"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Download, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useInView } from "@/lib/use-in-view";

interface WallpaperCardProps {
  wallpaper: {
    id: string;
    s3Url: string;
    month: number;
    year: number;
    createdAt: string;
    user: {
      id: string;
      name: string;
      image: string | null;
    };
  };
}

export function WallpaperCard({ wallpaper }: WallpaperCardProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isTapped, setIsTapped] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const touchHandledRef = useRef(false);
  const { ref, isInView } = useInView({ threshold: 0.1, rootMargin: "100px" });
  const isPortrait = useMemo(
    () => wallpaper.s3Url.toLowerCase().includes("mobile"),
    [wallpaper.s3Url]
  );
  const [imageDimensions, setImageDimensions] = useState(() =>
    isPortrait ? { width: 9, height: 16 } : { width: 16, height: 9 }
  );
  const monthYearLabel = useMemo(() => {
    // Prefer explicit wallpaper month/year from DB
    if (wallpaper.month && wallpaper.year) {
      // wallpaper.month is stored as 1-12
      const dateFromFields = new Date(wallpaper.year, wallpaper.month - 1, 1);
      const monthName = dateFromFields.toLocaleString(undefined, {
        month: "long",
      });
      return `${monthName} ${wallpaper.year}`;
    }
  }, [wallpaper.month, wallpaper.year]);

  useEffect(() => {
    setImageDimensions(
      isPortrait ? { width: 9, height: 16 } : { width: 16, height: 9 }
    );
    setIsImageLoaded(false);
  }, [isPortrait, wallpaper.s3Url]);

  // Close overlay when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setIsTapped(false);
      }
    };

    if (isTapped) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isTapped]);

  const aspectRatioStyle = useMemo(
    () => ({
      aspectRatio: `${imageDimensions.width} / ${imageDimensions.height}`,
    }),
    [imageDimensions]
  );

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      // Fetch the image and trigger download
      const response = await fetch(wallpaper.s3Url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Extract filename from URL or use a default
      const urlParts = wallpaper.s3Url.split("/");
      const filename = urlParts[urlParts.length - 1] || "wallpaper.png";
      link.download = filename;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Wallpaper downloaded successfully");
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download wallpaper. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // If touch was already handled, ignore click to prevent double-firing
    if (touchHandledRef.current) {
      touchHandledRef.current = false;
      return;
    }

    // Don't toggle if clicking the download button
    const target = e.target as HTMLElement;
    if (target.closest("button")) {
      return;
    }
    setIsTapped(!isTapped);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    // Prevent double-tap zoom on mobile
    if (e.touches.length > 1) return;

    // Don't toggle if touching the download button
    const target = e.target as HTMLElement;
    if (target.closest("button")) {
      return;
    }

    // Mark that touch was handled to prevent click from also firing
    touchHandledRef.current = true;
    setIsTapped(!isTapped);

    // Reset after a short delay
    setTimeout(() => {
      touchHandledRef.current = false;
    }, 300);
  };

  const isOverlayVisible = isTapped;

  return (
    <div
      ref={(node) => {
        // Merge refs for both useInView and our cardRef
        if (ref) {
          ref.current = node;
        }
        cardRef.current = node;
      }}
      onClick={handleCardClick}
      onTouchStart={handleTouchStart}
      className={cn(
        "mb-5 break-inside-avoid group relative w-full overflow-hidden rounded-lg bg-muted transition-shadow hover:shadow-lg cursor-pointer",
        isDownloading && "pointer-events-none"
      )}
      style={aspectRatioStyle}
    >
      {!isImageLoaded && (
        <div className="absolute inset-0 z-[1] animate-pulse rounded-lg bg-muted-foreground/10 backdrop-blur-sm transition-opacity duration-500" />
      )}
      {isInView && (
        <Image
          src={wallpaper.s3Url}
          alt={`Wallpaper by ${wallpaper.user.name}`}
          fill
          className={cn(
            "z-[0] object-cover transition-all duration-400 group-hover:scale-105",
            isImageLoaded
              ? "blur-0 opacity-100 scale-100"
              : "blur-2xl opacity-80 scale-105"
          )}
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          quality={75}
          loading="lazy"
          onLoad={(e) => {
            const img = e.currentTarget;
            const { naturalWidth, naturalHeight } = img;
            if (naturalWidth > 0 && naturalHeight > 0) {
              setImageDimensions({
                width: naturalWidth,
                height: naturalHeight,
              });
            }
            setIsImageLoaded(true);
          }}
        />
      )}

      {/* Hover overlay with user info and download button */}
      <div
        className={cn(
          "absolute inset-0 z-[3] transition-all duration-300 flex items-end",
          isOverlayVisible
            ? "bg-black/40"
            : "bg-black/0 group-hover:bg-black/40"
        )}
      >
        <div
          className={cn(
            "w-full p-4 transition-opacity duration-300",
            isOverlayVisible
              ? "opacity-100"
              : "opacity-0 group-hover:opacity-100"
          )}
        >
          <div className="flex items-center justify-between gap-4">
            {/* User info */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Avatar className="h-8 w-8 border-2 border-white/20">
                <AvatarImage
                  src={wallpaper.user.image || undefined}
                  alt={wallpaper.user.name}
                />
                <AvatarFallback className="bg-white/10 text-white">
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start min-w-0">
                <p className="text-xs font-medium text-white truncate drop-shadow-lg">
                  {wallpaper.user.name}
                </p>
                {monthYearLabel && (
                  <p className="text-xs text-white/80 truncate drop-shadow-lg">
                    {monthYearLabel}
                  </p>
                )}
              </div>
            </div>

            {/* Download button */}
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleDownload();
              }}
              disabled={isDownloading}
              size="sm"
              variant="secondary"
              className="shrink-0 cursor-pointer"
            >
              {isDownloading ? (
                <Spinner className="size-4" />
              ) : (
                <Download className="size-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
