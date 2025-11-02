"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Maximize, Minimize, Volume2, VolumeX, X, Brain } from "lucide-react";
import { useTimer } from "@/hooks/useTimer";
import { useBackground } from "@/hooks/useBackground";
import { useCelebration } from "@/hooks/useCelebration";
import { TimerCircle } from "@/components/focus/TimerCircle";
import { TimerControls } from "@/components/focus/TimerControls";
import { TimeAdjustment } from "@/components/focus/TimeAdjustment";
import { BackgroundSelector } from "@/components/focus/BackgroundSelector";

export default function FocusMode() {
  const router = useRouter();
  const { user, isAuthenticated } = useSelector(state => state.auth);

  // Custom hooks
  const background = useBackground(1);
  const { startCelebration, stopCelebration } = useCelebration();
  const timer = useTimer({
    onComplete: duration => {
      startCelebration(duration);
    },
  });

  // UI states
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  // Request notification permission on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Handle timer actions
  const handleStart = useCallback(() => {
    timer.start(background.currentBackground.id);
  }, [timer, background.currentBackground.id]);

  const handleReset = useCallback(() => {
    timer.reset();
    stopCelebration();
  }, [timer, stopCelebration]);

  const handleStop = useCallback(() => {
    stopCelebration();
    timer.setIsCompleted(false);
  }, [stopCelebration, timer]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden"
      style={{
        backgroundImage: `url(${background.backgroundUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Dark overlay for better text visibility */}
      <div className="absolute inset-0 bg-black/5 backdrop-blur-sm"></div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard")}
            className="text-white hover:bg-white/20 backdrop-blur-md"
          >
            <X className="h-5 w-5 mr-2" />
            Exit Focus Mode
          </Button>

          <div className="flex items-center space-x-2">
            <Badge
              variant="secondary"
              className="bg-white/20 text-white backdrop-blur-md px-4 py-2"
            >
              <Brain className="h-4 w-4 mr-2" />
              {background.currentBackground.name}
            </Badge>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            className="text-white hover:bg-white/20 backdrop-blur-md"
          >
            {isFullscreen ? (
              <Minimize className="h-5 w-5" />
            ) : (
              <Maximize className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Main Timer Card */}
        <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl p-8 md:p-12 w-full max-w-2xl">
          <div className="text-center space-y-8">
            {/* Timer Display */}
            <TimerCircle
              timeLeft={timer.timeLeft}
              duration={timer.duration}
              isRunning={timer.isRunning}
              isPaused={timer.isPaused}
              isCompleted={timer.isCompleted}
              progress={timer.progress}
            />

            {/* Controls */}
            <TimerControls
              isCompleted={timer.isCompleted}
              isRunning={timer.isRunning}
              isPaused={timer.isPaused}
              onStart={handleStart}
              onPause={timer.pause}
              onReset={handleReset}
              onStop={handleStop}
            />

            {/* Time Adjustment */}
            <TimeAdjustment
              duration={timer.duration}
              isRunning={timer.isRunning}
              onAdjust={timer.adjustTime}
              onSetDuration={timer.setCustomDuration}
            />

            {/* Progress Info */}
            {timer.isRunning && (
              <div className="text-white/80 text-sm">
                <div className="flex items-center justify-center space-x-4">
                  <span>
                    Completed:{" "}
                    {Math.floor((timer.duration * 60 - timer.timeLeft) / 60)}{" "}
                    min
                  </span>
                  <span>•</span>
                  <span>{Math.round(timer.progress)}% done</span>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-6 flex items-center justify-between">
          {/* Background Selector */}
          <BackgroundSelector
            backgrounds={background.backgrounds}
            currentIndex={background.currentBgIndex}
            currentName={background.currentBackground.name}
            showDropdown={background.showDropdown}
            onToggleDropdown={background.toggleDropdown}
            onSelectBackground={background.selectBackground}
          />

          {/* Sound Toggle (Placeholder) */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSoundEnabled(!isSoundEnabled)}
            className="text-white hover:bg-white/20 backdrop-blur-md"
            disabled
          >
            {isSoundEnabled ? (
              <Volume2 className="h-5 w-5" />
            ) : (
              <VolumeX className="h-5 w-5" />
            )}
            <span className="ml-2 text-xs opacity-60">Coming Soon</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
