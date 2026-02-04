"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
// Import your custom button (Path: ./components because page.tsx is in app root)
import SketchButton from './components/SketchButton';

export default function Home() {
  const [username, setUsername] = useState<string | null>(null);
  const router = useRouter();

  // Check if user is already logged in
  useEffect(() => {
    const storedUser = localStorage.getItem('username');
    if (storedUser) setUsername(storedUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('username');
    setUsername(null);
    router.push('/login');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center gap-8 bg-white p-6">
      
      {/* Hero Title */}
      <div className="flex flex-col gap-2">
        <h1 className="text-6xl font-extrabold text-gray-800 tracking-wider">
          MONSTER MATH
        </h1>
        <p className="text-xl text-gray-500 font-medium">
          The spookiest way to learn math!
        </p>
      </div>

      {/* Dynamic Menu */}
      {username ? (
        <div className="flex flex-col gap-6 items-center bg-gray-50 p-8 rounded-xl border-2 border-gray-200">
          <p className="text-2xl text-gray-700">
            Welcome back, <span className="font-bold text-blue-600">{username}</span>!
          </p>
          
          <SketchButton text="CONTINUE" href="/game" />
          
          <button 
            onClick={handleLogout}
            className="text-red-500 hover:text-red-700 font-bold underline mt-2"
          >
            Log Out
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-6 items-center">
           <SketchButton text="START GAME" href="/game" />
        </div>
      )}

      {/* Footer / Credits */}
      <footer className="absolute bottom-4 text-gray-400 text-sm">
        Created for the Fraction Comparison Project
      </footer>

    </div>
  );
}
