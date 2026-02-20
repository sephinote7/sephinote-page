"use client";

import { useEffect, useRef } from "react";
import { Icon, Stack } from "@/components/ui";

interface KakaoMapProps {
  lat: number;
  lng: number;
  locationName?: string;
  className?: string;
}

declare global {
  interface Window {
    kakao: {
      maps: {
        load: (callback: () => void) => void;
        Map: new (container: HTMLElement, options: object) => unknown;
        LatLng: new (lat: number, lng: number) => unknown;
        Marker: new (options: object) => unknown;
        InfoWindow: new (options: object) => { open: (map: unknown, marker: unknown) => void };
      };
    };
  }
}

export default function KakaoMap({ lat, lng, locationName, className = "" }: KakaoMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);

  useEffect(() => {
    const loadKakaoMap = () => {
      if (!mapRef.current || !window.kakao?.maps) return;

      window.kakao.maps.load(() => {
        const position = new window.kakao.maps.LatLng(lat, lng);
        const map = new window.kakao.maps.Map(mapRef.current!, {
          center: position,
          level: 3,
        });

        const marker = new window.kakao.maps.Marker({
          map,
          position,
        });

        if (locationName) {
          const infowindow = new window.kakao.maps.InfoWindow({
            content: `<div style="padding:5px 10px;font-size:12px;">${locationName}</div>`,
          });
          infowindow.open(map, marker);
        }

        mapInstanceRef.current = map;
      });
    };

    if (window.kakao?.maps) {
      loadKakaoMap();
    } else {
      const script = document.createElement("script");
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY}&autoload=false`;
      script.async = true;
      script.onload = loadKakaoMap;
      document.head.appendChild(script);
    }
  }, [lat, lng, locationName]);

  if (!process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY) {
    return (
      <div className={`bg-zinc-100 dark:bg-zinc-800 rounded-xl p-6 ${className}`}>
        <Stack align="center" gap="md" className="text-center">
          <Icon name="bookmark" size="lg" className="text-zinc-400" />
          <div>
            <p className="font-medium text-zinc-600 dark:text-zinc-400">{locationName || "위치 정보"}</p>
            <p className="text-sm text-zinc-400">지도를 표시하려면 카카오 맵 API 키가 필요합니다.</p>
          </div>
        </Stack>
      </div>
    );
  }

  return (
    <div className={`rounded-xl overflow-hidden ${className}`}>
      {locationName && (
        <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-4 py-3">
          <Stack direction="row" align="center" gap="sm">
            <Icon name="bookmark" size="sm" className="text-blue-500" />
            <span className="font-medium text-zinc-900 dark:text-zinc-100">{locationName}</span>
          </Stack>
        </div>
      )}
      <div ref={mapRef} className="w-full h-64" />
    </div>
  );
}
