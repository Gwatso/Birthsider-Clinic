# Birthsider Family Clinic – website

A lightweight, mobile-first, single-page website for Birthsider Family Clinic (Dr B.W. Gwagwa, MBChB UZ), No. 3064 Aerodrome Medium.

Plain HTML, CSS and JavaScript: no build step, no frameworks. Everything is about 70 KB before compression (plus one web font), so it loads quickly on mobile data.

```
index.html                 the whole page (content, SEO tags, schema markup)
assets/css/styles.css      styles (brand colours are at the top as CSS variables)
assets/js/main.js          menu, open/closed status, home visit form
assets/img/                placeholder images and favicon
robots.txt
```

## Preview locally

Open `index.html` in a browser, or run a small local server:

```sh
python3 -m http.server 8000   # then visit http://localhost:8000
```

## Before going live: fill in the placeholders

Search the project for each token below and replace **every** occurrence (most editors have "Find in files"):

| Token | Replace with | Example |
|---|---|---|
| `[TOWN]` | Town or city where the clinic is | – |
| `[PHONE]` | Phone number as people should see it | `077 123 4567` |
| `[PHONE_LINK]` | Same number in international format for tap-to-call | `+263771234567` |
| `[WHATSAPP]` | WhatsApp number as people should see it | `077 123 4567` |
| `[WHATSAPP_LINK]` | WhatsApp number, digits only, with country code | `263771234567` |
| `[TIME]` | Opening times shown before JavaScript loads | `8:00 am – 5:00 pm` |
| `[WEEKDAY_OPEN]` / `[WEEKDAY_CLOSE]` | Mon–Fri hours for Google (24h) | `08:00` / `17:00` |
| `[WEEKEND_OPEN]` / `[WEEKEND_CLOSE]` | Sat & Sun hours for Google (24h) | `09:00` / `13:00` |
| `[SITE_URL]` | Website address, no trailing slash | `https://birthsiderclinic.co.zw` |

(The examples are made up. Use the clinic's real details.)

### Opening hours and the "Open now" badge

Set the hours in `assets/js/main.js`, at the top in `CLINIC.hours`:

```js
hours: {
  weekday: [["08:00", "17:00"]],                    // Monday – Friday
  weekend: [["09:00", "13:00"]],                    // Saturday & Sunday
},
```

For split sessions, add more than one range, e.g. `[["08:00", "13:00"], ["14:00", "19:00"]]`. (The street sign lists "Monday – Friday" twice, which may mean two sessions.)

When these are set, the page fills in the hours table and footer, and shows **Open now / Closed** based on the time in Zimbabwe (`Africa/Harare`), whatever the visitor's own time zone. While they are `null`, the `[TIME]` text shows and the badge stays hidden.

### Text placeholders

These are in dashed boxes or square brackets in `index.html`:

- Doctor bio (About section)
- Areas covered for home visits (Home Visit section)
- FAQ: *Do I need an appointment?* and *Do you accept medical aid?*

No prices, accreditations, testimonials or medical claims have been added. Please keep it that way unless the clinic confirms them.

### Photos

Replace the two placeholder images with real photos. Compress them first; aim for under 150 KB each (for example with [squoosh.app](https://squoosh.app)).

| File | Used in | Suggested photo |
|---|---|---|
| `assets/img/hero-placeholder.svg` | Hero | Doctor checking a patient's blood pressure (portrait, ~800×950) |
| `assets/img/doctor-placeholder.svg` | About | Portrait of Dr Gwagwa (~700×800) |

Save the new photo (e.g. `assets/img/hero.jpg`), then update the `src`, `width` and `height` on the matching `<img>` in `index.html`. Also update `og:image` and the schema `image` in `<head>` so link previews on WhatsApp and Facebook show the new photo.

## How the home visit form works

The site has no server. When a visitor presses **Send on WhatsApp**, WhatsApp opens with the request already typed out to the clinic's number. **Send by Email** does the same in their email app, addressed to bgwagwa@icloud.com. Either way, the visitor still has to press send. Nothing is stored on the website.

## Hosting

Any static host works, e.g. GitHub Pages, Netlify or Cloudflare Pages. Point the domain at it, then set `[SITE_URL]`.

## Accessibility notes

- The brand teal `#1E8FB5` is used for icons and large headings. Small text and buttons use a slightly darker teal (`#15708F`) so they meet WCAG AA contrast on white.
- Tap targets are at least 48px, and body text is 17px.
- The page has a skip link, visible focus outlines and labelled form fields, and it respects the reduced-motion setting.
