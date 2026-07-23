# ThinkOfYou 💌

A personal digital postcard creator — upload your photo, add a title, and share as one link.

## Features

- 📸 **Photo upload** — drag and drop or click to upload
- ✏️ **Custom title** — add a message with white or black text
- 🔄 **Flip animation** — see the front and back of your postcard
- 📤 **Share & Download** — copy a shareable link or download the postcard
- 📱 **Fully responsive** — works great on mobile and desktop

## Getting Started

### Run locally

```bash
node server.js
```

Then open http://localhost:3000 in your browser.

### Pages

- `/` — Home page with hero postcards
- `/create` — Postcard creator

## Project Structure

```
think-of-you/
├── index.html          # Main HTML (SPA)
├── style.css           # All styles
├── app.js              # Router + interactivity
├── server.js           # Dev server (SPA routing)
├── package.json
└── assets/
    ├── upload-icon.svg
    ├── postcard-separator.svg
    ├── postcard-address-lines.svg
    ├── postcard-parchment.png
    ├── hero-trees.jpg
    ├── stamps/
    │   └── stamp-green.png
    └── flowers/
        └── flower-white.png
```

## Deployment

This is a static SPA. You can deploy to:
- **GitHub Pages** — push to `gh-pages` branch (add a `404.html` redirect)
- **Vercel** — just connect the repo, set output to `/`
- **Netlify** — add a `_redirects` file: `/* /index.html 200`

### Netlify `_redirects` (for clean URLs)

Create a file `_redirects` in the root:
```
/* /index.html 200
```

### Vercel `vercel.json`

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

## Credits

Inspired by [think-of-you.vercel.app](https://think-of-you.vercel.app)
Original design by [@iryna_lupan](https://www.instagram.com/iryna_lupan/)
