# Polymath Sphere LLC Website

Corporate website for Polymath Sphere LLC, a privately held digital firm that owns, develops, and selectively delivers software and design systems.

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
- `ventures.html` - Platforms (GO: Travel App, TripLog Mini)
- `careers.html` - Careers (not indexed)
- `legal.html` - Privacy policy and terms
- `impressum.html` - Legal imprint
- `404.html` - Not-found page (uses absolute paths, since GitHub Pages serves it at any URL)
- `about.html` - Redirect to `company.html`
- `triplogmini/` - TripLog Mini app site, support and privacy pages
- `business-card.html`, `business-card-svg.html` - Internal business card tools (not indexed)
- `styles.css`, `script.js` - Shared styles and behavior
- `fonts/` - Self-hosted Inter and Inter Tight (latin subset, variable weight)
- `images/og-image.png` - 1200x630 social share image

## Design System

- **Colors**: Off-white background (#FAFAFA), charcoal text (#1A1A1A), indigo accent (#6366F1); dark mode follows the system setting
- **Typography**: Inter Tight (headlines), Inter (body), self-hosted from `fonts/`
- **Motion**: Subtle reveal on scroll; all animation is turned off when the visitor prefers reduced motion
- **Tone**: Calm, minimal, confident, institutional

## Privacy notes

- No cookies or analytics. Fonts are self-hosted, so no requests go to Google.
- The contact form posts to FormSubmit (`formsubmit.co`), which is disclosed in `legal.html`. Update the privacy policy if this changes.
