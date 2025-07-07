import React from "react";

const colorClasses = [
  "bg-red-500",
  "bg-blue-500",
  "bg-green-500",
  "bg-yellow-400",
  "bg-purple-500"
];

const InstructionsModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-50 bg-gradient-to-br from-white/10 via-purple-200/10 to-blue-200/10 backdrop-blur-xl rounded-2xl p-8 border border-white/30 shadow-xl animate-fade-in">
      <div className="relative flex flex-col items-center gap-2 p-3 sm:gap-3 sm:p-6 bg-white/90 rounded-2xl shadow-2xl border-4 border-purple-500 animate-bounce-in w-[96vw] max-w-[98vw] sm:max-w-[400px] md:max-w-[35vw]">
        
        <div className="flex gap-2 mb-1 sm:mb-2">
          {colorClasses.map((cls, i) => (
            <span key={i} className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${cls} border-2 border-white shadow`} />
          ))}
        </div>
        <span className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-400 via-green-500 via-blue-500 to-purple-500 drop-shadow-lg animate-pop text-center">📝 Game Instructions</span>
        <ul className="text-sm sm:text-base text-gray-800 text-left list-disc pl-4 sm:pl-5 space-y-1 sm:space-y-2">
          <li><span className="font-bold text-purple-500">Register your name</span> if this is your first time playing the game!</li>
          <li>If the game is too hard, <span className="font-bold text-blue-500">you can <span className='underline'>peek</span> at the target</span>... no one needs to know! 😉</li>
          <li>And most importantly: <span className="font-bold text-green-500">Remember to have fun!</span> 🎉</li>
        </ul>
        <button onClick={onClose} className="mt-2 sm:mt-4 px-4 py-2 sm:px-6 sm:py-2 bg-gradient-to-r from-red-500 via-yellow-400 via-green-500 via-blue-500 to-purple-500 hover:from-purple-600 hover:to-red-500 rounded-lg text-white font-semibold transition-colors text-base sm:text-lg">Got it!</button>
      </div>
    </div>
  );
};

export default InstructionsModal; 