import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import CreateButton from "./components/create-button";
import Script from "next/script";
import { AuthProvider } from "./context/auth-context";
import Analytics from "./components/analytics";
import GoogleAnalytics from "./components/google-analytics";
import CookieBanner from "./components/cookie-banner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Blue House",
  description: "A home for voices that want to matter.",
  icons: {
    icon: [
      { url: "/blue_house.png", type: "image/png" },
    ],
    shortcut: ["/blue_house.png"],
    apple: ["/blue_house.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <GoogleAnalytics />
          <Analytics />
          <CookieBanner />

          <div className="background" />
          {/* <div className="bg" /> */}
          <div className="header" />
          <CreateButton />
          <div className="content">          
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
