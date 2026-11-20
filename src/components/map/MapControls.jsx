import React from 'react';
import { Plus, Minus, RotateCcw } from 'lucide-react';

const MapControls = ({ onZoomIn, onZoomOut, onReset }) => {
  return (
    <div className="flex flex-col space-y-2 bg-white/90 dark:bg-[#14171C]/90 backdrop-blur-md rounded-2xl border border-[#E4E4E7] dark:border-[#27272A] p-2 shadow-card select-none transition-colors duration-200">
      <button
        onClick={onZoomIn}
        className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl hover:bg-[#F4F4F5] dark:hover:bg-[#1E232B] text-[#09090B] dark:text-[#FFFFFF] flex items-center justify-center transition active:scale-95"
        title="Zoom In"
        type="button"
        aria-label="Zoom In"
      >
        <Plus className="w-5 h-5 stroke-[2.2]" />
      </button>

      <button
        onClick={onZoomOut}
        className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl hover:bg-[#F4F4F5] dark:hover:bg-[#1E232B] text-[#09090B] dark:text-[#FFFFFF] flex items-center justify-center transition active:scale-95"
        title="Zoom Out"
        type="button"
        aria-label="Zoom Out"
      >
        <Minus className="w-5 h-5 stroke-[2.2]" />
      </button>

      <button
        onClick={onReset}
        className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl hover:bg-[#F4F4F5] dark:hover:bg-[#1E232B] text-[#71717A] dark:text-[#A1A1AA] hover:text-[#09090B] dark:hover:text-[#FFFFFF] flex items-center justify-center transition border-t border-[#E4E4E7] dark:border-[#27272A] pt-1.5 active:scale-95"
        title="Reset Map View"
        type="button"
        aria-label="Reset View"
      >
        <RotateCcw className="w-[18px] h-[18px] stroke-[2.2]" />
      </button>
    </div>
  );
};

export default MapControls;
