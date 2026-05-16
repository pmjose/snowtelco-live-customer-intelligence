import { useDemoState } from '@/state/DemoStateProvider';
import { nocIncidents } from '@/data/nocIncidents';
import { cn } from '@/lib/utils';

// UK SVG mini-map with pulsing alarm storm on active incident.
// Coordinates roughly approximate UK; we project simple lon/lat to a 320x440 viewBox.

const VW = 320;
const VH = 440;
const LON_MIN = -8.5;
const LON_MAX = 2.0;
const LAT_MIN = 49.5;
const LAT_MAX = 59.0;

function project([lon, lat]: [number, number]): [number, number] {
  const x = ((lon - LON_MIN) / (LON_MAX - LON_MIN)) * VW;
  const y = VH - ((lat - LAT_MIN) / (LAT_MAX - LAT_MIN)) * VH;
  return [x, y];
}

const UK_PATH = 'M 105 30 L 130 50 L 145 90 L 165 110 L 175 145 L 195 180 L 200 215 L 215 245 L 220 280 L 235 310 L 230 345 L 200 360 L 175 365 L 150 380 L 130 400 L 110 410 L 90 415 L 75 405 L 60 395 L 50 375 L 55 345 L 70 320 L 85 295 L 90 265 L 100 240 L 95 215 L 80 195 L 70 170 L 75 145 L 80 120 L 90 90 L 100 60 Z';

export function MiniMap() {
  const { selectedIncidentId, nocPlaying, currentStage, tElapsedMs, selectIncident } = useDemoState();

  return (
    <div className="vf-card p-3 flex flex-col h-full min-h-[260px]">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[10px] uppercase tracking-wider text-ink-muted font-bold">UK · Network Map</div>
        <span className={cn('vf-chip text-[9.5px]', nocPlaying ? 'bg-vfRed-soft text-vfRed-dark' : 'bg-mist text-ink-muted')}>
          {nocPlaying ? 'Live' : 'Idle'}
        </span>
      </div>
      <div className="flex-1 min-h-0 grid place-items-center">
        <svg viewBox={`0 0 ${VW} ${VH}`} className="w-full h-full max-h-[400px]" preserveAspectRatio="xMidYMid meet">
          <defs>
            <radialGradient id="stormGrad">
              <stop offset="0%" stopColor="#29B5E8" stopOpacity="0.6" />
              <stop offset="60%" stopColor="#29B5E8" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#29B5E8" stopOpacity="0" />
            </radialGradient>
          </defs>
          <path d={UK_PATH} fill="#F4F4F6" stroke="#d4d4d4" strokeWidth="1" />
          {nocIncidents.map((inc) => {
            const [x, y] = project(inc.coordinates as [number, number]);
            const isSelected = inc.id === selectedIncidentId;
            const recovering = isSelected && (currentStage === 'verify' || currentStage === 'resolved');
            const stormColor = recovering ? '#10B981' : (inc.priority === 'P1' ? '#11567F' : inc.priority === 'P2' ? '#F59E0B' : '#29B5E8');

            return (
              <g key={inc.id} onClick={() => selectIncident(inc.id)} style={{ cursor: 'pointer' }}>
                {isSelected && nocPlaying && !recovering && (
                  <>
                    <circle cx={x} cy={y} r={28} fill="url(#stormGrad)" />
                    <circle cx={x} cy={y} r={14} fill="none" stroke={stormColor} strokeWidth="1.5" opacity="0.6" className="pulse-ring" />
                    <circle cx={x} cy={y} r={14} fill="none" stroke={stormColor} strokeWidth="1.5" opacity="0.5" className="pulse-ring" style={{ animationDelay: '0.5s' }} />
                  </>
                )}
                {recovering && (
                  <circle cx={x} cy={y} r={20} fill="#10B981" opacity={0.18} />
                )}
                <circle cx={x} cy={y} r={isSelected ? 6.5 : 4.5} fill={stormColor} stroke="white" strokeWidth="1.5" />
                <text x={x + 9} y={y + 3} fontSize="9" fontWeight="700" fill="#111">{inc.city}</text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="text-[10px] text-ink-muted mt-1">Click a city to focus the incident.</div>
      {tElapsedMs > 0 && <div className="text-[10px] font-mono text-ink-muted">T+ {(tElapsedMs / 1000).toFixed(1)}s</div>}
    </div>
  );
}
