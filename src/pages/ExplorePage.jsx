import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LocationCard from '../components/LocationCard';
import SearchBar from '../components/SearchBar';
import { sampleLocations } from '../data/locations';
import { getLocations } from '../services/api';
import { 
  Building, 
  GraduationCap, 
  FlaskConical, 
  Briefcase, 
  Compass, 
  Database,
  ArrowRight,
  Landmark,
  MapPin,
  Sparkles
} from 'lucide-react';

const ExplorePage = ({ bookmarkedIds = [], onToggleBookmark }) => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [allLocations, setAllLocations] = useState(sampleLocations);
  const [isLiveApi, setIsLiveApi] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      const data = await getLocations();
      if (isMounted && data && data.length > 0) {
        const locMap = new Map();
        data.forEach(l => locMap.set(l.name.toLowerCase(), l));
        sampleLocations.forEach(l => {
          if (!locMap.has(l.name.toLowerCase())) {
            locMap.set(l.name.toLowerCase(), l);
          }
        });
        setAllLocations(Array.from(locMap.values()));
        setIsLiveApi(true);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, []);

  // 5 Distinct Campus Categories specification
  const categoryConfig = [
    {
      id: 'faculty',
      title: 'Faculty Cabins',
      shortTitle: 'Faculty',
      icon: Briefcase,
      description: 'Faculty consultation rooms, academic advisors, and professor cabins across academic wings.',
      to: '/faculty'
    },
    {
      id: 'offices',
      title: 'Institute Offices',
      shortTitle: 'Offices',
      icon: Landmark,
      description: 'Administrative executive offices including Dean, Registrar, Examination Cell, and Placement Cell.',
      to: '/locations'
    },
    {
      id: 'classrooms',
      title: 'Classrooms & Lecture Halls',
      shortTitle: 'Classrooms',
      icon: GraduationCap,
      description: 'Tiered smart lecture theatres, seminar rooms, and tutorial classrooms across floors.',
      to: '/classrooms'
    },
    {
      id: 'facilities',
      title: 'Campus Locations & Facilities',
      shortTitle: 'Locations',
      icon: Building,
      description: 'Central library, reading rooms, student cafeteria, campus records, and general amenities.',
      to: '/locations'
    },
    {
      id: 'laboratories',
      title: 'Laboratories & Research Centers',
      shortTitle: 'Laboratories',
      icon: FlaskConical,
      description: 'Computing centers, VLSI hardware benches, applied physics laboratories, and research suites.',
      to: '/laboratories'
    }
  ];

  // Group and filter locations
  const locationsByCategory = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const result = {};

    categoryConfig.forEach(cat => {
      let items = allLocations.filter(l => l.category === cat.id);
      if (q) {
        items = items.filter(l => 
          l.name.toLowerCase().includes(q) ||
          l.roomNumber.toLowerCase().includes(q) ||
          l.building.toLowerCase().includes(q) ||
          (l.floor && l.floor.toLowerCase().includes(q)) ||
          (l.department && l.department.toLowerCase().includes(q))
        );
      }
      result[cat.id] = items;
    });

    return result;
  }, [allLocations, searchQuery]);

  const displayedCategories = useMemo(() => {
    if (activeFilter === 'all') {
      return categoryConfig;
    }
    return categoryConfig.filter(cat => cat.id === activeFilter);
  }, [activeFilter]);

  const totalMatches = Object.values(locationsByCategory).reduce((acc, curr) => acc + curr.length, 0);

  return (
    <div className="flex flex-col h-full bg-[#FAFAFA] dark:bg-[#09090B] overflow-y-auto no-scrollbar pb-32 lg:pb-16 transition-colors duration-250">
      
      {/* Top Banner */}
      <div className="bg-white dark:bg-[#14171C] border-b border-[#E4E4E7] dark:border-[#27272A] px-4 sm:px-6 lg:px-8 py-8 select-none shadow-sm transition-colors duration-250">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 text-xs uppercase tracking-widest font-bold text-[#71717A] dark:text-[#A1A1AA] mb-1">
                <span>Campus Directory</span>
                <span>•</span>
                <span>5 Core Categories</span>
              </div>
              <h1 className="font-heading text-2xl sm:text-3xl lg:text-[34px] font-extrabold text-[#09090B] dark:text-white tracking-tight">
                Explore Campus Directory
              </h1>
              <p className="text-sm sm:text-base lg:text-[16px] text-[#71717A] dark:text-[#A1A1AA] mt-1.5 max-w-3xl leading-relaxed">
                Browse faculty cabins, institute administration offices, lecture halls, campus amenities, and laboratory research facilities.
              </p>
            </div>

            <div className={`flex items-center space-x-2.5 px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-bold self-start md:self-auto shadow-sm ${
              isLiveApi 
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                : 'bg-[#F4F4F5] dark:bg-[#1E232B] border-[#E4E4E7] dark:border-[#27272A] text-[#09090B] dark:text-white'
            }`}>
              <Database className="w-4 h-4" />
              <span>{isLiveApi ? `PostgreSQL Live (${allLocations.length} Records)` : 'DSA Graph Index Ready'}</span>
            </div>
          </div>

          {/* Quick Search & Category Filter Pills */}
          <div className="pt-2 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            <div className="flex-1 max-w-xl">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                onClear={() => setSearchQuery('')}
                placeholder="Search across all 5 categories..."
                isLarge={true}
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1">
              <button
                onClick={() => setActiveFilter('all')}
                className={`h-11 px-4 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
                  activeFilter === 'all'
                    ? 'bg-[#09090B] dark:bg-white text-white dark:text-[#09090B] shadow-sm ring-1 ring-[#09090B] dark:ring-white'
                    : 'bg-white dark:bg-[#14171C] text-[#71717A] dark:text-[#A1A1AA] hover:text-[#09090B] dark:hover:text-white border border-[#E4E4E7] dark:border-[#27272A]'
                }`}
                type="button"
              >
                All Categories ({totalMatches})
              </button>
              {categoryConfig.map(cat => {
                const count = locationsByCategory[cat.id]?.length || 0;
                const isActive = activeFilter === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveFilter(cat.id)}
                    className={`h-11 px-4 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap flex items-center space-x-1.5 ${
                      isActive
                        ? 'bg-[#09090B] dark:bg-white text-white dark:text-[#09090B] shadow-sm ring-1 ring-[#09090B] dark:ring-white'
                        : 'bg-white dark:bg-[#14171C] text-[#71717A] dark:text-[#A1A1AA] hover:text-[#09090B] dark:hover:text-white border border-[#E4E4E7] dark:border-[#27272A]'
                    }`}
                    type="button"
                  >
                    <span>{cat.shortTitle}</span>
                    <span className={`text-[11px] font-mono px-1.5 py-0.5 rounded-md ${
                      isActive 
                        ? 'bg-white/20 dark:bg-black/20 text-white dark:text-[#09090B]' 
                        : 'bg-[#F4F4F5] dark:bg-[#1E232B] text-[#71717A] dark:text-[#A1A1AA]'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-10">
        
        {/* Quick Map Action Card (Monochrome styling) */}
        <div 
          onClick={() => navigate('/map')}
          className="p-6 sm:p-7 rounded-2xl bg-[#09090B] dark:bg-[#14171C] border border-[#27272A] text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-[#18181B] dark:hover:bg-[#1C2028] transition-all duration-200"
        >
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center text-white flex-shrink-0">
              <Compass className="w-7 h-7 stroke-[1.8]" />
            </div>
            <div>
              <h3 className="font-heading text-lg sm:text-xl lg:text-[22px] font-extrabold text-white">
                Interactive Indoor Campus Map
              </h3>
              <p className="text-sm sm:text-base text-zinc-300 dark:text-[#A1A1AA] mt-1">
                Calculate walking routes, zoom into rooms, and view step-by-step turn guidance on all 6 floors.
              </p>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate('/map');
            }}
            className="px-5 py-3 rounded-xl bg-white dark:bg-white text-[#09090B] text-sm sm:text-base font-bold transition flex items-center justify-center space-x-2 shadow-sm self-start sm:self-auto hover:bg-zinc-200 active:scale-95"
            type="button"
          >
            <span>Launch Map</span>
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2]" />
          </button>
        </div>

        {/* 5 Distinct Sections */}
        {displayedCategories.map(cat => {
          const items = locationsByCategory[cat.id] || [];
          const Icon = cat.icon;

          return (
            <section key={cat.id} className="space-y-5 pt-2">
              {/* Category Section Header */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[#E4E4E7] dark:border-[#27272A] pb-4">
                <div className="flex items-start space-x-3.5">
                  <div className="w-12 h-12 rounded-xl bg-[#F4F4F5] dark:bg-[#1E232B] text-[#09090B] dark:text-white flex items-center justify-center border border-[#E4E4E7] dark:border-[#27272A] shadow-sm flex-shrink-0">
                    <Icon className="w-6 h-6 stroke-[2]" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2.5">
                      <h2 className="font-heading text-xl sm:text-2xl font-extrabold text-[#09090B] dark:text-white">
                        {cat.title}
                      </h2>
                      <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-[#F4F4F5] dark:bg-[#1E232B] text-[#71717A] dark:text-[#A1A1AA] border border-[#E4E4E7] dark:border-[#27272A]">
                        {items.length} {items.length === 1 ? 'place' : 'places'}
                      </span>
                    </div>
                    <p className="text-sm text-[#71717A] dark:text-[#A1A1AA] mt-1">
                      {cat.description}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => navigate(cat.to)}
                  className="text-xs sm:text-sm font-bold text-[#09090B] dark:text-white hover:underline flex items-center space-x-1 self-start sm:self-auto"
                  type="button"
                >
                  <span>View Dedicated Directory</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Cards Grid */}
              {items.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-white dark:bg-[#14171C] border border-[#E4E4E7] dark:border-[#27272A] text-sm text-[#71717A] dark:text-[#A1A1AA]">
                  No matching locations found in {cat.title}.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {items.map(location => (
                    <LocationCard
                      key={location.id}
                      location={location}
                      isBookmarked={bookmarkedIds.includes(location.id)}
                      onToggleBookmark={onToggleBookmark}
                      showCategory={false}
                      actionLabel="Open on Map"
                    />
                  ))}
                </div>
              )}
            </section>
          );
        })}

      </div>
    </div>
  );
};

export default ExplorePage;