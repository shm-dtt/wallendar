-- CreateIndex
CREATE INDEX "wallpaper_upload_year_month_idx" ON "wallpaper_upload"("year", "month");

-- CreateIndex
CREATE INDEX "wallpaper_upload_year_month_createdAt_idx" ON "wallpaper_upload"("year", "month", "createdAt");
