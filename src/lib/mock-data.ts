/* ANCLA mock data — all simulated, no real API calls */

export const mockFolio = '#A-7F4C2';
export const mockHash = 'sha256:e3b0c44298fc1c149afb4c8996fb92427ae41e4649b934ca495991b7852b855';
export const mockPoliceFolio = 'R-2025-0847';
export const mockAgent = 'A. Morales';

/* KPI stats */
export const kpis = {
  activeAlerts: 247,
  aggressorsIdentified: 34,
  directReports: 9,
  casesUnderReview: 62,
  weeklyChange: { alerts: +12, aggressors: +3, reports: +2, cases: -5 },
};

/* Grooming phases */
export const groomingPhases = [
  { id: 1, label: 'Selección', description: 'Identificación de la víctima' },
  { id: 2, label: 'Acceso', description: 'Establecimiento de contacto' },
  { id: 3, label: 'Confianza', description: 'Construcción de vínculo' },
  { id: 4, label: 'Aislamiento', description: 'Separación de red de apoyo' },
  { id: 5, label: 'Explotación', description: 'Solicitud de contenido/actos' },
];

/* Nayarit zones */
export const nayaritZones = [
  { id: 'tepic', name: 'Tepic', alerts: 89, lat: 21.5, lng: -104.9, risk: 'high' },
  { id: 'bahia', name: 'Bahía de Banderas', alerts: 54, lat: 20.7, lng: -105.3, risk: 'medium' },
  { id: 'compostela', name: 'Compostela', alerts: 38, lat: 21.2, lng: -104.9, risk: 'medium' },
  { id: 'xalisco', name: 'Xalisco', alerts: 31, lat: 21.4, lng: -104.9, risk: 'medium' },
  { id: 'santiago', name: 'Santiago Ixcuintla', alerts: 22, lat: 21.8, lng: -105.2, risk: 'low' },
  { id: 'ruiz', name: 'Ruiz', alerts: 13, lat: 22.1, lng: -105.1, risk: 'low' },
];

/* Weekly trend data */
export const weeklyTrend = [
  { day: 'Lun', anonymous: 28, direct: 5 },
  { day: 'Mar', anonymous: 35, direct: 7 },
  { day: 'Mié', anonymous: 42, direct: 6 },
  { day: 'Jue', anonymous: 31, direct: 9 },
  { day: 'Vie', anonymous: 48, direct: 8 },
  { day: 'Sáb', anonymous: 52, direct: 11 },
  { day: 'Dom', anonymous: 11, direct: 3 },
];

/* Conversion funnel */
export const conversionFunnel = [
  { label: 'Sesiones iniciadas', value: 100, count: 1247 },
  { label: 'Completaron evaluación', value: 62, count: 773 },
  { label: 'Iniciaron chat ANA', value: 38, count: 474 },
  { label: 'Generaron reporte', value: 18, count: 224 },
];

/* Alert table rows */
export const alertRows = [
  {
    id: 'ALT-0847',
    folio: '#A-7F4C2',
    urgency: 'critica',
    summary: 'Solicitud explícita de imágenes',
    zone: 'Tepic',
    age: '14 años',
    platform: 'Instagram',
    groomingPhase: 4,
    timestamp: '2025-03-15T14:22:00',
    linked: true,
  },
  {
    id: 'ALT-0831',
    folio: '#A-8B3D1',
    urgency: 'alta',
    summary: 'Aislamiento de red de apoyo detectado',
    zone: 'Bahía de Banderas',
    age: '16 años',
    platform: 'WhatsApp',
    groomingPhase: 3,
    timestamp: '2025-03-15T11:05:00',
    linked: false,
  },
  {
    id: 'ALT-0824',
    folio: '#A-9C2E7',
    urgency: 'media',
    summary: 'Contacto reiterado con adulto desconocido',
    zone: 'Compostela',
    age: '13 años',
    platform: 'TikTok',
    groomingPhase: 2,
    timestamp: '2025-03-15T09:47:00',
    linked: false,
  },
  {
    id: 'ALT-0819',
    folio: '#A-1D4F9',
    urgency: 'alta',
    summary: 'Patrones de sexting identificados',
    zone: 'Xalisco',
    age: '15 años',
    platform: 'Snapchat',
    groomingPhase: 4,
    timestamp: '2025-03-14T20:13:00',
    linked: true,
  },
  {
    id: 'ALT-0811',
    folio: '#A-5E6A3',
    urgency: 'baja',
    summary: 'Lenguaje de captación inicial',
    zone: 'Tepic',
    age: '17 años',
    platform: 'Discord',
    groomingPhase: 1,
    timestamp: '2025-03-14T16:30:00',
    linked: false,
  },
];

/* Direct reports */
export const directReports = [
  {
    id: 'REP-001',
    folio: '#D-3K9M2',
    summary: 'Un adulto me pide fotos en el chat',
    contact: 'anon_teen_mx@pm.me',
    vinculation: 'Hermana de víctima ALT-0847',
    timestamp: '2025-03-15T13:10:00',
    status: 'nuevo',
    urgency: 'alta',
  },
  {
    id: 'REP-002',
    folio: '#D-7P1Q4',
    summary: 'Me siento sola y no sé qué hacer',
    contact: 'Por canal de ANCLA',
    vinculation: null,
    timestamp: '2025-03-15T10:55:00',
    status: 'en-revision',
    urgency: 'media',
  },
  {
    id: 'REP-003',
    folio: '#D-2N8R6',
    summary: 'Me amenazó con publicar mis fotos',
    contact: 'Por canal de ANCLA',
    vinculation: null,
    timestamp: '2025-03-15T08:20:00',
    status: 'en-revision',
    urgency: 'critica',
  },
];

/* Linguistic patterns for alert detail */
export const linguisticPatterns = [
  { pattern: 'Minimización', frequency: 87, examples: ['"es normal entre amigos"', '"no le digas a nadie"'] },
  { pattern: 'Secretismo', frequency: 94, examples: ['"esto es solo entre tú y yo"', '"nuestro secreto"'] },
  { pattern: 'Halago excesivo', frequency: 76, examples: ['"eres muy madura para tu edad"', '"eres especial"'] },
  { pattern: 'Solicitud de aislamiento', frequency: 65, examples: ['"tus amigos no te entienden"', '"solo yo te comprendo"'] },
  { pattern: 'Gradualidad sexual', frequency: 89, examples: ['Escalada progresiva detectada en 14 mensajes'] },
];

/* Activity heatmap — 7 days × 24 hours intensity 0-100 */
export const activityHeatmap: number[][] = Array.from({ length: 7 }, (_, day) =>
  Array.from({ length: 24 }, (_, hour) => {
    if (hour >= 22 || hour <= 6) {
      return Math.random() > 0.7 ? Math.floor(Math.random() * 80) + 20 : 0;
    }
    if (hour >= 15 && hour <= 21) return Math.floor(Math.random() * 60) + 20;
    return Math.floor(Math.random() * 30);
  })
);

/* ANA mock conversation */
export const mockAnaConversation = [
  {
    role: 'ana' as const,
    content: 'Hola, soy ANA. Estoy aquí para escucharte sin juzgarte. ¿Cómo estás hoy?',
  },
  {
    role: 'user' as const,
    content: 'Alguien en internet me está pidiendo fotos y me siento rara.',
  },
  {
    role: 'ana' as const,
    content: 'Gracias por contarme. Es muy valiente de tu parte. Esa sensación de rareza que describes es importante: tu instinto te está diciendo algo. ¿Quieres contarme más sobre lo que está pasando?',
  },
  {
    role: 'user' as const,
    content: 'Dice que si lo quiero de verdad se las mando. Pero me da miedo.',
  },
  {
    role: 'ana' as const,
    content: 'Ese miedo que sientes es completamente válido, y muy sabio. Nadie que te quiera de verdad te presionaría así. Lo que describes tiene un nombre: se llama grooming, y no es tu culpa que esté pasando. Estás a salvo aquí conmigo.',
  },
];

/* Emotional states config */
export const emotionalStates = [
  {
    id: 'calma' as const,
    label: 'En calma',
    color: '#5b81a8',
    rippleCadence: 4.45,
    description: 'Tranquila y centrada',
  },
  {
    id: 'bien' as const,
    label: 'Bien',
    color: '#6b7f5e',
    rippleCadence: 3.5,
    description: 'Me siento bien',
  },
  {
    id: 'mas-o-menos' as const,
    label: 'Más o menos',
    color: '#c4a882',
    rippleCadence: 2.5,
    description: 'Regular, tirando a bien',
  },
  {
    id: 'mal' as const,
    label: 'Mal',
    color: '#bf6b4a',
    rippleCadence: 1.8,
    description: 'No estoy bien',
  },
  {
    id: 'crisis' as const,
    label: 'Crisis',
    color: '#9e4a28',
    rippleCadence: 1.45,
    description: 'Necesito ayuda ahora',
  },
];

/* Temporal map events */
export const temporalEvents = [
  { id: 1, date: 'Feb 3', label: 'Primer contacto', type: 'contact', detail: 'Solicitud de amistad en Instagram' },
  { id: 2, date: 'Feb 8', label: 'Conversación', type: 'talk', detail: 'Halagos frecuentes y preguntas personales' },
  { id: 3, date: 'Feb 15', label: 'Aislamiento', type: 'isolate', detail: '"Tus amigos no te entienden como yo"' },
  { id: 4, date: 'Feb 22', label: 'Solicitud', type: 'request', detail: 'Primera solicitud de fotografías' },
  { id: 5, date: 'Mar 1', label: 'Presión', type: 'pressure', detail: 'Amenazas veladas si no coopera' },
  { id: 6, date: 'Mar 10', label: 'Reporte', type: 'report', detail: 'Joven reporta a través de ANCLA' },
];

/* Regulation methods */
export const regulationMethods = [
  { id: 1, label: 'Respiración', description: 'Ejercicio guiado de respiración 4-4-4', color: '#5b81a8', href: '/joven/respiracion' },
  { id: 2, label: 'Escritura', description: 'Exprésate en un espacio seguro', color: '#6b7f5e', href: '/joven/escritura' },
  { id: 3, label: 'Movimiento', description: 'Activa tu cuerpo para liberar tensión', color: '#c4a882', href: '/joven/movimiento' },
  { id: 4, label: 'Visualización', description: 'Un lugar seguro en tu mente', color: '#bf6b4a', href: '/joven/visualizacion' },
  { id: 5, label: 'Grounding', description: 'Técnica 5-4-3-2-1 para el ahora', color: '#e08090', href: '/joven/grounding' },
];
