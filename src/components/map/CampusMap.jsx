import React, { useState, useRef } from 'react';
import MapControls from './MapControls';
import { StartMarker, DestinationMarker } from './LocationMarker';
import RouteDisplay from './RouteDisplay';
import { useTheme } from '../../context/ThemeContext';
import { MAIN_BUILDING_FLOORS, schematicFloors } from '../../data/floorBlueprints';

const CampusMap = ({
  selectedLocation,
  onSelectLocation,
  currentLocation = "Main Foyer Entrance",
  showRoute = true,
  currentFloor = "G",
  onSelectFloor,
  navigationPathData = null,
  allLocations = [],
  className = ""
}) => {
  const { isDark } = useTheme();
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const containerRef = useRef(null);

  // Zoom and pan controls
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 2.5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.7));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e) => {
    // Only drag when clicking background, not when clicking rooms
    if (e.target.closest('.interactive-room') || e.target.closest('button')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Active Floor Blueprint lookup (default Ground Floor)
  const activeFloorData = schematicFloors[currentFloor] || schematicFloors["G"];
  const floorRooms = activeFloorData.rooms || [];
  const floorCorridors = activeFloorData.corridors || [];
  const floorPassages = activeFloorData.passages || [];
  const floorStairs = activeFloorData.stairs || [];

  // Determine active polyline on this floor
  const activePolyline = navigationPathData?.polyline_by_floor?.[currentFloor] || null;

  // Check if selected location is on current floor
  const isSelectedOnCurrentFloor = selectedLocation && (
    (selectedLocation.floorId === currentFloor) ||
    (!selectedLocation.floorId && currentFloor === 'G') ||
    (currentFloor === 'G' && (selectedLocation.floor === 'Ground Floor' || !selectedLocation.floor)) ||
    (currentFloor === '1' && selectedLocation.floor === 'First Floor') ||
    (currentFloor === '2' && selectedLocation.floor === 'Second Floor') ||
    (currentFloor === '3' && selectedLocation.floor === 'Third Floor')
  );

  // Check if start location is on current floor
  const isStartOnCurrentFloor = (currentFloor === 'G' && (currentLocation.includes('Entrance') || currentLocation.includes('Ground')));

  // Find destination marker coordinate
  const destinationCoords = (() => {
    if (!isSelectedOnCurrentFloor || !selectedLocation) return null;
    // Look up room in current floor geometry
    const matchedRoom = floorRooms.find(r => 
      r.id === selectedLocation.code ||
      r.code === selectedLocation.code ||
      r.code === selectedLocation.roomNumber ||
      r.id === selectedLocation.roomNumber ||
      r.name.toLowerCase() === selectedLocation.name.toLowerCase() ||
      r.locationId === selectedLocation.locationId ||
      r.nodeKey === selectedLocation.nodeKey
    );
    if (matchedRoom) {
      return { x: matchedRoom.x + matchedRoom.width / 2, y: matchedRoom.y + matchedRoom.height / 2 };
    }
    return selectedLocation.svgCoordinates || { x: 310, y: 400 };
  })();

  // Start point coordinates
  const startCoords = isStartOnCurrentFloor ? { x: 310, y: 725 } : null;

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden bg-[#FAFAFA] dark:bg-[#09090B] select-none flex items-center justify-center transition-colors duration-250 ${className}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      {/* Top Left Floor Label Badge */}
      <div className="absolute top-4 left-4 z-10 bg-white/95 dark:bg-[#14171C]/95 backdrop-blur-sm px-4 py-2 rounded-xl border border-[#E4E4E7] dark:border-[#27272A] text-xs sm:text-sm font-semibold text-[#71717A] dark:text-[#A1A1AA] shadow-sm flex items-center space-x-2.5 transition-colors duration-250">
        <span className="w-2.5 h-2.5 rounded-full bg-[#09090B] dark:bg-white" />
        <span className="font-heading font-bold text-[#09090B] dark:text-white">
          Main Building · {activeFloorData.label}
        </span>
        <span className="text-[#71717A] dark:text-[#A1A1AA] hidden md:inline">
          ({activeFloorData.levelName})
        </span>
      </div>

      {/* Floor Switcher Tabs: Ground / First / Second / Third */}
      {onSelectFloor && (
        <div className="absolute top-14 sm:top-4 right-4 z-10 bg-white/95 dark:bg-[#14171C]/95 backdrop-blur-sm p-1.5 rounded-2xl border border-[#E4E4E7] dark:border-[#27272A] shadow-sm flex items-center space-x-1.5 text-xs sm:text-sm transition-colors duration-250">
          <span className="text-xs font-bold text-[#71717A] dark:text-[#A1A1AA] px-2 uppercase hidden sm:inline">
            Floor
          </span>
          {MAIN_BUILDING_FLOORS.map((fl) => {
            const isActive = currentFloor === fl.id;
            return (
              <button
                key={fl.id}
                onClick={() => onSelectFloor(fl.id)}
                className={`h-9 px-3.5 rounded-xl font-bold transition text-xs sm:text-sm ${
                  isActive 
                    ? 'bg-[#09090B] dark:bg-white text-white dark:text-[#09090B] shadow-sm ring-1 ring-[#09090B] dark:ring-white' 
                    : 'text-[#71717A] dark:text-[#A1A1AA] hover:text-[#09090B] dark:hover:text-white hover:bg-[#F4F4F5] dark:hover:bg-[#1E232B]'
                }`}
                title={fl.description}
                type="button"
              >
                {fl.shortLabel}
              </button>
            );
          })}
        </div>
      )}

      {/* Floating Map Zoom / Reset Controls */}
      <div className="absolute bottom-6 right-6 z-20">
        <MapControls
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onReset={handleReset}
        />
      </div>

      {/* Multi-floor Walkway Legend / Notice */}
      {navigationPathData?.floors_crossed && navigationPathData.floors_crossed.length > 1 && (
        <div className="absolute bottom-6 left-6 z-20 bg-white/95 dark:bg-[#14171C]/95 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-[#E4E4E7] dark:border-[#27272A] shadow-sm text-xs font-medium text-[#71717A] dark:text-[#A1A1AA] max-w-xs space-y-1">
          <div className="flex items-center space-x-1.5 text-[#09090B] dark:text-white font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Multi-Floor Route Active</span>
          </div>
          <p className="text-[11px] leading-tight">
            Crosses: {navigationPathData.floors_crossed.join(' → ')}. Use floor tabs to view route on other levels.
          </p>
        </div>
      )}

      {/* Clean SVG Canvas for Hand-drawn Schematic Floor Plans */}
      <svg
        viewBox="0 0 620 780"
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full max-h-full max-w-full transition-transform duration-75 select-none"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'center center'
        }}
      >
        <defs>
          <filter id="unipath-room-shadow" x="-5%" y="-5%" width="110%" height="115%">
            <feDropShadow 
              dx="0" 
              dy="1.5" 
              stdDeviation="2.5" 
              floodOpacity={isDark ? "0.35" : "0.06"} 
              floodColor={isDark ? "#000000" : "#09090B"} 
            />
          </filter>

          {/* Shaded Walkable Cross-Passage Pattern (Diagonal Hatching) */}
          <pattern
            id="cross-passage-pattern"
            width="10"
            height="10"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="10"
              stroke={isDark ? "#303946" : "#D4D4D8"}
              strokeWidth="2.5"
            />
          </pattern>
        </defs>

        {/* 1. Base Map Background Canvas */}
        <rect 
          x="-30" 
          y="-30" 
          width="680" 
          height="840" 
          fill={isDark ? "#09090B" : "#FAFAFA"} 
          className="transition-colors duration-250"
        />

        {/* 2. Walkable Corridors & Lobby */}
        <g id={`corridors-group-floor-${currentFloor}`}>
          {floorCorridors.map((corr, idx) => (
            <rect
              key={`corr-${idx}`}
              x={corr.x}
              y={corr.y}
              width={corr.width}
              height={corr.height}
              rx={corr.rx || 6}
              fill={isDark ? "#14171C" : "#F4F4F5"}
              stroke={isDark ? "#27272A" : "#E4E4E7"}
              strokeWidth="1"
              className="transition-colors duration-250"
            />
          ))}

          {/* Ground Floor Entry Arch & Label */}
          {activeFloorData.entry && (
            <g id="ground-entry-point">
              <rect
                x={activeFloorData.entry.x}
                y={activeFloorData.entry.y}
                width={activeFloorData.entry.width}
                height={activeFloorData.entry.height}
                rx="6"
                fill={isDark ? "#1E232B" : "#E4E4E7"}
                stroke={isDark ? "#27272A" : "#D4D4D8"}
                strokeWidth="1.2"
              />
              <text
                x={activeFloorData.entry.x + activeFloorData.entry.width / 2}
                y={activeFloorData.entry.y + activeFloorData.entry.height / 2}
                textAnchor="middle"
                dominantBaseline="central"
                fill={isDark ? "#FFFFFF" : "#09090B"}
                fontSize="11"
                fontWeight="800"
                fontFamily="'Inter', sans-serif"
                letterSpacing="0.5px"
              >
                {activeFloorData.entry.label}
              </text>
            </g>
          )}

          {/* Corridor Label Text */}
          <text
            x="310"
            y={currentFloor === 'G' ? 340 : (currentFloor === '1' ? 320 : (currentFloor === '2' ? 180 : 210))}
            textAnchor="middle"
            dominantBaseline="central"
            fill={isDark ? "#52525B" : "#A1A1AA"}
            fontSize="10"
            fontWeight="700"
            fontFamily="'Inter', sans-serif"
            letterSpacing="2px"
            opacity="0.8"
            className="pointer-events-none select-none"
          >
            WALKWAY CORRIDOR
          </text>
        </g>

        {/* 3. Walkable Cross-Passages (Shaded Bands with Hatching Pattern) */}
        <g id={`passages-group-floor-${currentFloor}`}>
          {floorPassages.map((pass) => (
            <g key={pass.id} id={pass.id}>
              {/* Solid base container for cross-passage */}
              <rect
                x={pass.x}
                y={pass.y}
                width={pass.width}
                height={pass.height}
                fill={isDark ? "#1A202C" : "#E4E4E7"}
                stroke={isDark ? "#3F3F46" : "#D4D4D8"}
                strokeWidth="1.2"
                rx="4"
              />
              {/* Diagonal hatching overlay */}
              <rect
                x={pass.x}
                y={pass.y}
                width={pass.width}
                height={pass.height}
                fill="url(#cross-passage-pattern)"
                rx="4"
                opacity={isDark ? "0.6" : "0.5"}
              />
              {/* Subtle Label */}
              <text
                x={pass.x + pass.width / 2}
                y={pass.y + pass.height / 2}
                textAnchor="middle"
                dominantBaseline="central"
                fill={isDark ? "#E4E4E7" : "#52525B"}
                fontSize="9"
                fontWeight="700"
                fontFamily="'Inter', sans-serif"
                letterSpacing="1px"
                className="pointer-events-none select-none"
              >
                CROSS-PASSAGE
              </text>
            </g>
          ))}
        </g>

        {/* 4. Staircases & Vertical Exits */}
        <g id={`stairs-group-floor-${currentFloor}`}>
          {floorStairs.map((st) => (
            <g key={st.id} id={st.id} className="select-none">
              <rect
                x={st.x}
                y={st.y}
                width={st.width}
                height={st.height}
                rx="6"
                fill={isDark ? "#1A202C" : "#EAEAEA"}
                stroke={isDark ? "#3F3F46" : "#A1A1AA"}
                strokeWidth="1.4"
                strokeDasharray="4,2"
              />
              {/* Stepped lines inside staircase */}
              <line 
                x1={st.x + 8} 
                y1={st.y + st.height * 0.3} 
                x2={st.x + st.width - 8} 
                y2={st.y + st.height * 0.3} 
                stroke={isDark ? "#71717A" : "#A1A1AA"} 
                strokeWidth="1" 
              />
              <line 
                x1={st.x + 8} 
                y1={st.y + st.height * 0.7} 
                x2={st.x + st.width - 8} 
                y2={st.y + st.height * 0.7} 
                stroke={isDark ? "#71717A" : "#A1A1AA"} 
                strokeWidth="1" 
              />
              <text
                x={st.x + st.width / 2}
                y={st.y + st.height / 2}
                textAnchor="middle"
                dominantBaseline="central"
                fill={isDark ? "#FFFFFF" : "#09090B"}
                fontSize="11"
                fontWeight="800"
                fontFamily="'Inter', sans-serif"
                className="pointer-events-none"
              >
                {st.label}
              </text>
            </g>
          ))}
        </g>

        {/* 5. Schematic Room Shapes (Clickable, id="{location_code}") */}
        <g id={`rooms-group-floor-${currentFloor}`}>
          {floorRooms.map((room) => {
            const isSelected = selectedLocation && (
              selectedLocation.code === room.id ||
              selectedLocation.code === room.code ||
              selectedLocation.roomNumber === room.id ||
              selectedLocation.roomNumber === room.code ||
              selectedLocation.id === room.id ||
              selectedLocation.name.toLowerCase() === room.name.toLowerCase() ||
              (selectedLocation.locationId && selectedLocation.locationId === room.locationId)
            );

            const roomFill = isSelected 
              ? (isDark ? "#262C36" : "#F4F4F5") 
              : (isDark ? "#14171C" : "#FFFFFF");
            const roomStroke = isSelected 
              ? (isDark ? "#FFFFFF" : "#09090B") 
              : (isDark ? "#27272A" : "#E4E4E7");
            const strokeWidth = isSelected ? "2.5" : "1.2";

            return (
              <g
                key={room.id}
                id={room.id}
                onClick={() => {
                  // Find full matching location object from database list
                  const match = allLocations.find(l => 
                    l.code === room.id || 
                    l.code === room.code || 
                    l.roomNumber === room.id ||
                    l.roomNumber === room.code ||
                    l.name.toLowerCase() === room.name.toLowerCase() ||
                    l.locationId === room.locationId
                  );
                  if (match && onSelectLocation) {
                    onSelectLocation(match);
                  } else if (onSelectLocation) {
                    onSelectLocation({
                      id: room.nodeKey || room.id,
                      code: room.code,
                      name: room.name,
                      roomNumber: room.code,
                      floor: activeFloorData.label,
                      floorId: activeFloorData.floorId,
                      building: "Main Building",
                      locationId: room.locationId,
                      nodeKey: room.nodeKey
                    });
                  }
                }}
                className="interactive-room cursor-pointer transition-all duration-150 group"
              >
                <rect
                  id={`rect-${room.id}`}
                  x={room.x}
                  y={room.y}
                  width={room.width}
                  height={room.height}
                  rx="9"
                  ry="9"
                  fill={roomFill}
                  stroke={roomStroke}
                  strokeWidth={strokeWidth}
                  filter="url(#unipath-room-shadow)"
                  className="transition-colors duration-200"
                />

                {/* Primary Room Code / Label */}
                <text
                  x={room.x + room.width / 2}
                  y={room.isLargeBlock ? room.y + room.height / 2 - 12 : room.y + room.height / 2 - 7}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={isDark ? "#FFFFFF" : "#09090B"}
                  fontSize={room.isLargeBlock ? "15" : (room.width < 140 ? "11.5" : "13")}
                  fontWeight="800"
                  fontFamily="'Manrope', 'Inter', sans-serif"
                  className="pointer-events-none select-none transition-colors duration-200"
                >
                  {room.code}
                </text>

                {/* Secondary Full Name (if distinct from code) */}
                {room.name && room.name !== room.code && (
                  <text
                    x={room.x + room.width / 2}
                    y={room.isLargeBlock ? room.y + room.height / 2 + 12 : room.y + room.height / 2 + 10}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={isSelected ? (isDark ? "#FFFFFF" : "#09090B") : (isDark ? "#A1A1AA" : "#71717A")}
                    fontSize={room.width < 140 ? "10" : "11"}
                    fontWeight="600"
                    fontFamily="'Inter', sans-serif"
                    className="pointer-events-none select-none transition-colors duration-200"
                  >
                    {room.name.length > 20 ? `${room.name.slice(0, 18)}…` : room.name}
                  </text>
                )}
              </g>
            );
          })}
        </g>

        {/* 6. Real Highlighted Navigation Route on Active Floor */}
        {showRoute && activePolyline && (
          <RouteDisplay
            polyline={activePolyline}
            strokeColor={isDark ? "#FFFFFF" : "#09090B"}
            showDashes={true}
            isDark={isDark}
          />
        )}

        {/* 7. Start Point Pin Marker */}
        {showRoute && startCoords && (
          <StartMarker
            x={startCoords.x}
            y={startCoords.y}
            label={currentLocation}
            isDark={isDark}
          />
        )}

        {/* 8. Destination Pin Marker */}
        {showRoute && isSelectedOnCurrentFloor && destinationCoords && (
          <DestinationMarker
            x={destinationCoords.x}
            y={destinationCoords.y}
            label={selectedLocation.name}
            isDark={isDark}
          />
        )}
      </svg>
    </div>
  );
};

export default CampusMap;
