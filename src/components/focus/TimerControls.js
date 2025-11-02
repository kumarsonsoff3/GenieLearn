import React from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, X } from "lucide-react";

export function TimerControls({
  isCompleted,
  isRunning,
  isPaused,
  onStart,
  onPause,
  onReset,
  onStop,
}) {
  if (isCompleted) {
    return (
      <div className="flex items-center justify-center space-x-4">
        <Button
          size="lg"
          onClick={onStop}
          className="bg-red-500 text-white hover:bg-red-600 px-8 py-6 text-lg shadow-xl animate-pulse"
        >
          <X className="h-6 w-6 mr-2" />
          Stop
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center space-x-4">
      {!isRunning ? (
        <Button
          size="lg"
          onClick={onStart}
          className="bg-white text-gray-900 hover:bg-white/90 px-8 py-6 text-lg shadow-xl"
        >
          <Play className="h-6 w-6 mr-2" />
          {isPaused ? "Resume" : "Start"}
        </Button>
      ) : (
        <Button
          size="lg"
          onClick={onPause}
          className="bg-white text-gray-900 hover:bg-white/90 px-8 py-6 text-lg shadow-xl"
        >
          <Pause className="h-6 w-6 mr-2" />
          Pause
        </Button>
      )}

      <Button
        size="lg"
        variant="outline"
        onClick={onReset}
        className="border-white text-white hover:bg-white/20 backdrop-blur-md px-6 py-6"
      >
        <RotateCcw className="h-5 w-5" />
      </Button>
    </div>
  );
}
