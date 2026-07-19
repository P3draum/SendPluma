"use client";

import { useEffect, useRef } from "react";
import { useMap } from "@vis.gl/react-google-maps";

interface MapPolylineProps extends google.maps.PolylineOptions {
  path: google.maps.LatLngLiteral[];
}

export default function MapPolyline({ path, ...options }: MapPolylineProps) {
  const map = useMap();
  const polylineRef = useRef<google.maps.Polyline | null>(null);

  useEffect(() => {
    if (!map) return;

    const polyline = new google.maps.Polyline({
      path,
      ...options,
      map,
    });
    polylineRef.current = polyline;

    return () => {
      polyline.setMap(null);
    };
  }, [map]);

  // Update path/options on change without unmounting
  useEffect(() => {
    if (polylineRef.current) {
      polylineRef.current.setPath(path);
      polylineRef.current.setOptions(options);
    }
  }, [path, options]);

  return null;
}
