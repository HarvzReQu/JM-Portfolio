# John Miles Gonzaga — Portfolio

One-page **video editing** portfolio. Plain HTML/CSS/JS — no build step, no dependencies.

```
index.html        markup + content
styles.css        all styles (mobile-first)
script.js         nav drawer, scrollspy, scroll reveal, gallery filters, lightbox
assets/img/       gallery images + video poster frames
assets/video/     self-hosted video files
```

## Run it locally

Open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000     # then visit http://localhost:8000
```

## Gallery

The gallery holds two categories — **Sketches** and **Video** — with
filter buttons above the grid. Clicking a tile opens the lightbox; videos play inside it.
Category comes from `data-category` on the `<li>`; the filter buttons pick it up
automatically, so a new category only needs a matching button in the `.filters` group.

### Current contents

| Tile | Files |
| --- | --- |
| Four pencil sketches | `assets/img/sketch-*.jpg` (+ `-thumb.jpg` for the grid) |
| Pencil study video | `assets/video/sketch-process.mp4` |
| Animation edit video | `assets/video/anime-edit.mp4` |
| Night sky timelapse | `assets/video/night-sky.mp4` |

Each image exists twice: a ~800px `-thumb.jpg` used in the grid, and the full ~1500px
version opened in the lightbox (`data-full`). When you replace one, replace both, or point
`src` and `data-full` at the same file. The untouched originals of the sketches are in
`~/Desktop/JMPORTFOLIO-originals/`.

### Add a photo or drawing tile

```html
<li class="gallery__cell reveal" data-category="sketch">
  <button class="gallery__item" type="button"
          data-type="image"
          data-full="assets/img/still-brandfilm.jpg"    <!-- large version for the lightbox -->
          data-caption="Brand film — graded still">     <!-- lightbox caption -->
    <img src="assets/img/still-brandfilm-thumb.jpg"     <!-- grid thumbnail -->
         alt="Graded frame from a brand film, warm key light on the subject"
         width="800" height="600" loading="lazy" decoding="async">
    <span class="gallery__tag">Still</span>             <!-- corner label -->
  </button>
</li>
```

`data-full` may point at a larger file than `src` if you want light thumbnails and a
high-res view. Keep `alt` descriptive — it's what screen readers announce.

### Add a video tile

Two kinds, both opening in the same viewer.

**Self-hosted file** — drop an MP4 in `assets/video/` and point at it. `data-poster` is
the full-size still shown before playback; the `<img>` is the smaller grid thumbnail:

```html
<button class="gallery__item gallery__item--video" type="button"
        data-type="video"
        data-src="assets/video/showreel.mp4"
        data-poster="assets/img/video-showreel.jpg"
        data-caption="Editing showreel"
        aria-label="Play video: Editing showreel">
  <img src="assets/img/video-showreel-thumb.jpg" alt="Poster frame for the showreel" ...>
  <span class="gallery__play" aria-hidden="true"><svg …></svg></span>
  <span class="gallery__tag gallery__tag--video">Video</span>
</button>
```

**YouTube** — no file needed, just the id from the watch URL
(`youtube.com/watch?v=`**`dQw4w9WgXcQ`**):

```html
<button class="gallery__item gallery__item--video" type="button"
        data-type="youtube"
        data-id="dQw4w9WgXcQ"
        data-caption="Documentary feature">
```

The embed uses `youtube-nocookie.com` and is only created when the tile is clicked, so
YouTube loads nothing until a visitor asks for it. Closing the viewer removes the player,
which stops playback.

### Sound

Videos open with sound at the volume the visitor last chose — a slider and a mute button
sit under the player, and the setting is stored in `localStorage` so it carries across
clips and visits. Keyboard: `↑`/`↓` change volume, `M` toggles mute. If the browser blocks
autoplay with sound (common before a visitor has interacted with the page), playback starts
muted and the button reads "Unmute" rather than failing silently.

iOS ignores the volume property — the slider is inert there and the hardware buttons take
over — which is why there is a mute button next to it rather than a slider alone.

Until a video file exists, the viewer shows a short note naming the path it expects
instead of a broken player. The Documentary tile ships with an empty `data-id` and behaves
the same way until you fill it in.

## The 3D layer

Built with CSS 3D transforms only — no WebGL library, nothing to download, and it stays
smooth on phones.

| Piece | What it does |
| --- | --- |
| `.hero__floor` | A grid plane rotated flat (`rotateX(76deg)`) running to the horizon |
| `.deck` | Four work frames floating at different `translateZ`, drifting on a loop |
| `.reel` | Full-bleed film strip on a tilted plane, scrolling between About and Experience |
| `[data-tilt]` | Cards, gallery tiles and the portrait tilt toward the pointer, with a sheen |
| `.reveal` | Sections rise and rotate out of depth as they scroll in |
| `.lightbox__figure` | Opens forward in Z instead of a flat fade |

Two rules keep it fast and calm:

- **Touch devices never run the tilt code.** `script.js` adds `is-tilt-ready` to `<html>`
  only for `(hover: hover) and (pointer: fine)`, and every tilt style is scoped to that
  class. Phones still get depth, driven by scroll position instead of a cursor.
- **`prefers-reduced-motion: reduce` turns all of it off** — no float, no parallax, no
  tilt, no scrolling strip — and the content renders flat and fully visible.

Tilt hit-testing uses layout geometry (`offsetLeft`/`offsetTop`), not
`getBoundingClientRect()`. A rotating card moves its own rendered shape, so testing
against the rendered box makes the pointer "leave" the element mid-tilt and the card
flickers between tilted and flat. Layout coordinates ignore transforms and stay stable.

## Editing content

All copy lives in `index.html` under clearly commented sections (HERO, ABOUT, EXPERIENCE,
SERVICES, SKILLS, CERTIFICATIONS, GALLERY, CONTACT). To add an experience entry, copy an
existing `<li class="timeline__item">`; for a service card, copy an `<article class="card card--project">`.

## Colors

Defined once as CSS variables at the top of `styles.css`:

| Token | Value | Use |
| --- | --- | --- |
| `--navy` / `--navy-deep` | `#16324F` / `#0E2238` | hero, contact, footer |
| `--steel` | `#2C5F8A` | links, org names, timeline |
| `--amber` / `--amber-deep` | `#E9963E` / `#9E590F` | CTA, accents, kickers, volume slider |

All body-size text pairs were checked against WCAG AA (≥4.5:1).

## Deploying (GitHub + Vercel)

The repo is a plain static site, so Vercel needs no build command and no framework preset.
`vercel.json` sets clean URLs, a one-day cache on `/assets/*`, and two security headers.

```sh
# 1. GitHub — create an empty repo, then:
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main

# 2. Vercel — either import the repo at vercel.com/new (recommended: every push
#    redeploys automatically), or deploy straight from this folder:
npx vercel            # first run walks through login + project setup
npx vercel --prod     # promote to the production URL
```

Videos live in the repo (~17 MB total), which is fine for both GitHub and Vercel. If the
video library grows past a few hundred MB, move the files to YouTube tiles instead.

## Notes

- **The site was re-scoped to video editing only.** Civil engineering content (Site
  Engineer role, Aya Hotel project, AutoCAD/STAAD/Sketchup/Excel skills) was removed.
  The old version is in git history if you ever want it back.
- **Some skill and service wording was written for you, not dictated by you:**
  "Color grading", "Sound & music sync", "Storyboarding", and the four service cards
  describe standard editor work. Read them and delete anything you would not want to be
  asked about in an interview.
- **Video rights:** `anime-edit.mp4` and `sketch-process.mp4` came from TikTok downloads
  (`@big.steve701`, `@m3tz.art` in the original filenames). If they are not your own work,
  swap them for your own edits or add credit before publishing.
- Adding a third gallery category (e.g. "Stills") takes two things: `data-category="stills"`
  on the tile and a matching `<button class="filter" data-filter="stills">` in the filter row.
