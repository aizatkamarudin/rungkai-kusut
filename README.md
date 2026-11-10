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

## Deploy on Cloudflare (Workers + static assets)

The site deploys as the `rungkaikusut` Worker; `wrangler.jsonc` tells Cloudflare to serve this
folder as static assets (`.assetsignore` keeps README/config/.git out).

In the Cloudflare dashboard → Workers & Pages → `rungkaikusut` → **Settings → Build**:

- Git repository: `aizatkamarudin/rungkai-kusut`
- Branch: the branch you want live (Cloudflare only builds on pushes to that branch)
- Build command: *(empty)*
- Deploy command: `npx wrangler deploy`
- Root directory: `/`

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
