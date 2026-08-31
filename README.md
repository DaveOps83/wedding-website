# El Viaje — Wedding Guest Hub

Static single-page site for Merici & David's wedding guest hub (11–13 September 2026, Málaga, Spain).

## Live URL

**Status**: Ready to deploy to Netlify via GitHub.

**To deploy:**
1. Go to https://app.netlify.com/
2. Click "Add new site" > "Import an existing project"
3. Select "GitHub" and authorize
4. Choose this repository (`DaveOps83/wedding-website`)
5. Keep default settings (Netlify will auto-detect `netlify.toml`)
6. Click "Deploy"

Netlify will assign a live URL (e.g., `random-name-123.netlify.app`). You can customize the subdomain or connect a custom domain in Site settings → Domain management.

## Features

- **Simple authentication** — Username/password login (no database, credentials in HTML)
- **Weekend itinerary** — Friday ceremony at Iglesia de San Juan, Hacienda Nadales reception; Saturday drinks at Trocadero; Sunday beach at La Playa Surf House
- **Practical details** — Dress codes, transport info, weather, coordinator contact (Lucia +34 666 89 11 00)
- **WhatsApp opt-in** — Guests can leave their phone number to be added to the group chat
- **Collapsible sections** — Smooth accordion-style cards for easy navigation
- **Zero build dependencies** — Single static HTML file with inline CSS and JavaScript; `netlify.toml` handles publishing

## Current Auth Credentials

Default credentials (change after deploy):
- **Username**: `guest`
- **Password**: `welcome2026`

## Customization

### Update authentication

Edit the `AUTH_CREDENTIALS` object in `index.html` (line 62):

```javascript
const AUTH_CREDENTIALS = {
  username: 'your-username',
  password: 'your-password'
};
```

### Update color scheme

CSS variables at the top of the `<style>` block (line 10):

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

Edit the day blocks in the `renderHub()` function with specific times, venue names, and links.

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

## Deployment via GitHub

This repo includes:
- `netlify.toml` — Netlify configuration
- `index.html` — Single static page with all content, styles, and JavaScript
- `.gitignore` — Standard ignores

Every push to `main` will auto-deploy to Netlify (once you connect the repo).

## License

Private use for the wedding.
