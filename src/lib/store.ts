import { create } from 'zustand';

export type AnaState = 'listening' | 'talking' | 'validating' | 'critical';
export type EmotionalState = 'calma' | 'bien' | 'mas-o-menos' | 'mal' | 'crisis';
export type RiskLevel = number; // 0–100

export interface ChatMessage {
  id: string;
  role: 'user' | 'ana';
  content: string;
  timestamp: Date;
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

  /* Analysis results (from completed analysis job) */
  analysisPatterns: string[];
  setAnalysisPatterns: (p: string[]) => void;
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

  /* Session is ephemeral — UUID generated once per module load (client-side) */
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
    }),

  analysisPatterns: [],
  setAnalysisPatterns: (p) => set({ analysisPatterns: p }),
}));
