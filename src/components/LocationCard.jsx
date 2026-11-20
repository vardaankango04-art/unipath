import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Navigation, Bookmark, Building, Users } from 'lucide-react';

const LocationCard = ({
  location,
  isBookmarked = false,
  onToggleBookmark,
  showCategory = true,
  actionLabel = "Open on Map"
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white dark:bg-[#14171C] rounded-2xl border border-[#E4E4E7] dark:border-[#27272A] p-5 sm:p-6 shadow-sm hover:border-[#09090B] dark:hover:border-white hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      <div className="space-y-4">
        {/* Top Header: Room Code Badge + Name + Bookmark Button */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center space-x-3.5 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-[#F4F4F5] dark:bg-[#1E232B] text-[#09090B] dark:text-white flex items-center justify-center font-extrabold text-sm sm:text-base flex-shrink-0 shadow-sm border border-[#E4E4E7] dark:border-[#27272A]">
              {location.roomNumber ? location.roomNumber.slice(0, 3) : 'LOC'}
            </div>
            <div className="flex flex-col min-w-0">
              {showCategory && (
                <span className="text-xs sm:text-[13px] font-bold uppercase tracking-wider text-[#71717A] dark:text-[#A1A1AA] truncate">
                  {location.categoryLabel || location.category}
                </span>
              )}
              <h3 className="font-heading text-lg sm:text-xl lg:text-[21px] font-extrabold text-[#09090B] dark:text-white leading-snug truncate">
                {location.name}
              </h3>
            </div>
          </div>

          {onToggleBookmark && (
            <button
              onClick={() => onToggleBookmark(location.id)}
              className={`w-10 h-10 rounded-xl border transition flex items-center justify-center flex-shrink-0 ${
                isBookmarked
                  ? 'bg-[#09090B] dark:bg-white border-[#09090B] dark:border-white text-white dark:text-[#09090B]'
                  : 'bg-white dark:bg-[#14171C] border-[#E4E4E7] dark:border-[#27272A] text-[#71717A] dark:text-[#A1A1AA] hover:bg-[#F4F4F5] dark:hover:bg-[#1E232B] hover:text-[#09090B] dark:hover:text-white'
              }`}
              title={isBookmarked ? "Remove Bookmark" : "Save Location"}
              type="button"
              aria-label="Bookmark Location"
            >
              <Bookmark className={`w-4 h-4 sm:w-5 sm:h-5 stroke-[1.8] ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
          )}
        </div>

        {/* Location Specs: Building, Floor, Department */}
        <div className="space-y-2.5 text-sm sm:text-[15px] text-[#71717A] dark:text-[#A1A1AA]">
          <div className="flex items-center space-x-2.5">
            <Building className="w-[18px] h-[18px] text-[#09090B] dark:text-white flex-shrink-0 stroke-[1.8]" />
            <span className="truncate">
              {location.building} · {location.floor}
            </span>
          </div>

          {location.department && (
            <div className="flex items-center space-x-2.5">
              <span className="w-2 h-2 rounded-full bg-[#09090B] dark:bg-white ml-0.5 flex-shrink-0" />
              <span className="truncate font-semibold text-[#09090B] dark:text-white">
                {location.department}
              </span>
            </div>
          )}

          {location.capacity && (
            <div className="flex items-center space-x-2.5">
              <Users className="w-[18px] h-[18px] text-[#71717A] dark:text-[#A1A1AA] flex-shrink-0 stroke-[1.8]" />
              <span className="truncate text-sm sm:text-[15px]">
                {location.capacity}
              </span>
            </div>
          )}
        </div>

        {/* Description / Details */}
        {location.description && (
          <p className="text-sm sm:text-[15px] text-[#71717A] dark:text-[#A1A1AA] line-clamp-2 leading-relaxed pt-2.5 border-t border-[#E4E4E7] dark:border-[#27272A]">
            {location.description}
          </p>
        )}
      </div>

      {/* Bottom Action Button */}
      <div className="mt-6 pt-4 border-t border-[#E4E4E7] dark:border-[#27272A] flex items-center justify-between">
        <span className="text-sm sm:text-[15px] font-mono font-bold text-[#71717A] dark:text-[#A1A1AA]">
          {location.roomNumber}
        </span>

        <button
          onClick={() => navigate(`/map?loc=${location.id}`)}
          className="h-10 sm:h-11 px-4 sm:px-5 rounded-xl bg-[#09090B] dark:bg-white hover:bg-[#27272A] dark:hover:bg-[#E4E4E7] text-white dark:text-[#09090B] text-sm sm:text-base font-bold flex items-center space-x-2 transition active:scale-95 shadow-sm"
          type="button"
        >
          <Navigation className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2]" />
          <span>{actionLabel}</span>
        </button>
      </div>
    </div>
  );
};

export default LocationCard;
