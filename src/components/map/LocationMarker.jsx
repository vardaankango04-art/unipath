import React from 'react';

export const StartMarker = ({ x = 310, y = 550, label = "Main Foyer Entrance", isDark = false }) => {
  return (
    <g id="start-marker" transform={`translate(${x}, ${y})`} className="pointer-events-none">
      {/* Outer Pulse Ring */}
      <circle 
        cx="0" 
        cy="0" 
        r="16" 
        fill={isDark ? "#FFFFFF" : "#09090B"} 
        opacity={isDark ? 0.22 : 0.12} 
      />
      {/* Inner High-Contrast Monochrome Circle */}
      <circle 
        cx="0" 
        cy="0" 
        r="11" 
        fill={isDark ? "#FFFFFF" : "#09090B"} 
        stroke={isDark ? "#09090B" : "#FFFFFF"} 
        strokeWidth="2.5" 
      />
      <text
        x="0"
        y="1"
        textAnchor="middle"
        dominantBaseline="central"
        fill={isDark ? "#09090B" : "#FFFFFF"}
        fontSize="9.5"
        fontWeight="bold"
        fontFamily="'Manrope', 'Inter', sans-serif"
      >
        A
      </text>
      <text
        x="0"
        y="18"
        textAnchor="middle"
        dominantBaseline="central"
        fill={isDark ? "#A1A1AA" : "#71717A"}
        fontSize="9.5"
        fontWeight="600"
        fontFamily="'Inter', sans-serif"
      >
        {label}
      </text>
    </g>
  );
};

export const DestinationMarker = ({ x, y, label, isDark = false }) => {
  if (!x || !y) return null;

  return (
    <g 
      id="destination-marker" 
      transform={`translate(${x}, ${y})`} 
      className="pointer-events-none transition-transform duration-200"
    >
      {/* Clean Subtle Drop Shadow Glow Filter */}
      <defs>
        <filter id="marker-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow 
            dx="0" 
            dy="3" 
            stdDeviation="3" 
            floodColor="#000000" 
            floodOpacity={isDark ? 0.5 : 0.25} 
          />
        </filter>
      </defs>

      {/* Minimalist Monochrome Pin */}
      <path
        d="M0 -22 C-9 -22 -14 -14 -14 -6 C-14 4 0 16 0 16 C0 16 14 4 14 -6 C14 -14 9 -22 0 -22 Z"
        fill={isDark ? "#FFFFFF" : "#09090B"}
        stroke={isDark ? "#14171C" : "#FFFFFF"}
        strokeWidth="2.2"
        filter="url(#marker-glow)"
      />
      {/* Center High-Contrast Dot */}
      <circle cx="0" cy="-8" r="4.5" fill={isDark ? "#09090B" : "#FFFFFF"} />
    </g>
  );
};
