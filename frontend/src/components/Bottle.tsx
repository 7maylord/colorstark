import React from "react";
import { Square } from "lucide-react";

interface BottleProps {
  color: string;
  index: number;
  isTarget?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
}

const colorMap: Record<string, string> = {
  red: "bg-red-500",
  blue: "bg-blue-500",
  green: "bg-green-500",
  yellow: "bg-yellow-400",
  purple: "bg-purple-500",
};

const Bottle: React.FC<BottleProps> = ({ color, index, isTarget = false, isSelected = false, onClick }) => {
  return (
    <div
      className={`
        relative w-16 h-32 mx-2 cursor-pointer transition-all duration-300 transform
        ${isSelected ? 'scale-110 ring-4 ring-white ring-opacity-50' : ''}
        ${!isTarget ? 'hover:scale-105' : ''}
      `}
      onClick={onClick}
      aria-label={isTarget ? `Target bottle ${index + 1}` : `Bottle ${index + 1}`}
      tabIndex={0}
    >
      {/* Bottle neck */}
      <div className="absolute left-1/2 -translate-x-1/2 top-0 w-6 h-6 bg-gradient-to-b from-gray-200 to-gray-400 rounded-t-md z-20 border border-gray-300" />
      {/* Bottle cap */}
      <div className="absolute left-1/2 -translate-x-1/2 top-0 w-8 h-3 bg-gradient-to-b from-gray-700 to-gray-500 rounded-t-lg z-30 border border-gray-600" />
      {/* Bottle body (glass) */}
      <div className="absolute left-1/2 -translate-x-1/2 top-4 w-12 h-24 bg-gradient-to-b from-white/80 via-white/30 to-white/10 rounded-b-2xl rounded-t-lg border-2 border-gray-200 shadow-xl z-10 overflow-hidden">
        {/* Liquid */}
        <div className="absolute bottom-0 left-0 w-full h-3/4 rounded-b-2xl" style={{ background: color, opacity: isTarget ? 0.7 : 1 }} />
        {/* Shine */}
        <div className="absolute left-2 top-4 w-2 h-12 bg-white bg-opacity-30 rounded-full rotate-12 z-20" />
      </div>
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center z-40">
          <Square className="w-3 h-3 text-white" />
        </div>
      )}
    </div>
  );
};

export default Bottle; 