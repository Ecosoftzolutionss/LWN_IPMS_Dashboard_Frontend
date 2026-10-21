# LEEWON - Inventory FIFO Management System (display)

React + JavaScript + HTML/CSS + axios + CoreUI. Built for a 16:9 TV / monitor
(designed at 1920x1080, scaled to any screen).

## Screen rotation

1. Grid table with all configured parts
2. Part 1 detail  ->  Part 2 detail  ->  Part 3 detail ...  (pallets in their pallet colour)
3. back to the grid

Order of parts, seconds per screen and number of table rows all come from
**Dashboard Settings** (`/api/dashboard/config`).

## Run

```bash
npm install
npm run dev        # http://localhost:3000
```

Quick look without the backend: set `VITE_USE_MOCK=true` in `.env` and restart.

## API (ASP.NET Core)

The dev server forwards `/api/*` to `VITE_API_PROXY_TARGET` (default `http://localhost:5000`).

| Endpoint | Used for |
| --- | --- |
| `GET /api/dashboard/config` | `{ rows, seconds, itemIds[] }` (itemIds already in display order) |
| `GET /api/dashboard/fifo-board` | rows of the grid table |
| `GET /api/dashboard/part/{itemId}` | one part with `pallets[{ palletNo, qty, colour }]` |

## Build and deploy

```bash
npm run build      # output in /dist
```

Copy `dist/` to IIS / nginx. After deployment, edit **`config.js`** in the same
folder to point to the API (no rebuild needed):

```js
window.APP_CONFIG = { API_BASE_URL: 'http://192.168.1.50:5000/api', USE_MOCK: false };
```

If the API is on another host/port, enable CORS in the ASP.NET Core API.

## Logo

`src/components/Logo.jsx` and `public/logo.svg` hold the LEEWON logo as a vector
(sharp on HD / 4K). It is a redraw of the attached picture; to use the official
artwork, paste your original SVG paths into those two files.

## Fonts

Labels use Arial Black (falls back to the bundled Archivo Black). Large values use
Arial Narrow (falls back to the bundled Roboto Condensed). Long part names shrink
automatically to fit their box.

## Files

```
src/
  main.jsx                      entry
  App.jsx                       rotation: grid -> part 1 -> part 2 ...
  api.js                        axios calls (+ mock switch)
  mock.js                       sample data
  constants.js                  sizes, level colours, helpers
  hooks/useDashboard.js         loads config, grid and parts; clock
  components/Stage.jsx          1920x1080 stage scaled to the screen
  components/Header.jsx         logo, title, live clock
  components/Logo.jsx           LEEWON vector logo
  components/FitText.jsx        auto-shrink text
  components/FifoTableScreen.jsx
  components/PalletDetailScreen.jsx
  styles/dashboard.css          all styling
```
