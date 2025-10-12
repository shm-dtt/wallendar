"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCalendarStore } from "@/lib/calendar-store";
import { Label } from "@/components/ui/label";
import { Crosshair } from "lucide-react";
import { Button } from "@/components/ui/button";

export function JoystickSettings() {
  const offsetX = useCalendarStore((s) => s.offsetX);
  const offsetY = useCalendarStore((s) => s.offsetY);
  const setOffset = useCalendarStore((s) => s.setOffset);
  // setOffsetX and setOffsetY are not used here; we use the combined setter

  const areaRef = useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = useState(false);
  // Joystick deflection (for knob visual), not persisted
  const [deflect, setDeflect] = useState<{ dx: number; dy: number }>({
    dx: 0,
    dy: 0,
  });
  // Velocity vector derived from deflection while dragging
  const velRef = useRef<{ vx: number; vy: number }>({ vx: 0, vy: 0 });
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);
  // Keep latest offsets in refs for integration without stale closures
  const offsetXRef = useRef(offsetX);
  const offsetYRef = useRef(offsetY);
  useEffect(() => {
    offsetXRef.current = offsetX;
  }, [offsetX]);
  useEffect(() => {
    offsetYRef.current = offsetY;
  }, [offsetY]);

  const knobStyle = useMemo(() => {
    const x = Math.max(-1, Math.min(1, deflect.dx));
    const y = Math.max(-1, Math.min(1, deflect.dy));
    const pctX = (x + 1) * 50; // -1..1 => 0..100
    const pctY = (y + 1) * 50;
    return { left: `${pctX}%`, top: `${pctY}%` } as const;
  }, [deflect.dx, deflect.dy]);

  const updateFromPointer = (clientX: number, clientY: number) => {
    const el = areaRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let dx = (clientX - cx) / (rect.width / 2); // -1..1
    let dy = (clientY - cy) / (rect.height / 2); // -1..1
    // Constrain to unit circle so the knob doesn't leave the ring
    const len = Math.hypot(dx, dy);
    if (len > 1) {
      dx /= len;
      dy /= len;
    }
    // Deadzone to avoid drift
    const DEADZONE = 0.06;
    const mag = Math.hypot(dx, dy);
    if (mag < DEADZONE) {
      dx = 0;
      dy = 0;
    }

    // Update knob visual and velocity
    setDeflect({ dx, dy });
    velRef.current = { vx: dx, vy: dy };
  };

  const onPointerDown: React.PointerEventHandler<HTMLDivElement> = (e) => {
    setDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    updateFromPointer(e.clientX, e.clientY);
    if (rafRef.current == null) {
      rafRef.current = requestAnimationFrame(step);
    }
  };

  const onPointerMove: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (!dragging) return;
    updateFromPointer(e.clientX, e.clientY);
  };

  const onPointerUp: React.PointerEventHandler<HTMLDivElement> = (e) => {
    setDragging(false);
    (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
    setDeflect({ dx: 0, dy: 0 });
    velRef.current = { vx: 0, vy: 0 };
  };

  // Animation loop integrating velocity into position while joystick is deflected
  const step = useCallback((ts: number) => {
    if (lastTsRef.current == null) lastTsRef.current = ts;
    const dt = Math.max(0, Math.min(0.05, (ts - lastTsRef.current) / 1000));
    lastTsRef.current = ts;

    const { vx, vy } = velRef.current;
    if (vx !== 0 || vy !== 0) {
      const MAX_SPEED_PER_SEC = 0.8; // normalized units per second
      const nextX = Math.max(
        -1,
        Math.min(1, offsetXRef.current + vx * MAX_SPEED_PER_SEC * dt)
      );
      const nextY = Math.max(
        -1,
        Math.min(1, offsetYRef.current + vy * MAX_SPEED_PER_SEC * dt)
      );
      if (nextX !== offsetXRef.current || nextY !== offsetYRef.current) {
        offsetXRef.current = nextX;
        offsetYRef.current = nextY;
        setOffset(nextX, nextY);
      }
    }

    rafRef.current = requestAnimationFrame(step);
  }, [setOffset]);

  // Ensure RAF runs when component is mounted and stops on unmount
  useEffect(() => {
    if (rafRef.current == null) rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTsRef.current = null;
    };
  }, [step]);

  return (
    <div className="py-1">
      <div className="flex items-center gap-2 mb-2">
        <Crosshair className="w-4 h-4 text-primary" />
        <h2 className="font-semibold text-sm">Position</h2>
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">
          Move calendar block
        </Label>
        <div className="flex items-center gap-3">
          <div
            ref={areaRef}
            className="relative w-24 h-24 rounded-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-sm overflow-hidden select-none touch-none cursor-pointer hover:shadow-md transition-shadow"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
          >
            {/* Center dot */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-neutral-400 dark:bg-neutral-500" />

            {/* Direction indicators */}
            <div className="absolute left-1/2 top-3 -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-b-3 border-l-transparent border-r-transparent border-b-neutral-400 dark:border-b-neutral-500" />
            <div className="absolute left-1/2 bottom-3 -translate-x-1/2 rotate-180 w-0 h-0 border-l-2 border-r-2 border-b-3 border-l-transparent border-r-transparent border-b-neutral-400 dark:border-b-neutral-500" />
            <div className="absolute top-1/2 left-3 -translate-y-1/2 -rotate-90 w-0 h-0 border-l-2 border-r-2 border-b-3 border-l-transparent border-r-transparent border-b-neutral-400 dark:border-b-neutral-500" />
            <div className="absolute top-1/2 right-3 -translate-y-1/2 rotate-90 w-0 h-0 border-l-2 border-r-2 border-b-3 border-l-transparent border-r-transparent border-b-neutral-400 dark:border-b-neutral-500" />

            <div
              className="absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 shadow-md flex items-center justify-center cursor-grab active:cursor-grabbing transition-transform hover:scale-105"
              style={knobStyle}
            >
              <div className="w-2 h-2 rounded-full bg-primary" />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4 justify-end text-sm">
              <p className="px-1 py-0.5 rounded text-muted-foreground">
                X: {offsetX.toFixed(2)}
              </p>
              <p className="px-1 py-0.5 rounded text-muted-foreground">
                Y: {offsetY.toFixed(2)}
              </p>
            </div>
            <Button variant="outline" onClick={() => setOffset(0, 0)}>
              Reset
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
