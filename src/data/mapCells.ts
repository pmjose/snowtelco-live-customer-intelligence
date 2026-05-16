export interface MapCity {
  name: string;
  coordinates: [number, number];
  status: 'Stable' | 'Investigating' | 'Degraded';
  customers: number;
}

export const ukCities: MapCity[] = [
  { name: 'London', coordinates: [-0.1276, 51.5074], status: 'Investigating', customers: 6800000 },
  { name: 'Manchester', coordinates: [-2.226, 53.451], status: 'Degraded', customers: 1450000 },
  { name: 'Birmingham', coordinates: [-1.898, 52.486], status: 'Stable', customers: 1280000 },
  { name: 'Glasgow', coordinates: [-4.2518, 55.8642], status: 'Stable', customers: 970000 },
  { name: 'Cardiff', coordinates: [-3.181, 51.481], status: 'Stable', customers: 410000 },
  { name: 'Leeds', coordinates: [-1.5491, 53.8008], status: 'Stable', customers: 760000 },
  { name: 'Liverpool', coordinates: [-2.9916, 53.4084], status: 'Stable', customers: 660000 },
  { name: 'Bristol', coordinates: [-2.5879, 51.4545], status: 'Stable', customers: 510000 },
  { name: 'Edinburgh', coordinates: [-3.1883, 55.9533], status: 'Stable', customers: 540000 },
  { name: 'Belfast', coordinates: [-5.9301, 54.5973], status: 'Stable', customers: 320000 },
];

export interface CellSite {
  id: string;
  coordinates: [number, number];
  city: string;
  status: 'OK' | 'Degraded' | 'Down';
}

// Manchester M14 micro-cluster around the primary incident
export const manchesterM14Sites: CellSite[] = [
  { id: 'MAN-M14-073', coordinates: [-2.225, 53.453], city: 'Manchester', status: 'Down' },
  { id: 'MAN-M14-074', coordinates: [-2.232, 53.449], city: 'Manchester', status: 'Degraded' },
  { id: 'MAN-M14-075', coordinates: [-2.218, 53.449], city: 'Manchester', status: 'Degraded' },
  { id: 'MAN-M14-076', coordinates: [-2.228, 53.456], city: 'Manchester', status: 'Degraded' },
  { id: 'MAN-M14-077', coordinates: [-2.214, 53.454], city: 'Manchester', status: 'Degraded' },
  { id: 'MAN-M14-078', coordinates: [-2.236, 53.456], city: 'Manchester', status: 'Degraded' },
  { id: 'MAN-M14-079', coordinates: [-2.221, 53.446], city: 'Manchester', status: 'Down' },
];
