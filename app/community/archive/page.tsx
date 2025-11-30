import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { WallpaperCard } from "@/components/misc/wallpaper-card";
import { getCommunityWallpapers } from "@/lib/community-data";

export const revalidate = 60;

export default async function ArchivePage() {
  const { archive } = await getCommunityWallpapers();
  const hasArchive = archive.length > 0;

  return (
    <main className="font-sans">
      <div className="p-4 md:p-6 space-y-8">
        <Header />

        <div className="flex flex-col gap-3 text-center">
          <h1 className="text-4xl font-semibold">Archive</h1>
          <p className="text-muted-foreground">
            Wallpapers from previous months
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <Link href="/create">
            <Button variant="default" size="lg" className="cursor-pointer">
              Make Your Own
            </Button>
          </Link>
          <Link href="/community">
            <Button variant="secondary" size="lg" className="cursor-pointer">
              Back to Community
            </Button>
          </Link>
        </div>

        {hasArchive ? (
          <div className="columns-1 gap-5 sm:columns-2 lg:columns-3 xl:columns-4">
            {archive.map((wallpaper) => (
              <WallpaperCard key={wallpaper.id} wallpaper={{
                ...wallpaper,
                createdAt: wallpaper.createdAt.toISOString(),
              }} />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">
            No archived wallpapers yet
          </p>
        )}
      </div>
    </main>
  );
}
