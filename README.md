# Contoso Outdoors

A responsive static storefront built with Astro and the existing Contoso Outdoors catalog, product images, and manuals. The interface follows the supplied Spring Garden palette and supports persistent light and dark themes.

## Requirements

- Node.js 22.23.4 or newer
- npm 10 or newer

## Run locally

```bash
npm ci
npm run dev
```

Open [http://localhost:4321](http://localhost:4321).

## Build and preview

```bash
npm run check
npm run build
npm run preview
```

Astro generates a static site in `dist/`. Product pages are generated from `public/products.json`; category collections use `public/categories.json`. Product ratings are calculated from the review ratings in each product's existing manual.

## Storefront features

- Category carousels on the home page and an `/products/` catalog with immediate category and text filters.
- A generated detail page for every catalog product, including an image gallery, review rating, quantity control, and Add to Cart feedback.
- A keyboard-accessible theme toggle with a saved preference.
- Ask Contoso chat with local-only text submission and optional browser speech recognition. It does not connect to a live agent. Speech recognition availability, permission prompts, and accuracy depend on the browser and device.

The catalog and existing images, manuals, and brand assets remain in `public/`. No local environment values are required for the static storefront.
