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
  riskDelta: number
  patronesDetectados: string[]
  sugerirAnalisis: boolean
}

function parseAnalysis(raw: string): AnaAnalysis {
  const fallback: AnaAnalysis = {
    respuesta: 'Estoy aquí contigo. ¿Puedes contarme un poco más sobre lo que está pasando?',
    riskDelta: 0,
    patronesDetectados: [],
    sugerirAnalisis: false,
  }

  // Strip markdown code fences if present
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim()

  // Try direct parse
  try {
    const parsed = JSON.parse(cleaned) as AnaAnalysis
    if (typeof parsed.respuesta === 'string' && parsed.respuesta.trim()) return parsed
  } catch { /* fall through */ }

  // Extract first JSON object from the text
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
// Explicit self-harm intent in Spanish. Two-word minimums avoid false positives
// ("me matan de risa", "voy a morir de vergüenza", etc.)
const EMERGENCY_PHRASES = [
  'quiero matar',    // "me quiero matar", "quiero matarme"
  'voy a matar',     // "voy a matarme", "me voy a matar"
  'quiero morir',    // "me quiero morir", "quiero morirme"
  'voy a morir',     // intención explícita, not "voy a morir de frío"
  'quiero suicidar', // "quiero suicidarme", "me quiero suicidar"
  'voy a suicidar',
  'hacerme daño',    // "quiero hacerme daño", "voy a hacerme daño"
  'hacerme daño',
  'voy a hacer daño', // "me voy a hacer daño"
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
// Catches ambiguous signals that keywords miss (e.g., veiled intent).
// Logs errors visibly — a silent fail here is a safety risk.
async function geminiEmergencyGate(userInput: string): Promise<boolean> {
  try {
    const generationConfig = {
      responseMimeType: 'application/json',
      maxOutputTokens: 100,
      temperature: 0,
      thinkingConfig: {
        thinkingBudget: 0,
      },
    } as any
    const geminiModel = genai.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig,
    })

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
    // Log explicitly — a silent fail here means we could miss a real emergency
    console.error('[ANA emergency gate] Gemini failed, relying on keyword layer:', err)
    return false
  }
}

export interface SendMessageResult {
  response: string
  isEmergency: boolean
  riskDelta: number
  newPatterns: string[]
  sugerirAnalisis: boolean
}

export async function sendMessageToAna(params: {
  messages: ChatMessage[]
  userInput: string
  sessionToken: string
  mode: 'escudo' | 'salvavidas'
  captureText?: string  // OCR text from screenshot — never the image itself
}): Promise<SendMessageResult> {
  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for')?.split(',')[0].trim() ?? '127.0.0.1'

  if (isRateLimited(ip)) {
    return {
      response: 'Estoy recibiendo muchos mensajes. Espera un momento antes de continuar.',
      isEmergency: false,
      riskDelta: 0,
      newPatterns: [],
      sugerirAnalisis: false,
    }
  }

  // ── Step 1: Keyword gate (synchronous, no API call) ─────────────────────
  // Catches explicit self-harm intent before any network call.
  // Must run regardless of Gemini availability.
  const isEmergency = hasEmergencyKeyword(params.userInput) || await geminiEmergencyGate(params.userInput)

  // ── Emergency protocol: return immediately, skip Claude ──────────────────
  if (isEmergency) {
    return {
      response:
        'Escucho que estás en peligro ahora mismo. Esto es una emergencia y quiero que sepas que hay personas capacitadas para ayudarte en este momento.\n\nLlama ahora al 800 911 2000 (Línea de la Vida, gratuita, disponible las 24 horas) o al 911.\n\nNo estás solo/a. Estas personas están entrenadas para exactamente esto.',
      isEmergency: true,
      riskDelta: 40,
      newPatterns: [],
      sugerirAnalisis: false,
    }
  }

  // ── Step 2: Claude empathetic response ───────────────────────────────────
  // Filter out messages with empty content — Claude API rejects them with 400.
  // Then take the last 20 to keep payload small.
  const filteredHistory = params.messages.filter(
    (m) => m.content && m.content.trim() !== '',
  )
  const recentMessages = filteredHistory.slice(-20)
  const claudeMessages: Anthropic.MessageParam[] = recentMessages.map((m) => ({
    role: m.role === 'ana' ? 'assistant' : 'user',
    content: m.content,
  }))

  // Build the final user turn — include screenshot text as context if present
  const userTurn = params.captureText
    ? `${params.userInput}\n\n[El joven compartió una captura de pantalla. Texto extraído por OCR — úsalo como contexto para el paso actual del flujo]:\n${params.captureText}`
    : params.userInput

  claudeMessages.push({ role: 'user', content: userTurn })

  const claudeResponse = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 1024,
    system: buildSystemPrompt(params.mode),
    messages: claudeMessages,
  })

  const rawText =
    claudeResponse.content.find((b) => b.type === 'text')?.text ?? ''

  const analysis = parseAnalysis(rawText)

  return {
    response: analysis.respuesta || 'Estoy procesando lo que me dijiste, dame un momento.',
    isEmergency: false,
    riskDelta: Math.min(30, Math.max(-5, analysis.riskDelta ?? 0)),
    newPatterns: analysis.patronesDetectados ?? [],
    sugerirAnalisis: analysis.sugerirAnalisis ?? false,
  }
}
