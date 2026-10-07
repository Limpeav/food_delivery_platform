'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Navigation, Store, Home, Bike, RefreshCw, ZoomIn, ZoomOut } from 'lucide-react';

export interface LocationPoint {
  lat: number;
  lng: number;
  name?: string;
  address?: string;
}

interface DeliveryTrackingMapProps {
  restaurantLocation?: LocationPoint;
  deliveryLocation?: LocationPoint;
  driverLocation?: LocationPoint;
  status?: string;
  height?: number | string;
  className?: string;
}

export const DeliveryTrackingMap: React.FC<DeliveryTrackingMapProps> = ({
  restaurantLocation,
  deliveryLocation,
  driverLocation,
  status = 'DELIVERING',
  height = 360,
  className = '',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<{
    restaurant?: any;
    delivery?: any;
    driver?: any;
    polyline1?: any;
    polyline2?: any;
  }>({});
  const [mapLoaded, setMapLoaded] = useState(false);

  // Fallback defaults: Phnom Penh center coordinates if none provided
  const restLat = restaurantLocation?.lat ?? 11.5564;
  const restLng = restaurantLocation?.lng ?? 104.9282;

  const destLat = deliveryLocation?.lat ?? 11.5621;
  const destLng = deliveryLocation?.lng ?? 104.9160;

  const driverLat = driverLocation?.lat ?? (restLat + destLat) / 2;
  const driverLng = driverLocation?.lng ?? (restLng + destLng) / 2;

  // Initialize Map
  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;
    if (mapRef.current) return;

    let isMounted = true;

    import('leaflet').then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      // Fix icon issues
      // @ts-ignore
      delete L.Icon.Default.prototype._getIconUrl;

      const map = L.map(mapContainerRef.current, {
        center: [driverLat, driverLng],
        zoom: 14,
        zoomControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Create Custom HTML DivIcons
      const restaurantIcon = L.divIcon({
        html: `
          <div class="relative flex items-center justify-center">
            <div style="background:#FF5A1F;box-shadow:0 0 15px rgba(255,90,31,0.5);" class="w-10 h-10 rounded-2xl flex items-center justify-center text-white border-2 border-white shadow-xl transition-transform hover:scale-110">
              <span style="font-size:18px;">🏪</span>
            </div>
            <div style="background:#FF5A1F;" class="absolute -bottom-1.5 w-3 h-3 rotate-45 border-r border-b border-white"></div>
          </div>
        `,
        className: 'custom-map-icon',
        iconSize: [40, 44],
        iconAnchor: [20, 44],
      });

      const customerIcon = L.divIcon({
        html: `
          <div class="relative flex items-center justify-center">
            <div style="background:#2563EB;box-shadow:0 0 15px rgba(37,99,235,0.5);" class="w-10 h-10 rounded-2xl flex items-center justify-center text-white border-2 border-white shadow-xl transition-transform hover:scale-110">
              <span style="font-size:18px;">🏠</span>
            </div>
            <div style="background:#2563EB;" class="absolute -bottom-1.5 w-3 h-3 rotate-45 border-r border-b border-white"></div>
          </div>
        `,
        className: 'custom-map-icon',
        iconSize: [40, 44],
        iconAnchor: [20, 44],
      });

      const driverIcon = L.divIcon({
        html: `
          <div class="relative flex items-center justify-center">
            <div class="absolute -inset-2 rounded-full bg-emerald-400/30 animate-ping"></div>
            <div style="background:#10B981;box-shadow:0 0 18px rgba(16,185,129,0.7);" class="relative w-11 h-11 rounded-full flex items-center justify-center text-white border-2 border-white shadow-2xl transition-transform hover:scale-110">
              <span style="font-size:20px;">🛵</span>
            </div>
          </div>
        `,
        className: 'custom-map-icon',
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });

      // Markers
      const restMarker = L.marker([restLat, restLng], { icon: restaurantIcon }).addTo(map);
      restMarker.bindPopup(`
        <div style="font-family:sans-serif;font-size:12px;line-height:1.4;">
          <strong style="color:#FF5A1F;">🏪 Restaurant</strong><br/>
          ${restaurantLocation?.name || 'Pickup Point'}<br/>
          <span style="color:#64748b;font-size:11px;">${restaurantLocation?.address || ''}</span>
        </div>
      `);

      const destMarker = L.marker([destLat, destLng], { icon: customerIcon }).addTo(map);
      destMarker.bindPopup(`
        <div style="font-family:sans-serif;font-size:12px;line-height:1.4;">
          <strong style="color:#2563EB;">🏠 Delivery Destination</strong><br/>
          ${deliveryLocation?.name || 'Customer'}<br/>
          <span style="color:#64748b;font-size:11px;">${deliveryLocation?.address || ''}</span>
        </div>
      `);

      let driverMarker: any = null;
      let poly1: any = null;
      let poly2: any = null;

      if (driverLocation) {
        driverMarker = L.marker([driverLat, driverLng], { icon: driverIcon }).addTo(map);
        driverMarker.bindPopup(`
          <div style="font-family:sans-serif;font-size:12px;line-height:1.4;">
            <strong style="color:#10B981;">🛵 Courier in Transit</strong><br/>
            ${driverLocation?.name || 'Delivery Partner'}<br/>
            <span style="color:#64748b;font-size:11px;">Live GPS Tracking</span>
          </div>
        `);

        // Route polyline: Restaurant -> Driver -> Destination
        poly1 = L.polyline(
          [[restLat, restLng], [driverLat, driverLng]],
          { color: '#10B981', weight: 4, opacity: 0.7, dashArray: '6, 8' }
        ).addTo(map);

        poly2 = L.polyline(
          [[driverLat, driverLng], [destLat, destLng]],
          { color: '#3B82F6', weight: 4, opacity: 0.8, dashArray: '8, 8' }
        ).addTo(map);
      } else {
        // Direct route restaurant -> destination
        poly1 = L.polyline(
          [[restLat, restLng], [destLat, destLng]],
          { color: '#FF5A1F', weight: 4, opacity: 0.7, dashArray: '6, 8' }
        ).addTo(map);
      }

      markersRef.current = {
        restaurant: restMarker,
        delivery: destMarker,
        driver: driverMarker,
        polyline1: poly1,
        polyline2: poly2,
      };

      // Fit bounds to show both pins (and rider)
      const latlngs = driverLocation
        ? [[restLat, restLng], [destLat, destLng], [driverLat, driverLng]]
        : [[restLat, restLng], [destLat, destLng]];

      try {
        const bounds = L.latLngBounds(latlngs as any);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
      } catch (e) {
        console.error('Map fitBounds error:', e);
      }

      mapRef.current = map;
      setMapLoaded(true);
    });

    return () => {
      isMounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update Driver Position Live dynamically when GPS coordinates change
  useEffect(() => {
    if (!mapRef.current || !driverLocation) return;
    import('leaflet').then((L) => {
      const { driver, polyline1, polyline2 } = markersRef.current;
      const dLat = driverLocation.lat;
      const dLng = driverLocation.lng;

      if (driver) {
        driver.setLatLng([dLat, dLng]);
      }

      if (polyline1 && polyline2) {
        polyline1.setLatLngs([[restLat, restLng], [dLat, dLng]]);
        polyline2.setLatLngs([[dLat, dLng], [destLat, destLng]]);
      }
    });
  }, [driverLocation?.lat, driverLocation?.lng, restLat, restLng, destLat, destLng]);

  const fitAll = () => {
    if (!mapRef.current) return;
    import('leaflet').then((L) => {
      const latlngs = driverLocation
        ? [[restLat, restLng], [destLat, destLng], [driverLat, driverLng]]
        : [[restLat, restLng], [destLat, destLng]];
      mapRef.current.fitBounds(L.latLngBounds(latlngs as any), { padding: [50, 50], maxZoom: 16 });
    });
  };

  const focusDriver = () => {
    if (!mapRef.current || !driverLocation) return;
    mapRef.current.setView([driverLocation.lat, driverLocation.lng], 16, { animate: true });
  };

  return (
    <div className={`relative rounded-3xl overflow-hidden border border-slate-200/80 shadow-md ${className}`}>
      {/* External Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        crossOrigin=""
      />

      <div
        ref={mapContainerRef}
        style={{ height, width: '100%', background: '#0f172a' }}
        className="relative z-0"
      />

      {/* Map Header Status Floating Card */}
      <div className="absolute top-4 left-4 z-[1000] flex items-center gap-2.5 rounded-2xl bg-slate-950/90 backdrop-blur-md border border-slate-800 px-3.5 py-2 text-white shadow-xl">
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
        <div className="flex flex-col">
          <span className="text-[11px] font-black tracking-wider uppercase text-emerald-400 flex items-center gap-1">
            <Navigation className="w-3 h-3 text-emerald-400" /> Live Tracking
          </span>
          <span className="text-xs font-semibold text-slate-200">
            {status === 'DELIVERING' || status === 'OUT_FOR_DELIVERY' || status === 'FOOD_PICKED_UP'
              ? 'Rider is on the way to you'
              : status === 'READY_FOR_PICKUP' || status === 'DRIVER_ASSIGNED'
              ? 'Rider heading to restaurant'
              : status === 'DELIVERED'
              ? 'Order completed & delivered'
              : 'Kitchen preparing your order'}
          </span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="absolute bottom-4 right-4 z-[1000] flex flex-col gap-2">
        {driverLocation && (
          <button
            type="button"
            onClick={focusDriver}
            title="Locate Driver"
            className="w-10 h-10 rounded-2xl bg-white/95 backdrop-blur-sm border border-slate-200 text-emerald-600 flex items-center justify-center shadow-lg hover:bg-emerald-50 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Bike className="w-5 h-5" />
          </button>
        )}
        <button
          type="button"
          onClick={fitAll}
          title="Fit Full Route"
          className="w-10 h-10 rounded-2xl bg-white/95 backdrop-blur-sm border border-slate-200 text-slate-700 flex items-center justify-center shadow-lg hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Map Legend Bar */}
      <div className="absolute bottom-4 left-4 z-[1000] hidden sm:flex items-center gap-3 rounded-xl bg-white/95 backdrop-blur-sm border border-slate-200/90 px-3 py-1.5 shadow-lg text-[11px] font-medium text-slate-600">
        <span className="flex items-center gap-1">
          <span className="text-xs">🏪</span> Restaurant
        </span>
        <span className="text-slate-300">•</span>
        <span className="flex items-center gap-1">
          <span className="text-xs">🛵</span> Rider
        </span>
        <span className="text-slate-300">•</span>
        <span className="flex items-center gap-1">
          <span className="text-xs">🏠</span> Drop-off
        </span>
      </div>
    </div>
  );
};
