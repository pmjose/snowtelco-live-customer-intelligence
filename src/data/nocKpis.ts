export interface NocKpi {
  id: string;
  label: string;
  value: string;
  unit?: string;
  trend: number[];
  delta?: string;
  tone?: 'good' | 'warn' | 'bad' | 'neutral';
}

export const nocKpis: NocKpi[] = [
  { id: 'mttd', label: 'MTTD', value: '38', unit: 's', trend: [62, 58, 51, 49, 44, 41, 38], delta: '−24s WoW', tone: 'good' },
  { id: 'mttr', label: 'MTTR (mitigation)', value: '14.2', unit: 'min', trend: [42, 36, 28, 24, 19, 16, 14.2], delta: 'baseline 47m → 14m', tone: 'good' },
  { id: 'sla', label: 'SLA burn', value: '12', unit: '%', trend: [22, 20, 18, 17, 15, 13, 12], delta: '−10pp', tone: 'good' },
  { id: 'open-p1', label: 'Open P1', value: '3', trend: [4, 4, 5, 4, 3, 3, 3], delta: 'steady', tone: 'warn' },
  { id: 'alarms', label: 'Alarms / min', value: '147', trend: [80, 90, 110, 130, 150, 165, 147], delta: '+18% (storm)', tone: 'bad' },
  { id: 'auto', label: 'Auto-actions today', value: '64', trend: [10, 18, 28, 36, 48, 56, 64], delta: '+19', tone: 'good' },
  { id: 'conf', label: 'Agent confidence', value: '92', unit: '%', trend: [78, 82, 85, 88, 90, 91, 92], delta: '+1pp', tone: 'good' },
];
