import { Button } from "@/components/ui/button";
import { WandSparkles } from "lucide-react";
import { gallery } from "@/lib/calendar-utils";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import Link from "next/link";
import Image from "next/image";

export default function Page() {
  return (
    <main className="min-h-screen font-sans">
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Left Section */}
        <section className="flex-1 flex flex-col px-4 py-8 sm:px-6 sm:py-12 lg:px-12 lg:py-20">
          <Header />

          <div className="flex-1 flex flex-col justify-center space-y-6 sm:space-y-8 max-w-none min-h-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm self-start">
              <WandSparkles className="h-4 w-4" aria-hidden="true" />
              <span>Upload. Overlay. Download.</span>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <h1 className="text-2xl lg:text-3xl xl:text-4xl font-semibold leading-tight">
                Transform your images into calendar desktop wallpapers.
              </h1>
              <p className="sm:text-lg lg:text-xl text-gray-600 max-w-xl">
                Personalize any photo with a clean, legible monthly calendar.
              </p>
            </div>

            <div className="pt-4 sm:pt-6 pb-8 sm:pb-12">
              <Link href="/create">
                <Button
                  className="rounded-full bg-black px-6 py-3 sm:px-8 sm:py-4 text-sm sm:text-base text-white shadow-sm hover:bg-black/90 transition-colors cursor-pointer"
                  size="lg"
                >
                  Get Started
                </Button>
              </Link>
            </div>
          </div>

          <Footer />
        </section>

        <section className="flex-1 relative overflow-hidden min-h-[30vh] lg:min-h-screen">
          <div className="absolute inset-0">
            <div className="flex flex-col w-full animate-[verticalScroll_25s_linear_infinite]">
              {[...gallery, ...gallery].map((item, idx) => (
                <figure key={idx} className="relative w-full flex-shrink-0">
                  <Image
                    src={item}
                    width={1600}
                    height={900}
                    alt={`Calendar wallpaper example ${
                      (idx % gallery.length) + 1
                    }`}
                    className="w-full object-cover"
                    priority={idx < 2}
                    loading={idx < 2 ? "eager" : "lazy"}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    placeholder="blur"
                    blurDataURL="data:image/webp;base64,UklGRjIAAABXRUJQVlA4IC4AAACyAgCdASoBAAEALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA"
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
