import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Compass, Info, X, ShieldCheck, Sun, Moon, Layers, Bookmark } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();
  const [greeting, setGreeting] = useState('Good day!');
  const [showInfoModal, setShowInfoModal] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good Morning');
    } else if (hour < 17) {
      setGreeting('Good Afternoon');
    } else {
      setGreeting('Good Evening');
    }
  }, []);

  const navLinks = [
    { to: '/map', label: 'Campus Map', icon: Compass },
    { to: '/explore', label: 'Explore', icon: Layers },
    { to: '/saved', label: 'Saved Places', icon: Bookmark },
  ];

  return (
    <header className="bg-white dark:bg-[#14171C] border-b border-[#E4E4E7] dark:border-[#27272A] sticky top-0 z-30 select-none shadow-subtle h-[84px] sm:h-[88px] flex items-center transition-colors duration-200">
      <div className="w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Left: UniPath Brand Identity */}
        <div 
          onClick={() => navigate('/map')}
          className="flex items-center space-x-3.5 sm:space-x-4 cursor-pointer group flex-shrink-0"
          title="UniPath – Smart Campus Navigation"
        >
          <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl bg-[#09090B] dark:bg-[#FFFFFF] text-white dark:text-[#09090B] flex items-center justify-center shadow-sm transition-transform duration-200 group-hover:scale-105 flex-shrink-0">
            <Compass className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2]" />
          </div>
          <div className="flex flex-col">
            <span className="font-heading text-2xl sm:text-[26px] font-extrabold tracking-tight text-[#09090B] dark:text-[#FFFFFF] leading-tight">
              UniPath
            </span>
            <span className="text-xs sm:text-[13px] text-[#71717A] dark:text-[#A1A1AA] font-semibold tracking-wider leading-tight">
              Smart Campus Navigation
            </span>
          </div>
        </div>

        {/* Center: Dynamic Greeting & Spacious Desktop Navigation Bar */}
        <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
          {/* Dynamic Greeting */}
          <div className="flex flex-col text-center xl:text-left pr-2">
            <span className="font-heading text-base sm:text-lg font-extrabold text-[#09090B] dark:text-[#FFFFFF] leading-tight">
              {greeting}!
            </span>
            <span className="text-xs sm:text-[13px] text-[#71717A] dark:text-[#A1A1AA] mt-0.5">
              Explore your campus.
            </span>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden lg:flex items-center p-1.5 rounded-2xl bg-[#F4F4F5] dark:bg-[#09090B] border border-[#E4E4E7] dark:border-[#27272A] space-x-1.5 shadow-xs">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to || (item.to === '/map' && location.pathname === '/');
              return (
                <button
                  key={item.to}
                  onClick={() => navigate(item.to)}
                  className={`flex items-center space-x-2.5 px-5 py-2.5 rounded-xl text-sm sm:text-[15px] font-bold transition-all duration-200 ${
                    isActive
                      ? 'bg-[#09090B] dark:bg-[#FFFFFF] text-white dark:text-[#09090B] shadow-sm'
                      : 'text-[#71717A] dark:text-[#A1A1AA] hover:text-[#09090B] dark:hover:text-[#FFFFFF] hover:bg-white dark:hover:bg-[#1E232B]'
                  }`}
                  type="button"
                >
                  <Icon className="w-[18px] h-[18px] sm:w-5 sm:h-5 stroke-[2]" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right: Theme Toggle & Campus Information Guide */}
        <div className="flex items-center space-x-3 sm:space-x-3.5 relative">
          
          {/* Theme Toggle Button (Light/Dark Mode) */}
          <button
            onClick={toggleTheme}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl border border-[#E4E4E7] dark:border-[#27272A] bg-white dark:bg-[#14171C] hover:bg-[#F4F4F5] dark:hover:bg-[#1E232B] flex items-center justify-center transition-all duration-200 active:scale-95 shadow-subtle group"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            type="button"
          >
            {isDark ? (
              <Sun className="w-5 h-5 sm:w-6 sm:h-6 text-[#FFFFFF] stroke-[2] transition-transform group-hover:rotate-45" />
            ) : (
              <Moon className="w-5 h-5 sm:w-6 sm:h-6 text-[#09090B] stroke-[2] transition-transform group-hover:-rotate-12" />
            )}
          </button>

          {/* Public Campus Information Button */}
          <button
            onClick={() => setShowInfoModal(!showInfoModal)}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl border border-[#E4E4E7] dark:border-[#27272A] bg-[#F4F4F5] dark:bg-[#1E232B] hover:bg-[#E4E4E7] dark:hover:bg-[#27272A] text-[#09090B] dark:text-[#FFFFFF] flex items-center justify-center transition active:scale-95 shadow-subtle"
            title="Campus Navigation Guide"
            aria-label="Campus Information"
            type="button"
          >
            <Info className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
          </button>

          {/* Public Campus Information Dropdown Modal */}
          {showInfoModal && (
            <div className="absolute right-0 top-16 w-80 sm:w-[440px] bg-white dark:bg-[#14171C] border border-[#E4E4E7] dark:border-[#27272A] rounded-2xl shadow-dropdown p-6 sm:p-7 z-50 text-sm space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between pb-3.5 border-b border-[#E4E4E7] dark:border-[#27272A]">
                <div className="flex items-center space-x-2.5">
                  <ShieldCheck className="w-5 h-5 text-[#09090B] dark:text-[#FFFFFF]" />
                  <span className="font-heading font-bold text-[#09090B] dark:text-[#FFFFFF] text-base sm:text-lg">Public Campus Navigation</span>
                </div>
                <button 
                  onClick={() => setShowInfoModal(false)}
                  className="text-[#71717A] dark:text-[#A1A1AA] hover:text-[#09090B] dark:hover:text-[#FFFFFF] p-1.5 rounded-lg hover:bg-[#F4F4F5] dark:hover:bg-[#1E232B] transition"
                  type="button"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3.5 text-sm sm:text-[15px] text-[#71717A] dark:text-[#A1A1AA] leading-relaxed">
                <p>
                  UniPath is a public indoor wayfinding system for students, faculty, visiting parents, and university guests.
                  <strong className="text-[#09090B] dark:text-[#FFFFFF] block mt-1 font-semibold">No login or account creation required.</strong>
                </p>

                <div className="p-4 sm:p-5 rounded-xl bg-[#F4F4F5] dark:bg-[#09090B] border border-[#E4E4E7] dark:border-[#27272A] space-y-2.5 text-xs sm:text-sm">
                  <span className="font-bold text-[#09090B] dark:text-[#FFFFFF] block text-sm">How to find your destination:</span>
                  <div className="flex items-center space-x-2.5 text-[#09090B] dark:text-[#FFFFFF]">
                    <span className="w-2 h-2 rounded-full bg-[#09090B] dark:bg-[#FFFFFF] flex-shrink-0" />
                    <span>Search any classroom, lab, or faculty cabin by name or room code.</span>
                  </div>
                  <div className="flex items-center space-x-2.5 text-[#09090B] dark:text-[#FFFFFF]">
                    <span className="w-2 h-2 rounded-full bg-[#09090B] dark:bg-[#FFFFFF] flex-shrink-0" />
                    <span>Switch floors (-1 to 4) using the floor selector above the map.</span>
                  </div>
                  <div className="flex items-center space-x-2.5 text-[#09090B] dark:text-[#FFFFFF]">
                    <span className="w-2 h-2 rounded-full bg-[#09090B] dark:bg-[#FFFFFF] flex-shrink-0" />
                    <span>Follow the animated route line through corridors to your room.</span>
                  </div>
                </div>

                <p className="text-xs text-[#71717A] dark:text-[#A1A1AA] pt-1">
                  Demonstration Blueprint: Actual university CAD floor plans and PostgreSQL database records map directly via unique room IDs.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
