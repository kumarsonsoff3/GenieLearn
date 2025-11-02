import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Minus, Timer } from "lucide-react";

export function TimeAdjustment({
  duration,
  isRunning,
  onAdjust,
  onSetDuration,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempDuration, setTempDuration] = useState(duration);

  const handleEdit = () => {
    if (!isRunning) {
      setIsEditing(true);
      setTempDuration(duration);
    }
  };

  const handleSave = () => {
    onSetDuration(tempDuration);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setTempDuration(duration);
  };

  if (isRunning) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAdjust(-5)}
          className="text-white hover:bg-white/20 backdrop-blur-md"
        >
          <Minus className="h-4 w-4 mr-1" />5 min
        </Button>

        {isEditing ? (
          <div className="flex items-center space-x-2">
            <input
              type="number"
              min="1"
              max="9999"
              value={tempDuration}
              onChange={e => setTempDuration(parseInt(e.target.value, 10) || 1)}
              onKeyDown={e => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") handleCancel();
              }}
              autoFocus
              className="w-20 px-2 py-1 text-center bg-white/20 backdrop-blur-md border border-white/30 rounded text-white text-lg focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <Button
              size="sm"
              onClick={handleSave}
              className="bg-white/20 hover:bg-white/30 text-white"
            >
              ✓
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCancel}
              className="text-white hover:bg-white/20"
            >
              ✕
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            onClick={handleEdit}
            className="text-white hover:bg-white/20 backdrop-blur-md text-lg px-6"
          >
            <Timer className="h-5 w-5 mr-2" />
            {duration} minutes
          </Button>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAdjust(5)}
          className="text-white hover:bg-white/20 backdrop-blur-md"
        >
          <Plus className="h-4 w-4 mr-1" />5 min
        </Button>
      </div>

      {/* Preset times */}
      <div className="flex items-center justify-center space-x-2">
        {[15, 25, 45, 60].map(mins => (
          <Button
            key={mins}
            size="sm"
            variant={duration === mins ? "default" : "ghost"}
            onClick={() => onSetDuration(mins)}
            className={
              duration === mins
                ? "bg-white text-gray-900"
                : "text-white hover:bg-white/20 backdrop-blur-md"
            }
          >
            {mins}m
          </Button>
        ))}
      </div>
    </div>
  );
}
