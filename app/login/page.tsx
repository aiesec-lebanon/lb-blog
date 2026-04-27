'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function LoginPage() {
  const [isGuest, setIsGuest] = useState(false);
  const [username, setUsername] = useState('');

  const handleAiesecLogin = () => {
    const params = new URLSearchParams({
      response_type: 'code', // OAuth authorization code flow
      client_id: process.env.NEXT_PUBLIC_CLIENT_ID || '',
      redirect_uri: `${window.location.origin}/api/auth/callback`,
    });  
    
    window.location.href = `${process.env.NEXT_PUBLIC_AUTH_URL}/authorize?${params.toString()}`;
  }

  const handleGuestLogin = async () => {
    if (!username.trim()) return;

    await fetch('/api/auth/guest', {
      method: 'POST',
      body: JSON.stringify({ username }),
    });

    window.location.href = '/'; // go to app
  };

  return (
    <div className="flex items-center justify-center h-screen">

      {/* 👇 Opaque container */}
      <div className="bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-xl flex flex-col items-center gap-6">

        {/* Logo */}
        <Image src="/blue_house.png" width={70} height={70} alt='' />

        {/* AIESEC Login */}
        <button
          onClick={handleAiesecLogin}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-semibold w-72"
        >
          Log in with AIESEC
        </button>

        {/* Guest Option */}
        {!isGuest ? (
          <button
            onClick={() => setIsGuest(true)}
            className="text-gray-600 underline"
          >
            Login as a guest
          </button>
        ) : (
          <div className="flex flex-col gap-3 w-72">
            <input
              type="text"
              placeholder="Enter a username"
              className="border p-2 rounded"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <button
              onClick={handleGuestLogin}
              className="bg-gray-800 text-white py-2 rounded"
            >
              Continue as Guest
            </button>
          </div>
        )}

      </div>
    </div>
  );
}