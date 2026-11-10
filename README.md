# Rungkai Kusut — rungkaikusut.com

Static website for Rungkai Kusut (data, digitalisation & AI for Malaysian SMEs). No build step.

## Structure

| Path | What it is |
| --- | --- |
| `index.html` | Homepage (hero, process, services, digitalisation, works, free tools, why us, FAQ, contact) |
| `assets/site.css` · `assets/site.js` | Homepage styles and animations |
| `assets/vendor/` | Self-hosted GSAP + ScrollTrigger and Lenis (smooth scroll) |
| `data-checker/`, `kos-kerja-manual/`, `pdpa-scanner/` | Free browser tools (unchanged) |
| `404.html`, `robots.txt`, `sitemap.xml`, favicons, `og-image.png` | Site essentials |
| `_headers` | Cloudflare Pages caching/security headers |

## Deploy on Cloudflare Pages

1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git** → pick `rungkai-kusut`.
2. Production branch: the branch you want live (e.g. `main`).
3. Framework preset: **None**. Build command: *(leave empty)*. Build output directory: `/`.
4. Save and deploy, then add `rungkaikusut.com` under **Custom domains**.

## Local preview

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Editing content

All text lives in `index.html`. Projects are the `<li class="work">` items in the Works section
(`data-c` = accent colour, `data-k` = preview mock: `phone`, `web`, `dash` or `iot`).
The contact form posts to Web3Forms using the key in `assets/site.js`.
When you change CSS/JS, bump the `?v=` number on their `<link>`/`<script>` tags in `index.html` to bust caches.
