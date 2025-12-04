import React from 'react';
import { HelpCircle } from 'lucide-react';

interface Props {
  content: React.ReactNode;
  icon?: React.ReactNode; // Allow custom icon
  className?: string;
}

const TooltipHelp: React.FC<Props> = ({ content, icon, className = "" }) => {
  return (
    <div className={`group relative inline-flex items-center ml-1.5 align-middle ${className}`}>
      {icon ? (
        <span className="cursor-help transition-colors text-phuhung-blue hover:text-phuhung-blueHover">{icon}</span>
      ) : (
        <HelpCircle className="w-4 h-4 text-phuhung-blue hover:text-phuhung-blueHover cursor-help transition-colors" />
      )}
      
      {/* Tooltip Content */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 hidden group-hover:block w-72 p-3 bg-white border border-gray-200 text-gray-700 text-xs leading-relaxed rounded-md shadow-xl z-[100] animate-in fade-in zoom-in-95 duration-200">
        <div className="relative z-10">
            {content}
        </div>
        
        {/* Triangle pointer border */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-[7px] border-transparent border-t-gray-200"></div>
        {/* Triangle pointer background */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-white -mt-[1px]"></div>
      </div>
    </div>
  );
};

export default TooltipHelp;