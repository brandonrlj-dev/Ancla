'use server'

import Anthropic from '@anthropic-ai/sdk'
import { after } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import type { AnalysisResult } from '@/lib/store'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

const ANALYSIS_SYSTEM_PROMPT = `Eres un experto en análisis forense digital de casos de grooming y sextorsión con menores en México.
Analiza el texto proporcionado e identifica patrones de manipulación del agresor.

Responde ÚNICAMENTE con JSON válido, sin markdown ni texto extra:
{
  "patrones_detectados": ["patron1", "patron2"],
  "nivel_riesgo": <0-100>,
  "fase_grooming": <1-5>,
  "resumen_comportamiento": "descripción breve de los patrones observados"
}

Fases de grooming: 1=Selección, 2=Acceso y confianza, 3=Aislamiento, 4=Desensibilización, 5=Explotación`

// ── Public Server Actions ─────────────────────────────────────────────────────

export async function startAnalysisJob(params: {
  ocrText: string
  conversationContext: string
  sessionToken: string
}): Promise<{ jobId: string }> {
  const supabase = createServiceClient()

  const { data: job, error } = await supabase
    .from('jobs_analisis')
    .insert({
      session_token: params.sessionToken,
      estado: 'pendiente',
      payload: {
        ocrText: params.ocrText,
        conversationContext: params.conversationContext,
      },
    })
    .select('id')
    .single()

  if (error || !job) {
    console.error('[analysis] insert jobs_analisis failed:', error)
    throw new Error(`No se pudo crear el job de análisis: ${error?.message ?? 'sin datos'}`)
  }

  const jobId = job.id as string

  // after() runs after the Server Action response is sent to the client.
  // The client gets the jobId immediately; Claude processes in the background.
  after(async () => {
    await processJob(jobId, params.ocrText, params.conversationContext)
  })

  return { jobId }
}

export async function getAnalysisJobResult(params: {
  jobId: string
  sessionToken: string
}): Promise<{
  estado: string
  resultado: AnalysisResult | null
  errorMsg: string | null
}> {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('jobs_analisis')
    .select('estado, resultado, error_msg')
    .eq('id', params.jobId)
    .eq('session_token', params.sessionToken) // session_token prevents cross-session reads
    .single()

  if (error || !data) throw new Error('Job no encontrado')

  return {
    estado: data.estado as string,
    resultado: data.resultado as AnalysisResult | null,
    errorMsg: data.error_msg as string | null,
  }
}

// ── Internal background processor ────────────────────────────────────────────
// Called only via after(). Not exported — not a public Server Action.

async function processJob(
  jobId: string,
  ocrText: string,
  conversationContext: string,
): Promise<void> {
  const supabase = createServiceClient()

  await supabase
    .from('jobs_analisis')
    .update({ estado: 'procesando', actualizado_en: new Date().toISOString() })
    .eq('id', jobId)

  try {
    const parts = [
      ocrText ? `Texto extraído de capturas de pantalla:\n${ocrText}` : '',
      conversationContext ? `Contexto de la conversación con ANA:\n${conversationContext}` : '',
    ].filter(Boolean)

    const userContent = parts.length > 0
      ? parts.join('\n\n')
      : 'No hay texto de capturas disponible. Analiza el contexto conversacional.'

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1024,
      system: ANALYSIS_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userContent }],
    })

    const rawText = response.content.find((b) => b.type === 'text')?.text ?? ''
    const jsonMatch = rawText.match(/\{[\s\S]*\}/)
    const resultado = JSON.parse(jsonMatch ? jsonMatch[0] : rawText) as AnalysisResult

    await supabase
      .from('jobs_analisis')
      .update({
        estado: 'completado',
        resultado,
        actualizado_en: new Date().toISOString(),
      })
      .eq('id', jobId)
  } catch (err) {
    await supabase
      .from('jobs_analisis')
      .update({
        estado: 'fallido',
        error_msg: err instanceof Error ? err.message : 'Error desconocido',
        actualizado_en: new Date().toISOString(),
      })
      .eq('id', jobId)
  }
}
