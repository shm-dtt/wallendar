import React, { useCallback, useEffect, useRef, useState } from "react";
import { Check, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";

type ClassValue =
  | ClassArray
  | ClassDictionary
  | string
  | number
  | bigint
  | null
  | boolean
  | undefined;
type ClassDictionary = Record<string, any>;
type ClassArray = ClassValue[];

function clsx(...inputs: ClassValue[]): string {
  return inputs.filter(Boolean).join(" ");
}

type HSL = {
  h: number;
  s: number;
  l: number;
};

type RGB = {
  r: number;
  g: number;
  b: number;
};

type ColorValue = {
  hex: string;
  hsl: HSL;
  rgb: RGB;
};

// Color conversion utilities
function hexToHsl(hex: string): HSL {
  const sanitized = hex.replace(/^#/, "").padEnd(6, "0");
  const r = parseInt(sanitized.slice(0, 2), 16) / 255;
  const g = parseInt(sanitized.slice(2, 4), 16) / 255;
  const b = parseInt(sanitized.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToHex({ h, s, l }: HSL): string {
  const sNorm = s / 100;
  const lNorm = l / 100;

  const k = (n: number) => (n + h / 30) % 12;
  const a = sNorm * Math.min(lNorm, 1 - lNorm);
  const f = (n: number) => lNorm - a * Math.max(Math.min(k(n) - 3, 9 - k(n), 1), -1);

  const r = Math.round(255 * f(0));
  const g = Math.round(255 * f(8));
  const b = Math.round(255 * f(4));

  return [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
}

function hexToRgb(hex: string): RGB {
  const sanitized = hex.replace(/^#/, "").padEnd(6, "0");
  return {
    r: parseInt(sanitized.slice(0, 2), 16),
    g: parseInt(sanitized.slice(2, 4), 16),
    b: parseInt(sanitized.slice(4, 6), 16)
  };
}

function sanitizeHex(val: string): string {
  return val.replace(/[^a-fA-F0-9]/g, "").toUpperCase().slice(0, 6);
}

interface ColorAreaProps {
  hue: number;
  saturation: number;
  lightness: number;
  onChange: (s: number, l: number) => void;
}

const ColorArea: React.FC<ColorAreaProps> = ({ hue, saturation, lightness, onChange }) => {
  const [isDragging, setIsDragging] = useState(false);
  const areaRef = useRef<HTMLDivElement>(null);

  const updateColor = useCallback((clientX: number, clientY: number) => {
    if (!areaRef.current) return;
    
    const rect = areaRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(clientY - rect.top, rect.height));
    
    const s = Math.round((x / rect.width) * 100);
    const l = Math.round(100 - (y / rect.height) * 100);
    
    onChange(s, l);
  }, [onChange]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    updateColor(e.clientX, e.clientY);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    updateColor(e.clientX, e.clientY);
  }, [isDragging, updateColor]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={areaRef}
      className="relative w-full h-40 rounded-lg cursor-crosshair overflow-hidden border border-gray-200 dark:border-gray-700"
      style={{
        background: `linear-gradient(to top, #000, transparent, #fff), linear-gradient(to left, hsl(${hue}, 100%, 50%), #bbb)`
      }}
      onMouseDown={handleMouseDown}
    >
      <div
        className="absolute w-4 h-4 border-2 border-white rounded-full shadow-md pointer-events-none"
        style={{
          left: `${saturation}%`,
          top: `${100 - lightness}%`,
          transform: 'translate(-50%, -50%)',
          background: `hsl(${hue}, ${saturation}%, ${lightness}%)`
        }}
      />
    </div>
  );
};

interface HueSliderProps {
  hue: number;
  onChange: (hue: number) => void;
}

const HueSlider: React.FC<HueSliderProps> = ({ hue, onChange }) => {
  return (
    <div className="relative">
      <input
        type="range"
        min="0"
        max="360"
        value={hue}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-3 rounded-lg appearance-none cursor-pointer"
        style={{
          background: 'linear-gradient(to right, hsl(0,100%,50%), hsl(60,100%,50%), hsl(120,100%,50%), hsl(180,100%,50%), hsl(240,100%,50%), hsl(300,100%,50%), hsl(360,100%,50%))'
        }}
      />
      <style jsx>{`
        input[type='range']::-webkit-slider-thumb {
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: white;
          border: 2px solid #e2e8f0;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          cursor: pointer;
        }
        input[type='range']::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: white;
          border: 2px solid #e2e8f0;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

interface ColorInputProps {
  value: string;
  onChange: (value: string) => void;
  onCommit?: () => void;
}

const ColorInput: React.FC<ColorInputProps> = ({ value, onChange, onCommit }) => {
  const [localValue, setLocalValue] = useState(value);
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = sanitizeHex(e.target.value);
    setLocalValue(newValue);
    
    const isValidHex = /^[A-F0-9]{6}$/.test(newValue);
    setIsValid(isValidHex);
    
    if (isValidHex) {
      onChange(newValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && onCommit) {
      onCommit();
    }
  };

  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-mono text-sm">
        #
      </div>
      <input
        type="text"
        value={localValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={onCommit}
        className={clsx(
          "w-full pl-8 pr-12 py-2 text-sm font-mono border rounded-lg",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
          isValid 
            ? "border-gray-200 dark:border-gray-700" 
            : "border-red-300 dark:border-red-600"
        )}
        placeholder="FFFFFF"
        maxLength={6}
      />
      <div
        className="absolute right-2 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded border border-gray-300 dark:border-gray-600"
        style={{ backgroundColor: isValid ? `#${localValue}` : 'transparent' }}
      />
    </div>
  );
};

// Preset colors
const PRESET_COLORS = [
  "#000000", "#ffffff", "#f87171", "#fb923c", "#fbbf24", "#a3e635",
  "#34d399", "#22d3ee", "#60a5fa", "#a78bfa", "#f472b6", "#fb7185",
  "#374151", "#6b7280", "#9ca3af", "#d1d5db", "#ef4444", "#f97316",
  "#eab308", "#84cc16", "#10b981", "#06b6d4", "#3b82f6", "#8b5cf6"
];

interface ModernColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  onChangeComplete?: (color: string) => void;
  trigger?: React.ReactNode;
  className?: string;
}

export const ModernColorPicker: React.FC<ModernColorPickerProps> = ({
  value,
  onChange,
  onChangeComplete,
  trigger,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentColor, setCurrentColor] = useState<ColorValue>(() => {
    const hex = sanitizeHex(value.replace('#', '')).padEnd(6, '0');
    return {
      hex,
      hsl: hexToHsl(hex),
      rgb: hexToRgb(hex)
    };
  });

  const dropdownRef = useRef<HTMLDivElement>(null);
  const commitTimeoutRef = useRef<NodeJS.Timeout>(null);

  // Handle clicks outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const commitColor = useCallback(() => {
    const finalColor = `#${currentColor.hex}`;
    onChange(finalColor);
    onChangeComplete?.(finalColor);
  }, [currentColor.hex, onChange, onChangeComplete]);

  const scheduleCommit = useCallback(() => {
    if (commitTimeoutRef.current) {
      clearTimeout(commitTimeoutRef.current);
    }
    commitTimeoutRef.current = setTimeout(commitColor, 300);
  }, [commitColor]);

  const updateColor = useCallback((updates: Partial<ColorValue>) => {
    setCurrentColor(prev => {
      const updated = { ...prev, ...updates };
      
      // Ensure all color formats are in sync
      if (updates.hex && !updates.hsl) {
        updated.hsl = hexToHsl(updates.hex);
      }
      if (updates.hex && !updates.rgb) {
        updated.rgb = hexToRgb(updates.hex);
      }
      if (updates.hsl && !updates.hex) {
        updated.hex = hslToHex(updates.hsl);
      }
      
      return updated;
    });
    scheduleCommit();
  }, [scheduleCommit]);

  const handleAreaChange = useCallback((s: number, l: number) => {
    updateColor({ hsl: { ...currentColor.hsl, s, l } });
  }, [currentColor.hsl, updateColor]);

  const handleHueChange = useCallback((h: number) => {
    updateColor({ hsl: { ...currentColor.hsl, h } });
  }, [currentColor.hsl, updateColor]);

  const handleHexChange = useCallback((hex: string) => {
    updateColor({ hex });
  }, [updateColor]);

  const handlePresetClick = useCallback((hex: string) => {
    const cleanHex = sanitizeHex(hex.replace('#', ''));
    updateColor({ hex: cleanHex });
    commitColor();
  }, [updateColor, commitColor]);

  const defaultTrigger = (
    <button
      className={clsx(
        "inline-flex items-center gap-2 px-3 py-2 text-sm border rounded-lg",
        "hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors",
        "border-gray-200 dark:border-gray-700",
        className
      )}
      onClick={() => setIsOpen(!isOpen)}
    >
      <div
        className="w-4 h-4 rounded border border-gray-300 dark:border-gray-600"
        style={{ backgroundColor: `#${currentColor.hex}` }}
      />
      <Palette className="w-4 h-4" />
    </button>
  );

  return (
    <div className="relative">
      {trigger ? (
        <div onClick={() => setIsOpen(!isOpen)}>
          {trigger}
        </div>
      ) : (
        defaultTrigger
      )}

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute bottom-full left-0 mb-2 md:bottom-auto md:left-full md:top-1/2 md:-translate-y-1/2 md:ml-2 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl z-50 min-w-[260px] md:min-w-[320px]"
        >
          <div className="space-y-4">
            <ColorArea
              hue={currentColor.hsl.h}
              saturation={currentColor.hsl.s}
              lightness={currentColor.hsl.l}
              onChange={handleAreaChange}
            />

            <HueSlider
              hue={currentColor.hsl.h}
              onChange={handleHueChange}
            />

            <ColorInput
              value={currentColor.hex}
              onChange={handleHexChange}
              onCommit={commitColor}
            />

            <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="text-xs text-gray-500 font-mono">
                #{currentColor.hex}
              </div>
              <Button
                size="sm"
                onClick={() => {
                  commitColor();
                  setIsOpen(false);
                }}
                className="h-7 px-3 text-xs"
              >
                <Check className="w-3 h-3 mr-1" />
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};