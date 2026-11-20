import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const CategoryCard = ({
  title,
  description,
  count,
  icon: Icon,
  to,
  badge = "Browse Directory"
}) => {
  const navigate = useNavigate();

  return (
    <div 
      onClick={() => navigate(to)}
      className="bg-white dark:bg-[#14171C] rounded-2xl border border-[#E4E4E7] dark:border-[#27272A] p-6 sm:p-7 shadow-sm hover:border-[#09090B] dark:hover:border-white hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between group active:scale-[0.99]"
    >
      <div className="space-y-4">
        {/* Top Icon Badge & Room Count */}
        <div className="flex items-center justify-between">
          <div className="w-14 h-14 rounded-xl bg-[#F4F4F5] dark:bg-[#1E232B] text-[#09090B] dark:text-white flex items-center justify-center group-hover:bg-[#09090B] dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-[#09090B] transition-colors duration-200 shadow-sm border border-[#E4E4E7] dark:border-[#27272A]">
            <Icon className="w-7 h-7 stroke-[2]" />
          </div>

          <span className="text-xs sm:text-sm font-bold text-[#71717A] dark:text-[#A1A1AA] px-3.5 py-1.5 rounded-full bg-[#FAFAFA] dark:bg-[#09090B] border border-[#E4E4E7] dark:border-[#27272A]">
            {count}
          </span>
        </div>

        {/* Title & Description */}
        <div className="space-y-2">
          <h3 className="font-heading text-xl sm:text-2xl font-extrabold text-[#09090B] dark:text-white transition-colors leading-snug">
            {title}
          </h3>
          <p className="text-sm sm:text-base text-[#71717A] dark:text-[#A1A1AA] leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      {/* Explore Action Link */}
      <div className="mt-6 pt-4 border-t border-[#E4E4E7] dark:border-[#27272A] flex items-center justify-between text-sm sm:text-base font-bold text-[#09090B] dark:text-white transition-colors">
        <span>{badge}</span>
        <div className="w-9 h-9 rounded-xl bg-[#F4F4F5] dark:bg-[#1E232B] flex items-center justify-center text-[#09090B] dark:text-white group-hover:translate-x-1 group-hover:bg-[#09090B] dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-[#09090B] transition-all">
          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2]" />
        </div>
      </div>
    </div>
  );
};

export default CategoryCard;
