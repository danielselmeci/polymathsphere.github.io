# Polymath Sphere LLC Website

Corporate website for Polymath Sphere LLC, an independent software and design studio in Arkansas that builds its own iPhone apps and takes on a limited number of client projects.

**Domain:** polymathsphere.com

## Setup for GitHub Pages

1. Create a new repository on GitHub (e.g., `polymathsphere.github.io` for a custom domain)
2. Push all files to the repository
3. Go to Settings > Pages in your GitHub repository
4. Select the main branch as the source
5. Configure your custom domain `polymathsphere.com` in the Pages settings
6. Add a `CNAME` file with `polymathsphere.com` if using a custom domain

The site will be available at `https://polymathsphere.com` once DNS is configured.

## Local Development

Simply open `index.html` in a web browser, or use a local server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js (if you have http-server installed)
npx http-server
```

Then visit `http://localhost:8000`

## Structure

- `index.html` - Homepage
- `company.html` - Company information
- `studio.html` - Studio capabilities and process
- `ventures.html` - Platforms (Go: TravelApp, TripLog Mini)
- `careers.html` - Careers (not indexed)
- `legal.html` - Privacy policy and terms
- `404.html` - Not-found page (uses absolute paths, since GitHub Pages serves it at any URL)
- `about.html` - Redirect to `company.html`
- `triplogmini/` - TripLog Mini app site, support and privacy pages
- `business-card.html` - Internal business card maker (not indexed)
- `styles.css`, `script.js` - Shared styles and behavior
- `fonts/` - Self-hosted Inter and Inter Tight (latin subset, variable weight)
- `images/` - Logo files and the 1200x630 social share image

## Design System

- **Theme**: Blueprint. Light appearance is classic blueprint blue (#1B4F9C) with a white grid; dark appearance is a deep navy blueprint (#0B1D38) with a pale blue grid. It follows the device setting automatically.
- **Logo**: "Facets", a geodesic sphere (many faces, one form). Source: `images/logo.svg` (uses `currentColor`); also `images/logo.png` (512 px) and `images/apple-touch-icon.png` (180 px).
- **Favicon**: a simplified Facets mark (hexagon and triangles only) so it stays crisp at 16-32 px. `favicon.svg` switches to navy in dark mode; `favicon.ico` (16/32/48) and `images/favicon-16.png`/`favicon-32.png` are fallbacks for browsers without SVG icons.
- **Typography**: Inter Tight (headlines), Inter (body), self-hosted from `fonts/`; system monospace for drawing-style labels
- **Details**: numbered section labels, registration marks on panels, a title-block footer, and a technical drawing of the logo on the homepage
- **Motion**: Subtle reveal on scroll and a line-drawing animation in the hero; all animation is turned off when the visitor prefers reduced motion
- **Tone**: Calm, minimal, confident, institutional

## Business card maker

`business-card.html` (not linked from the site, not indexed) makes front and back cards in three styles (Blueprint, Night, Paper), US 3.5 x 2 in or EU 85 x 55 mm, with optional 1/8 in bleed. One layout feeds two outputs, so downloads match the preview:

- **Print PDF** (two pages, front and back): vector, with Inter, Inter Tight and IBM Plex Mono embedded from `fonts/print/`. Choose **CMYK** for print shops (plain DeviceCMYK process colors, no ICC profile; tints are solid colors, not transparency) or **RGB** for home/office printers.
- **PNG** per side: RGB at 600 dpi, with the on-screen text halo, for screens and email signatures.

CMYK values: Blueprint paper C92 M66 Y0 K6, Night paper C100 M85 Y35 K60, ink white (or pale blue on Night). Order a printed proof, since screen blue can't be matched exactly in ink.

## Positioning

Polymath Sphere LLC is an independent software and design studio that:
- Builds and owns its own iPhone apps (Go: TravelApp at gotravelapp.com, TripLog Mini at /triplogmini/)
- Takes on a limited number of client projects, each under its own statement of work
- Is privately held and independently operated

## Privacy notes

- No cookies or analytics. Fonts are self-hosted, so no requests go to Google.
- The contact form posts to FormSubmit (`formsubmit.co`), which is disclosed in `legal.html`. Update the privacy policy if this changes.
