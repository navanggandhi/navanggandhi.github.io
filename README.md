# Navang Gandhi — Personal Website

A clean, modern, single-page personal site. No build tools, no dependencies —
just open `index.html` in a browser.

## Files
| File | What it holds |
|------|---------------|
| `index.html` | All the content/text — **this is the main file to edit** |
| `styles.css` | Colors, fonts, layout |
| `script.js` | Theme toggle, mobile menu, scroll animations |

## How to customize
Open `index.html` and replace the placeholder text. The sections are clearly
commented (`<!-- ===== ABOUT ===== -->`, etc.):

- **Hero** — your name, title, and intro line
- **About** — your story + the "Quick facts" box (city, role, education)
- **Skills** — four cards; edit the icon (emoji), title, and description
- **Experience** — a timeline; copy a `timeline__item` block to add entries
- **Projects** — three cards; point the `↗` links at real URLs
- **Contact** — email is already set; update the LinkedIn / GitHub links

### Change the color
In `styles.css`, edit the `--accent` value near the top (currently indigo
`#6366f1`). Try `#0ea5e9` (blue), `#10b981` (green), or `#ec4899` (pink).

## Features
- Light / dark mode toggle (remembers your choice)
- Fully responsive (works on phones)
- Smooth scrolling + reveal-on-scroll animations
- Accessible and respects "reduce motion" settings

## Publishing it online (free options)
- **GitHub Pages** — push this folder to a repo, enable Pages in settings
- **Netlify / Vercel** — drag-and-drop the folder onto their dashboard
- **Cloudflare Pages** — connect a repo or upload directly

All three are free for a static site like this.
