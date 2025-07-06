'use client';

import BottlesBackground from "../components/BottlesBackground";
import GameIntro from "../components/GameIntro";

export default function Home() {
  // Landing page with gaming UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 relative overflow-hidden flex flex-col items-center justify-center">
      <BottlesBackground />
      <div className="z-10 flex flex-col items-center gap-8 w-full">
        <GameIntro />
      </div>
    </div>
  );
}