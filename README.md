# El Viaje — Wedding Guest Hub

Static single-page site for Merici & David's wedding guest hub (11–13 September 2026, Málaga, Spain).

## Live URL

To be deployed to Netlify. Update this section with the live URL once deployed.

## Features

- **Guest login** — Simple name-based authentication (no database required)
- **Weekend itinerary** — Friday ceremony at Iglesia de San Juan, Hacienda Nadales reception; Saturday drinks at Trocadero; Sunday beach at La Playa Surf House
- **Practical details** — Dress codes, transport info, weather, coordinator contact (Lucia +34 666 89 11 00)
- **WhatsApp opt-in** — Guests can leave their phone number to be added to the group chat
- **Collapsible sections** — Smooth accordion-style cards for easy navigation
- **Zero dependencies** — Single static HTML file with inline CSS and JavaScript; no build step, no external JS libraries

## Deployment

### Via Netlify (drag-and-drop, easiest)

1. Go to https://app.netlify.com/drop
2. Drag `index.html` onto the page
3. Netlify will assign a random URL (e.g., `random-name-123.netlify.app`)
4. Customize the subdomain or connect a custom domain in Site settings → Domain management
5. Share the live URL

### Via Netlify CLI

```bash
npm install -g netlify-cli
netlify login
netlify deploy --dir=. --prod
```

## Customization

### Update guest list

Edit the `ALL_GUESTS` array in `index.html` (line 69):

```javascript
const ALL_GUESTS = [
  {name: "Merici Pereira"},
  {name: "David Opperman"},
  {name: "Your Guest Name"},
  // ...
];
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

Edit the day blocks in the `renderHub()` function (lines 114–136) with specific times, venue names, and links.

### Update practical details

Edit the practical items section (lines 140–156) with dress codes, contact info, and logistics.

## External Resources

- **Google Fonts** — Cormorant Garamond (serif) and DM Sans (sans-serif)
- **Google Maps** — Links to venues; no API key required (search-based links)

Both load fine from any Netlify domain with no additional configuration.

## QR Code for Print Materials

Once deployed, generate a QR code pointing to the live URL and include it on printed invitations, programs, or signage.

Suggested tools:
- https://qr-code-generator.com/ (paste the URL)
- Built-in iOS camera app (generates QR from any URL)

## License

Private use for the wedding.
