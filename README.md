# Radish Labs

The complete multi-page marketing site for Radish Labs: an independent product studio that builds custom websites, internal tools, and practical automations.

The design uses the supplied Radish Labs duck mark and brand red (`#d8344e`) with true neutral blacks and grays. It intentionally contains no gradients, decorative color blobs, fabricated testimonials, client logos, or vanity metrics.

## Pages

- `/` — positioning, capabilities, and an interactive system finder
- `/work/` — build types and clearly labelled example systems
- `/approach/` — delivery method, principles, and engagement shapes
- `/studio/` — the studio story, honest early-stage ledger, values, and FAQ
- `/start/` — a four-step, browser-only project brief builder with copy, download, and email-draft actions

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Verify and build

```bash
npm run check
```

The production site is generated in `dist/`. It is a static Vite build and can be hosted on any static host that preserves directory-style routes.

For the browser-level interaction suite (using an installed Google Chrome):

```bash
npm run test:browser
```

## Privacy

The project brief builder does not submit data to a server. It generates the brief in the visitor's browser and supports copying, downloading, or opening an unaddressed email draft. This avoids pretending a contact endpoint exists before Radish Labs has chosen an inbox and hosting provider.

## Brand assets

The supplied mark is included in black and white under `public/brand/`. The favicon and social card are purpose-built SVG derivatives of the same mark.
