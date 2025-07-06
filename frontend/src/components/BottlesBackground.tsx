"use client";

export default function BottlesBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
      {/* Floating Bottles Animation */}
      <div className="absolute top-20 left-10 animate-float">
        <div className="w-6 h-16 bg-gradient-to-b from-red-400 to-red-600 rounded-t-full rounded-b-lg opacity-80 shadow-2xl ring-2 ring-white">
          <div className="w-4 h-4 bg-red-300 rounded-full mx-auto mt-1 opacity-90"></div>
        </div>
      </div>
      <div className="absolute top-40 right-20 animate-float-delayed">
        <div className="w-5 h-14 bg-gradient-to-b from-blue-400 to-blue-600 rounded-t-full rounded-b-lg opacity-80 shadow-2xl ring-2 ring-white">
          <div className="w-3 h-3 bg-blue-300 rounded-full mx-auto mt-1 opacity-90"></div>
        </div>
      </div>
      <div className="absolute bottom-40 left-20 animate-float-slow">
        <div className="w-6 h-15 bg-gradient-to-b from-green-400 to-green-600 rounded-t-full rounded-b-lg opacity-80 shadow-2xl ring-2 ring-white">
          <div className="w-4 h-4 bg-green-300 rounded-full mx-auto mt-1 opacity-90"></div>
        </div>
      </div>
      <div className="absolute bottom-20 right-10 animate-float">
        <div className="w-5 h-13 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-t-full rounded-b-lg opacity-80 shadow-2xl ring-2 ring-white">
          <div className="w-3 h-3 bg-yellow-300 rounded-full mx-auto mt-1 opacity-90"></div>
        </div>
      </div>
      <div className="absolute top-60 left-1/3 animate-float-delayed">
        <div className="w-6 h-16 bg-gradient-to-b from-purple-400 to-purple-600 rounded-t-full rounded-b-lg opacity-80 shadow-2xl ring-2 ring-white">
          <div className="w-4 h-4 bg-purple-300 rounded-full mx-auto mt-1 opacity-90"></div>
        </div>
      </div>
      <div className="absolute top-1/3 right-1/3 animate-float-slow">
        <div className="w-5 h-14 bg-gradient-to-b from-pink-400 to-pink-600 rounded-t-full rounded-b-lg opacity-80 shadow-2xl ring-2 ring-white">
          <div className="w-3 h-3 bg-pink-300 rounded-full mx-auto mt-1 opacity-90"></div>
        </div>
      </div>
      <div className="absolute bottom-1/3 left-1/4 animate-float">
        <div className="w-6 h-15 bg-gradient-to-b from-cyan-400 to-cyan-600 rounded-t-full rounded-b-lg opacity-80 shadow-2xl ring-2 ring-white">
          <div className="w-4 h-4 bg-cyan-300 rounded-full mx-auto mt-1 opacity-90"></div>
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