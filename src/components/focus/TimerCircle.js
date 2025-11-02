import React from "react";

const CIRCLE_RADIUS = 140;

export function TimerCircle({
  timeLeft,
  duration,
  isRunning,
  isPaused,
  isCompleted,
  progress,
}) {
  const circleCircumference = 2 * Math.PI * CIRCLE_RADIUS;

  const formatTime = seconds => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    } else {
      return `${mins.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
  };

  const getStatusText = () => {
    if (isCompleted) return "🎉 Session Complete! Great Work! 🎉";
    if (isRunning) return "Focus Time";
    if (isPaused) return "Paused";
    return "Ready to Focus";
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      {/* SVG Progress Circle */}
      <svg className="w-72 h-72 md:w-96 md:h-96 transform -rotate-90">
        {/* Background circle */}
        <circle
          cx="144"
          cy="144"
          r={CIRCLE_RADIUS}
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth="8"
          fill="none"
          className="md:hidden"
        />
        <circle
          cx="192"
          cy="192"
          r={CIRCLE_RADIUS}
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth="8"
          fill="none"
          className="hidden md:block"
        />

        {/* Progress circle */}
        <circle
          cx="144"
          cy="144"
          r={CIRCLE_RADIUS}
          stroke="white"
          strokeWidth="8"
          fill="none"
          strokeDasharray={circleCircumference}
          strokeDashoffset={circleCircumference * (1 - progress / 100)}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-linear md:hidden"
        />
        <circle
          cx="192"
          cy="192"
          r={CIRCLE_RADIUS}
          stroke="white"
          strokeWidth="8"
          fill="none"
          strokeDasharray={circleCircumference}
          strokeDashoffset={circleCircumference * (1 - progress / 100)}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-linear hidden md:block"
        />
      </svg>

      {/* Timer Text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-8 md:px-12">
        <div
          className={`font-bold text-white tracking-wider font-mono text-center max-w-full ${
            timeLeft >= 3600
              ? "text-3xl sm:text-4xl md:text-5xl lg:text-6xl"
              : "text-4xl sm:text-5xl md:text-6xl lg:text-7xl"
          }`}
        >
          {formatTime(timeLeft)}
        </div>
        <div className="text-white/80 text-sm md:text-lg mt-2">
          {getStatusText()}
        </div>
      </div>
    </div>
  );
}
