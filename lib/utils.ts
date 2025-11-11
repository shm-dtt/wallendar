import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const announcementInfo: {
  title: string;
  link: string;
} = {
  title: "Wallendar Community is here!!",
  link: "/community",
}