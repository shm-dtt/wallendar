import { CalendarHeader } from '@/components/calendar-header'
import { CalendarWallpaperClient } from '@/components/calendar-wallpaper-client'
import { getInitialData } from '@/lib/calendar-utils'

export default async function Create() {
  // Server-side data preparation
  const initialData = await getInitialData()
  
  return (
    <main className="min-h-dvh bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto p-4 md:p-6">
        <CalendarHeader />
        <CalendarWallpaperClient initialData={initialData} />
      </div>
    </main>
  )
}
