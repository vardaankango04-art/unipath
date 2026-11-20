import React from 'react';
import { NavLink } from 'react-router-dom';
import { Compass, Layers, Bookmark } from 'lucide-react';

const BottomNavigation = () => {
  // Mobile / Tablet Bottom Navigation Bar (Hidden on desktop to avoid covering map)
  const navItems = [
    { to: '/map', label: 'Campus Map', icon: Compass },
    { to: '/explore', label: 'Explore', icon: Layers },
    { to: '/saved', label: 'Saved Places', icon: Bookmark },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-3 sm:p-4 pointer-events-none select-none lg:hidden">
      <div className="max-w-[440px] w-full mx-auto pointer-events-auto">
        <nav 
          aria-label="Bottom Navigation"
          className="glass-monochrome rounded-2xl px-4 py-2 flex items-center justify-around shadow-xl relative overflow-hidden h-[66px]"
        >
          {/* Top glossy reflection sweep line */}
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-zinc-400/50 dark:via-zinc-200/40 to-transparent pointer-events-none animate-gloss-sweep" />

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `relative flex flex-col items-center justify-center py-2 px-3 sm:px-5 rounded-xl transition-all duration-200 group flex-1 text-center ${
                    isActive
                      ? 'bg-[#F4F4F5] dark:bg-[#1E232B] text-[#09090B] dark:text-white font-bold'
                      : 'text-[#71717A] dark:text-[#A1A1AA] hover:text-[#09090B] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 active:scale-95'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon 
                      className={`w-[22px] h-[22px] transition-transform duration-200 ${
                        isActive 
                          ? 'scale-110 text-[#09090B] dark:text-white stroke-[2.2]' 
                          : 'stroke-[1.8] group-hover:scale-105 text-[#71717A] dark:text-[#A1A1AA] group-hover:text-[#09090B] dark:group-hover:text-white'
                      }`} 
                    />
                    <span 
                      className={`text-[12px] mt-1 leading-tight tracking-tight transition-colors duration-200 ${
                        isActive ? 'text-[#09090B] dark:text-white font-semibold' : 'text-[#71717A] dark:text-[#A1A1AA] group-hover:text-[#09090B] dark:group-hover:text-white'
                      }`}
                    >
                      {item.label}
                    </span>

                    {/* Active Pip */}
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#09090B] dark:bg-white mt-0.5" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default BottomNavigation;
