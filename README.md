<div align="center">
  <img src='app/favicon.ico' width="64" height="64"/>
</div>

# Wallendar

Transform your images into calendar desktop wallpapers. [Check it out.](https://wallendar.shop/)

![Wallpaper example 5](public/images/wallpaper1.webp)

## Features

- Choose between the 12 months.
- Change the formatting of the month, be it short, long or numeric.
- Switch the starting day of the week (Sun/Mon).
- Funky collections of fonts, with option to upload custom font.
- Move around the calendar block according to your wallpaper.
- Get a LIVE preview of the changes and download the 4K wallpaper!!!

## Getting Started

### Prerequisites

- Node.js 18+
- npm/yarn/pnpm

### Installation

```bash
# Clone the repo
git clone https://github.com/shm-dtt/wallendar
cd wallendar

# Install dependencies
npm install

# Set up environment (optional - for download tracking)
cp env.example .env.local

# Update .env.local with your values:
UPSTASH_REDIS_REST_URL="your_redis_url"
UPSTASH_REDIS_REST_TOKEN="your_redis_token"


# Run dev server
npm run dev
```

Visit `http://localhost:3000` to get started.

### Build for Production

```bash
npm run build
npm run start
```

## Environment Variables

Optional - only needed for production download tracking:

- `UPSTASH_REDIS_REST_URL` - Redis URL from Upstash
- `UPSTASH_REDIS_REST_TOKEN` - Redis token

Leave empty for development - the app works without Redis.

---

Made with Next.js, shadcn/ui, and Zustand by [shm-dtt](https://sohamdutta.in)

Credits for the color picker: [Ryan Mogk](https://modall.ca/lab/tailwindcss-react-color-picker)
