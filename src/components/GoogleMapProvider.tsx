"use client";

import { APIProvider, useApiIsLoaded } from "@vis.gl/react-google-maps";
import { ReactNode } from "react";

// For backward compatibility with existing components
export const useGoogleMaps = () => {
  const isLoaded = useApiIsLoaded();
  return { isLoaded, loadError: undefined }; // APIProvider handles errors internally usually
};

export default function GoogleMapProvider({ children }: { children: ReactNode }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  return (
    <APIProvider apiKey={apiKey} libraries={["places", "geometry"]} version="beta">
      {children}
    </APIProvider>
  );
}
