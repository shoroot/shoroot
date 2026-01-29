import { useEffect, useCallback, useState } from "react";

export function useAutoPlay(
  itemCount: number,
  interval: number = 5000,
  autoPlay: boolean = true,
) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % itemCount);
  }, [itemCount]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + itemCount) % itemCount);
  }, [itemCount]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const pause = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    setIsPaused(false);
  }, []);

  useEffect(() => {
    if (!autoPlay || isPaused || itemCount <= 1) {
      return;
    }

    const timer = setInterval(goToNext, interval);

    return () => {
      clearInterval(timer);
    };
  }, [autoPlay, isPaused, interval, goToNext, itemCount]);

  return {
    currentIndex,
    goToNext,
    goToPrevious,
    goToSlide,
    pause,
    resume,
    isPaused,
  };
}
