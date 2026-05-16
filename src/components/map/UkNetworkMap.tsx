import { useEffect, useRef } from 'react';
import maplibregl, { Map as MlMap, GeoJSONSource } from 'maplibre-gl';
import { ukCities, manchesterM14Sites } from '@/data/mapCells';
import { primaryIncident } from '@/data/networkEvents';
import { useDemoState } from '@/state/DemoStateProvider';
import { stageReached } from '@/state/stages';

type Tone = 'osm' | 'light' | 'dark';

const styles: Record<Tone, maplibregl.StyleSpecification> = {
  osm: {
    version: 8,
    sources: { osm: { type: 'raster', tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'], tileSize: 256, attribution: '© OpenStreetMap contributors' } },
    layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
  },
  light: {
    version: 8,
    sources: { carto: { type: 'raster', tiles: ['https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'], tileSize: 256, attribution: '© CARTO © OSM' } },
    layers: [{ id: 'carto', type: 'raster', source: 'carto' }],
  },
  dark: {
    version: 8,
    sources: { carto: { type: 'raster', tiles: ['https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'], tileSize: 256, attribution: '© CARTO © OSM' } },
    layers: [{ id: 'carto', type: 'raster', source: 'carto' }],
  },
};

interface Props { mapTone?: Tone }

export function UkNetworkMap({ mapTone = 'osm' }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MlMap | null>(null);
  const radiusRef = useRef<number>(0.05);
  const animFrameRef = useRef<number>(0);
  const activeMarkerRef = useRef<maplibregl.Marker | null>(null);
  const { stage, isIncidentActive, scenario, resolutionProgress } = useDemoState();
  const incidentCenter: [number, number] = [scenario.coordinates[0], scenario.coordinates[1]];

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: styles[mapTone],
      center: incidentCenter,
      zoom: 6.2,
      attributionControl: { compact: true },
    });
    map.scrollZoom.disable();
    mapRef.current = map;

    map.on('load', () => addLayers(map));
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      if (activeMarkerRef.current) { activeMarkerRef.current.remove(); activeMarkerRef.current = null; }
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Switch style when tone changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.setStyle(styles[mapTone]);
    map.once('styledata', () => addLayers(map));
  }, [mapTone]);

  // Animate radius + sites
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    cancelAnimationFrame(animFrameRef.current);

    // Make the radius noticeably visible at UK zoom levels.
    const targetRadius = stageReached(stage, 'customers_impacted') ? 0.40 : isIncidentActive ? 0.20 : 0.10;
    const shrinkFactor = 1 - resolutionProgress;
    const finalTarget = targetRadius * shrinkFactor;
    let phase = 0;

    const tick = () => {
      phase += 0.04;
      const pulse = finalTarget === 0 ? 0 : finalTarget + Math.sin(phase) * Math.max(0.008, 0.02 * shrinkFactor);
      radiusRef.current += (pulse - radiusRef.current) * 0.18;
      const src = map.getSource('incident-radius') as GeoJSONSource | undefined;
      if (src) src.setData(makeCircle(incidentCenter, Math.max(0.001, radiusRef.current)) as any);

      // Update cell-site recovery (only meaningful for the Manchester scenario;
      // other scenarios don't have a fixed cell-site overlay).
      const sitesSrc = map.getSource('cell-sites') as GeoJSONSource | undefined;
      if (sitesSrc) {
        if (scenario.id !== 'manchester') {
          sitesSrc.setData({ type: 'FeatureCollection', features: [] } as any);
        } else {
          const recoveredCount = Math.round(resolutionProgress * manchesterM14Sites.length);
          sitesSrc.setData({
            type: 'FeatureCollection',
            features: manchesterM14Sites.map((s, i) => ({
              type: 'Feature',
              geometry: { type: 'Point', coordinates: s.coordinates },
              properties: { id: s.id, status: i < recoveredCount ? 'OK' : s.status },
            })),
          } as any);
        }
      }
      animFrameRef.current = requestAnimationFrame(tick);
    };
    animFrameRef.current = requestAnimationFrame(tick);

    if (map.getLayer('incident-radius-fill')) {
      map.setPaintProperty('incident-radius-fill', 'fill-opacity', 0.22);
      map.setPaintProperty('incident-radius-line', 'line-width', 2.5);
    }
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [stage, isIncidentActive, resolutionProgress, scenario.id, incidentCenter[0], incidentCenter[1]]);

  // Highlight the active scenario's city with a red DOM marker + label, and
  // fly the map to it when the scenario changes. Always renders something
  // meaningful even at idle.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    // Remove any prior marker first
    if (activeMarkerRef.current) { activeMarkerRef.current.remove(); activeMarkerRef.current = null; }
    const el = document.createElement('div');
    el.style.cssText = 'display:flex;flex-direction:column;align-items:center;pointer-events:none;';
    el.innerHTML = `
      <div style="position:relative;width:18px;height:18px;">
        <span style="position:absolute;inset:0;border-radius:9999px;background:#E11D48;box-shadow:0 0 0 4px rgba(225,29,72,0.25);"></span>
        <span style="position:absolute;inset:4px;border-radius:9999px;background:#fff;"></span>
      </div>
      <div style="margin-top:4px;padding:2px 8px;border-radius:9999px;background:#111;color:#fff;font:700 11px/1.2 Inter,system-ui,sans-serif;white-space:nowrap;box-shadow:0 1px 6px rgba(0,0,0,.25);">${scenario.city} ${scenario.postcode ?? ''}</div>
    `;
    const marker = new maplibregl.Marker({ element: el, anchor: 'top' })
      .setLngLat([scenario.coordinates[0], scenario.coordinates[1]])
      .addTo(map);
    activeMarkerRef.current = marker;
    // Fly the map to the active city — call directly, no `load` gating
    // (map.flyTo is safe to call before tiles finish; maplibre queues it).
    try {
      map.flyTo({ center: [scenario.coordinates[0], scenario.coordinates[1]], zoom: 6.5, speed: 1.4, essential: true });
    } catch { /* ignore */ }
    return () => {
      marker.remove();
      if (activeMarkerRef.current === marker) activeMarkerRef.current = null;
    };
  }, [scenario.id]);

  function addLayers(map: MlMap) {
    if (map.getSource('cities')) return;

    map.addSource('cities', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: ukCities.map((c) => ({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: c.coordinates },
          properties: { name: c.name, status: c.status, customers: c.customers },
        })),
      },
    });
    map.addLayer({
      id: 'cities-circle',
      type: 'circle',
      source: 'cities',
      paint: {
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 4, 4, 8, 8],
        'circle-color': ['match', ['get', 'status'], 'Degraded', '#29B5E8', 'Investigating', '#F59E0B', '#111111'],
        'circle-stroke-color': '#ffffff',
        'circle-stroke-width': 2,
        'circle-opacity': 0.9,
      },
    });
    // City name labels are rendered via DOM markers below (avoids the
    // `text-field requires glyphs` console error from raster-only styles).

    map.addSource('incident-radius', { type: 'geojson', data: makeCircle(incidentCenter, 0.05) });
    map.addLayer({ id: 'incident-radius-fill', type: 'fill', source: 'incident-radius', paint: { 'fill-color': '#E11D48', 'fill-opacity': 0.22 } });
    map.addLayer({ id: 'incident-radius-line', type: 'line', source: 'incident-radius', paint: { 'line-color': '#E11D48', 'line-width': 2.5 } });

    map.addSource('cell-sites', {
      type: 'geojson',
      data: scenario.id === 'manchester'
        ? { type: 'FeatureCollection', features: manchesterM14Sites.map((s) => ({ type: 'Feature', geometry: { type: 'Point', coordinates: s.coordinates }, properties: { id: s.id, status: s.status } })) }
        : { type: 'FeatureCollection', features: [] },
    });
    map.addLayer({
      id: 'cell-sites-circle',
      type: 'circle',
      source: 'cell-sites',
      paint: {
        'circle-radius': 5,
        'circle-color': ['match', ['get', 'status'], 'Down', '#11567F', 'Degraded', '#29B5E8', 'OK', '#10B981', '#10B981'],
        'circle-stroke-color': '#ffffff',
        'circle-stroke-width': 1,
      },
    });

    map.on('click', 'cities-circle', (e) => {
      const f = e.features?.[0];
      if (!f) return;
      const props = f.properties as any;
      new maplibregl.Popup({ offset: 12 })
        .setLngLat((f.geometry as any).coordinates)
        .setHTML(`<div style="font-family:Inter,sans-serif"><strong>${props.name}</strong><br/>Status: ${props.status}<br/>${(+props.customers).toLocaleString()} customers</div>`)
        .addTo(map);
    });
  }

  return (
    <div className="vf-card overflow-hidden h-full min-h-[420px] relative">
      <div className="absolute z-10 left-3 top-3 vf-chip bg-white/90 border border-mist-dark text-ink-muted">UK Network · Live View</div>
      <div className="absolute z-10 right-3 top-3 vf-card p-2.5 text-[11px] flex items-center gap-3">
        <Legend color="#11567F" label="Down" />
        <Legend color="#29B5E8" label="Degraded" />
        <Legend color="#F59E0B" label="Investigating" />
        <Legend color="#10B981" label="OK" />
      </div>
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}

function mapToneTextColor(_m: MlMap) { return '#111'; }

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
      <span className="text-ink">{label}</span>
    </span>
  );
}

function makeCircle(center: [number, number], radiusDeg: number, points = 64) {
  const [lng, lat] = center;
  const coords: number[][] = [];
  for (let i = 0; i <= points; i++) {
    const a = (i / points) * Math.PI * 2;
    coords.push([lng + Math.cos(a) * radiusDeg / Math.cos((lat * Math.PI) / 180), lat + Math.sin(a) * radiusDeg]);
  }
  return { type: 'FeatureCollection', features: [{ type: 'Feature', geometry: { type: 'Polygon', coordinates: [coords] }, properties: {} }] } as any;
}

// Suppress unused import warning
void primaryIncident;
