"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function GameMenu() {
  const router = useRouter();

  useEffect(() => {
    router.push('/game/play');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <p className="text-xl text-gray-500 font-mono animate-pulse">Loading Game...</p>
    </div>
  );
}