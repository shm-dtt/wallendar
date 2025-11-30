import prisma from "@/lib/prisma";
import { cache } from "react";

export const getCommunityWallpapers = cache(async () => {
  const now = new Date();
  const istNow = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));

  const month = istNow.getMonth() + 1;
  const year = istNow.getFullYear();

  const wallpaperUpload = prisma.wallpaperUpload;

  const current = await wallpaperUpload.findMany({
    where: { year, month },
    select: {
      id: true,
      s3Url: true,
      createdAt: true,
      month: true,
      year: true,
      user: { select: { id: true, name: true, image: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const archive = await wallpaperUpload.findMany({
    where: {
      OR: [{ year: { lt: year } }, { year, month: { lt: month } }],
    },
    select: {
      id: true,
      s3Url: true,
      createdAt: true,
      month: true,
      year: true,
      user: { select: { id: true, name: true, image: true } },
    },
    orderBy: [{ year: "desc" }, { month: "desc" }, { createdAt: "desc" }],
    take: 80,
  });

  return { current, archive, now };
});
