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

export const sampleImagePath = "/sample-bg.png";