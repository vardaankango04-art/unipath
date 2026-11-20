import React, { useState, useMemo, useEffect } from 'react';
import SearchBar from '../components/SearchBar';
import LocationCard from '../components/LocationCard';
import { sampleLocations } from '../data/locations';
import { getLocations } from '../services/api';
import { GraduationCap, Database, Layers } from 'lucide-react';

const ClassroomsPage = ({ bookmarkedIds = [], onToggleBookmark }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [classrooms, setClassrooms] = useState(() => 
    sampleLocations.filter(loc => loc.category === 'classrooms')
  );
  const [isLiveApi, setIsLiveApi] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadClassrooms() {
      const data = await getLocations();
      if (isMounted && data && data.length > 0) {
        // Filter classrooms, lecture theatres, and tutorial rooms
        const filtered = data.filter(loc => 
          loc.category === 'classrooms' || 
          (loc.categoryLabel && (
            loc.categoryLabel.toLowerCase().includes('classroom') ||
            loc.categoryLabel.toLowerCase().includes('tutorial') ||
            loc.categoryLabel.toLowerCase().includes('lecture')
          ))
        );
        if (filtered.length > 0) {
          setClassrooms(filtered);
          setIsLiveApi(true);
        }
      }
    }
    loadClassrooms();
    return () => { isMounted = false; };
  }, []);

  const filteredClassrooms = useMemo(() => {
    if (!searchQuery.trim()) return classrooms;
    const q = searchQuery.toLowerCase().trim();
    return classrooms.filter(cr =>
      cr.name.toLowerCase().includes(q) ||
      (cr.roomNumber && cr.roomNumber.toLowerCase().includes(q)) ||
      (cr.building && cr.building.toLowerCase().includes(q)) ||
      (cr.department && cr.department.toLowerCase().includes(q)) ||
      (cr.position && cr.position.toLowerCase().includes(q))
    );
  }, [classrooms, searchQuery]);

  return (
    <div className="flex flex-col h-full bg-[#FAFAFA] dark:bg-[#09090B] overflow-y-auto no-scrollbar pb-32 lg:pb-16 transition-colors duration-250">
      {/* Top Header */}
      <div className="bg-white dark:bg-[#14171C] border-b border-[#E4E4E7] dark:border-[#27272A] px-4 sm:px-6 lg:px-8 py-8 select-none shadow-sm transition-colors duration-250">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2.5">
                <GraduationCap className="w-6 h-6 sm:w-7 sm:h-7 text-[#09090B] dark:text-white stroke-[2.2]" />
                <h1 className="font-heading text-2xl sm:text-3xl lg:text-[32px] font-extrabold text-[#09090B] dark:text-white tracking-tight">
                  Classrooms & Lecture Halls
                </h1>
              </div>
              <p className="text-sm sm:text-base lg:text-[16px] text-[#71717A] dark:text-[#A1A1AA] mt-1">
                Directory of lecture halls, seminar rooms, and tutorial classrooms across campus wings.
              </p>
            </div>

            <div className={`flex items-center space-x-2 px-4 py-2 rounded-xl border text-xs sm:text-sm font-bold self-start sm:self-auto shadow-sm ${
              isLiveApi 
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                : 'bg-[#F4F4F5] dark:bg-[#1E232B] border-[#E4E4E7] dark:border-[#27272A] text-[#09090B] dark:text-white'
            }`}>
              <Database className="w-4 h-4" />
              <span>{isLiveApi ? `PostgreSQL Live (${classrooms.length} Spaces)` : 'PostgreSQL Schema Ready'}</span>
            </div>
          </div>

          {/* Search Box */}
          <div className="max-w-md pt-1">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onClear={() => setSearchQuery('')}
              placeholder="Search by room number (e.g. CR 1, CR 13, TR 1, LT 2)..."
              isLarge={true}
            />
          </div>
        </div>
      </div>

      {/* Classrooms Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        <div className="flex items-center justify-between text-sm sm:text-base text-[#71717A] dark:text-[#A1A1AA]">
          <span>Displaying <strong className="text-[#09090B] dark:text-white font-bold">{filteredClassrooms.length}</strong> classrooms</span>
          <span className="text-xs sm:text-sm font-mono text-emerald-600 dark:text-emerald-400">
            {isLiveApi ? 'PostgreSQL Verified Data' : 'Sample data schema'}
          </span>
        </div>

        {filteredClassrooms.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#14171C] border border-[#E4E4E7] dark:border-[#27272A] shadow-sm space-y-3 transition-colors duration-250">
            <Layers className="w-12 h-12 text-[#71717A] dark:text-[#A1A1AA] mx-auto opacity-30" />
            <h3 className="font-heading text-lg sm:text-xl font-bold text-[#09090B] dark:text-white">No classrooms found</h3>
            <p className="text-sm sm:text-base text-[#71717A] dark:text-[#A1A1AA] max-w-sm mx-auto">
              Try searching by room number or building wing.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredClassrooms.map((cr) => (
              <LocationCard
                key={cr.id}
                location={cr}
                isBookmarked={bookmarkedIds.includes(cr.id)}
                onToggleBookmark={onToggleBookmark}
                showCategory={false}
                actionLabel="Open on Map"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassroomsPage;
