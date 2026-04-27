'use client';

import { useEffect, useState } from "react";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) setVisible(true);
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie_consent", "accepted");
    setVisible(false);

    // 👇 trigger GA load
    window.dispatchEvent(new Event("enable-analytics"));
  };

  const handleReject = () => {
    localStorage.setItem("cookie_consent", "rejected");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 w-full bg-black text-white p-4 flex justify-between items-center z-50">
      <span>This site uses cookies for analytics.</span>

      <div className="flex gap-2">
        <button
          onClick={handleReject}
          className="px-3 py-1 bg-gray-600 rounded"
        >
          Reject
        </button>
        <button
          onClick={handleAccept}
          className="px-3 py-1 bg-blue-600 rounded"
        >
          Accept
        </button>
      </div>
    </div>
  );
}