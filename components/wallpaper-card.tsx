"use client";

import { useState } from "react";
import Image from "next/image";
import { Download, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface WallpaperCardProps {
  wallpaper: {
    id: string;
    s3Url: string;
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
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download wallpaper. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        <Image
          src={wallpaper.s3Url}
          alt={`Wallpaper by ${wallpaper.user.name}`}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
          unoptimized // S3 images may not be optimized
        />
      </div>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={wallpaper.user.image || undefined} alt={wallpaper.user.name} />
            <AvatarFallback>
              <User className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{wallpaper.user.name}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(wallpaper.createdAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          onClick={handleDownload}
          disabled={isDownloading}
          size="sm"
          className="w-full"
          variant="outline"
        >
          {isDownloading ? (
            <>
              <Download className="mr-2 h-4 w-4 animate-spin" />
              Downloading...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Download
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

