import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ImageIcon } from "lucide-react";

export function BackgroundSelector({
  backgrounds,
  currentIndex,
  currentName,
  showDropdown,
  onToggleDropdown,
  onSelectBackground,
}) {
  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggleDropdown}
        className="text-white hover:bg-white/20 backdrop-blur-md"
      >
        <ImageIcon className="h-4 w-4 mr-2" />
        <span className="text-sm">{currentName}</span>
        <ChevronDown className="h-4 w-4 ml-2" />
      </Button>

      {showDropdown && (
        <div className="absolute bottom-full mb-2 left-0 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg shadow-2xl py-1 min-w-[180px] z-50">
          {backgrounds.map((bg, index) => (
            <button
              key={bg.id}
              onClick={() => onSelectBackground(index)}
              className={`w-full text-left px-3 py-1.5 text-sm hover:bg-white/20 transition-colors ${
                currentIndex === index
                  ? "bg-white/30 text-white font-semibold"
                  : "text-white/90"
              }`}
            >
              {bg.name}
              {currentIndex === index && <span className="ml-2">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
