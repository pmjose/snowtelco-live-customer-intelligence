export interface TopoNode {
  id: string;
  label: string;
  type: 'core' | 'region' | 'cluster' | 'site' | 'cell';
  status: 'OK' | 'Degraded' | 'Down' | 'Watch';
  parentId?: string;
  postcode?: string;
  city?: string;
}

export const topology: TopoNode[] = [
  { id: 'CORE-UK', label: 'SnowTelco Core UK', type: 'core', status: 'OK' },
  { id: 'REG-NW', label: 'North West', type: 'region', status: 'Degraded', parentId: 'CORE-UK' },
  { id: 'REG-LDN', label: 'London', type: 'region', status: 'Degraded', parentId: 'CORE-UK' },
  { id: 'REG-WM', label: 'West Midlands', type: 'region', status: 'OK', parentId: 'CORE-UK' },
  { id: 'REG-SCO', label: 'Scotland', type: 'region', status: 'OK', parentId: 'CORE-UK' },
  // North West
  { id: 'CLU-MAN-01', label: 'MAN-01', type: 'cluster', status: 'Degraded', parentId: 'REG-NW' },
  { id: 'CLU-LIV-01', label: 'LIV-01', type: 'cluster', status: 'OK', parentId: 'REG-NW' },
  { id: 'SITE-MAN-M14-A', label: 'M14-A (Rusholme)', type: 'site', status: 'Down', parentId: 'CLU-MAN-01', postcode: 'M14', city: 'Manchester' },
  { id: 'SITE-MAN-M14-B', label: 'M14-B (Fallowfield)', type: 'site', status: 'Degraded', parentId: 'CLU-MAN-01', postcode: 'M14', city: 'Manchester' },
  { id: 'SITE-MAN-M14-C', label: 'M14-C (Moss Side)', type: 'site', status: 'Degraded', parentId: 'CLU-MAN-01', postcode: 'M14', city: 'Manchester' },
  { id: 'CELL-MAN-M14-A1', label: 'A1 5G', type: 'cell', status: 'Down', parentId: 'SITE-MAN-M14-A' },
  { id: 'CELL-MAN-M14-A2', label: 'A2 4G', type: 'cell', status: 'Degraded', parentId: 'SITE-MAN-M14-A' },
  { id: 'CELL-MAN-M14-B1', label: 'B1 5G', type: 'cell', status: 'Degraded', parentId: 'SITE-MAN-M14-B' },
  // London
  { id: 'CLU-LDN-E14', label: 'LDN-E14', type: 'cluster', status: 'Watch', parentId: 'REG-LDN', city: 'London' },
  { id: 'SITE-LDN-E14-A', label: 'E14-A (Canary Wharf)', type: 'site', status: 'Watch', parentId: 'CLU-LDN-E14', postcode: 'E14', city: 'London' },
  // Birmingham
  { id: 'CLU-BIR-B4', label: 'BIR-B4', type: 'cluster', status: 'OK', parentId: 'REG-WM' },
  { id: 'SITE-BIR-B4-A', label: 'B4-A (Digbeth)', type: 'site', status: 'OK', parentId: 'CLU-BIR-B4', postcode: 'B4', city: 'Birmingham' },
  // London IMS Core (HSS / P-CSCF)
  { id: 'CLU-LDN-CORE', label: 'LDN-CORE-IMS', type: 'cluster', status: 'Down', parentId: 'REG-LDN', city: 'London' },
  { id: 'SITE-HSS-LDN-A', label: 'HSS-LDN-A (Oracle USPL)', type: 'site', status: 'Down', parentId: 'CLU-LDN-CORE', postcode: 'CORE', city: 'London' },
  { id: 'SITE-PCSCF-LDN-01', label: 'LDN-PCSCF-01 (Mavenir)', type: 'site', status: 'Degraded', parentId: 'CLU-LDN-CORE', postcode: 'CORE', city: 'London' },
];

export const nodeById = (id: string) => topology.find((n) => n.id === id);
export const childrenOf = (id: string) => topology.filter((n) => n.parentId === id);
