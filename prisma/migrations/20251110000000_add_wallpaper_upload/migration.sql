-- CreateTable
CREATE TABLE "wallpaper_upload" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "s3Url" TEXT NOT NULL,
    "s3Key" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wallpaper_upload_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "wallpaper_upload_userId_month_year_idx" ON "wallpaper_upload"("userId", "month", "year");

-- CreateIndex
CREATE UNIQUE INDEX "wallpaper_upload_userId_month_year_s3Key_key" ON "wallpaper_upload"("userId", "month", "year", "s3Key");

-- AddForeignKey
ALTER TABLE "wallpaper_upload" ADD CONSTRAINT "wallpaper_upload_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

