'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MapPin, LocateFixed, Loader2 } from 'lucide-react';
import { useTranslation } from '@/stores/languageStore';

// Default center: Phnom Penh
const DEFAULT_LAT = 11.5564;
const DEFAULT_LNG = 104.9282;
const DEFAULT_ZOOM = 15;

export interface LocationPickerValue {
  lat: number;
  lng: number;
  address?: string;
}

interface LocationPickerProps {
  value: LocationPickerValue;
  onChange: (val: LocationPickerValue) => void;
  className?: string;
  mapHeight?: number;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  value,
  onChange,
  className = '',
  mapHeight = 200,
}) => {
  const { t } = useTranslation();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [detecting, setDetecting] = useState(false);
  const [geocoding, setGeocoding] = useState(false);

  // Reverse-geocode lat/lng → human-readable address via Nominatim
  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      setGeocoding(true);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      return data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    } catch {
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    } finally {
      setGeocoding(false);
    }
  };

  // Initialise Leaflet map once on mount
  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    let isMounted = true;

    // Dynamically import Leaflet so it's SSR-safe
    import('leaflet').then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      // Clean up any previous map instance or leftover leaflet container state
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch {}
        mapRef.current = null;
      }
      if ((mapContainerRef.current as any)?._leaflet_id) {
        delete (mapContainerRef.current as any)._leaflet_id;
        mapContainerRef.current.innerHTML = '';
      }

      // Fix default icon paths broken by webpack
      // @ts-ignore
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const initialLat = Number.isFinite(value?.lat) ? value.lat : DEFAULT_LAT;
      const initialLng = Number.isFinite(value?.lng) ? value.lng : DEFAULT_LNG;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: DEFAULT_ZOOM,
        zoomControl: true,
      });

      // If unmounted while map was initializing
      if (!isMounted) {
        try {
          map.remove();
        } catch {}
        return;
      }

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Custom green marker for restaurant
      const icon = L.divIcon({
        html: `<div style="background:#10b981;width:36px;height:36px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;">
                <span style="transform:rotate(45deg);display:block;width:12px;height:12px;background:white;border-radius:50%;margin:auto;margin-top:6px;margin-left:9px;"></span>
               </div>`,
        className: '',
        iconSize: [36, 36],
        iconAnchor: [18, 36],
      });

      const marker = L.marker([initialLat, initialLng], { icon, draggable: true }).addTo(map);

      // Update on marker drag
      marker.on('dragend', async () => {
        const pos = marker.getLatLng();
        const addr = await reverseGeocode(pos.lat, pos.lng);
        onChange({ lat: pos.lat, lng: pos.lng, address: addr });
      });

      // Update on map click
      map.on('click', async (e: any) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        const addr = await reverseGeocode(lat, lng);
        onChange({ lat, lng, address: addr });
      });

      mapRef.current = map;
      markerRef.current = marker;
    });

    return () => {
      isMounted = false;
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch {}
        mapRef.current = null;
        markerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync marker position when value changes externally (e.g. GPS detect)
  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return;
    if (!Number.isFinite(value?.lat) || !Number.isFinite(value?.lng)) return;
    markerRef.current.setLatLng([value.lat, value.lng]);
    mapRef.current.setView([value.lat, value.lng], DEFAULT_ZOOM, { animate: true });
  }, [value.lat, value.lng]);

  const detectLocation = () => {
    if (!navigator.geolocation) return;
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const addr = await reverseGeocode(latitude, longitude);
        onChange({ lat: latitude, lng: longitude, address: addr });
        setDetecting(false);
      },
      () => setDetecting(false),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Map Container */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-700 shadow-inner">
        {/* Leaflet CSS */}
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          crossOrigin=""
        />
        <div
          ref={mapContainerRef}
          style={{ height: mapHeight, width: '100%', background: '#1e293b' }}
          aria-label="Restaurant location map — click to set pin or drag the marker"
        />

        {/* Detect GPS button overlaid on map */}
        <button
          type="button"
          onClick={detectLocation}
          disabled={detecting}
          aria-label="Use my current location"
          className="absolute top-3 right-3 z-[1000] flex items-center gap-1.5 rounded-xl bg-slate-950/90 border border-emerald-500/40 px-3 py-1.5 text-xs font-bold text-emerald-400 hover:bg-emerald-950 hover:border-emerald-400 transition-all shadow-lg cursor-pointer disabled:opacity-60"
        >
          {detecting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <LocateFixed className="w-3.5 h-3.5" />
          )}
          {detecting ? t.common.detectingLocation : t.common.useMyLocation}
        </button>
      </div>

      {/* Coordinate display + reverse-geocoded address */}
      <div className="rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 flex items-start gap-2.5">
        <MapPin className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          {geocoding ? (
            <p className="text-xs text-slate-400 animate-pulse">{t.common.resolvingAddress}</p>
          ) : value.address ? (
            <p className="text-xs text-slate-300 leading-snug break-words">{value.address}</p>
          ) : (
            <p className="text-xs text-slate-500 italic">
              {t.common.pinLocationInstruction}
            </p>
          )}
          <p className="text-[10px] text-slate-500 mt-1 font-mono">
            {value.lat.toFixed(6)}, {value.lng.toFixed(6)}
          </p>
        </div>
      </div>

      <p className="text-[10px] text-slate-500 px-1">
        {t.common.mapPinHelp}
      </p>
    </div>
  );
};
