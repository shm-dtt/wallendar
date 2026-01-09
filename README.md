<div align="center">
  <img src='app/favicon.ico' width="64" height="64"/>
</div>

# Wallendar

Transform your images into calendar desktop wallpapers. [Check it out.](https://wallendar.shop/)

![Wallpaper example 5](public/images/wallpaper1.webp)

## Features

- Choose between the 12 months, the formatting of the month, be it short, long or numeric.
- Switch the starting day of the week (Sun/Mon).
- Funky collections of fonts, with option to upload custom font.
- Move around the calendar block according to your wallpaper.
- Get a LIVE preview of the changes and download the 4K wallpaper!!!
- NEW: Share it with the world (in the Community section)
- **API Access**: Generate wallpapers programmatically via the `/api/create` endpoint.

## API Documentation

Wallendar exposes a REST API to generate wallpapers server-side. You can upload an image or provide a URL, along with a configuration object to customize the calendar.

**Endpoint**: `POST /api/create`

See [API_REFERENCE.md](API_REFERENCE.md) for full documentation, including all configuration options and examples.

### Quick Example

```bash
curl -X POST https://www.wallendar.shop/api/create \
  -F "image=https://github.com/shm-dtt/wallendar/raw/main/public/samples/sample-bg1.jpg" \
  --output wallpaper.png
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm/yarn/pnpm
- PostgreSQL database (local or hosted)
- AWS S3 bucket (optional, for wallpaper uploads)
- Upstash Redis account (optional, for download/publish tracking)
- GitHub OAuth App (optional, for authentication)
- Google OAuth App (optional, for authentication)

### Installation

```bash
# Clone the repo
git clone https://github.com/shm-dtt/wallendar
cd wallendar

# Install dependencies
npm install

# Set up environment variables
cp env.example .env.local

# Update .env.local with your values (see Environment Variables section below)

# Set up the database
npx prisma migrate dev

# Run dev server
npm run dev
```

Visit `https://www.wallendar.shop` to get started.

## Environment Variables

Copy `env.example` to `.env.local` and fill in the following variables:

### File Uploads

- `AWS_REGION` - AWS region where your S3 bucket is located (e.g., `us-east-1`)
- `AWS_ACCESS_KEY_ID` - AWS access key ID
- `AWS_SECRET_ACCESS_KEY` - AWS secret access key
- `AWS_S3_BUCKET_NAME` - Name of your S3 bucket for storing wallpapers

### OAuth Authentication

To enable GitHub and Google login:

- `DATABASE_URL` - PostgreSQL connection string (e.g., `postgresql://user:password@localhost:5432/wallendar`)
- `BETTER_AUTH_SECRET` - Secret key for Better Auth (generate with `openssl rand -base64 32`)
- `BETTER_AUTH_URL` - Your application URL (e.g., `https://www.wallendar.shop` for dev, `https://yourdomain.com` for production)
- `GITHUB_CLIENT_ID` - GitHub OAuth App client ID
- `GITHUB_CLIENT_SECRET` - GitHub OAuth App client secret
- `GOOGLE_CLIENT_ID` - Google OAuth App client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth App client secret

### Download and Publishing Tracking

For production download and publishing tracking:

- `UPSTASH_REDIS_REST_URL` - Redis URL from Upstash
- `UPSTASH_REDIS_REST_TOKEN` - Redis token from Upstash

**Note**: The app will work without Redis, OAuth, and S3 in development mode, but these are required for full functionality in production.

---

Made with Next.js, shadcn/ui, and Zustand by [shm-dtt](https://sohamdutta.in)

Credits for the color picker: [Ryan Mogk](https://modall.ca/lab/tailwindcss-react-color-picker)
