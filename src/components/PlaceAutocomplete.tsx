"use client";

import { useEffect, useRef, useState } from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";

interface PlaceAutocompleteProps {
  id?: string;
  placeholder?: string;
  defaultValue?: string;
  className?: string;
  onPlaceSelect: (place: { address: string; lat: number; lng: number } | null) => void;
}

export default function PlaceAutocomplete({ id, placeholder, defaultValue, className, onPlaceSelect }: PlaceAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const places = useMapsLibrary("places");
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    if (!places || !inputRef.current) return;

    const options: google.maps.places.AutocompleteOptions = {
      fields: ["geometry", "name", "formatted_address", "place_id"],
      componentRestrictions: { country: "br" },
      types: ["establishment", "geocode"],
    };

    const instance = new places.Autocomplete(inputRef.current, options);
    setAutocomplete(instance);
  }, [places]);

  useEffect(() => {
    if (!autocomplete) return;

    const listener = autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (place.geometry?.location) {
        onPlaceSelect({
          address: place.formatted_address || place.name || "",
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        });
      }
    });

    return () => {
      google.maps.event.removeListener(listener);
    };
  }, [autocomplete, onPlaceSelect]);

  return (
    <input
      id={id}
      ref={inputRef}
      type="text"
      placeholder={placeholder}
      defaultValue={defaultValue}
      className={className}
    />
  );
}
