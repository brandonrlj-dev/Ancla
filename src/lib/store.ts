import { create } from 'zustand';

export type AnaState = 'listening' | 'talking' | 'validating' | 'critical';
export type EmotionalState = 'calma' | 'bien' | 'mas-o-menos' | 'mal' | 'crisis';

export interface ChatMessage {
  id: string;
  role: 'user' | 'ana';
  content: string;
  timestamp: Date;
  imageDataUrl?: string; // base64 data URL, lives only in RAM, destroyed with session
}

export interface EscudoSessionResult {
  nivelRiesgo: 'ALTO' | 'MEDIO' | 'BAJO';
  score: number;
  patronesDetectados: string[];
  plataforma: string;
  identificador?: string;
  ocrText?: string;
}

interface AnclaStore {
  /* ANA avatar state */
  anaState: AnaState;
  setAnaState: (s: AnaState) => void;

  /* Emotional state (termómetro) */
  emotionalState: EmotionalState | null;
  setEmotionalState: (s: EmotionalState) => void;

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

  /* Escudo questionnaire result — passed to Ancla for pre-filling */
  escudoResult: EscudoSessionResult | null;
  setEscudoResult: (r: EscudoSessionResult | null) => void;

  /* Report identity — computed in ancla flow, synced here for cross-page access */
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
      anaState: 'listening',
      escudoResult: null,
      folio: '',
      hashHex: '',
      reporteId: null,
    }),

  escudoResult: null,
  setEscudoResult: (r) => set({ escudoResult: r }),

  folio: '',
  setFolio: (f) => set({ folio: f }),
  hashHex: '',
  setHashHex: (h) => set({ hashHex: h }),
  reporteId: null,
  setReporteId: (id) => set({ reporteId: id }),
}));
