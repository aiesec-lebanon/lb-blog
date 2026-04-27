'use client';

import { useEffect, useState } from "react";
import Script from "next/script";

export default function GoogleAnalytics() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");

    if (consent === "accepted") {
      setEnabled(true);
    }

    const handler = () => setEnabled(true);
    window.addEventListener("enable-analytics", handler);

    return () => window.removeEventListener("enable-analytics", handler);
  }, []);

  if (!enabled) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;

          gtag('js', new Date());
          gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
        `}
      </Script>
    </>
  );
}