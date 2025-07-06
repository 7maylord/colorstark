"use client";

import dynamic from "next/dynamic";
const ColorStarkGame = dynamic(() => import("../../components/ColorStarkGame"), { ssr: false });

export default function GamePage() {
  return <ColorStarkGame />;
} 