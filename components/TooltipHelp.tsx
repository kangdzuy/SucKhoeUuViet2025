import React from 'react';
import { HelpCircle } from 'lucide-react';

interface Props {
  text: string;
}

const TooltipHelp: React.FC<Props> = ({ text }) => {
  return (
    <div className="group relative inline-flex items-center ml-1 align-middle">
      <HelpCircle className="w-4 h-4 text-phuhung-blue hover:text-phuhung-blueHover cursor-help transition-colors opacity-80 hover:opacity-100" />
      
      {/* Tooltip Content */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-64 p-3 bg-white border border-gray-200 shadow-xl rounded-md text-[13px] leading-relaxed text-gray-700 z-50 animate-in fade-in zoom-in-95 duration-200">
        {text}
        {/* Triangle pointer */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-white"></div>
      </div>
    </div>
  );
};

export default TooltipHelp;