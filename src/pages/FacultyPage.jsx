import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import LocationCard from '../components/LocationCard';
import { sampleLocations } from '../data/locations';
import { getFaculty } from '../services/api';
import { Briefcase, Database, Layers, User, MapPin, Building, GraduationCap, Navigation } from 'lucide-react';

const FacultyPage = ({ bookmarkedIds = [], onToggleBookmark }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFloor, setSelectedFloor] = useState('all');
  const [facultyList, setFacultyList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiveApi, setIsLiveApi] = useState(false);

  // Fetch actual faculty members from PostgreSQL through FastAPI
  useEffect(() => {
    let isMounted = true;
    async function loadFaculty() {
      setIsLoading(true);
      const data = await getFaculty();
      if (isMounted) {
        if (data && data.length > 0) {
          setFacultyList(data);
          setIsLiveApi(true);
        }
        setIsLoading(false);
      }
    }
    loadFaculty();
    return () => { isMounted = false; };
  }, []);

  const floorTabs = [
    { id: 'all', label: 'All Faculty' },
    { id: 'first', label: 'First Floor' },
    { id: 'second', label: 'Second Floor' }
  ];

  // Filtered actual faculty members from database
  const filteredFaculty = useMemo(() => {
    return facultyList.filter(fac => {
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery = !q ||
        fac.faculty_name.toLowerCase().includes(q) ||
        (fac.floor_label && fac.floor_label.toLowerCase().includes(q)) ||
        (fac.department && fac.department.toLowerCase().includes(q)) ||
        (fac.cabin_room_no && fac.cabin_room_no.toLowerCase().includes(q));

      const matchesFloor = selectedFloor === 'all' ||
        (selectedFloor === 'first' && (fac.floor_label || '').toLowerCase().includes('first')) ||
        (selectedFloor === 'second' && (fac.floor_label || '').toLowerCase().includes('second'));

      return matchesQuery && matchesFloor;
    });
  }, [facultyList, searchQuery, selectedFloor]);

  return (
    <div className="flex flex-col h-full bg-[#FAFAFA] dark:bg-[#09090B] overflow-y-auto no-scrollbar pb-32 lg:pb-16 transition-colors duration-250">
      {/* Top Header */}
      <div className="bg-white dark:bg-[#14171C] border-b border-[#E4E4E7] dark:border-[#27272A] px-4 sm:px-6 lg:px-8 py-8 select-none shadow-sm transition-colors duration-250">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2.5">
                <Briefcase className="w-6 h-6 sm:w-7 sm:h-7 text-[#09090B] dark:text-white stroke-[2.2]" />
                <h1 className="font-heading text-2xl sm:text-3xl lg:text-[32px] font-extrabold text-[#09090B] dark:text-white tracking-tight">
                  Faculty Directory
                </h1>
              </div>
              <p className="text-sm sm:text-base lg:text-[16px] text-[#71717A] dark:text-[#A1A1AA] mt-1">
                Directory of university faculty members and professors mapped across campus floors.
              </p>
            </div>

            <div className={`flex items-center space-x-2 px-4 py-2 rounded-xl border text-xs sm:text-sm font-bold self-start sm:self-auto shadow-sm ${
              isLiveApi 
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                : 'bg-[#F4F4F5] dark:bg-[#1E232B] border-[#E4E4E7] dark:border-[#27272A] text-[#09090B] dark:text-white'
            }`}>
              <Database className="w-4 h-4" />
              <span>{isLiveApi ? `PostgreSQL Live (${facultyList.length} Faculty)` : 'Faculty Schema Ready'}</span>
            </div>
          </div>

          {/* Search Box */}
          <div className="max-w-md pt-1">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onClear={() => setSearchQuery('')}
              placeholder="Search faculty by name (e.g. Meghna, Bajaj)..."
              isLarge={true}
            />
          </div>

          {/* Floor Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#E4E4E7] dark:border-[#27272A]">
            {floorTabs.map((tab) => {
              const isActive = selectedFloor === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedFloor(tab.id)}
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

      {/* Faculty Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        <div className="flex items-center justify-between text-sm sm:text-base text-[#71717A] dark:text-[#A1A1AA]">
          <span>Displaying <strong className="text-[#09090B] dark:text-white font-bold">{filteredFaculty.length}</strong> faculty members</span>
          <span className="text-xs sm:text-sm font-mono text-emerald-600 dark:text-emerald-400">PostgreSQL Verified Data</span>
        </div>

        {filteredFaculty.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#14171C] border border-[#E4E4E7] dark:border-[#27272A] shadow-sm space-y-3 transition-colors duration-250">
            <Layers className="w-12 h-12 text-[#71717A] dark:text-[#A1A1AA] mx-auto opacity-30" />
            <h3 className="font-heading text-lg sm:text-xl font-bold text-[#09090B] dark:text-white">No faculty members found</h3>
            <p className="text-sm sm:text-base text-[#71717A] dark:text-[#A1A1AA] max-w-sm mx-auto">
              Try searching by teacher name or selecting another floor.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredFaculty.map((fac) => (
              <div
                key={fac.faculty_id}
                className="bg-white dark:bg-[#14171C] rounded-2xl border border-[#E4E4E7] dark:border-[#27272A] p-5 sm:p-6 shadow-sm hover:border-[#09090B] dark:hover:border-white hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Top Badge + Name */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-3.5 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-[#F4F4F5] dark:bg-[#1E232B] text-[#09090B] dark:text-white flex items-center justify-center font-extrabold text-sm sm:text-base flex-shrink-0 shadow-sm border border-[#E4E4E7] dark:border-[#27272A]">
                        <User className="w-6 h-6 stroke-[2]" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs sm:text-[13px] font-bold uppercase tracking-wider text-[#71717A] dark:text-[#A1A1AA] truncate">
                          {fac.floor_label || 'Campus Faculty'}
                        </span>
                        <h3 className="font-heading text-lg sm:text-xl lg:text-[20px] font-extrabold text-[#09090B] dark:text-white leading-snug truncate">
                          {fac.faculty_name}
                        </h3>
                      </div>
                    </div>
                  </div>

                  {/* Faculty Details: Floor & Building */}
                  <div className="space-y-2.5 text-sm sm:text-[15px] text-[#71717A] dark:text-[#A1A1AA]">
                    <div className="flex items-center space-x-2.5">
                      <Building className="w-[18px] h-[18px] text-[#09090B] dark:text-white flex-shrink-0 stroke-[1.8]" />
                      <span className="truncate">
                        Main Building · {fac.floor_label || 'Academic Block'}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2.5">
                      <GraduationCap className="w-[18px] h-[18px] text-[#09090B] dark:text-white flex-shrink-0 stroke-[1.8]" />
                      <span className="truncate">
                        {fac.department || 'Faculty Department (Scheduled for survey)'}
                      </span>
                    </div>

                    {fac.cabin_room_no && (
                      <div className="flex items-center space-x-2.5">
                        <MapPin className="w-[18px] h-[18px] text-[#09090B] dark:text-white flex-shrink-0 stroke-[1.8]" />
                        <span className="truncate">
                          Cabin: {fac.cabin_room_no}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Action Button */}
                <div className="mt-6 pt-4 border-t border-[#E4E4E7] dark:border-[#27272A] flex items-center justify-between">
                  <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-[#F4F4F5] dark:bg-[#1E232B] text-[#71717A] dark:text-[#A1A1AA] border border-[#E4E4E7] dark:border-[#27272A]">
                    {fac.floor_label || 'Floor Level'}
                  </span>

                  <button
                    onClick={() => {
                      const floorParam = (fac.floor_label || '').toLowerCase().includes('second') ? '2' : '1';
                      navigate(`/map?floor=${floorParam}`);
                    }}
                    className="h-10 px-4 rounded-xl bg-[#09090B] dark:bg-white hover:bg-[#27272A] dark:hover:bg-[#E4E4E7] text-white dark:text-[#09090B] text-sm font-bold flex items-center space-x-2 transition active:scale-95 shadow-sm"
                    type="button"
                  >
                    <Navigation className="w-4 h-4 stroke-[2]" />
                    <span>View Floor on Map</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FacultyPage;
