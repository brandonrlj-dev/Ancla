'use server'

import Anthropic from '@anthropic-ai/sdk'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { headers } from 'next/headers'
import { buildSystemPrompt } from '@/lib/ana-system-prompt'
import type { ChatMessage } from '@/lib/store'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
const genai = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!)

// Module-level rate limiter — resets on cold start, acceptable for demo
const rateMap = new Map<string, { count: number; resetAt: number }>()

function isRateLimited(ip: string): boolean {
  const limit = parseInt(process.env.RATE_LIMIT_AI_RPM ?? '10')
  const now = Date.now()
  const entry = rateMap.get(ip)
  if (!entry || now >= entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + 60_000 })
    return false
  }
  if (entry.count >= limit) return true
  entry.count++
  return false
}

interface AnaAnalysis {
  respuesta: string
  hayEmergencia: boolean
  sugerirEscudo: boolean
  sugerirAncla: boolean
  sugerirRegulacion: boolean
}

function parseAnalysis(raw: string): AnaAnalysis {
  const fallback: AnaAnalysis = {
    respuesta: 'Estoy aquí contigo. ¿Puedes contarme un poco más sobre lo que está pasando?',
    hayEmergencia: false,
    sugerirEscudo: false,
    sugerirAncla: false,
    sugerirRegulacion: false,
  }

  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim()

  try {
    const parsed = JSON.parse(cleaned) as AnaAnalysis
    if (typeof parsed.respuesta === 'string' && parsed.respuesta.trim()) return parsed
  } catch { /* fall through */ }

  const match = cleaned.match(/\{[\s\S]*\}/)
  if (match) {
    try {
      const parsed = JSON.parse(match[0]) as AnaAnalysis
      if (typeof parsed.respuesta === 'string' && parsed.respuesta.trim()) return parsed
    } catch { /* fall through */ }
  }

  return fallback
}

// ── Layer 1: Keyword detection ───────────────────────────────────────────────
// Explicit self-harm intent in Spanish. Two-word minimums avoid false positives.
const EMERGENCY_PHRASES = [
  'quiero matar',
  'voy a matar',
  'quiero morir',
  'voy a morir',
  'quiero suicidar',
  'voy a suicidar',
  'hacerme daño',
  'voy a hacer daño',
  'quitarme la vida',
  'no quiero vivir',
  'quiero cortarme',
  'voy a cortarme',
  'me voy a cortar',
  'quiero colgarme',
  'no quiero seguir viviendo',
  'mejor estaría muerto',
  'mejor estuviera muerto',
  'ya no quiero seguir',
]

function hasEmergencyKeyword(text: string): boolean {
  const lower = text.toLowerCase()
  return EMERGENCY_PHRASES.some((phrase) => lower.includes(phrase))
}

// ── Layer 2: Gemini contextual gate ──────────────────────────────────────────
// Catches ambiguous signals that keywords miss. Logs errors visibly — a silent
// fail here is a safety risk.
async function geminiEmergencyGate(userInput: string): Promise<boolean> {
  try {
    const generationConfig = {
      responseMimeType: 'application/json',
      maxOutputTokens: 100,
      temperature: 0,
      thinkingConfig: { thinkingBudget: 0 },
    } as any
    const geminiModel = genai.getGenerativeModel({ model: 'gemini-2.5-flash', generationConfig })

    const prompt = `Eres un sistema de seguridad para menores en crisis. Evalúa si el mensaje indica INTENCIÓN EXPLÍCITA de hacerse daño físico o suicidio.

REGLA CRÍTICA: El threshold es CONSERVADOR. Ante la duda, responde false. Un falso positivo traumatiza a alguien innecesariamente. Solo responde true con intención explícita y directa, nunca por expresiones metafóricas o coloquiales.

EXPRESIONES MEXICANAS QUE NO SON EMERGENCIA (responde false):
"ya fue todo", "ya estuvo", "ya terminé", "ya valió", "me muero de vergüenza", "te mato de risa", "me está matando el calor", "ya me cargó el payaso", "me quiero morir de pena", "estoy harta/o"

Ejemplos VERDADEROS (responde true): "quiero hacerme daño", "me quiero matar" con contexto de crisis real, "quiero suicidarme", "no quiero seguir viviendo"
Ejemplos FALSOS (responde false): "me siento mal", "estoy triste", "me amenazaron", "tengo miedo", "ya fue todo", "ya estuvo"

Mensaje: "${userInput.slice(0, 400)}"

No uses markdown. Responde ÚNICAMENTE con el JSON crudo: {"emergency":true} o {"emergency":false}`

    const result = await geminiModel.generateContent(prompt)
    const text = result.response.text().trim()
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text) as { emergency: boolean }
    return parsed.emergency === true
  } catch (err) {
    console.error('[ANA emergency gate] Gemini failed, relying on keyword layer:', err)
    return false
  }
}

export interface SendMessageResult {
  response: string
  hayEmergencia: boolean
  sugerirEscudo: boolean
  sugerirAncla: boolean
  sugerirRegulacion: boolean
}

export async function sendMessageToAna(params: {
  messages: ChatMessage[]
  userInput: string
  sessionToken: string
  mode?: 'escudo' | 'salvavidas'  // kept for call-site compatibility, now ignored
  captureText?: string
}): Promise<SendMessageResult> {
  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for')?.split(',')[0].trim() ?? '127.0.0.1'

  if (isRateLimited(ip)) {
    return {
      response: 'Estoy recibiendo muchos mensajes. Espera un momento antes de continuar.',
      hayEmergencia: false,
      sugerirEscudo: false,
      sugerirAncla: false,
      sugerirRegulacion: false,
    }
  }

  // ── Step 1: Two-layer emergency gate (synchronous keyword first, then Gemini) ─
  const isEmergency = hasEmergencyKeyword(params.userInput) || await geminiEmergencyGate(params.userInput)

  if (isEmergency) {
    return {
      response:
        'Lo que sientes importa mucho. Hay personas capacitadas para acompañarte ahora mismo. Llama al 800 911 2000 (Línea de la Vida, gratuita, 24 horas) o al 911. No estás solo/a.',
      hayEmergencia: true,
      sugerirEscudo: false,
      sugerirAncla: false,
      sugerirRegulacion: false,
    }
  }

  // ── Step 2: Claude empathetic response ───────────────────────────────────
  const filteredHistory = params.messages.filter(
    (m) => m.content && m.content.trim() !== '',
  )
  const recentMessages = filteredHistory.slice(-20)
  const claudeMessages: Anthropic.MessageParam[] = recentMessages.map((m) => ({
    role: m.role === 'ana' ? 'assistant' : 'user',
    content: m.content,
  }))

  const userTurn = params.captureText
    ? `${params.userInput}\n\n[El joven compartió una captura de pantalla. Texto extraído por OCR]:\n${params.captureText}`
    : params.userInput

  claudeMessages.push({ role: 'user', content: userTurn })

  const claudeResponse = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 512,
    system: buildSystemPrompt('escudo'),
    messages: claudeMessages,
  })

  const rawText = claudeResponse.content.find((b) => b.type === 'text')?.text ?? ''
  const analysis = parseAnalysis(rawText)

  return {
    response: analysis.respuesta || 'Estoy aquí contigo. ¿Puedes contarme un poco más?',
    hayEmergencia: analysis.hayEmergencia ?? false,
    sugerirEscudo: analysis.sugerirEscudo ?? false,
    sugerirAncla: analysis.sugerirAncla ?? false,
    sugerirRegulacion: analysis.sugerirRegulacion ?? false,
  }
}
