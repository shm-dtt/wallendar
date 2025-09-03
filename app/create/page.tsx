import { CalendarWallpaperClient } from '@/components/calendar-wallpaper-client'
import { Header } from '@/components/landing-header'
import { getInitialData } from '@/lib/calendar-utils'

export default async function Create() {
  // Server-side data preparation
  const initialData = await getInitialData()
  
  return (
    <main className="font-sans min-h-dvh">
      <div className="container mx-auto p-4 md:p-6">
        <Header/>
        <CalendarWallpaperClient initialData={initialData} />
      </div>
    </main>
  )
}
