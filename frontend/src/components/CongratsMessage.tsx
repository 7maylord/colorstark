import React from "react";

interface CongratsMessageProps {
  points?: number;
  children?: React.ReactNode;
}

const CongratsMessage: React.FC<CongratsMessageProps> = ({ points, children }) => (
  <div className="fixed inset-0 flex flex-col items-center justify-center z-50 bg-black bg-opacity-60 animate-fade-in">
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-50">
      {[...Array(30)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: `hsl(${Math.random() * 360}, 90%, 60%)`,
            opacity: 0.8,
            animation: `fall ${2 + Math.random() * 2}s linear ${Math.random()}s infinite`,
          }}
        />
      ))}
    </div>
    <div className="relative flex flex-col items-center gap-3 p-4 sm:p-6 bg-white/90 rounded-2xl shadow-2xl border-4 border-yellow-300 animate-bounce-in w-[90vw] max-w-[35vw] sm:max-w-[400px] md:max-w-[35vw]">
      <span className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-yellow-400 to-purple-500 drop-shadow-lg animate-pop text-center break-words max-w-full overflow-hidden whitespace-pre-line">🎉 CONGRATS! 🎉</span>
      <span className="text-lg md:text-xl font-bold text-purple-700 animate-fade-in-slow text-center">You solved the puzzle!</span>
      {typeof points === 'number' && (
        <span className="text-base text-gray-800 text-center">You have earned <span className="font-bold text-purple-600">{points} points</span>!</span>
      )}
      <span className="text-2xl animate-wiggle">🏆</span>
      {children}
    </div>
  </div>
);

export default CongratsMessage; 