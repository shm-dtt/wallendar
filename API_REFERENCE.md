# Wallendar API Reference

Wallendar provides a REST API to programmatically generate calendar wallpapers.

## Endpoint

`POST /api/create`

Generates a PNG wallpaper with a calendar overlay and optional text based on the provided configuration.

## Request Format

The endpoint accepts `multipart/form-data` with the following fields:

| Field | Type | Description |
|-------|------|-------------|
| `image` | File or String | **Required.** The background image. Can be a file upload OR a direct URL string. |
| `config` | JSON String | **Optional.** Configuration object for styling. Defaults used if omitted. |

### Configuration Object

The `config` JSON object supports the following properties:

```json
{
  "month": 0,                // 0-11 (Jan-Dec). Default: Current month
  "year": 2026,              // Year. Default: Current year
  "weekStart": "sunday",     // "sunday" or "monday". Default: "sunday"
  "headerFormat": "full",    // "full", "short", "numeric", etc. Default: "full"
  "textColor": "#ffffff",    // Hex color. Default: "#ffffff"
  "fontFamily": "Product Sans", // See Supported Fonts. Default: "Product Sans"
  "offsetX": 0,              // Horizontal offset (-1 to 1). Default: 0
  "offsetY": 0,              // Vertical offset (-1 to 1). Default: 0
  "viewMode": "desktop",     // "desktop" or "mobile". Default: "desktop"
  "calendarScale": 1,        // Scale factor (0.5 to 1.5). Default: 1
  "date": null,              // 1-31, optional reference date. Default: current date
  "showHighlight": false,    // Draw circle around reference date. Default: false
  "showStrikethrough": false, // Strike through past dates. Default: false
  "textOverlay": {
    "enabled": true,
    "content": "Your text here",
    "fontSize": 1,           // Relative size multiplier. Default: 1
    "font": "Product Sans",
    "useTypographyFont": true, // If true, uses same font as calendar
    "position": "center"     // "center", "top-left", "bottom-right", etc.
   }
 }
```

## Supported Fonts

The API supports the following fonts (must match exactly):
- `Product Sans` (Default)
- `Montserrat`
- `Doto`
- `Crafty Girls`
- `Freckle Face`
- `Playwrite CA`
- `Segoe Script`
- `Instrument Serif`
- `Ultra`

## Usage Examples

### 1. Basic Usage (Image URL + Defaults)

Generates a calendar for the current month using an image URL.

```bash
curl -X POST https://wallendar.shop/api/create \
  -F "image=https://example.com/wallpaper.jpg" \
  --output wallpaper.png
```

### 2. Custom Configuration

Generates a specific month/year with custom styling.

```bash
curl -X POST https://wallendar.shop/api/create \
  -F "image=@/path/to/local/image.jpg" \
  -F 'config={
    "month": 11,
    "year": 2025,
    "textColor": "#FF0000",
    "fontFamily": "Doto",
    "weekStart": "monday"
  }' \
  --output holiday-wallpaper.png
```

### 3. Text Overlay

Adds custom text to the wallpaper.

```bash
curl -X POST https://wallendar.shop/api/create \
  -F "image=https://example.com/bg.jpg" \
  -F 'config={
    "textOverlay": {
      "enabled": true,
      "content": "Stay Hard\nDon't give up",
      "position": "bottom-right",
      "fontSize": 1.2
    }
  }' \
  --output motivational.png
```

### 4. Date Effects

Highlight and strikethrough dates.

```bash
curl -X POST https://wallendar.shop/api/create \
  -F "image=https://example.com/bg.jpg" \
  -F 'config={
    "month": 0,
    "year": 2025,
    "date": 15,
    "showHighlight": true,
    "showStrikethrough": true
  }' \
  --output january-with-effects.png
```

## Limits

| Constraint | Value |
|------------|-------|
| Rate Limit | 5 requests per minute per IP |
| Max Image Size | 50 MB |
| Request Timeout | 8 seconds (for URL fetches) |

> **Note on Rate Limiting**: Ensure `TRUST_PROXY=true` is set in your environment variables if deploying behind a proxy (like Vercel) to enable correct IP detection.

## Error Responses

Errors return JSON with an `error` field:

```json
{
  "error": "Description of the error"
}
```

| Status | Meaning |
|--------|---------|
| 400 | Bad request (missing image, invalid URL, file too large, invalid date) |
| 429 | Rate limit exceeded |
| 500 | Server error during generation |
