'use client';
import { useEffect, useRef } from 'react';

type TechLocation = {
  id: string;
  name: string;
  phone: string;
  lastLat: number | null;
  lastLng: number | null;
  lastSeen: string | null;
  isOnline: boolean;
  currentJob: { service: string; address: string; preferredDate: string } | null;
};

interface TrackingMapProps {
  technicians: TechLocation[];
}

export default function TrackingMap({ technicians }: TrackingMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Dynamically import Leaflet to avoid SSR issues
    import('leaflet').then(L => {
      if (!mapRef.current || mapInstanceRef.current) return;

      // Fix default marker icons
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      // Default center: Biñan, Laguna, Philippines
      const defaultCenter: [number, number] = [14.3294, 121.1164];
      const activeTechs = technicians.filter(t => t.lastLat && t.lastLng);
      const center = activeTechs.length > 0
        ? [activeTechs[0].lastLat!, activeTechs[0].lastLng!] as [number, number]
        : defaultCenter;

      const map = L.map(mapRef.current!).setView(center, 13);
      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      technicians.forEach(tech => {
        if (!tech.lastLat || !tech.lastLng) return;

        const color = tech.isOnline ? '#16a34a' : '#9ca3af';
        const icon = L.divIcon({
          className: '',
          html: `
            <div style="
              background:${color};
              color:white;
              border-radius:50%;
              width:36px;height:36px;
              display:flex;align-items:center;justify-content:center;
              font-weight:800;font-size:14px;
              border:3px solid white;
              box-shadow:0 2px 8px rgba(0,0,0,0.3);
              font-family:sans-serif;
            ">${tech.name[0].toUpperCase()}</div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        const lastSeen = tech.lastSeen
          ? new Date(tech.lastSeen).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })
          : '—';

        const popup = `
          <div style="font-family:sans-serif;min-width:180px;">
            <div style="font-weight:800;font-size:15px;color:#0f1f5c;margin-bottom:4px;">${tech.name}</div>
            <div style="font-size:12px;color:#666;margin-bottom:2px;">${tech.phone || ''}</div>
            ${tech.currentJob ? `
              <div style="font-size:12px;margin-top:6px;padding:6px;background:#eff6ff;border-radius:6px;">
                <div style="font-weight:600;color:#1d4ed8;">${tech.currentJob.service}</div>
                <div style="color:#555;margin-top:2px;">${tech.currentJob.address}</div>
              </div>` : ''}
            <div style="font-size:11px;color:${tech.isOnline ? '#16a34a' : '#9ca3af'};margin-top:6px;font-weight:600;">
              ${tech.isOnline ? '🟢 Online' : '⚫ Offline'} · Last seen ${lastSeen}
            </div>
          </div>
        `;

        L.marker([tech.lastLat, tech.lastLng], { icon })
          .addTo(map)
          .bindPopup(popup);
      });

      // Fit bounds if multiple active techs
      if (activeTechs.length > 1) {
        const bounds = L.latLngBounds(activeTechs.map(t => [t.lastLat!, t.lastLng!] as [number, number]));
        map.fitBounds(bounds, { padding: [40, 40] });
      }
    });

    return () => {
      if (mapInstanceRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (mapInstanceRef.current as any).remove();
        mapInstanceRef.current = null;
      }
    };
  }, [technicians]);

  return <div ref={mapRef} style={{ height: '100%', width: '100%', borderRadius: '16px' }} />;
}
