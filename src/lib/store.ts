import { create } from 'zustand';

export type AnaState = 'listening' | 'talking' | 'validating' | 'critical';
export type EmotionalState = 'calma' | 'bien' | 'mas-o-menos' | 'mal' | 'crisis';
export type RiskLevel = number; // 0–100

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

  /* Chat messages */
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
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'ana';
  content: string;
  timestamp: Date;
}

export const useAnclaStore = create<AnclaStore>((set) => ({
  anaState: 'listening',
  setAnaState: (s) => set({ anaState: s }),

  emotionalState: null,
  setEmotionalState: (s) => set({ emotionalState: s }),

  riskLevel: 24,
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
}));
