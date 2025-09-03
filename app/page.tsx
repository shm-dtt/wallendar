/* eslint-disable @typescript-eslint/no-explicit-any */

import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { gallery } from "@/lib/calendar-utils";
import { Header } from "@/components/landing-header";
import { Footer } from "@/components/landing-footer";

export default function Page() {
  return (
    <main className="min-h-screen bg-white font-sans">
      <div className="flex flex-col lg:flex-row min-h-screen">
        <section className="flex-1 flex flex-col px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16 xl:px-12">
          <Header />

          <div className="flex-1 flex flex-col justify-center space-y-6 sm:space-y-8 max-w-2xl mx-auto lg:mx-0 lg:max-w-none min-h-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm self-start">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              <span className="text-pretty">Upload. Overlay. Download.</span>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <h1 className="text-balance text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-semibold leading-tight">
                Transform your images into stunning calendar wallpapers
              </h1>
              <p className="text-pretty text-base sm:text-lg lg:text-xl text-gray-600 max-w-xl">
                Personalize any photo with a clean, legible monthly calendar.
              </p>
            </div>

            <div className="pt-4 sm:pt-6 pb-8 sm:pb-12">
              <Button
                className="rounded-full bg-black px-6 py-3 sm:px-8 sm:py-4 text-sm sm:text-base text-white shadow-sm hover:bg-black/90 hover:cursor-pointer transition-colors duration-200"
                size="lg"
              >
                Get Started
              </Button>
            </div>
          </div>

          <div className="mt-auto">
            <Footer />
          </div>
        </section>

        <section className="flex-1 relative overflow-hidden min-h-[30vh] lg:min-h-screen">
          <div className="absolute inset-0">
            <div
              className="flex flex-col w-full"
              style={{
                animation: "verticalScroll 25s linear infinite",
              }}
            >
              {[...gallery, ...gallery].map((item, idx) => (
                <figure key={idx} className="relative w-full flex-shrink-0">
                  <img
                    src={item}
                    alt={`Calendar wallpaper example ${
                      (idx % gallery.length) + 1
                    }`}
                    className="w-full h-auto object-cover block"
                  />
                </figure>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
