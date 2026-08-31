# El Viaje — Wedding Guest Hub

Static single-page site for Merici & David's wedding guest hub (11–13 September 2026, Málaga, Spain).

## Live URL

**Status**: Ready to deploy to Netlify via GitHub.

**To deploy:**
1. Go to https://app.netlify.com/
2. Click "Add new site" > "Import an existing project"
3. Select "GitHub" and authorize
4. Choose this repository (`DaveOps83/wedding-website`)
5. Netlify auto-detects `netlify.toml` config
6. Set environment variable in **Site settings → Build & deploy → Environment**:
   - Key: `WEDDING_PASSWORD`
   - Value: [your secure password]
7. Click "Deploy"

Netlify will assign a live URL (e.g., `random-name-123.netlify.app`). You can customize the subdomain or connect a custom domain in Site settings → Domain management.

## Features

- **Server-side password validation** — Password validated via Netlify Function, never exposed in client-side code
- **Session-based authentication** — Login token stored in sessionStorage, cleared on browser close
- **Weekend itinerary** — Friday ceremony at Iglesia de San Juan, Hacienda Nadales reception; Saturday drinks at Trocadero; Sunday beach at La Playa Surf House
- **Practical details** — Dress codes, transport info, weather, coordinator contact (Lucia +34 666 89 11 00)
- **WhatsApp opt-in** — Guests can leave their phone number to be added to the group chat
- **Collapsible sections** — Smooth accordion-style cards for easy navigation
- **Zero dependencies** — Single static HTML file with inline CSS and JavaScript; no build step
- **Security-first** — Strong security headers, no crawlers allowed, HTTPS enforced

## Security

This site is configured with security-first defaults:

### Authentication
- Password validated server-side via Netlify Function
- Password stored only in Netlify environment variables
- Client-side code never contains or displays the password
- Session token stored in sessionStorage (cleared on browser close)

### HTTP Security Headers
- **Strict-Transport-Security** — Force HTTPS, preload enabled
- **Content-Security-Policy** — Restrict content to same-origin only, except Google Fonts
- **X-Frame-Options** — Prevent clickjacking (DENY)
- **X-Content-Type-Options** — Prevent MIME sniffing (nosniff)
- **X-XSS-Protection** — Enable browser XSS filter
- **Referrer-Policy** — No referrer sent
- **Permissions-Policy** — Block access to sensitive APIs (geolocation, microphone, camera, payment)

### Crawler Prevention
- `robots.txt` — Disallows all crawlers from indexing
- `_redirects` — Ensures robots.txt is served before SPA rewrite
- Site not visible in search engines

## Customization

### Update authentication password

Change the `WEDDING_PASSWORD` environment variable in Netlify:
1. Go to **Site settings** → **Build & deploy** → **Environment**
2. Edit the `WEDDING_PASSWORD` variable
3. Trigger a new deploy (optional; takes effect immediately)

### Update color scheme

Edit CSS variables at the top of `index.html` `<style>` block (line 10):

```css
:root {
  --terra: #551C25;       /* Primary color (burgundy) */
  --gold: #D4A843;        /* Accent color */
  --cobalt: #5B8DB8;      /* Secondary blue */
  --cream: #F6EEDF;       /* Light background */
  --ink: #2C2A26;         /* Dark text */
  --ink-soft: #6B6459;    /* Muted text */
  --border: #E4DCC9;      /* Border color */
  --bg: #FFFFFF;          /* Page background */
}
```

### Update itinerary

Edit the day blocks in the `renderHub()` function (in the `<script>` section) with specific times, venue names, and links.

### Update practical details

Edit the practical items section with dress codes, contact info, and logistics.

## External Resources

- **Google Fonts** — Cormorant Garamond (serif) and DM Sans (sans-serif)
- **Google Maps** — Links to venues; no API key required (search-based links)

Both load fine from any Netlify domain with no additional configuration.

## QR Code for Print Materials

Once deployed and live, generate a QR code pointing to the live URL and include it on printed invitations, programs, or signage.

Suggested tools:
- https://qr-code-generator.com/ (paste the URL)
- Built-in iOS camera app (generates QR from any URL)

## Deployment Architecture

### Files

- `index.html` — Single static HTML page (welcome + hub + client-side routing)
- `netlify/functions/login.js` — Serverless function for password validation
- `netlify.toml` — Netlify build config (headers, functions, redirects)
- `_redirects` — URL redirect rules (robots.txt + SPA rewrite)
- `robots.txt` — Crawler disallow rules
- `.gitignore` — Standard project ignores
- `README.md` — This file

### Deployment Flow

1. Push code to GitHub
2. Netlify auto-detects and deploys
3. Netlify reads `netlify.toml` and deploys serverless functions
4. `netlify.toml` headers applied to all responses
5. `_redirects` ensures `robots.txt` is served, then SPA rewrite for other routes
6. `WEDDING_PASSWORD` env var injected at runtime into serverless function

## License

Private use for the wedding.
