'use client';

const TOTAL_MUNICIPIOS = 20;

function barColor(alerts: number): string {
  if (alerts <= 2) return '#a8c4a0';
  if (alerts <= 5) return '#d4956b';
  if (alerts <= 9) return '#bf6b4a';
  return '#9e4a28';
}

interface NayaritMapProps {
  size?: number;
  highlightZone?: string;
  className?: string;
  zonaStats?: { name: string; alerts: number }[];
}

export default function NayaritMap({ className, zonaStats = [] }: NayaritMapProps) {
  const active = zonaStats
    .map((z) => ({ name: z.name.replace(/, Nayarit$/, ''), alerts: z.alerts }))
    .filter((z) => z.alerts > 0)
    .sort((a, b) => b.alerts - a.alerts);

  const max     = Math.max(1, active[0]?.alerts ?? 1);
  const sinActividad = TOTAL_MUNICIPIOS - active.length;

  return (
    <div className={className} style={{ width: '100%' }}>
      {active.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.82rem', fontFamily: 'var(--font-body)', padding: '32px 0' }}>
          Sin alertas registradas
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {active.map((z) => {
            const pct = (z.alerts / max) * 100;
            const col = barColor(z.alerts);
            return (
              <div key={z.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 130, flexShrink: 0, fontSize: '0.78rem', fontFamily: 'var(--font-body)', color: 'var(--color-text-primary)', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {z.name}
                </div>
                <div style={{ flex: 1, background: 'var(--color-gray-100)', borderRadius: 6, height: 20, overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: col, borderRadius: 6, transition: 'width 500ms ease' }} />
                </div>
                <div style={{ width: 24, flexShrink: 0, fontSize: '0.78rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: col }}>
                  {z.alerts}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {sinActividad > 0 && active.length > 0 && (
        <div style={{ marginTop: 12, fontSize: '0.72rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}>
          {sinActividad} municipio{sinActividad !== 1 ? 's' : ''} sin actividad
        </div>
      )}
    </div>
  );
}
