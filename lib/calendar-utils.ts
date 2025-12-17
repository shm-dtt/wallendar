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
  { value: "full", label: "Full" },
  { value: "short", label: "Short" },
  { value: "numeric", label: "Numeric" },
  { value: "numeric-full-year", label: "mm/YYYY" },
  { value: "numeric-short-year", label: "mm/YY" },
  { value: "short-full-year", label: "MMM/YYYY" },
  { value: "short-short-year", label: "MMM/YY" },
] as const;

export const localFonts = [
  { name: "Product Sans", displayName: "Product Sans", path: "/fonts/ProductSans.ttf" },
  { name: "Montserrat", displayName: "Montserrat", path: "/fonts/Montserrat.ttf" },
  { name: "Doto", displayName: "Doto", path: "/fonts/Doto.ttf" },
  { name: "Crafty Girls", displayName: "Crafty Girls", path: "/fonts/CraftyGirls.ttf" },
  { name: "Freckle Face", displayName: "Freckle Face", path: "/fonts/FreckleFace.ttf" },
  { name: "Playwrite CA", displayName: "Playwrite CA", path: "/fonts/PlaywriteCA.ttf" },
  { name: "Segoe Script", displayName: "Segoe Script", path: "/fonts/SegoeScript.TTF" },
  { name: "Instrument Serif", displayName: "Instrument Serif", path: "/fonts/InstrumentSerif.ttf" },
  { name: "Ultra", displayName: "Ultra", path: "/fonts/Ultra.ttf" },
]

export const gallery: string[] = [
  "/images/wallpaper1.webp",
  "/images/wallpaper2.webp",
  "/images/wallpaper3.webp",
  "/images/wallpaper4.webp",
  "/images/wallpaper5.png",
  "/images/wallpaper6.png",
  "/images/wallpaper7.webp",
];

export const monthNames: string[] = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const sampleImagePath: string[] = [
  "/samples/sample-bg1.jpg",
  "/samples/sample-bg2.jpg",
  "/samples/sample-bg3.jpg",
  "/samples/sample-bg4.jpg",
  "/samples/sample-bg5.jpg",
  "/samples/sample-bg6.jpg",
  "/samples/sample-bg7.jpg",
];

export const fontFamilyMap = {
  Montserrat:
    'Montserrat, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans"',
  Serif: 'Georgia, Cambria, "Times New Roman", Times, serif',
  Mono: 'ui-monospace, "SFMono-Regular", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  "Playwrite CA":
    '"Playwrite CA", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans"',
  Doto:
    'Doto, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans"',
  "Crafty Girls":
    '"Crafty Girls", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans"',
  "Freckle Face":
    '"Freckle Face", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans"',
  "Product Sans":
    '"Product Sans", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans"',
  "Segoe Script":
    '"Segoe Script", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans"',
  Ultra:
    '"Ultra", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans"',
  "Instrument Serif":
    '"Instrument Serif", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans"',
};