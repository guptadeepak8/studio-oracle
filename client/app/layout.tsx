import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import Sidebar from "../components/Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StudioOracle - Audience Ops Console",
  description: "AI Audience Intelligence project manager console.",
};

import { Toaster } from "sonner";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex text-zinc-100 bg-zinc-950 overflow-hidden w-screen">
        <Suspense fallback={<div className="w-[18%] bg-[#0d0d0f] border-r border-zinc-800 shrink-0" />}>
          <Sidebar />
        </Suspense>
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          {children}
        </div>
        <Toaster
          position="bottom-right"
          theme="dark"
          richColors
          closeButton
          toastOptions={{
            style: {
              background: "#1c1c1f",
              border: "1px solid #28282b",
              color: "#f4f4f5",
            },
          }}
        />
      </body>
    </html>
  );
}
