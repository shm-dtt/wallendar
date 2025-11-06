import { Button } from "@/components/ui/button";
import { Instrument_Serif } from "next/font/google";
import { gallery } from "@/lib/calendar-utils";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import Link from "next/link";
import Image from "next/image";
import AnnouncementBanner from "@/components/misc/announcement-banner";
import { SupportPopover } from "@/components/misc/support-popover";
import { getCachedDownloadCount } from "@/lib/redis";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
});

export default function Page() {
  // const downloadCount = await getCachedDownloadCount();
  return (
    <main className=" font-sans">
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Left Section */}
        <section className="flex-1 flex flex-col px-4 py-4 sm:px-6 sm:py-8 lg:px-12 lg:py-12">
          <Header />

          <div className="flex-1 flex flex-col justify-center items-center space-y-6 max-w-none min-h-0 -mt-18">
            <AnnouncementBanner />
            <div className="space-y-4">
              <h1
                className={` text-center text-3xl lg:text-4xl xl:text-5xl font-semibold leading-tight ${instrumentSerif.className}`}
              >
                Wallpapers with calendar, but{" "}
                <span className="italic">aesthetic</span>.
              </h1>
              <p className=" text-center text-base lg:text-xl text-secondary-foreground/60">
                Personalize any photo with a clean, legible monthly calendar.
              </p>
            </div>

            <div className="py-4">
              <Link href="/create">
                <Button
                  className=" px-6 py-3 lg:px-8 lg:py-4 text-sm lg:text-base shadow-sm cursor-pointer"
                  size="lg"
                >
                  Get Started
                </Button>
              </Link>
            </div>
            <p className="text-center text-secondary-foreground/60 text-xs -mt-4">
              {/* {(downloadCount-1).toLocaleString()}+ downloads */}
            </p>
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
      <div className="fixed bottom-6 right-6">
        <SupportPopover/>
      </div>
    </main>
  );
}
