"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shuffle, Image } from "lucide-react";
import { useCalendarStore } from "@/lib/calendar-store";
import { ButtonGroup } from "@/components/ui/button-group";

export function BackgroundSettings() {
  // const imageSrc = useCalendarStore((state) => state.imageSrc);
  const setImageSrc = useCalendarStore((state) => state.setImageSrc);
  const handleSampleImage = useCalendarStore(
    (state) => state.handleSampleImage
  );
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="py-1">
      <div className="items-center gap-2 mb-3 hidden lg:flex">
        <Image className="w-4 h-4 text-primary" />
        <h2 className="font-semibold text-sm">Background</h2>
      </div>

      <div className=" space-y-1">
        <Label htmlFor="imageUpload" className="text-sm">
          Upload Image
        </Label>
        <div className="flex items-center gap-2">
          <ButtonGroup className="w-full">
            <Input
              id="imageUpload"
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="text-sm file:text-muted-foreground"
            />
            <Button variant="outline" onClick={handleSampleImage}>
              <Shuffle className="w-4 h-4" />
              Try Sample
            </Button>
          </ButtonGroup>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-2">
        Images are scaled to fit the selected aspect ratio
      </p>
    </div>
  );
}
