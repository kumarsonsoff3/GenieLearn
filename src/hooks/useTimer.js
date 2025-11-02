import { useState, useEffect, useRef, useCallback } from "react";

const DEFAULT_DURATION = 25;

export function useTimer({ onComplete }) {
  const [duration, setDuration] = useState(DEFAULT_DURATION);
  const [timeLeft, setTimeLeft] = useState(DEFAULT_DURATION * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [completedMinutes, setCompletedMinutes] = useState(0);

  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const lastSaveRef = useRef(null);
  const durationRef = useRef(duration);
  const hasCompletedRef = useRef(false);

  useEffect(() => {
    durationRef.current = duration;
  }, [duration]);

  const saveProgress = useCallback(
    async (minutes, isCompleted) => {
      if (!sessionId) return;

      try {
        await fetch("/api/focus/sessions", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            completedMinutes: minutes,
            isCompleted,
          }),
        });
        setCompletedMinutes(minutes);
      } catch (error) {
        console.error("Failed to save progress:", error);
      }
    },
    [sessionId]
  );

  const handleTimerComplete = useCallback(() => {
    if (hasCompletedRef.current) return;

    hasCompletedRef.current = true;
    setIsRunning(false);
    setIsCompleted(true);
    const currentDuration = durationRef.current;
    saveProgress(currentDuration, true);

    if (onComplete) {
      onComplete(currentDuration);
    }
  }, [saveProgress, onComplete]);

  useEffect(() => {
    if (isRunning && timeLeft > 0 && !hasCompletedRef.current) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft, handleTimerComplete]);

  useEffect(() => {
    if (isRunning && sessionId) {
      const now = Date.now();
      if (!lastSaveRef.current || now - lastSaveRef.current >= 60000) {
        const elapsed = Math.floor((duration * 60 - timeLeft) / 60);
        if (elapsed > completedMinutes) {
          saveProgress(elapsed, false);
          lastSaveRef.current = now;
        }
      }
    }
  }, [
    timeLeft,
    isRunning,
    sessionId,
    duration,
    completedMinutes,
    saveProgress,
  ]);

  const start = useCallback(
    async backgroundId => {
      if (!isRunning) {
        setIsRunning(true);
        setIsPaused(false);
        startTimeRef.current = Date.now();
        hasCompletedRef.current = false;

        if (!sessionId) {
          try {
            const response = await fetch("/api/focus/sessions", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                duration,
                completedMinutes: 0,
                backgroundId,
                isCompleted: false,
              }),
            });

            if (response.ok) {
              const session = await response.json();
              setSessionId(session.$id);
            }
          } catch (error) {
            console.error("Failed to create session:", error);
          }
        }
      }
    },
    [isRunning, duration, sessionId]
  );

  const pause = useCallback(() => {
    setIsRunning(false);
    setIsPaused(true);

    const elapsed = Math.floor((duration * 60 - timeLeft) / 60);
    if (elapsed > completedMinutes) {
      saveProgress(elapsed, false);
    }
  }, [duration, timeLeft, completedMinutes, saveProgress]);

  const reset = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    setIsCompleted(false);
    setTimeLeft(duration * 60);
    setSessionId(null);
    setCompletedMinutes(0);
    startTimeRef.current = null;
    lastSaveRef.current = null;
    hasCompletedRef.current = false;
  }, [duration]);

  const adjustTime = useCallback(
    minutes => {
      const newDuration = Math.max(5, duration + minutes);
      setDuration(newDuration);
      if (!isRunning) {
        setTimeLeft(newDuration * 60);
      }
    },
    [duration, isRunning]
  );

  const setCustomDuration = useCallback(
    minutes => {
      const newDuration = Math.max(1, minutes);
      setDuration(newDuration);
      if (!isRunning) {
        setTimeLeft(newDuration * 60);
      }
    },
    [isRunning]
  );

  const progress = duration > 0 ? ((duration * 60 - timeLeft) / (duration * 60)) * 100 : 0;

  return {
    duration,
    timeLeft,
    isRunning,
    isPaused,
    isCompleted,
    progress,
    completedMinutes,
    start,
    pause,
    reset,
    adjustTime,
    setCustomDuration,
    setIsCompleted,
  };
}
