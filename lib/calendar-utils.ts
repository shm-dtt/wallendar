export async function getInitialData() {
  const current = new Date();
  return {
    currentMonth: current.getMonth(),
    currentYear: current.getFullYear(),
    monthNames: [
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
    ],
    sampleImagePath: "/sample-bg.png", // Your sample image in public folder
  };
}

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

export const gallery: string[] = [
  "/images/wallpaper1.png",
  "/images/wallpaper2.png",
  "/images/wallpaper3.png",
  "/images/wallpaper4.png",
  "/images/wallpaper5.jpg",
];
