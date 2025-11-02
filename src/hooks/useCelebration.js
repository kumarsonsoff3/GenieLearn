import { useRef, useCallback, useEffect } from "react";
import confetti from "canvas-confetti";

export function useCelebration() {
  const audioRef = useRef(null);
  const fireworksIntervalRef = useRef(null);

  const stopCelebration = useCallback(() => {
    // Stop and reset audio
    if (audioRef.current) {
      try {
        audioRef.current.loop = false;
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.src = "";
        audioRef.current.load();
      } catch (e) {
        console.error("Audio stop error:", e);
      } finally {
        audioRef.current = null;
      }
    }

    // Stop ALL audio elements on the page (failsafe)
    try {
      const allAudio = document.querySelectorAll("audio");
      allAudio.forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
        audio.src = "";
        audio.load();
      });
    } catch (e) {
      console.error("Error stopping all audio:", e);
    }

    // Stop confetti interval
    if (fireworksIntervalRef.current) {
      clearInterval(fireworksIntervalRef.current);
      fireworksIntervalRef.current = null;
    }
  }, []);

  const startCelebration = useCallback(
    duration => {
      // Stop any existing celebration first
      stopCelebration();

      // Create and play looping audio
      try {
        const audio = new Audio("/alert1.mp3");
        audio.loop = true;
        audio.volume = 0.5;

        audio.addEventListener("error", e => {
          console.error("Audio loading error:", e);
        });

        audioRef.current = audio;
        audio.play().catch(e => console.error("Audio play failed:", e));
      } catch (e) {
        console.error("Audio creation failed:", e);
      }

      // Launch canvas-confetti fireworks
      const defaults = {
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        zIndex: 9999,
      };

      function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
      }

      const launchConfetti = () => {
        confetti({
          ...defaults,
          particleCount: 50,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        });
        confetti({
          ...defaults,
          particleCount: 50,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        });
      };

      // Launch confetti immediately
      launchConfetti();

      // Continue launching for 5 seconds only
      const fireworksInterval = setInterval(launchConfetti, 250);
      fireworksIntervalRef.current = fireworksInterval;

      // Auto-stop confetti after 5 seconds (but keep audio playing)
      setTimeout(() => {
        if (fireworksIntervalRef.current) {
          clearInterval(fireworksIntervalRef.current);
          fireworksIntervalRef.current = null;
        }
      }, 5000);

      // Show completion notification
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Focus Session Complete! 🎉", {
          body: `Great job! You completed ${duration} minutes of focused work.`,
          icon: "/icon-192x192.png",
        });
      }
    },
    [stopCelebration]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCelebration();
    };
  }, [stopCelebration]);

  return {
    startCelebration,
    stopCelebration,
  };
}
