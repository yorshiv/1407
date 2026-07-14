# Aegis Viewer — Premium Secure Dataset Viewer

A static HTML/CSS/vanilla JS console for browsing local, pre-loaded datasets
(chats, photos, videos, documents, profile info) through a cinematic,
PIN-gated interface. No backend, no build step required to run it — deploy
the folder as-is to Vercel or GitHub Pages.

## How it actually works (please read this part)

Everything here is genuinely config-driven and dataset-isolated, **with one
honest caveat**: a static site (no server, no PHP, no Node backend) cannot
ask the browser "what files are inside this folder?" — HTTP has no directory
listing for hosts like Vercel or GitHub Pages, and JavaScript in the browser
can't read the filesystem.

So instead of pretending to auto-scan folders at runtime, each dataset
folder has a small **`manifest.json`** that lists its photos, videos, and
documents. That file is what the app actually reads. You never write it by
hand — a script generates it for you:

```
node tools/generate-manifests.js
```

Run that any time you add/remove files in `assets/<dataset>/photos`,
`videos`, or `documents`, and every `manifest.json` is rebuilt automatically
by scanning the real folder contents.

**Even that manual step is optional.** This repo includes a GitHub Action
(`.github/workflows/generate-manifests.yml`) that runs the same script and
commits the updated manifests automatically any time you push changes to
`assets/` or `config/datasets.json`. So the practical workflow is:

1. Drop files into `assets/demo04/photos/`, `videos/`, `documents/` (create the folder if it's new).
2. Add `{ "id": "demo04", "title": "Demo 04" }` to `config/datasets.json` (only needed for brand-new datasets — existing ones don't need touching).
3. `git push`.
4. GitHub Action regenerates manifests → dataset card appears automatically, no JavaScript edited, ever.

If you deploy straight from a local machine without GitHub Actions, just
remember to run `node tools/generate-manifests.js` before you deploy.

## Folder structure

```
index.html
css/style.css
js/
  app.js                  entry point, wires everything together
  modules/
    theme.js              applies config colors/fonts to CSS variables
    particles.js           ambient floating-particle backdrop
    state.js                shared App state + fetch helpers
    config-text.js          binds [data-cfg] elements to app-config.json
    pin.js                  PIN screen (dots, keypad, shake/error)
    datasets.js              dataset cards + dataset selection/loading
    processing.js            progress ring / bar / rotating messages
    terminal.js               typed hacker-terminal boot log
    dashboard.js               sidebar + overview stats + profile panel
    chats.js                   WhatsApp-style chat rendering + search
    photos.js                   gallery + lightbox (zoom, keyboard nav)
    videos.js                    video grid + popup player
    documents.js                  document cards + inline preview
    search.js                     dataset-scoped global search
config/
  app-config.json          all copy, PIN, theme colors, timings
  datasets.json             the list of datasets shown as cards
assets/
  demo01/  demo02/  demo03/
    profile.json
    chats.json
    manifest.json           generated — do not hand-edit
    photos/  videos/  documents/
tools/
  generate-manifests.js      the manifest generator script
.github/workflows/
  generate-manifests.yml     auto-runs the generator on every push
```

## Adding a new dataset

1. Create `assets/demo04/` with any combination of `profile.json`,
   `chats.json`, `photos/`, `videos/`, `documents/`. All are optional — the
   dashboard shows an empty state for anything that's missing.
2. Add an entry to `config/datasets.json`:
   ```json
   { "id": "demo04", "title": "Demo 04", "description": "New case file.", "status": "New" }
   ```
3. Run `node tools/generate-manifests.js` (or just push — the Action does it).

No JavaScript file needs to change. The dataset card, the dashboard, chats,
photos, videos, and documents all populate purely from data on disk.

## `profile.json` shape

```json
{
  "displayName": "Subject Name",
  "avatar": "photos/img_001.jpg",
  "status": "Active Review",
  "fields": [{ "label": "Case Reference", "value": "DS-04-2026" }]
}
```

## `chats.json` shape

```json
{
  "contactName": "Subject Name",
  "messages": [
    { "id": 1, "sender": "them", "type": "text", "text": "Hello", "timestamp": "2026-07-01T09:00:00Z" },
    { "id": 2, "sender": "me", "type": "image", "text": "caption", "media": "photos/img_001.jpg", "timestamp": "2026-07-01T09:02:00Z" }
  ]
}
```

`sender` is `"me"` or `"them"`. `type` is `"text"`, `"image"`, or `"video"`
(with `media` pointing to a path inside the dataset folder).

## Editing all visible text, the PIN, and the theme

Everything is in `config/app-config.json` — app name, subtitle, button
labels, loading messages, terminal boot lines, dashboard/sidebar labels,
footer text, the PIN, theme colors, fonts, and animation timing. Change a
value there and reload; no JavaScript edits needed.

Default PIN is `2468` (`config/app-config.json → "pin"`). Change it before
sharing this anywhere real.

## Running locally

Because the app uses `fetch()` to load JSON config and manifests, it must be
served over HTTP — opening `index.html` directly via `file://` will fail due
to browser CORS/file restrictions. Any static server works:

```
python3 -m http.server 8080
# then open http://localhost:8080
```

## Deploying

**Vercel**: import the repo, framework preset "Other", no build command,
output directory `.` (project root). Done.

**GitHub Pages**: Settings → Pages → deploy from the branch root. Done.

Either way, push after adding files so the manifest workflow can run (or run
`node tools/generate-manifests.js` yourself before pushing if you'd rather
not use GitHub Actions).

## Security note

The PIN gate and "dataset isolation" here are UI/UX conveniences for a demo
console, not real security — this is a static site, so anyone with the URL
can view the raw files directly under `/assets/...` regardless of the PIN
screen. Don't put sensitive real data in a public deployment of this
project; use it for demos, internal tools behind other access control, or
genuinely non-sensitive content.
