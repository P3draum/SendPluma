"use client";

import { useEffect } from "react";
import { useMap } from "@vis.gl/react-google-maps";

interface MapBoundsFitterProps {
  points: { lat: number; lng: number }[];
}

export default function MapBoundsFitter({ points }: MapBoundsFitterProps) {
  const map = useMap();

  useEffect(() => {
    if (!map || points.length === 0 || !window.google) return;

    const bounds = new window.google.maps.LatLngBounds();
    points.forEach((p) => bounds.extend(p));
    
    map.fitBounds(bounds, { top: 40, bottom: 40, left: 40, right: 40 });
  }, [map, points]);

  return null;
}
