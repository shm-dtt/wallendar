import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="preload"
          as="image"
          href="/images/wallpaper1.webp"
          type="image/webp"
        />
        <link
          rel="preload"
          as="image"
          href="/images/wallpaper2.webp"
          type="image/webp"
        />
        <link
          rel="preload"
          as="image"
          href="/images/wallpaper3.webp"
          type="image/webp"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
            attribute="class"
            defaultTheme="light"
            disableTransitionOnChange
          >
        {children}
        <Analytics />
        <Toaster richColors closeButton position="bottom-right"/>
        </ThemeProvider>
      </body>
    </html>
  );
}
