/* eslint-disable @typescript-eslint/no-explicit-any */

import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { gallery } from "@/lib/calendar-utils";
import { Header } from "@/components/landing-header";
import { Footer } from "@/components/landing-footer";

export default function Page() {
  return (
    <main className="min-h-dvh bg-white font-sans">
      <section className="grid md:grid-cols-2">
        <div>
          <div className="flex min-h-[80dvh] flex-col justify-between px-6 pt-16 md:min-h-dvh md:pt-14">
            <Header />

            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                <span className="text-pretty">Upload. Overlay. Download.</span>
              </div>
              {/* Tagline and subcopy */}
              <h1 className="text-balance text-3xl font-semibold leading-tight md:text-5xl">
                Transform your images into stunning calendar wallpapers
              </h1>
              <p className="max-w-xl text-pretty text-lg text-gray-600">
                Personalize any photo with a clean, legible monthly calendar.
              </p>
            </div>

            <div className="pb-16 md:pb-40">
              <Button
                className="rounded-full bg-black px-6 py-6 text-base text-white shadow-sm hover:bg-black/90 hover:cursor-pointer"
                size="lg"
              >
                Get Started
              </Button>
            </div>

            <Footer />
          </div>
        </div>

        <div>
          <div className="relative h-[80dvh] overflow-hidden md:h-dvh">
            <div
              className="scroll-vert flex w-full flex-col"
              style={{ ["--duration" as any]: "25000ms" }} // @typescript-eslint/no-explicit-any
            >
              {[...gallery, ...gallery].map((item, idx) => (
                <figure key={idx} className="relative w-full flex-shrink-0">
                  <img src={item} className="w-full h-auto" />
                </figure>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
