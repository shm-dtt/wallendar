import { HeaderFormat } from "@/lib/calendar-store";

export function daysInMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

export function firstDayOffset(
  year: number,
  monthIndex: number,
  weekStart: "sunday" | "monday"
) {
  const jsDay = new Date(year, monthIndex, 1).getDay();
  if (weekStart === "sunday") return jsDay;
  return (jsDay - 1 + 7) % 7;
}

export function formatMonthHeader(month: number, year: number, format: HeaderFormat): string {
  const date = new Date(year, month, 1);
  
  switch (format) {
    case "full":
      return date.toLocaleString("en-US", { month: "long" }).toLowerCase();
    
    case "short":
      return date.toLocaleString("en-US", { month: "short" }).toLowerCase();
    
    case "numeric":
      return String(month + 1).padStart(2, "0");
    
    case "numeric-full-year":
      return `${String(month + 1).padStart(2, "0")}-${year}`;
    
    case "numeric-short-year":
      return `${String(month + 1).padStart(2, "0")}-${String(year).slice(-2)}`;
    
    case "short-short-year":
      return `${date.toLocaleString("en-US", { month: "short" }).toLowerCase()} ${String(year).slice(-2)}`;
    
    case "short-full-year":
      return `${date.toLocaleString("en-US", { month: "short" }).toLowerCase()} ${year}`;
    
    default:
      return date.toLocaleString("en-US", { month: "long" }).toLowerCase();
  }
}

export const headerFormatOptions = [
  { value: "full", label: "Month (full)" },
  { value: "short", label: "Month (short)" },
  { value: "numeric", label: "Month (numeric)" },
  { value: "numeric-full-year", label: "mm/YYYY" },
  { value: "numeric-short-year", label: "mm/YY" },
  { value: "short-full-year", label: "MMM/YYYY" },
  { value: "short-short-year", label: "MMM/YY" },
] as const;

export const localFonts = [
  { name: "Montserrat", displayName: "Montserrat (Default)", path: "/fonts/Montserrat.ttf" },
  { name: "Doto", displayName: "Doto", path: "/fonts/Doto.ttf" },
  { name: "Crafty Girls", displayName: "Crafty Girls", path: "/fonts/CraftyGirls.ttf" },
  { name: "Freckle Face", displayName: "Freckle Face", path: "/fonts/FreckleFace.ttf" },
  { name: "Playwrite CA", displayName: "Playwrite CA", path: "/fonts/PlaywriteCA.ttf" },
  { name: "Product Sans", displayName: "Product Sans", path: "/fonts/ProductSans.ttf" },
  { name: "Segoe Script", displayName: "Segoe Script", path: "/fonts/SegoeScript.TTF" },
]

export const gallery: string[] = [
  "/images/wallpaper1.webp",
  "/images/wallpaper2.webp",
  "/images/wallpaper3.webp",
  "/images/wallpaper4.webp",
  "/images/wallpaper5.webp",
];

export const monthNames: string[] = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const sampleImagePath : string[] = [
  "/samples/sample-bg1.jpg",
  "/samples/sample-bg2.jpg",
  "/samples/sample-bg3.jpg",
  "/samples/sample-bg4.jpg",
  "/samples/sample-bg5.jpg",
  "/samples/sample-bg6.jpg",
  "/samples/sample-bg7.jpg",
];