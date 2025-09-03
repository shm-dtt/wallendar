import type { Metadata } from "next";
import { Geist, Geist_Mono, Montserrat, Inter, Playwrite_CA } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"
import {  } from "next/font/google"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  weight: ["700"],
  variable: "--font-montserrat",
})

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

const playwriteCA = Playwrite_CA({
  display: "swap",
  variable: "--font-playwrite-ca",
})

export const metadata: Metadata = {
  title: "Wallendar",
  description: "Wallendar - Create beautiful calendar wallpapers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${montserrat.variable} ${playwriteCA.variable} antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
