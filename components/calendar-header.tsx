import { Calendar } from "lucide-react"

export function CalendarHeader() {
  return (
    <div className="mb-8 text-center">
      <div className="inline-flex items-center gap-3 mb-2">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Calendar className="w-6 h-6 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">
          Calendar Wallpaper
        </h1>
      </div>
      <p className="text-muted-foreground max-w-md mx-auto">
        Create beautiful 4K calendar wallpapers with custom backgrounds and typography
      </p>
    </div>
  )
}