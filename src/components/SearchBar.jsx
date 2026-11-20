import React from 'react';
import { Search, X } from 'lucide-react';

const SearchBar = ({
  value = '',
  onChange,
  onClear,
  placeholder = 'Search by classroom, lab, cabin, or room code...',
  className = '',
  isLarge = true
}) => {
  return (
    <div className={`relative flex items-center w-full ${className}`}>
      {/* Search Icon */}
      <Search 
        className="absolute left-4.5 w-5 h-5 sm:w-[22px] sm:h-[22px] text-[#71717A] dark:text-[#A1A1AA] stroke-[2] pointer-events-none" 
      />
      
      {/* Search Input: ~52px-56px high, clean minimalist monochrome */}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-13 sm:h-14 bg-white dark:bg-[#14171C] text-[#09090B] dark:text-[#FFFFFF] placeholder-[#71717A] dark:placeholder-[#A1A1AA] text-sm sm:text-base font-medium rounded-2xl border border-[#E4E4E7] dark:border-[#27272A] pl-13 pr-12 focus:outline-none focus:ring-2 focus:ring-[#09090B] dark:focus:ring-[#FFFFFF] focus:border-transparent transition shadow-subtle"
      />

      {value && (
        <button
          onClick={onClear}
          className="absolute right-4 w-7 h-7 rounded-full bg-[#F4F4F5] dark:bg-[#1E232B] hover:bg-[#E4E4E7] dark:hover:bg-[#27272A] text-[#71717A] dark:text-[#A1A1AA] hover:text-[#09090B] dark:hover:text-[#FFFFFF] flex items-center justify-center transition"
          title="Clear search"
          type="button"
          aria-label="Clear Search"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
