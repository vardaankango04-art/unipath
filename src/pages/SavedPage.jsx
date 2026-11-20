import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LocationCard from '../components/LocationCard';
import { sampleLocations } from '../data/locations';
import { Bookmark, RotateCcw, MapPin, Layers } from 'lucide-react';

const SavedPage = ({ bookmarkedIds = [], onToggleBookmark, onResetBookmarks }) => {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState('all');

  const bookmarkedLocations = sampleLocations.filter(loc => bookmarkedIds.includes(loc.id));

  const filterTabs = [
    { id: 'all', label: 'All Saved' },
    { id: 'classrooms', label: 'Classrooms' },
    { id: 'laboratories', label: 'Laboratories' },
    { id: 'faculty', label: 'Faculty Cabins' },
    { id: 'offices', label: 'Institute Offices' },
    { id: 'facilities', label: 'Campus Locations' },
  ];

  const filteredPlaces = bookmarkedLocations.filter(place => {
    if (selectedFilter === 'all') return true;
    return place.category === selectedFilter;
  });

  return (
    <div className="flex flex-col h-full bg-[#FAFAFA] dark:bg-[#09090B] overflow-y-auto no-scrollbar pb-32 lg:pb-16 transition-colors duration-250">
      {/* Top Header */}
      <div className="bg-white dark:bg-[#14171C] border-b border-[#E4E4E7] dark:border-[#27272A] px-4 sm:px-6 lg:px-8 py-8 select-none shadow-sm transition-colors duration-250">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2.5">
                <Bookmark className="w-6 h-6 sm:w-7 sm:h-7 text-[#09090B] dark:text-white fill-current stroke-[2]" />
                <h1 className="font-heading text-2xl sm:text-3xl lg:text-[32px] font-extrabold text-[#09090B] dark:text-white tracking-tight">
                  Saved Places
                </h1>
              </div>
              <p className="text-sm sm:text-base lg:text-[16px] text-[#71717A] dark:text-[#A1A1AA] mt-1">
                Quick access to your bookmarked classrooms, laboratories, institute offices, and faculty cabins.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <span className="text-sm sm:text-base font-semibold text-[#71717A] dark:text-[#A1A1AA]">
                Total: <strong className="text-[#09090B] dark:text-white font-bold">{bookmarkedLocations.length} Saved</strong>
              </span>
              {bookmarkedLocations.length === 0 && (
                <button
                  onClick={onResetBookmarks}
                  className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#09090B] dark:bg-white text-white dark:text-[#09090B] transition flex items-center space-x-1.5 shadow-sm"
                  type="button"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Restore Sample Bookmarks</span>
                </button>
              )}
            </div>
          </div>

          {/* Type Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#E4E4E7] dark:border-[#27272A]">
            {filterTabs.map((tab) => {
              const isActive = selectedFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedFilter(tab.id)}
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

      {/* Saved Places Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        {filteredPlaces.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#14171C] border border-[#E4E4E7] dark:border-[#27272A] shadow-sm space-y-3 transition-colors duration-250">
            <Bookmark className="w-12 h-12 text-[#71717A] dark:text-[#A1A1AA] mx-auto opacity-30" />
            <h3 className="font-heading text-lg sm:text-xl font-bold text-[#09090B] dark:text-white">
              No saved places in this category
            </h3>
            <p className="text-sm sm:text-base text-[#71717A] dark:text-[#A1A1AA] max-w-sm mx-auto">
              You can bookmark any room or laboratory on the Campus Map, Explore, or Directory pages to access it quickly here.
            </p>
            <div className="pt-2">
              <button
                onClick={() => navigate('/map')}
                className="px-5 py-2.5 rounded-xl bg-[#09090B] dark:bg-white hover:bg-[#27272A] dark:hover:bg-[#E4E4E7] text-white dark:text-[#09090B] text-sm sm:text-base font-bold transition active:scale-95 shadow-sm"
              >
                Explore Campus Map
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPlaces.map((place) => (
              <LocationCard
                key={place.id}
                location={place}
                isBookmarked={true}
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

export default SavedPage;
