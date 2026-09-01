# Wedding Guest Hub

Static single-page site for Merici & David's wedding guest hub (11–13 September 2026, Málaga, Spain).

## Live URL

**Status**: Ready to deploy to Netlify via GitHub.

**To deploy:**
1. Go to https://app.netlify.com/
2. Click "Add new site" > "Import an existing project"
3. Select "GitHub" and authorize
4. Choose this repository (`DaveOps83/wedding-website`)
5. Netlify auto-detects `netlify.toml` config
6. Set environment variables in **Site settings → Build & deploy → Environment**:
   - Key: `WEDDING_PASSWORD` — Value: [your guest password]
   - Key: `WEDDING_TOKEN_SECRET` — Value: [a long random string, used to sign session tokens]
7. Click "Deploy"

Netlify will assign a live URL (e.g., `random-name-123.netlify.app`). You can customize the subdomain or connect a custom domain in Site settings → Domain management.

## Features

- **Server-side password validation** — Password validated via Netlify Function, never exposed in client-side code
- **Signed session tokens** — Login issues an HMAC-signed, time-bound token (valid ~30 days) stored in sessionStorage; every hub/weather request re-verifies it server-side
- **Trilingual** — English, Spanish, and Portuguese, switchable from the login screen or the hub menu
- **Day-based navigation** — Tabs for Friday (ceremony + reception), Saturday (Afternoon Drinks), Sunday (Beach day), and Guest book & gifts; the selected tab is remembered across a refresh (but resets to the correct day once a new calendar day starts)
- **Auto-redirect** — Landing on `/` with a still-valid session token skips the login screen and goes straight to the hub
- **Embedded venue maps** — Each location card embeds a live Google Map pinned at the venue, instead of a plain link
- **Live weather forecast** — 3-day forecast for Málaga and Torremolinos proxied server-side from Open-Meteo (auth-gated, cached ~30 min)
- **Guest book & gift fund** — QR codes and tappable links to the Wedibox guest book and Revolut gift fund
- **Coordinator contact card** — Call and WhatsApp buttons for the event coordinator
- **Zero dependencies** — Single static HTML file with inline CSS and JavaScript; no build step
- **Security-first** — Strong security headers, no crawlers allowed, HTTPS enforced

## Security

This site is configured with security-first defaults:

### Authentication
- Password validated server-side via Netlify Function; never appears in client-side code
- Password and token-signing secret stored only in Netlify environment variables (`WEDDING_PASSWORD`, `WEDDING_TOKEN_SECRET`)
- Session token is HMAC-signed and time-bound (~30 days); `verify.js` and `weather.js` both re-check it server-side with a constant-time comparison
- Token stored in sessionStorage, so it doesn't survive the browser tab closing

### HTTP Security Headers
- **Strict-Transport-Security** — Force HTTPS, preload enabled
- **Content-Security-Policy** — Restrict content to same-origin only, except Google Fonts and embedded Google Maps (`frame-src`)
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

Edit the CSS variables at the top of `index.html`'s `<style>` block:

```css
:root {
  --terra: #551C25;      /* Primary color (burgundy) */
  --gold: #D4A843;       /* Accent color */
  --cream: #F6EEDF;      /* Light background */
  --ink: #2C2A26;        /* Dark text */
  --ink-soft: #5C5650;   /* Muted text */
  --border: #E4DCC9;     /* Border color */
}
```

### Update itinerary

Edit the day blocks in the `renderDay()` function (in the `<script>` section) with specific times, venue names, and links. Copy text lives in the `translations` object (one block per language) further up the same script.

### Update practical details

Edit the relevant translation keys (dress code, transport, location) and the `card()`/`fields()` calls in `renderDay()` for each day's practical items.

## External Resources

- **Google Fonts** — Cormorant Garamond (serif) and DM Sans (sans-serif)
- **Google Maps Embed** — Each venue location embeds a live map (`google.com/maps/embed`); no API key required for basic embeds
- **Open-Meteo** — Free weather forecast API, no API key required; proxied server-side via `netlify/functions/weather.js`

All three load fine from any Netlify domain with no additional configuration.

## QR Code for Print Materials

Once deployed and live, generate a QR code pointing to the live URL and include it on printed invitations, programs, or signage.

Suggested tools:
- https://qr-code-generator.com/ (paste the URL)
- Built-in iOS camera app (generates QR from any URL)

## Deployment Architecture

### Files

- `index.html` — Single static HTML page (welcome + hub + client-side routing, all three languages)
- `netlify/functions/login.js` — Serverless function for password validation and token issuance
- `netlify/functions/verify.js` — Serverless function that verifies a session token
- `netlify/functions/weather.js` — Serverless function that proxies and caches the Open-Meteo forecast, gated behind the same session token
- `netlify/functions/lib/tokens.js` — Shared HMAC sign/verify logic and token TTL used by the three functions above
- `netlify.toml` — Netlify build config (headers, functions, redirects)
- `_redirects` — URL redirect rules (robots.txt + SPA rewrite)
- `robots.txt` — Crawler disallow rules
- `.gitignore` — Standard project ignores
- `README.md` — This file

### Deployment Flow

1. Push code to GitHub
2. Netlify auto-detects and deploys
3. Netlify reads `netlify.toml` and deploys the serverless functions
4. `netlify.toml` headers applied to all responses
5. `_redirects` ensures `robots.txt` is served, then SPA rewrite for other routes
6. `WEDDING_PASSWORD` and `WEDDING_TOKEN_SECRET` env vars injected at runtime into the serverless functions

## License

Private use for the wedding.
