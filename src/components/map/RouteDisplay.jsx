import React from 'react';

const RouteDisplay = ({ polyline, strokeColor = "#09090B", showDashes = true, isDark = false }) => {
  if (!polyline) return null;

  return (
    <g id="route-path-group" className="pointer-events-none">
      {/* Route Glow Underlay */}
      <polyline
        points={polyline}
        fill="none"
        stroke={strokeColor}
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={isDark ? "0.22" : "0.12"}
      />

      {/* Main Solid Route Line */}
      <polyline
        points={polyline}
        fill="none"
        stroke={strokeColor}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Animated Directional Dash */}
      {showDashes && (
        <polyline
          points={polyline}
          fill="none"
          stroke={isDark ? "#09090B" : "#FFFFFF"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="route-dash-animated"
        />
      )}
    </g>
  );
};

export default RouteDisplay;
