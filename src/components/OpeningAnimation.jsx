import React, { useState, useEffect } from 'react';
import { Compass } from 'lucide-react';

const OpeningAnimation = ({ onComplete }) => {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Animation timing (1.2s - 1.5s total)
    const fadeTimer = setTimeout(() => {
      setFading(true);
    }, prefersReducedMotion ? 400 : 1200);

    const completeTimer = setTimeout(() => {
      if (onComplete) onComplete();
    }, prefersReducedMotion ? 600 : 1550);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div 
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#09090B] select-none transition-opacity duration-350 ease-out ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      aria-label="UniPath Loading Screen"
      role="status"
    >
      <div className="flex flex-col items-center space-y-4 px-6 text-center animate-fadeIn">
        
        {/* Animated Compass Logo Container */}
        <div className="relative">
          {/* Subtle Outer Glow Ring */}
          <div className="absolute -inset-2 rounded-3xl bg-white/10 opacity-30 blur-md" />
          
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-2xl">
            <Compass className="w-10 h-10 sm:w-12 sm:h-12 stroke-[2] text-white animate-spin-slow" />
          </div>
        </div>

        {/* Brand Name */}
        <div className="space-y-1">
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            UniPath
          </h1>
          <p className="text-sm font-medium text-[#A1A1AA] tracking-wide">
            Explore your campus.
          </p>
        </div>

        {/* Indicator Line */}
        <div className="w-24 h-1 rounded-full bg-white/15 overflow-hidden mt-2">
          <div className="w-full h-full bg-white origin-left animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export default OpeningAnimation;
