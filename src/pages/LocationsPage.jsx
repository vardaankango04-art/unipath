import React, { useState, useMemo, useEffect } from 'react';
import SearchBar from '../components/SearchBar';
import LocationCard from '../components/LocationCard';
import { sampleLocations } from '../data/locations';
import { getLocations } from '../services/api';
import { MapPin, Building, Database, Layers } from 'lucide-react';

const LocationsPage = ({ bookmarkedIds = [], onToggleBookmark }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [locations, setLocations] = useState(sampleLocations);
  const [isLiveApi, setIsLiveApi] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadLocations() {
      const data = await getLocations();
      if (isMounted && data && data.length > 0) {
        // Merge with sample interactive locations
        const locMap = new Map();
        data.forEach(l => locMap.set(l.name.toLowerCase(), l));
        sampleLocations.forEach(l => {
          if (!locMap.has(l.name.toLowerCase())) {
            locMap.set(l.name.toLowerCase(), l);
          }
        });
        setLocations(Array.from(locMap.values()));
        setIsLiveApi(true);
      }
    }
    loadLocations();
    return () => { isMounted = false; };
  }, []);

  const typeFilters = [
    { id: 'all', label: 'All Places' },
    { id: 'classrooms', label: 'Classrooms' },
    { id: 'laboratories', label: 'Laboratories' },
    { id: 'offices', label: 'Offices & Halls' },
    { id: 'facilities', label: 'Campus Amenities' }
  ];

  const filteredLocations = useMemo(() => {
    return locations.filter((loc) => {
      const matchesType = selectedType === 'all' || loc.category === selectedType;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery = !q || 
        loc.name.toLowerCase().includes(q) ||
        (loc.roomNumber && loc.roomNumber.toLowerCase().includes(q)) ||
        (loc.building && loc.building.toLowerCase().includes(q)) ||
        (loc.floor && loc.floor.toLowerCase().includes(q)) ||
        (loc.position && loc.position.toLowerCase().includes(q)) ||
        (loc.department && loc.department.toLowerCase().includes(q));

      return matchesType && matchesQuery;
    });
  }, [locations, selectedType, searchQuery]);

  return (
    <div className="flex flex-col h-full bg-[#FAFAFA] dark:bg-[#09090B] overflow-y-auto no-scrollbar pb-32 lg:pb-16 transition-colors duration-250">
      {/* Top Header */}
      <div className="bg-white dark:bg-[#14171C] border-b border-[#E4E4E7] dark:border-[#27272A] px-4 sm:px-6 lg:px-8 py-8 select-none shadow-sm transition-colors duration-250">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2.5">
                <MapPin className="w-6 h-6 sm:w-7 sm:h-7 text-[#09090B] dark:text-white stroke-[2.2]" />
                <h1 className="font-heading text-2xl sm:text-3xl lg:text-[32px] font-extrabold text-[#09090B] dark:text-white tracking-tight">
                  Campus Locations & Common Areas
                </h1>
              </div>
              <p className="text-sm sm:text-base lg:text-[16px] text-[#71717A] dark:text-[#A1A1AA] mt-1">
                Directory of campus facilities, study halls, classrooms, and academic wings.
              </p>
            </div>

            <div className={`flex items-center space-x-2 px-4 py-2 rounded-xl border text-xs sm:text-sm font-bold self-start sm:self-auto shadow-sm ${
              isLiveApi 
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                : 'bg-[#F4F4F5] dark:bg-[#1E232B] border-[#E4E4E7] dark:border-[#27272A] text-[#09090B] dark:text-white'
            }`}>
              <Database className="w-4 h-4" />
              <span>{isLiveApi ? `PostgreSQL Live (${locations.length} Places)` : 'Campus Database Ready'}</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="max-w-md pt-1">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onClear={() => setSearchQuery('')}
              placeholder="Search by location name, room code, or wing..."
              isLarge={true}
            />
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#E4E4E7] dark:border-[#27272A]">
            {typeFilters.map((tab) => {
              const isActive = selectedType === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedType(tab.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition active:scale-95 ${
                    isActive
                      ? 'bg-[#09090B] dark:bg-white text-white dark:text-[#09090B] shadow-sm ring-1 ring-[#09090B] dark:ring-white'
                      : 'bg-white dark:bg-[#14171C] text-[#71717A] dark:text-[#A1A1AA] hover:text-[#09090B] dark:hover:text-white border border-[#E4E4E7] dark:border-[#27272A]'
                  }`}
                  type="button"
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        <div className="flex items-center justify-between text-sm sm:text-base text-[#71717A] dark:text-[#A1A1AA]">
          <span>Displaying <strong className="text-[#09090B] dark:text-white font-bold">{filteredLocations.length}</strong> campus locations</span>
          <span className="text-xs sm:text-sm font-mono text-emerald-600 dark:text-emerald-400">
            {isLiveApi ? 'PostgreSQL Verified Data' : 'Demonstration dataset'}
          </span>
        </div>

        {filteredLocations.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#14171C] border border-[#E4E4E7] dark:border-[#27272A] shadow-sm space-y-3 transition-colors duration-250">
            <Layers className="w-12 h-12 text-[#71717A] dark:text-[#A1A1AA] mx-auto opacity-30" />
            <h3 className="font-heading text-lg sm:text-xl font-bold text-[#09090B] dark:text-white">No campus locations found</h3>
            <p className="text-sm sm:text-base text-[#71717A] dark:text-[#A1A1AA] max-w-sm mx-auto">
              Try adjusting your search query or switching to another category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredLocations.map((loc) => (
              <LocationCard
                key={loc.id}
                location={loc}
                isBookmarked={bookmarkedIds.includes(loc.id)}
                onToggleBookmark={onToggleBookmark}
                showCategory={true}
                actionLabel="Open on Map"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationsPage;
