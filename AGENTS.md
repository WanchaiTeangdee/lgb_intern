# AGENTS.md

Static memory-keepsake website for two interns (น้องตี๋ & น้องหมวย) to give to the 26 LGB colleagues ("พี่ๆ") at the end of their internship. Visitors pick a name, open an envelope, read a letter addressed to them, and browse a shared memory gallery. All user-facing text is **Thai** — keep it Thai, and keep the warm, casual tone.

## Stack and constraints

- Plain HTML + CSS + vanilla JS. **No build step, no package manager, no framework, no tests.** Do not add any.
- Must keep working by double-clicking `index.html` (`file://`) and when dropped on Netlify / GitHub Pages. So: no ES modules, no `fetch` of local files, no bundler-only features. Everything is loaded with plain `<script src>` tags.
- Scripts share **globals**, not imports. Load order in [index.html](index.html) matters:
  `data.js` → `letters.js` → `memories.js` → `app.js` → `music.js` → `mascots.js` → `cute.js`.
  The content files define `SITE`, `PEOPLE`, `MUSIC`, `LETTERS`, `MEMORIES`; the rest are IIFEs that read them. `music.js` exposes `window.Music` (used by `app.js` to `duck()`/`restore()` during video playback).
- Reply box: each letter page ends with a textarea that POSTs (`fetch`, `mode: "no-cors"`) to a Google Form configured in `SITE.reply` in [data.js](data.js). It is hidden until `action` and `messageField` are filled in. Replies go only to the owners' Google Sheet — never render them on the site.
- Owner-only reply viewer: [admin.html](admin.html) + [admin.js](admin.js) + [admin.css](admin.css) render the replies as sticky notes. It fetches JSON from a Google Apps Script web app (`NOTES_URL` in admin.js; source in [tools/replies-apps-script.gs](tools/replies-apps-script.gs)) guarded by a secret key the owner types in. Never link to it from the public pages, never put the real key in any file in this folder, and never make the Sheet public.
- Routing is hash-based in [app.js](app.js): `#/` (pick a name), `#/to/<person-id>` (letter), `#/memories` (shared gallery). Keep these URLs stable — people have been given direct links.

## File map

| File | Role |
| --- | --- |
| [data.js](data.js) | `SITE` (titles, mascot lines, `cute` toggle), `PEOPLE` (id, name, avatar, emoji, color), `MUSIC` playlist |
| [letters.js](letters.js) | `LETTERS.<person-id> = { "น้องตี๋": {text, media}, "น้องหมวย": {text, media} }` |
| [memories.js](memories.js) | `MEMORIES` array of shared memories (title, date, place, emoji, media, description) |
| [app.js](app.js) | Router, rendering, lightbox, media handling, console sanity warnings |
| [music.js](music.js) | Background playlist (YouTube IFrame API + local mp3), floating control |
| [mascots.js](mascots.js) | Tee/Muay cartoon mascots pinned to screen edges |
| [cute.js](cute.js) | Hearts, confetti, floating stars; disabled by `SITE.cute = false` |
| [style.css](style.css) | All styling |
| `images/people/<id>.jpg` | Profile photos (missing → emoji fallback) |
| `media/`, `media/music/` | Photos, clips, mp3s |

[README.md](README.md) (Thai) is the owner-facing guide; the big comment block at the top of each content file documents its schema. Keep those in sync if you change behaviour or schema.

## Content rules (the usual task)

- **Person `id`**: lowercase English, no spaces, unique. It is used in the URL (`#/to/natto`), in `LETTERS.<id>`, and as the avatar filename. Adding a person means: entry in `PEOPLE` + a `LETTERS.<id>` block + (optionally) `images/people/<id>.jpg`.
- Letters and memory descriptions are **template literals** — never put a backtick `` ` `` inside the text. A blank line starts a new paragraph.
- Empty letter fields (blank `text` and empty `media`) are intentionally hidden; empty `MEMORIES` entries (blank `title`) are skipped. Do not delete these placeholders or "fill in" letters — the letter content is written by the interns, not by you. Never invent letter/memory text.
- `memories.js` `date` is `YYYY-MM-DD` in the Gregorian calendar; the UI shows it as a Buddhist-era date. `SITE.period` is already written in B.E. (2569).
- Media files: English names, no spaces, exact case (`.jpg` ≠ `.JPG` once deployed). Prefer `.mp4`; large clips go to YouTube (unlisted) and are referenced by URL. Resize photos to ≤ ~1600px wide.
- Music entries are either `{ id: "<11-char YouTube id>", title }` or `{ src: "media/music/x.mp3", title }`. YouTube embeds can be blocked by the owner; local mp3 is the reliable option.

## Code conventions

- Match the existing style: IIFE per file, `const`/arrow functions, 2-space indent, double quotes, template-literal HTML.
- **Always escape interpolated data with the `esc()` helper** in [app.js](app.js) before putting it in HTML; text goes through `paragraphs()`.
- Failure must degrade gracefully: missing image/video → hide and show emoji/colour fallback (`__mediaFail`); `localStorage` access is always wrapped in try/catch; optional globals are checked with `typeof X !== "undefined"`. Keep that pattern.
- Comments in this codebase are in Thai; follow that for new comments.
- Respect `prefers-reduced-motion` for any new animation, and keep layouts mobile-first (most recipients will open this on a phone).
- Browsers block autoplay: music starts only after the first user gesture. Don't try to work around this.

## Verifying changes

There are no automated tests. After a change:

1. Open `index.html` in a browser (or use the Claude-in-Chrome tools) and check `#/`, `#/to/<some-id>`, and `#/memories`.
2. Check the DevTools Console — `app.js` prints warnings for duplicate `PEOPLE` ids and for `LETTERS` keys that don't match any person. A blank white page means a syntax error in one of the `.js` files (commonly a stray backtick or missing comma).
3. Note that YouTube music does not play from `file://`; test with a local server (e.g. `python -m http.server`) if you touch `music.js`.

## Git

- Work on `main`; commit messages in this repo are short English imperative sentences ("Add cute effects and thank you message ...").
- Don't commit large unoptimised media; don't rename files under `media/` or `images/people/` without updating every reference.
