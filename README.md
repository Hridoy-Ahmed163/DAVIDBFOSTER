# David B. Foster Ministries — davidbfoster.org

A single-page, dark cinematic site for David B. Foster Ministries. No framework, no build step:
plain HTML, CSS and vanilla JavaScript. Open `index.html` or serve the folder.

## Run it locally

```bash
node server.mjs        # http://localhost:4321
```

Any static host works (Netlify, Cloudflare Pages, Vercel, cPanel, S3). Upload the folder as-is.

## Files

```
index.html          all sections, metadata, JSON-LD
css/styles.css      design tokens + components
js/main.js          nav, countdown, filters, forms, consent, analytics
assets/img/         optimised WebP photography
assets/favicon.svg  gold B monogram
assets/logo.svg     full lockup (used in structured data)
server.mjs          tiny local preview server (not needed in production)
```

## Before launch — replace these

| Where | What |
| --- | --- |
| `assets/img/*.webp` | All photos are stock placeholders. Every `alt` says **REPLACE WITH CLIENT PHOTO**. Keep files roughly the same dimensions and WebP format. |
| `js/main.js` → `CONFIG.GA4_ID` | Real GA4 ID (currently `G-XXXXXXXXXX`). Loads only after cookie consent. |
| `js/main.js` → `CONFIG.META_PIXEL_ID` | Real Meta Pixel ID (currently `PIXEL_ID_HERE`). |
| `js/main.js` → `CONFIG.FORM_ENDPOINT` | Form/CRM endpoint (Formspree, Netlify Forms, a Worker…). While empty, forms open a pre-filled email to `hello@davidbfoster.org` instead of failing silently. |
| Video cards | Add a YouTube ID to each `data-yt=""` attribute in `index.html` (the card thumbnail, the small Watch button, and the featured video). Empty IDs show a friendly "coming soon" notice. |
| `href="https://give.davidbfoster.org"` | Replace with the live giving page from the ministry's processor. |
| `https://www.youtube.com/@davidbfoster`, `https://www.instagram.com/` | Placeholder social profiles. |
| `hello@ / speaking@ / partners@davidbfoster.org` | Confirm the real inboxes. |
| Email copy | "We aim to reply within two business days", tax-deduction wording and the privacy policy need the ministry's confirmation and legal review. |
| Freedom book link | Currently an Amazon search; swap in the real product page. |
| Countdown | `data-countdown` on `#countdown` and `startDate` in the Event JSON-LD (currently 21 Nov 2026, 7:00 PM CST). |
| Copy marked `PLACEHOLDER` | Founding story, the Freedom blurb and giving tiers are drafted copy awaiting facts. |

## Adding content

**Events** — copy an `.event-row` block in the Events section and change the date, category,
title and copy. The featured event is `.event-featured`.

**Teachings** — duplicate a `.video-card`, set `data-topic` to one of
`faith | healing | finance | relationships | revival` so the filter chips pick it up.

**Partner tiers** — duplicate a `.level` card. Amounts are suggestions, not requirements.

## Notes

- Design tokens live at the top of `css/styles.css` (colour, type scale, spacing, motion).
- Motion respects `prefers-reduced-motion`; all interactive controls are keyboard accessible
  with visible focus states, and there is one `h1` per page.
- The privacy policy opens as a dialog from the footer and from the consent banner.
  If you need a standalone URL for legal review, the same content can be moved to `/privacy`.
- Analytics and the Meta Pixel are only injected after the visitor accepts the cookie banner;
  "Cookie settings" in the footer re-opens the choice.
