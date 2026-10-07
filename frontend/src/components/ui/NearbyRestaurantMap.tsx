'use client';

import React, { useEffect, useRef, useState } from 'react';
import { LocateFixed, Loader2, Navigation, Star, Clock, Bike, Compass } from 'lucide-react';
import { NearbyRestaurant } from '@/types';

// Default center: Phnom Penh
const DEFAULT_LAT = 11.5564;
const DEFAULT_LNG = 104.9282;

interface NearbyRestaurantMapProps {
  userLocation: { lat: number; lng: number; address?: string };
  onLocationChange: (loc: { lat: number; lng: number; address?: string }) => void;
  radiusKm?: number;
  onRadiusChange?: (radius: number) => void;
  restaurants: NearbyRestaurant[];
  selectedRestaurantId?: number | null;
  onSelectRestaurant?: (restaurant: NearbyRestaurant) => void;
  height?: number | string;
  className?: string;
}

export const NearbyRestaurantMap: React.FC<NearbyRestaurantMapProps> = ({
  userLocation,
  onLocationChange,
  radiusKm = 5.0,
  onRadiusChange,
  restaurants,
  selectedRestaurantId,
  onSelectRestaurant,
  height = 420,
  className = '',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const circleRef = useRef<any>(null);
  const restaurantMarkersRef = useRef<Map<number, any>>(new Map());
  const [detecting, setDetecting] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  // Reverse-geocode coordinates to readable address via Nominatim
  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      return data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch {
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  };

  // Initialize Leaflet map
  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;
    if (mapRef.current) return;

    let isMounted = true;

    import('leaflet').then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      // Fix Leaflet's default asset urls
      // @ts-ignore
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const initialLat = userLocation.lat || DEFAULT_LAT;
      const initialLng = userLocation.lng || DEFAULT_LNG;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 14,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // User location marker (Pulse Blue)
      const userIcon = L.divIcon({
        html: `
          <div style="position:relative;width:28px;height:28px;display:flex;align-items:center;justify-content:center;">
            <div style="position:absolute;width:100%;height:100%;background:#3b82f6;border-radius:50%;opacity:0.4;animation:ping 2s cubic-bezier(0,0,0.2,1) infinite;"></div>
            <div style="width:20px;height:20px;background:#2563eb;border:3px solid white;border-radius:50%;box-shadow:0 3px 10px rgba(0,0,0,0.3);position:relative;z-index:2;"></div>
          </div>
        `,
        className: 'user-pin-marker',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const userMarker = L.marker([initialLat, initialLng], {
        icon: userIcon,
        draggable: true,
        title: 'Your Location (Drag to change)',
      }).addTo(map);

      userMarker.bindTooltip('📍 Your Location (Drag me)', {
        permanent: false,
        direction: 'top',
        offset: [0, -10],
      });

      // 5km Radius Circle around user
      const circle = L.circle([initialLat, initialLng], {
        color: '#FF5A1F',
        fillColor: '#FF5A1F',
        fillOpacity: 0.08,
        weight: 2,
        dashArray: '5, 5',
        radius: radiusKm * 1000,
      }).addTo(map);

      // Map interactions
      userMarker.on('dragend', async () => {
        const pos = userMarker.getLatLng();
        circle.setLatLng(pos);
        const addr = await reverseGeocode(pos.lat, pos.lng);
        onLocationChange({ lat: pos.lat, lng: pos.lng, address: addr });
      });

      map.on('click', async (e: any) => {
        const { lat, lng } = e.latlng;
        userMarker.setLatLng([lat, lng]);
        circle.setLatLng([lat, lng]);
        const addr = await reverseGeocode(lat, lng);
        onLocationChange({ lat, lng, address: addr });
      });

      mapRef.current = map;
      userMarkerRef.current = userMarker;
      circleRef.current = circle;
      setMapReady(true);
    });

    return () => {
      isMounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        userMarkerRef.current = null;
        circleRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update circle radius when radiusKm prop changes
  useEffect(() => {
    if (!circleRef.current) return;
    circleRef.current.setRadius(radiusKm * 1000);
  }, [radiusKm]);

  // Sync user marker position when userLocation changes
  useEffect(() => {
    if (!mapRef.current || !userMarkerRef.current || !circleRef.current) return;
    const { lat, lng } = userLocation;
    if (lat && lng) {
      userMarkerRef.current.setLatLng([lat, lng]);
      circleRef.current.setLatLng([lat, lng]);
    }
  }, [userLocation.lat, userLocation.lng]);

  // Render restaurant markers dynamically
  useEffect(() => {
    if (!mapRef.current || !mapReady) return;

    import('leaflet').then((L) => {
      // Clear existing markers
      restaurantMarkersRef.current.forEach((marker) => {
        if (mapRef.current) mapRef.current.removeLayer(marker);
      });
      restaurantMarkersRef.current.clear();

      restaurants.forEach((r) => {
        if (r.latitude == null || r.longitude == null) return;

        const isSelected = selectedRestaurantId === r.id;
        const markerBg = isSelected ? '#FF5A1F' : r.isOpen ? '#059669' : '#64748b';

        const customIcon = L.divIcon({
          html: `
            <div style="background:${markerBg};color:white;padding:4px 8px;border-radius:18px;font-size:11px;font-weight:700;display:flex;align-items:center;gap:4px;box-shadow:0 3px 8px rgba(0,0,0,0.3);border:2px solid white;transform:${isSelected ? 'scale(1.15)' : 'scale(1)'};transition:all 0.2s ease;">
              <span>🍽️</span>
              <span style="max-width:85px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${r.name}</span>
              <span style="background:rgba(255,255,255,0.25);border-radius:10px;padding:1px 4px;font-size:10px;">★${r.rating.toFixed(1)}</span>
            </div>
          `,
          className: 'custom-restaurant-marker',
          iconSize: [120, 30],
          iconAnchor: [60, 15],
        });

        const marker = L.marker([r.latitude, r.longitude], { icon: customIcon }).addTo(mapRef.current);

        // Rich popup
        const popupContent = `
          <div style="min-width:180px;font-family:sans-serif;padding:4px;">
            <div style="font-weight:bold;font-size:13px;color:#0f172a;margin-bottom:2px;">${r.name}</div>
            <div style="font-size:11px;color:#64748b;margin-bottom:6px;">${r.categoryName || 'Cuisine'} • ${r.address}</div>
            <div style="display:flex;align-items:center;gap:8px;font-size:11px;margin-bottom:8px;">
              <span style="color:#059669;font-weight:bold;">📍 ${r.distanceKm} km away</span>
              <span style="color:#64748b;">⏱ ~${r.estimatedDeliveryMinutes} min</span>
            </div>
            <div style="font-size:11px;font-weight:600;color:${r.isOpen ? '#059669' : '#e11d48'};margin-bottom:8px;">
              ${r.isOpen ? '● Open Now' : '○ Closed'}
            </div>
            <a href="/restaurants/${r.id}" style="display:block;text-align:center;background:#FF5A1F;color:white;padding:6px 12px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:11px;">
              View Menu & Order
            </a>
          </div>
        `;

        marker.bindPopup(popupContent);

        marker.on('click', () => {
          if (onSelectRestaurant) onSelectRestaurant(r);
        });

        restaurantMarkersRef.current.set(r.id, marker);
      });
    });
  }, [restaurants, selectedRestaurantId, mapReady, onSelectRestaurant]);

  // Pan to selected restaurant if selected externally
  useEffect(() => {
    if (!mapRef.current || !selectedRestaurantId) return;
    const selected = restaurants.find((r) => r.id === selectedRestaurantId);
    if (selected && selected.latitude && selected.longitude) {
      mapRef.current.panTo([selected.latitude, selected.longitude], { animate: true });
      const marker = restaurantMarkersRef.current.get(selectedRestaurantId);
      if (marker) marker.openPopup();
    }
  }, [selectedRestaurantId, restaurants]);

  // GPS Locate Current Location
  const handleLocateMe = () => {
    if (!navigator.geolocation) return;
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const addr = await reverseGeocode(latitude, longitude);
        onLocationChange({ lat: latitude, lng: longitude, address: addr });
        if (mapRef.current) {
          mapRef.current.setView([latitude, longitude], 14, { animate: true });
        }
        setDetecting(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setDetecting(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const radiusOptions = [3, 5, 8, 10];

  return (
    <div className={`relative rounded-3xl overflow-hidden border border-slate-200/80 shadow-md ${className}`}>
      {/* Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        crossOrigin=""
      />

      {/* Map Container */}
      <div
        ref={mapContainerRef}
        style={{ height, width: '100%', background: '#0f172a' }}
        aria-label="5km Radius Nearby Restaurants Interactive Map"
      />

      {/* Top Map Floating Bar: GPS Button & Radius Picker */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Radius Quick Selector */}
        {onRadiusChange && (
          <div className="pointer-events-auto flex items-center gap-1 bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-2xl shadow-lg border border-slate-200/80">
            <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1 mr-1">
              <Compass className="w-3.5 h-3.5 text-[#FF5A1F]" /> Radius:
            </span>
            {radiusOptions.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => onRadiusChange(r)}
                className={`text-xs font-bold px-2 py-0.5 rounded-xl transition-all cursor-pointer ${
                  radiusKm === r
                    ? 'bg-[#FF5A1F] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {r}km
              </button>
            ))}
          </div>
        )}

        {/* Locate Me GPS Button */}
        <button
          type="button"
          onClick={handleLocateMe}
          disabled={detecting}
          className="pointer-events-auto flex items-center gap-1.5 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-950 transition-all shadow-lg cursor-pointer disabled:opacity-60 ml-auto"
        >
          {detecting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FF5A1F]" />
          ) : (
            <LocateFixed className="w-3.5 h-3.5 text-[#FF5A1F]" />
          )}
          {detecting ? 'Locating...' : 'Use My GPS'}
        </button>
      </div>

      {/* Bottom Floating Info Pill */}
      <div className="absolute bottom-3 left-3 right-3 z-[1000] pointer-events-none">
        <div className="pointer-events-auto flex items-center justify-between gap-3 rounded-2xl bg-white/95 backdrop-blur-md px-4 py-2 text-xs shadow-xl border border-slate-200/90 text-slate-700">
          <div className="flex items-center gap-2 min-w-0">
            <span className="flex h-2.5 w-2.5 shrink-0 rounded-full bg-blue-600 animate-pulse" />
            <p className="truncate font-semibold text-slate-800 text-[11px] sm:text-xs">
              {userLocation.address || 'Phnom Penh Center'}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="rounded-full bg-orange-100 px-2.5 py-0.5 font-bold text-[#FF5A1F] text-[10px] sm:text-[11px]">
              {restaurants.length} nearby in {radiusKm}km
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
