import { useState, useCallback } from "react";

export const BACKGROUNDS = [
  { id: "forest-journey", name: "Forest Journey" },
  { id: "creative_flow", name: "Creative Flow" },
  { id: "deep-verdant", name: "Deep Verdant" },
  { id: "golden-hour", name: "Golden Hour" },
  { id: "majestic-mist", name: "Majestic Mist" },
  { id: "metropolis-mood", name: "Metropolis Mood" },
  { id: "primal-energy", name: "Primal Energy" },
  { id: "serene-skyline", name: "Serene Skyline" },
  { id: "spring-serenity", name: "Spring Serenity" },
];

const BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID;
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;

export function useBackground(initialIndex = 1) {
  const [currentBgIndex, setCurrentBgIndex] = useState(initialIndex);
  const [showDropdown, setShowDropdown] = useState(false);

  const getBackgroundUrl = useCallback(fileId => {
    return `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${fileId}/view?project=${PROJECT_ID}&mode=admin`;
  }, []);

  const selectBackground = useCallback(index => {
    setCurrentBgIndex(index);
    setShowDropdown(false);
  }, []);

  const nextBackground = useCallback(() => {
    setCurrentBgIndex(prev => (prev + 1) % BACKGROUNDS.length);
  }, []);

  const prevBackground = useCallback(() => {
    setCurrentBgIndex(
      prev => (prev - 1 + BACKGROUNDS.length) % BACKGROUNDS.length
    );
  }, []);

  const toggleDropdown = useCallback(() => {
    setShowDropdown(prev => !prev);
  }, []);

  const currentBackground = BACKGROUNDS[currentBgIndex];
  const backgroundUrl = getBackgroundUrl(currentBackground.id);

  return {
    currentBgIndex,
    currentBackground,
    backgroundUrl,
    showDropdown,
    selectBackground,
    nextBackground,
    prevBackground,
    toggleDropdown,
    backgrounds: BACKGROUNDS,
  };
}
