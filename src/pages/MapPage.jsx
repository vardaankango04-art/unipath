import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import CampusMap from '../components/CampusMap';
import SearchBar from '../components/SearchBar';
import { sampleLocations, CAMPUS_FLOORS } from '../data/locations';
import { MAIN_BUILDING_FLOORS } from '../data/floorBlueprints';
import { getLocations, calculateShortestPathApi } from '../services/api';
import { 
  Navigation, 
  MapPin, 
  Clock, 
  Bookmark, 
  Building, 
  Layers, 
  CornerUpRight,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Footprints,
  PanelRightClose,
  PanelRightOpen,
  Compass,
  Database,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const MapPage = ({ bookmarkedIds = [], onToggleBookmark }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentFloor, setCurrentFloor] = useState('G');

  // Live database records state
  const [allLocations, setAllLocations] = useState(sampleLocations);
  const [isDbConnected, setIsDbConnected] = useState(false);
  const [dbRecordCount, setDbRecordCount] = useState(0);

  // Location and route state
  const [selectedLocation, setSelectedLocation] = useState(sampleLocations[0]);
  const [currentLocation, setCurrentLocation] = useState('Main Foyer Entrance');
  const [showRoute, setShowRoute] = useState(true);
  const [navigationRoute, setNavigationRoute] = useState(null);

  // Layout state: Panel collapse on desktop & mobile drawer toggle
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(true);

  // Starting Location options for graph source node
  const startPoints = [
    { id: 'G_ENTRY', label: 'Main Foyer Entrance' },
    { id: 'G_STAIRS_LT2', label: 'Ground Exit Stairs (LT-2)' },
    { id: 'G_STAIRS_CL8_DLC', label: 'Ground Exit Stairs (CL-8/DLC)' },
    { id: 'F1_STAIRS', label: 'First Floor Central Stairs' },
    { id: 'F2_STAIRS', label: 'Second Floor Central Stairs' },
    { id: 'F3_STAIRS', label: 'Third Floor Central Stairs' },
  ];

  // Fetch actual locations from PostgreSQL through FastAPI
  useEffect(() => {
    let isMounted = true;
    async function loadApiLocations() {
      const apiLocs = await getLocations();
      if (isMounted && apiLocs && apiLocs.length > 0) {
        setIsDbConnected(true);
        setDbRecordCount(apiLocs.length);

        // Combine API locations with sample interactive blueprint rooms to ensure SVG map completeness
        const combinedMap = new Map();
        // Priority to actual PostgreSQL records
        apiLocs.forEach(loc => combinedMap.set(loc.name.toLowerCase(), loc));
        sampleLocations.forEach(loc => {
          if (!combinedMap.has(loc.name.toLowerCase())) {
            combinedMap.set(loc.name.toLowerCase(), loc);
          }
        });

        const combinedList = Array.from(combinedMap.values());
        setAllLocations(combinedList);
      }
    }
    loadApiLocations();
    return () => { isMounted = false; };
  }, []);

  // Compute live shortest path from FastAPI Dijkstra engine
  useEffect(() => {
    let isMounted = true;
    async function fetchShortestPath() {
      if (!selectedLocation) {
        setNavigationRoute(null);
        return;
      }

      // Map currentLocation to source node key
      let sourceKey = 'G_ENTRY';
      const sp = startPoints.find(p => p.label === currentLocation || p.id === currentLocation);
      if (sp) sourceKey = sp.id;

      const targetKey = selectedLocation.nodeKey || selectedLocation.id;
      const targetLocId = selectedLocation.locationId;

      const res = await calculateShortestPathApi({
        sourceNodeKey: sourceKey,
        targetNodeKey: targetKey,
        targetLocationId: targetLocId
      });

      if (isMounted) {
        if (res && res.status === 'success') {
          setNavigationRoute(res);
        } else {
          setNavigationRoute(res || { status: 'no_route', message: 'No route available' });
        }
      }
    }

    fetchShortestPath();
    return () => { isMounted = false; };
  }, [currentLocation, selectedLocation]);

  const handleSelectLocation = (loc) => {
    setSelectedLocation(loc);
    setShowRoute(true);
    if (loc.floorId) {
      setCurrentFloor(loc.floorId);
    } else if (loc.floor) {
      if (loc.floor.includes('-1')) setCurrentFloor('-1');
      else if (loc.floor.toLowerCase().includes('ground')) setCurrentFloor('G');
      else if (loc.floor.toLowerCase().includes('first')) setCurrentFloor('1');
      else if (loc.floor.toLowerCase().includes('second')) setCurrentFloor('2');
      else if (loc.floor.toLowerCase().includes('third')) setCurrentFloor('3');
    }
  };

  // Sync with URL query parameter e.g. /map?loc=classroom-101
  useEffect(() => {
    const locId = searchParams.get('loc');
    if (locId) {
      const match = allLocations.find(l => l.id === locId || l.locationId === Number(locId));
      if (match) {
        setSelectedLocation(match);
        setShowRoute(true);
        if (match.floorId) setCurrentFloor(match.floorId);
        if (isPanelCollapsed) setIsPanelCollapsed(false);
      }
    }
  }, [searchParams, allLocations]);

  // Categories (5 distinct campus categories + All)
  const categories = [
    { id: 'all', label: 'All Places' },
    { id: 'classrooms', label: 'Classrooms' },
    { id: 'laboratories', label: 'Laboratories' },
    { id: 'faculty', label: 'Faculty Cabins' },
    { id: 'offices', label: 'Institute Offices' },
    { id: 'facilities', label: 'Campus Locations' },
  ];

  // Filtered locations
  const filteredLocations = useMemo(() => {
    let list = allLocations;
    if (selectedCategory !== 'all') {
      list = list.filter(l => l.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(l =>
        l.name.toLowerCase().includes(q) ||
        (l.roomNumber && l.roomNumber.toLowerCase().includes(q)) ||
        (l.building && l.building.toLowerCase().includes(q)) ||
        (l.floor && l.floor.toLowerCase().includes(q)) ||
        (l.department && l.department.toLowerCase().includes(q)) ||
        (l.position && l.position.toLowerCase().includes(q))
      );
    }
    return list;
  }, [allLocations, selectedCategory, searchQuery]);


  const isBookmarked = selectedLocation && bookmarkedIds.includes(selectedLocation.id);

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-84px)] sm:h-[calc(100vh-88px)] w-full bg-[#FAFAFA] dark:bg-[#09090B] overflow-hidden relative transition-colors duration-250">
      {/* DESKTOP-FIRST TWO-COLUMN BALANCED LAYOUT */}
      <div className="flex-1 flex flex-col lg:flex-row h-full w-full overflow-hidden relative">
        
        {/* LEFT SECTION (Main Interactive Indoor SVG Map Area) */}
        <div className={`flex flex-col h-full relative overflow-hidden bg-[#FAFAFA] dark:bg-[#09090B] transition-all duration-300 ${
          isPanelCollapsed 
            ? 'w-full' 
            : 'w-full lg:flex-1'
        }`}>
          {/* Top Status Bar above Map */}
          <div className="h-[56px] sm:h-[60px] px-6 bg-white dark:bg-[#14171C] border-b border-[#E4E4E7] dark:border-[#27272A] flex items-center justify-between z-10 select-none shadow-sm flex-shrink-0 transition-colors duration-250">
            <div className="flex items-center space-x-3 text-[#71717A] dark:text-[#A1A1AA] min-w-0">
              <MapPin className="w-5 h-5 sm:w-[22px] sm:h-[22px] text-[#09090B] dark:text-white flex-shrink-0 stroke-[2.2]" />
              <div className="flex items-center space-x-2 sm:space-x-2.5 truncate text-sm sm:text-base">
                <span className="text-xs sm:text-[14px] font-semibold text-[#71717A] dark:text-[#A1A1AA] hidden sm:inline">From:</span>
                <strong className="font-heading text-sm sm:text-[16px] font-bold text-[#09090B] dark:text-white truncate">{currentLocation}</strong>
                <span className="text-[#71717A] dark:text-[#A1A1AA] text-sm sm:text-base font-bold px-0.5">→</span>
                <span className="text-xs sm:text-[14px] font-semibold text-[#71717A] dark:text-[#A1A1AA] hidden sm:inline">To:</span>
                <strong className="font-heading text-sm sm:text-[16px] font-extrabold text-[#09090B] dark:text-white truncate">{selectedLocation?.name}</strong>
              </div>
            </div>

            <div className="flex items-center space-x-3 flex-shrink-0">
              {/* Route Toggle Button */}
              <button
                onClick={() => setShowRoute(!showRoute)}
                className={`h-9 px-3.5 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center space-x-2 ${
                  showRoute 
                    ? 'bg-[#09090B] dark:bg-white text-white dark:text-[#09090B] border border-[#09090B] dark:border-white shadow-sm' 
                    : 'bg-white dark:bg-[#14171C] text-[#71717A] dark:text-[#A1A1AA] hover:text-[#09090B] dark:hover:text-white border border-[#E4E4E7] dark:border-[#27272A]'
                }`}
                type="button"
                title="Toggle route highlighting on map"
              >
                <Navigation className="w-4 h-4 stroke-[2]" />
                <span className="hidden sm:inline">{showRoute ? 'Hide Route' : 'Show Route'}</span>
              </button>

              {/* Desktop Panel Collapse / Expand Button */}
              <button
                onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}
                className="hidden lg:flex items-center space-x-2 h-9 px-3.5 rounded-xl bg-white dark:bg-[#14171C] hover:bg-[#F4F4F5] dark:hover:bg-[#1E232B] border border-[#E4E4E7] dark:border-[#27272A] text-[#09090B] dark:text-white text-xs sm:text-sm font-semibold transition shadow-sm active:scale-95"
                title={isPanelCollapsed ? "Open Search & Navigation Panel" : "Expand Map View"}
                type="button"
              >
                {isPanelCollapsed ? (
                  <>
                    <PanelRightOpen className="w-[18px] h-[18px] text-[#09090B] dark:text-white" />
                    <span>Open Panel</span>
                  </>
                ) : (
                  <>
                    <PanelRightClose className="w-[18px] h-[18px] text-[#71717A] dark:text-[#A1A1AA]" />
                    <span>Expand Map</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Centered Indoor Floor Plan Canvas */}
          <div className="flex-1 relative w-full h-full overflow-hidden flex items-center justify-center p-2 sm:p-4">
            <CampusMap
              selectedLocation={selectedLocation}
              onSelectLocation={handleSelectLocation}
              currentLocation={currentLocation}
              showRoute={showRoute}
              currentFloor={currentFloor}
              onSelectFloor={setCurrentFloor}
              navigationPathData={navigationRoute}
              allLocations={allLocations}
            />

            {/* Floating Re-Open Panel Button when collapsed on desktop */}
            {isPanelCollapsed && (
              <button
                onClick={() => setIsPanelCollapsed(false)}
                className="hidden lg:flex absolute top-16 right-6 z-20 items-center space-x-2 px-5 py-3 rounded-xl bg-[#09090B] dark:bg-white hover:bg-[#27272A] dark:hover:bg-[#E4E4E7] text-white dark:text-[#09090B] text-sm font-bold shadow-lg transition active:scale-95"
                type="button"
              >
                <PanelRightOpen className="w-4 h-4" />
                <span>Show Navigation Panel</span>
              </button>
            )}
          </div>

          {/* Mobile Drawer Toggle Handle */}
          <div className="lg:hidden bg-white dark:bg-[#14171C] border-t border-[#E4E4E7] dark:border-[#27272A] px-4 py-2.5 flex items-center justify-between z-20 shadow-sm transition-colors duration-250">
            <div className="flex items-center space-x-2 text-sm font-bold text-[#09090B] dark:text-white">
              <Compass className="w-4 h-4 text-[#09090B] dark:text-white" />
              <span>Search & Location Details</span>
            </div>
            <button
              onClick={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)}
              className="p-1 rounded-lg hover:bg-[#F4F4F5] dark:hover:bg-[#1E232B] text-[#71717A] dark:text-[#A1A1AA]"
              type="button"
            >
              {isMobileDrawerOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* RIGHT SECTION: Dedicated Campus Navigation & Information Panel (480px - 520px) */}
        {(!isPanelCollapsed || window.innerWidth < 1024) && (
          <aside className={`w-full lg:w-[480px] xl:w-[500px] 2xl:w-[520px] flex-shrink-0 flex flex-col bg-white dark:bg-[#14171C] border-t lg:border-t-0 lg:border-l border-[#E4E4E7] dark:border-[#27272A] shadow-sm z-20 transition-all duration-300 ${
            isMobileDrawerOpen ? 'h-[55vh] lg:h-full' : 'h-0 lg:h-full overflow-hidden'
          }`}>
            {/* A. Panel Heading */}
            <div className="px-6 py-5 border-b border-[#E4E4E7] dark:border-[#27272A] flex items-center justify-between bg-white dark:bg-[#14171C] sticky top-0 z-10 flex-shrink-0 transition-colors duration-250">
              <div className="space-y-1.5 sm:space-y-2 min-w-0">
                <div className="flex items-center space-x-2.5">
                  <h2 className="font-heading text-2xl lg:text-[25px] xl:text-[26px] font-extrabold text-[#09090B] dark:text-white tracking-tight leading-tight">
                    Campus Navigation
                  </h2>
                  <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg flex items-center border ${
                    isDbConnected 
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                      : 'bg-[#F4F4F5] dark:bg-[#1E232B] text-[#09090B] dark:text-white border-[#E4E4E7] dark:border-[#27272A]'
                  } flex-shrink-0`}>
                    {isDbConnected && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-1.5" />}
                    <span>{isDbConnected ? `PostgreSQL (${dbRecordCount})` : 'DSA Graph'}</span>
                  </span>
                </div>
                <p className="text-[14px] sm:text-[15px] text-[#71717A] dark:text-[#A1A1AA] leading-relaxed">
                  Find classrooms, labs, cabins and compute indoor routes
                </p>
              </div>

              {/* Close/Collapse Button on desktop inside panel */}
              <button
                onClick={() => setIsPanelCollapsed(true)}
                className="hidden lg:flex w-9 h-9 rounded-xl hover:bg-[#F4F4F5] dark:hover:bg-[#1E232B] text-[#71717A] dark:text-[#A1A1AA] hover:text-[#09090B] dark:hover:text-white items-center justify-center transition flex-shrink-0 ml-2"
                title="Collapse Panel for Fullscreen Map"
                type="button"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content inside Right Panel */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6 pb-36 lg:pb-12">
              
              {/* B. Search Locations Section */}
              <div className="space-y-2">
                <label className="font-heading text-sm font-bold text-[#09090B] dark:text-white block">
                  Search Locations
                </label>
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  onClear={() => setSearchQuery('')}
                  placeholder="Search classrooms, labs, faculty cabins..."
                  isLarge={true}
                />
              </div>

              {/* C. Category Filters */}
              <div className="space-y-2">
                <label className="font-heading text-sm font-bold text-[#09090B] dark:text-white block">
                  Category Filters
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {categories.map((cat) => {
                    const isActive = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`h-10 px-3 rounded-xl text-xs sm:text-[13px] font-semibold transition active:scale-95 flex items-center justify-center text-center whitespace-nowrap ${
                          isActive
                            ? 'bg-[#09090B] dark:bg-white text-white dark:text-[#09090B] shadow-sm ring-1 ring-[#09090B] dark:ring-white'
                            : 'bg-[#F4F4F5] dark:bg-[#1E232B] text-[#71717A] dark:text-[#A1A1AA] hover:text-[#09090B] dark:hover:text-white hover:bg-[#E4E4E7] dark:hover:bg-[#27272A] border border-[#E4E4E7] dark:border-[#27272A]'
                        }`}
                        type="button"
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* D. Matching Locations */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-heading text-sm font-bold text-[#09090B] dark:text-white">
                    Matching Locations ({filteredLocations.length})
                  </label>
                  <span className="text-xs text-[#71717A] dark:text-[#A1A1AA] font-medium">Click to select & trace</span>
                </div>

                <div className="space-y-3 max-h-[240px] sm:max-h-[270px] overflow-y-auto no-scrollbar pr-1 border border-[#E4E4E7] dark:border-[#27272A] rounded-2xl p-3 bg-[#FAFAFA] dark:bg-[#09090B] transition-colors duration-250">
                  {filteredLocations.length === 0 ? (
                    <div className="p-8 text-center text-sm text-[#71717A] dark:text-[#A1A1AA]">
                      No matching locations found for "{searchQuery}".
                    </div>
                  ) : (
                    filteredLocations.map((loc) => {
                      const isSelected = selectedLocation?.id === loc.id;
                      return (
                        <button
                          key={loc.id}
                          onClick={() => handleSelectLocation(loc)}
                          className={`w-full p-4 rounded-xl text-left transition flex items-center justify-between border min-h-[76px] ${
                            isSelected
                              ? 'bg-[#F4F4F5] dark:bg-[#1E232B] border-2 border-[#09090B] dark:border-white text-[#09090B] dark:text-white shadow-sm'
                              : 'bg-white dark:bg-[#14171C] border-[#E4E4E7] dark:border-[#27272A] text-[#71717A] dark:text-[#A1A1AA] hover:bg-[#F4F4F5] dark:hover:bg-[#1E232B] hover:text-[#09090B] dark:hover:text-white hover:border-[#09090B]/30 dark:hover:border-white/30 shadow-sm'
                          }`}
                          type="button"
                        >
                          <div className="flex flex-col min-w-0 pr-3">
                            <span className="font-heading font-bold text-[#09090B] dark:text-white text-[15px] sm:text-base truncate">
                              {loc.name}
                            </span>
                            <span className="text-sm text-[#71717A] dark:text-[#A1A1AA] mt-0.5 truncate">
                              {loc.building} · {loc.roomNumber}
                            </span>
                          </div>
                          <span className="text-xs px-3 py-1.5 rounded-lg bg-[#F4F4F5] dark:bg-[#1E232B] text-[#09090B] dark:text-white font-mono font-bold flex-shrink-0 border border-[#E4E4E7] dark:border-[#27272A]">
                            {loc.floor}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* E. Selected Location Details */}
              {selectedLocation && (
                <div className="space-y-3 pt-2 border-t border-[#E4E4E7] dark:border-[#27272A]">
                  <label className="font-heading text-sm font-bold text-[#09090B] dark:text-white block">
                    Selected Location Details
                  </label>

                  <div className="bg-[#FAFAFA] dark:bg-[#09090B] rounded-2xl border border-[#E4E4E7] dark:border-[#27272A] p-5 sm:p-6 space-y-5 shadow-sm transition-colors duration-250">
                    {/* Header: Badge, Name, Category, Bookmark */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1.5 min-w-0">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#71717A] dark:text-[#A1A1AA] block">
                          {selectedLocation.categoryLabel}
                        </span>
                        <h3 className="font-heading text-xl sm:text-[22px] font-bold text-[#09090B] dark:text-white leading-snug">
                          {selectedLocation.name}
                        </h3>
                        <p className="text-sm font-medium text-[#71717A] dark:text-[#A1A1AA]">
                          {selectedLocation.building} · {selectedLocation.floor}
                        </p>
                      </div>

                      {onToggleBookmark && (
                        <button
                          onClick={() => onToggleBookmark(selectedLocation.id)}
                          className={`w-11 h-11 rounded-xl border transition flex items-center justify-center flex-shrink-0 ${
                            isBookmarked
                              ? 'bg-[#09090B] dark:bg-white border-[#09090B] dark:border-white text-white dark:text-[#09090B]'
                              : 'bg-white dark:bg-[#14171C] border-[#E4E4E7] dark:border-[#27272A] text-[#71717A] dark:text-[#A1A1AA] hover:bg-[#F4F4F5] dark:hover:bg-[#1E232B] hover:text-[#09090B] dark:hover:text-white'
                          }`}
                          title={isBookmarked ? "Remove Bookmark" : "Save Location"}
                          type="button"
                        >
                          <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
                        </button>
                      )}
                    </div>

                    {/* Clean 2-Column Information Grid */}
                    <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
                      <div className="bg-white dark:bg-[#14171C] p-3.5 rounded-xl border border-[#E4E4E7] dark:border-[#27272A] transition-colors duration-250">
                        <span className="text-xs font-bold text-[#71717A] dark:text-[#A1A1AA] uppercase block">Room Code</span>
                        <span className="font-mono font-bold text-[#09090B] dark:text-white text-sm mt-0.5 block">{selectedLocation.roomNumber}</span>
                      </div>
                      <div className="bg-white dark:bg-[#14171C] p-3.5 rounded-xl border border-[#E4E4E7] dark:border-[#27272A] transition-colors duration-250">
                        <span className="text-xs font-bold text-[#71717A] dark:text-[#A1A1AA] uppercase block">Floor Level</span>
                        <span className="font-bold text-[#09090B] dark:text-white text-sm mt-0.5 block">{selectedLocation.floor}</span>
                      </div>
                      <div className="bg-white dark:bg-[#14171C] p-3.5 rounded-xl border border-[#E4E4E7] dark:border-[#27272A] transition-colors duration-250">
                        <span className="text-xs font-bold text-[#71717A] dark:text-[#A1A1AA] uppercase block">Unique ID (Node)</span>
                        <span className="font-mono font-semibold text-[#09090B] dark:text-white text-xs truncate mt-0.5 block">{selectedLocation.id}</span>
                      </div>
                      <div className="bg-white dark:bg-[#14171C] p-3.5 rounded-xl border border-[#E4E4E7] dark:border-[#27272A] transition-colors duration-250">
                        <span className="text-xs font-bold text-[#71717A] dark:text-[#A1A1AA] uppercase block">Capacity</span>
                        <span className="font-bold text-[#09090B] dark:text-white text-sm mt-0.5 block">{selectedLocation.capacity || 'Standard Room'}</span>
                      </div>
                    </div>

                    {/* Department (if available) */}
                    {selectedLocation.department && (
                      <div className="bg-white dark:bg-[#14171C] p-3.5 rounded-xl border border-[#E4E4E7] dark:border-[#27272A] text-sm text-[#09090B] dark:text-white transition-colors duration-250">
                        <span className="text-xs font-bold text-[#71717A] dark:text-[#A1A1AA] uppercase block mb-1">Department</span>
                        <span className="font-semibold">{selectedLocation.department}</span>
                      </div>
                    )}

                    {/* Description */}
                    {selectedLocation.description && (
                      <p className="text-sm text-[#71717A] dark:text-[#A1A1AA] leading-relaxed">
                        {selectedLocation.description}
                      </p>
                    )}

                    {/* Full-width Navigation Action Button */}
                    <div className="pt-2">
                      <button
                        onClick={() => setShowRoute(true)}
                        className="h-[48px] sm:h-12 w-full rounded-xl bg-[#09090B] dark:bg-white hover:bg-[#27272A] dark:hover:bg-[#E4E4E7] text-white dark:text-[#09090B] text-sm sm:text-base font-bold flex items-center justify-center space-x-2 transition active:scale-95 shadow-sm"
                        type="button"
                      >
                        <Navigation className="w-5 h-5 stroke-[2]" />
                        <span>Navigate to Destination</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* F. Navigation & Route Guidance */}
              <div className="space-y-3 pt-2 border-t border-[#E4E4E7] dark:border-[#27272A]">
                <label className="font-heading text-sm font-bold text-[#09090B] dark:text-white block">
                  Navigation & Route Guidance
                </label>

                <div className="bg-white dark:bg-[#14171C] rounded-2xl border border-[#E4E4E7] dark:border-[#27272A] p-5 sm:p-6 space-y-5 shadow-sm transition-colors duration-250">
                  {/* Source / Start Point Selection */}
                  <div className="space-y-2">
                    <span className="text-sm font-bold text-[#09090B] dark:text-white block">
                      Starting Location (Graph Origin Node)
                    </span>
                    <select
                      value={currentLocation}
                      onChange={(e) => setCurrentLocation(e.target.value)}
                      className="w-full h-12 text-sm font-semibold px-4 rounded-xl border border-[#E4E4E7] dark:border-[#27272A] bg-[#FAFAFA] dark:bg-[#09090B] text-[#09090B] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#09090B] dark:focus:ring-white transition-colors duration-250"
                    >
                      {startPoints.map(sp => (
                        <option key={sp.id} value={sp.label}>{sp.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Route Stats: Distance & Time (Map Units) */}
                  <div className="space-y-4 pt-2 border-t border-[#E4E4E7] dark:border-[#27272A]">
                    <div className="grid grid-cols-2 gap-3.5">
                      <div className="p-3.5 rounded-xl bg-[#FAFAFA] dark:bg-[#09090B] border border-[#E4E4E7] dark:border-[#27272A] flex items-center space-x-3 transition-colors duration-250">
                        <Clock className="w-5 h-5 text-[#09090B] dark:text-white flex-shrink-0" />
                        <div>
                          <span className="text-xs uppercase font-bold text-[#71717A] dark:text-[#A1A1AA] block">Estimated Time</span>
                          <span className="font-bold text-[#09090B] dark:text-white text-base">
                            {navigationRoute?.total_distance ? `${Math.max(1, Math.round(navigationRoute.total_distance / 250))} min walk` : 'N/A'}
                          </span>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-[#FAFAFA] dark:bg-[#09090B] border border-[#E4E4E7] dark:border-[#27272A] flex items-center space-x-3 transition-colors duration-250">
                        <Footprints className="w-5 h-5 text-[#09090B] dark:text-white flex-shrink-0" />
                        <div>
                          <span className="text-xs uppercase font-bold text-[#71717A] dark:text-[#A1A1AA] block">Walking Distance</span>
                          <span className="font-bold text-[#09090B] dark:text-white text-base">
                            {navigationRoute?.total_distance !== undefined && navigationRoute?.total_distance !== null
                              ? `${navigationRoute.total_distance} map units` 
                              : (navigationRoute?.status === 'no_route' ? 'No route' : 'Calculating...')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Multi-Floor Traversal Indicator */}
                    {navigationRoute?.floors_crossed && navigationRoute.floors_crossed.length > 1 && (
                      <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 text-xs text-amber-900 dark:text-amber-200 space-y-1.5">
                        <div className="flex items-center space-x-1.5 font-bold">
                          <Layers className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                          <span>Floors Crossed via Staircase:</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                          {navigationRoute.floors_crossed.map((fName, idx) => {
                            let fCode = 'G';
                            if (fName.includes('-1')) fCode = '-1';
                            else if (fName.toLowerCase().includes('first')) fCode = '1';
                            else if (fName.toLowerCase().includes('second')) fCode = '2';
                            else if (fName.toLowerCase().includes('third')) fCode = '3';

                            return (
                              <React.Fragment key={fName}>
                                {idx > 0 && <span className="text-amber-500 font-bold">→</span>}
                                <button
                                  onClick={() => setCurrentFloor(fCode)}
                                  className={`px-2 py-0.5 rounded-md font-bold text-[11px] border transition ${
                                    currentFloor === fCode
                                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                                      : 'bg-white dark:bg-[#1E232B] text-amber-900 dark:text-amber-200 border-amber-200 dark:border-amber-800 hover:bg-amber-100'
                                  }`}
                                  type="button"
                                >
                                  {fName}
                                </button>
                              </React.Fragment>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Turn-by-Turn Instruction Banner */}
                    <div className="p-4 rounded-xl bg-[#F4F4F5] dark:bg-[#1E232B] border border-[#E4E4E7] dark:border-[#27272A] flex items-start space-x-3 transition-colors duration-250">
                      {navigationRoute?.status === 'no_route' ? (
                        <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <CornerUpRight className="w-5 h-5 text-[#09090B] dark:text-white flex-shrink-0 mt-0.5" />
                      )}
                      <div>
                        <span className="text-xs uppercase font-bold text-[#09090B] dark:text-white block mb-1">
                          {navigationRoute?.status === 'no_route' ? 'Navigation Notice' : 'Route Guidance'}
                        </span>
                        <p className="text-sm text-[#09090B] dark:text-white leading-relaxed font-medium">
                          {navigationRoute?.status === 'no_route'
                            ? (navigationRoute.message || 'No route available between the specified locations.')
                            : (navigationRoute?.floors_crossed?.length > 1
                                ? `Follow corridor to staircase, transition across ${navigationRoute.floors_crossed.join(' → ')}, and proceed to destination.`
                                : `Proceed along corridor to destination on ${currentFloor === 'G' ? 'Ground Floor' : `Floor ${currentFloor}`}.`)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* G. Architecture & Demonstration Notice */}
              <div className="p-4 rounded-2xl bg-[#FAFAFA] dark:bg-[#09090B] border border-[#E4E4E7] dark:border-[#27272A] space-y-1.5 text-xs text-[#71717A] dark:text-[#A1A1AA] transition-colors duration-250">
                <div className="flex items-center space-x-2 text-[#09090B] dark:text-white font-bold text-xs sm:text-sm">
                  <Database className="w-4 h-4 text-[#09090B] dark:text-white" />
                  <span>Demonstration Blueprint & Data Contract</span>
                </div>
                <p className="text-xs leading-relaxed text-[#71717A] dark:text-[#A1A1AA]">
                  Temporary illustrative floor-plan layout for semester DSA evaluation. University CAD floor plans and PostgreSQL database records map seamlessly via unique IDs (`id`, `svgCoordinates`, `graphNodes`).
                </p>
              </div>

            </div>
          </aside>
        )}

      </div>
    </div>
  );
};

export default MapPage;
