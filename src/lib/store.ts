import { create } from 'zustand';

export type AnaState = 'listening' | 'talking' | 'validating' | 'critical';
export type EmotionalState = 'calma' | 'bien' | 'mas-o-menos' | 'mal' | 'crisis';
export type RiskLevel = number; // 0–100

export interface ChatMessage {
  id: string;
  role: 'user' | 'ana';
  content: string;
  timestamp: Date;
  imageDataUrl?: string; // base64 data URL, lives only in RAM, destroyed with session
}

export interface AnalysisResult {
  patrones_detectados: string[];
  nivel_riesgo: number;
  fase_grooming: number;
  resumen_comportamiento: string;
}

interface AnclaStore {
  /* ANA avatar state */
  anaState: AnaState;
  setAnaState: (s: AnaState) => void;

  /* Emotional state (termómetro) */
  emotionalState: EmotionalState | null;
  setEmotionalState: (s: EmotionalState) => void;

  /* Risk score */
  riskLevel: RiskLevel;
  setRiskLevel: (r: RiskLevel) => void;

  /* Chat messages — never persisted to server, lives in RAM only */
  chatMessages: ChatMessage[];
  addChatMessage: (m: ChatMessage) => void;

  /* Breathing exercise active */
  breathingActive: boolean;
  setBreathingActive: (a: boolean) => void;

  /* PC portal auth */
  pcAuthenticated: boolean;
  setPcAuthenticated: (a: boolean) => void;

  /* Jumper open state */
  jumperOpen: boolean;
  setJumperOpen: (o: boolean) => void;

  /* Session management — ephemeral, never leaves client RAM */
  sessionToken: string;
  lastActivity: number | null;
  touchActivity: () => void;
  clearSession: () => void;

  /* Analysis patterns — accumulated across conversation, never sent to server */
  analysisPatterns: string[];
  setAnalysisPatterns: (p: string[]) => void;
  addAnalysisPatterns: (p: string[]) => void; // merges without duplicates

  /* Deep analysis job (Phase 2) */
  analysisJobId: string | null;
  setAnalysisJobId: (id: string | null) => void;
  analysisResult: AnalysisResult | null;
  setAnalysisResult: (r: AnalysisResult | null) => void;

  /* OCR text extracted from screenshots — images never leave device */
  ocrText: string | null;
  setOcrText: (t: string | null) => void;

  /* Report identity — computed once on analisis page, read on reporte page */
  folio: string;
  setFolio: (f: string) => void;
  hashHex: string;
  setHashHex: (h: string) => void;
  reporteId: string | null;
  setReporteId: (id: string | null) => void;
}

export const useAnclaStore = create<AnclaStore>((set) => ({
  anaState: 'listening',
  setAnaState: (s) => set({ anaState: s }),

  emotionalState: null,
  setEmotionalState: (s) => set({ emotionalState: s }),

  riskLevel: 0,
  setRiskLevel: (r) => set({ riskLevel: r }),

  chatMessages: [],
  addChatMessage: (m) =>
    set((state) => ({ chatMessages: [...state.chatMessages, m] })),

  breathingActive: false,
  setBreathingActive: (a) => set({ breathingActive: a }),

  pcAuthenticated: false,
  setPcAuthenticated: (a) => set({ pcAuthenticated: a }),

  jumperOpen: false,
  setJumperOpen: (o) => set({ jumperOpen: o }),

  sessionToken: typeof crypto !== 'undefined' ? crypto.randomUUID() : 'server-ssr',
  lastActivity: null,
  touchActivity: () => set({ lastActivity: Date.now() }),
  clearSession: () =>
    set({
      chatMessages: [],
      sessionToken: typeof crypto !== 'undefined' ? crypto.randomUUID() : 'server-ssr',
      lastActivity: null,
      riskLevel: 0,
      anaState: 'listening',
      analysisPatterns: [],
      analysisJobId: null,
      analysisResult: null,
      ocrText: null,
      folio: '',
      hashHex: '',
      reporteId: null,
    }),

  analysisPatterns: [],
  setAnalysisPatterns: (p) => set({ analysisPatterns: p }),
  addAnalysisPatterns: (p) =>
    set((state) => ({
      analysisPatterns: Array.from(new Set([...state.analysisPatterns, ...p])),
    })),

  analysisJobId: null,
  setAnalysisJobId: (id) => set({ analysisJobId: id }),

  analysisResult: null,
  setAnalysisResult: (r) => set({ analysisResult: r }),

  ocrText: null,
  setOcrText: (t) => set({ ocrText: t }),

  folio: '',
  setFolio: (f) => set({ folio: f }),
  hashHex: '',
  setHashHex: (h) => set({ hashHex: h }),
  reporteId: null,
  setReporteId: (id) => set({ reporteId: id }),
}));
