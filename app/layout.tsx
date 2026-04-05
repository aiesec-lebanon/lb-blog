import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import CreateButton from "./components/create-button";
import Header from "./components/header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Blue House Blog",
  description: "Created by AIESEC Lebanon IM Team.",
  icons: {
    icon: [
      { url: "/aiesec_man.png", type: "image/png" },
    ],
    shortcut: ["/aiesec_man.png"],
    apple: ["/aiesec_man.png"],
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
        <Header />
        <CreateButton />

        {children}
      </body>
    </html>
  );
}
