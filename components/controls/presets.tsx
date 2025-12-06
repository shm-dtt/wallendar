"use client";

import { LayoutGrid, Scaling } from "lucide-react";
import { useCalendarStore } from "@/lib/calendar-store";
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useState } from "react";

const presets = [
  {
    id: 1,
    value: "",
    label: "Default",
  },
  {
    id: 2,
    value: "bg-white/50",
    label: "White Opacity-50",
  },
  {
    id: 3,
    value: "bg-black/50",
    label: "Black Opacity-50",
  },
];

export default function PresetSettings() {
  const [open, setOpen] = useState(false);
  const preset = useCalendarStore((state) => state.preset);
  const setPreset = useCalendarStore((state) => state.setPreset);

  return (
    <div className="py-1 space-y-4">
      <div className="items-center gap-2 hidden lg:flex">
        {/* Preset icon*/}
        <LayoutGrid className="w-4 h-4 text-primary" />
        <h2 className="font-semibold text-sm">Presets</h2>
      </div>

      <div className="flex items-center gap-2 lg:hidden">
        <LayoutGrid className="w-4 h-4 text-primary" />
        <h2 className="font-semibold text-sm">Presets</h2>
      </div>

      <div className="flex justify-center lg:justify-start w-full">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full lg:w-full justify-between"
            >
              {preset
                ? presets.find((p) => p.value === preset)?.label
                : "Apply Preset"}
              <ChevronsUpDown className="opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Search preset..." className="h-9" />
              <CommandList>
                <CommandEmpty>No preset found.</CommandEmpty>
                <CommandGroup>
                  {presets.map((p) => (
                    <CommandItem
                      key={p.id}
                      value={p.value}
                      onSelect={(currentValue) => {
                        setPreset(currentValue === preset ? null : currentValue);
                        setOpen(false);
                      }}
                    >
                      {p.label}
                      <Check
                        className={cn(
                          "ml-auto",
                          preset === p.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

