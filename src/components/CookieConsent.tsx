'use client';

import { useState, useEffect } from 'react';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('site_preferences');
    if (!consent) {
      setTimeout(() => setIsVisible(true), 2000);
    }
  }, []);

  const accept = () => {
    localStorage.setItem('site_preferences', 'accepted');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 bg-gray-900 border border-gray-800 rounded-xl p-4 shadow-2xl z-50 font-sans text-sm text-gray-300">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="text-white font-semibold mb-1">Site Preferences</h4>
          <p className="text-xs mb-3">We use local data to optimize your reading experience and save your preferences.</p>
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={accept} className="flex-1 bg-white text-black py-1.5 px-4 rounded-md font-medium text-xs hover:bg-gray-100 transition-colors">
          Got it
        </button>
      </div>
    </div>
  );
}
