"use client";

export default function BottlesBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
      {/* Floating Bottles Animation */}
      <div className="absolute top-8 sm:top-20 left-2 sm:left-10 bounce-bottle-1">
        <div className="w-4 h-10 sm:w-6 sm:h-16 bg-gradient-to-b from-red-400 to-red-600 rounded-t-full rounded-b-lg opacity-80 shadow-2xl ring-2 ring-white">
          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-300 rounded-full mx-auto mt-1 opacity-90"></div>
        </div>
      </div>
      <div className="absolute top-24 sm:top-40 right-4 sm:right-20 bounce-bottle-2">
        <div className="w-3 h-8 sm:w-5 sm:h-14 bg-gradient-to-b from-blue-400 to-blue-600 rounded-t-full rounded-b-lg opacity-80 shadow-2xl ring-2 ring-white">
          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-300 rounded-full mx-auto mt-1 opacity-90"></div>
        </div>
      </div>
      <div className="absolute bottom-24 sm:bottom-40 left-4 sm:left-20 bounce-bottle-3">
        <div className="w-4 h-9 sm:w-6 sm:h-15 bg-gradient-to-b from-green-400 to-green-600 rounded-t-full rounded-b-lg opacity-80 shadow-2xl ring-2 ring-white">
          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-300 rounded-full mx-auto mt-1 opacity-90"></div>
        </div>
      </div>
      <div className="absolute bottom-8 sm:bottom-20 right-2 sm:right-10 bounce-bottle-1">
        <div className="w-3 h-7 sm:w-5 sm:h-13 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-t-full rounded-b-lg opacity-80 shadow-2xl ring-2 ring-white">
          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-300 rounded-full mx-auto mt-1 opacity-90"></div>
        </div>
      </div>
      <div className="absolute top-36 sm:top-60 left-1/4 sm:left-1/3 bounce-bottle-2">
        <div className="w-4 h-10 sm:w-6 sm:h-16 bg-gradient-to-b from-purple-400 to-purple-600 rounded-t-full rounded-b-lg opacity-80 shadow-2xl ring-2 ring-white">
          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-purple-300 rounded-full mx-auto mt-1 opacity-90"></div>
        </div>
      </div>
      <div className="absolute top-1/4 sm:top-1/3 right-1/4 sm:right-1/3 bounce-bottle-3">
        <div className="w-3 h-8 sm:w-5 sm:h-14 bg-gradient-to-b from-pink-400 to-pink-600 rounded-t-full rounded-b-lg opacity-80 shadow-2xl ring-2 ring-white">
          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-pink-300 rounded-full mx-auto mt-1 opacity-90"></div>
        </div>
      </div>
      <div className="absolute bottom-1/4 sm:bottom-1/3 left-1/6 sm:left-1/4 bounce-bottle-1">
        <div className="w-4 h-9 sm:w-6 sm:h-15 bg-gradient-to-b from-cyan-400 to-cyan-600 rounded-t-full rounded-b-lg opacity-80 shadow-2xl ring-2 ring-white">
          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-cyan-300 rounded-full mx-auto mt-1 opacity-90"></div>
        </div>
      </div>
      <div className="absolute top-12 sm:top-28 left-1/2 bounce-bottle-2">
        <div className="w-3 h-8 sm:w-5 sm:h-14 bg-gradient-to-b from-orange-400 to-orange-600 rounded-t-full rounded-b-lg opacity-70 shadow-2xl ring-2 ring-white">
          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-orange-300 rounded-full mx-auto mt-1 opacity-90"></div>
        </div>
      </div>
      <div className="absolute bottom-12 sm:bottom-28 right-1/2 bounce-bottle-3">
        <div className="w-4 h-10 sm:w-6 sm:h-16 bg-gradient-to-b from-lime-400 to-lime-600 rounded-t-full rounded-b-lg opacity-70 shadow-2xl ring-2 ring-white">
          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-lime-300 rounded-full mx-auto mt-1 opacity-90"></div>
        </div>
      </div>
      <div className="absolute top-2/3 left-1/3 bounce-bottle-1">
        <div className="w-3 h-7 sm:w-5 sm:h-13 bg-gradient-to-b from-emerald-400 to-emerald-600 rounded-t-full rounded-b-lg opacity-70 shadow-2xl ring-2 ring-white">
          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-emerald-300 rounded-full mx-auto mt-1 opacity-90"></div>
        </div>
      </div>
      <div className="absolute top-2/3 right-1/3 bounce-bottle-2">
        <div className="w-4 h-9 sm:w-6 sm:h-15 bg-gradient-to-b from-fuchsia-400 to-fuchsia-600 rounded-t-full rounded-b-lg opacity-70 shadow-2xl ring-2 ring-white">
          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-fuchsia-300 rounded-full mx-auto mt-1 opacity-90"></div>
        </div>
      </div>
      {/* Particle Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full opacity-30 animate-twinkle"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-white rounded-full opacity-30 animate-twinkle-delayed"></div>
        <div className="absolute bottom-1/4 left-1/2 w-1 h-1 bg-white rounded-full opacity-30 animate-twinkle"></div>
        <div className="absolute top-2/3 right-1/4 w-1 h-1 bg-white rounded-full opacity-30 animate-twinkle-delayed"></div>
      </div>
    </div>
  );
} 