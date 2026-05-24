'use server'

import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

// ── Behaviour → pattern + score mapping ──────────────────────────────────────
const COMPORTAMIENTO_MAP: Record<string, { patron: string; score: number }> = {
  secreto:      { patron: 'secretismo',        score: 15 },
  love_bombing: { patron: 'love_bombing',       score: 10 },
  fotos:        { patron: 'solicitud_imagen',   score: 30 },
  dinero:       { patron: 'incentivos',         score: 20 },
  amenaza:      { patron: 'amenaza_difusion',   score: 35 },
  presencia:    { patron: 'encuentro_personal', score: 25 },
  sexual:       { patron: 'gradualidad_sexual', score: 25 },
  edad_falsa:   { patron: 'identidad_falsa',    score: 20 },
}

// Keywords that signal grooming in OCR-extracted screenshot text
const GROOMING_KEYWORDS = [
  'mándame', 'manda', 'pack', 'fotito', 'videíto', 'foto', 'video',
  'secreto', 'no le digas', 'no le cuentes', 'entre tú y yo',
  'especial', 'nadie te entiende', 'te amo', 'te quiero mucho',
  'novios', 'pareja', 'regalo', 'dinero', 'seguidores',
  'vernos', 'verte', 'en persona', 'nos vemos',
  'desnudo', 'desnuda', 'sexy', 'íntimo', 'íntima',
  'lo publico', 'lo voy a publicar', 'te voy a exponer',
]

function hasGroomingKeywords(text: string): boolean {
  const lower = text.toLowerCase()
  return GROOMING_KEYWORDS.some((kw) => lower.includes(kw))
}

export interface EscudoParams {
  plataforma: string
  tiempoContacto: string
  comportamientos: string[]  // keys from COMPORTAMIENTO_MAP
  ocrText?: string
  identificador?: string
}

export interface EscudoResult {
  nivelRiesgo: 'ALTO' | 'MEDIO' | 'BAJO'
  score: number
  patronesDetectados: string[]
  analisisTexto: string
}

export async function analyzeEscudo(params: EscudoParams): Promise<EscudoResult> {
  // ── Step 1: Deterministic risk score ────────────────────────────────────────
  let score = 0
  const patronesDetectados: string[] = []

  for (const id of params.comportamientos) {
    const entry = COMPORTAMIENTO_MAP[id]
    if (entry) {
      score += entry.score
      patronesDetectados.push(entry.patron)
    }
  }

  if (params.ocrText && hasGroomingKeywords(params.ocrText)) {
    score += 20
  }

  const nivelRiesgo: EscudoResult['nivelRiesgo'] =
    score >= 60 ? 'ALTO' : score >= 30 ? 'MEDIO' : 'BAJO'

  // ── Step 2: Claude contextual analysis paragraph ─────────────────────────────
  const comportamientosTexto = params.comportamientos
    .map((id) => {
      const labels: Record<string, string> = {
        secreto:      'pidió guardar secreto',
        love_bombing: 'hizo sentir especial muy rápido',
        fotos:        'pidió fotos o videos',
        dinero:       'ofreció dinero, regalos o seguidores',
        amenaza:      'amenazó o presionó',
        presencia:    'pidió verse en persona',
        sexual:       'introdujo temas sexuales',
        edad_falsa:   'mintió sobre su edad',
      }
      return labels[id] ?? id
    })
    .join(', ')

  const ocrContext = params.ocrText
    ? `\nTexto extraído de captura de pantalla: "${params.ocrText.slice(0, 600)}"`
    : ''

  const prompt = `Eres un experto en protección infantil digital en México. Un joven reporta la siguiente situación:

Plataforma: ${params.plataforma}
Tiempo de contacto: ${params.tiempoContacto}
Comportamientos reportados: ${comportamientosTexto || 'ninguno específico'}${ocrContext}

Nivel de riesgo calculado: ${nivelRiesgo} (score: ${score}/100)

Escribe UN párrafo de 2-3 oraciones en español mexicano informal dirigido directamente al joven. Debe:
1. Explicar brevemente por qué los comportamientos descritos son o no son señales de alerta
2. Ser cálido y no alarmista si el riesgo es BAJO o MEDIO
3. Ser claro y directo sobre la seriedad si el riesgo es ALTO
4. No mencionar nombres de instituciones ni links
5. No usar markdown, solo texto plano

Solo responde con el párrafo, sin encabezados ni explicaciones adicionales.`

  let analisisTexto =
    nivelRiesgo === 'BAJO'
      ? 'Por ahora no veo señales claras de grooming o sextorsión en lo que describes, pero confía en tu instinto. Si algo cambia o te sientes incómodo/a, puedes volver aquí cuando quieras.'
      : nivelRiesgo === 'MEDIO'
      ? 'Algunos de los comportamientos que describes son señales de alerta que vale la pena tomar en serio. No estás exagerando al preocuparte — hacer el reporte puede ayudarte a protegerte.'
      : 'Lo que describes tiene características serias de grooming o sextorsión. No estás solo/a y no es tu culpa. Hay personas capacitadas para ayudarte ahora mismo.'

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 256,
      messages: [{ role: 'user', content: prompt }],
    })
    const text = response.content.find((b) => b.type === 'text')?.text?.trim()
    if (text && text.length > 20) analisisTexto = text
  } catch (err) {
    console.error('[analyzeEscudo] Claude failed, using fallback:', err)
  }

  return { nivelRiesgo, score, patronesDetectados, analisisTexto }
}
