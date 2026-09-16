# Stream redesign

Branch `design/stream-v5`. This is the whole site: one page, built by Astro
from the data files. Start here when improving the design. The concept in one
paragraph is in `stream-concept.md`. Older docs in this folder record earlier
explorations and do not describe the current page.

## What is on the page

A fixed left column with portrait, name, role, a bio taken from the research
statement, and links. In the middle, "Selected work" grouped into three
themes (Expanding, Navigating, Modeling), each with an icon, a colored name
and a one-line intro on the same line. Each paper is one row: venue, award,
title, authors and links on the left (248px), and a 270px-tall interactive
figure on the right. Then the full publication list with contained
thumbnails (regenerated to fit, not crop), linked author lists, and no
posters. A page map sits at the right edge of the viewport.

Each figure plays a scripted walkthrough of the system once, when it scrolls
into view: a fake cursor moves, text is typed or streamed, the system
responds. After that the figure is interactive and a replay button appears in
its corner. Any click on a control cancels the walkthrough. With
`prefers-reduced-motion` the figure jumps to its finished state.

The page map at the right edge is a rail of ticks, one per theme (longer,
in the theme color) and one per paper, plus one for the publication list.
Ticks near the pointer magnify and the nearest one shows its label; the
current tick is solid. Press to jump, drag to scrub. Below 1060px the page
is one column and the map is hidden. The three linked phrases in the bio
carry the theme icon and a theme-colored underline, hint their theme
section on hover, and are marked while that section is on screen.

## Where things live

- `src/pages/index.astro` composes the page and loads the two scripts.
- `src/layouts/Base.astro` is the document head: fonts, favicons, analytics,
  and the two stylesheets.
- `src/styles/global.css` is the page: tokens (including the three theme
  colors), sidebar, map, entries, publication list, mobile.
  `src/styles/demos.css` is every figure, laid out for about 590 by 300;
  a container query below 480px stacks each figure for phones. The
  one-column breakpoint (1060px) lives in both stylesheets; the figure
  height override must stay in demos.css because it loads last.
- `src/components/Side.astro` is the left column. The bio text lives here.
- `src/components/PageMap.astro` renders the map rows from `themes.json`.
- `src/components/Work.astro` renders the themes (each `section` carries
  `data-th`, which sets the theme color token); `Entry.astro` renders one
  row. `src/data/icons.js` holds the three theme icons used by the header
  and the bio.
- `src/components/demos/*.astro` are the six figures (markup only).
- `src/scripts/flow.js` is the shared walkthrough runtime: cancellation
  token, `sleep`, `typeInto`, `stream`, the fake cursor.
- `src/scripts/demos.js` registers the six demo modules, plays each flow once
  via IntersectionObserver, adds the replay button, and routes clicks on
  `[data-act]` elements to the module's `act()`.
- `src/scripts/demos/*.js` hold each figure's behavior and curated text.
  Each exports `init(d)`, `flow(d, tok)`, `final(d)`, `act(d, el, tok)`.
- `src/scripts/map.js` is the sidebar map.
- `src/components/Publications.astro` is the full list and the posters.
- `src/data/themes.json` names the themes, their one-line intro, and which
  papers belong to each. `src/data/publications.json` is the paper record;
  `thumb` is the generated thumbnail. `src/data/profile.json` has the links
  and portrait.
- `public/images/thumbs/` are 360 by 225 images: each teaser trimmed of
  white margins and fitted whole onto a white canvas (Evalet from a frame of
  its teaser video). Regenerate with the small PIL script in the session
  notes if teasers change; `scripts/make-thumbs.py` is the older cropper.
- `public/fonts/Geist-Variable.woff2` and `GeistMono-Variable.woff2` are
  copied from the `geist` package.

Unused but still present: `src/layouts/Layout.astro`, the old components
(`CanvasPanel`, `Card`, `CardHand`, `LeftPanel`, `PaperDetail`,
`PublicationList`, `ResearchGridFinal`), the old scripts (`disentangle`,
`fragments`, `panel`, `text-scramble`), `src/data/fragments.json`, and
`src/legacy/`. They can be deleted.

## The six figures

- Stylette: a mic pill above a mock web page. The cursor selects the
  paragraph and taps the mic; a waveform plays while the words of "tone down
  the text" arrive; three property rows appear (color, font-family,
  font-size) with three suggestions each, and two are applied. The mic
  cycles to the next request; chips pick one directly.
- Cells, Generators, Lenses: four cell blocks in a tray. Dragging (or
  clicking) a cell moves it into the chain, which is the prompt; the
  generator (GPT-4, temperature 0.7 or 1.2) continues it; outputs land in a
  list lens or a space lens with two axes. Outputs are keyed by the last
  cell in the chain.
- EvalLM: the paper's photosynthesis example. Criteria are added one at a
  time, typed into a field or picked from suggestion chips; each one lights
  up its evidence in both outputs and scores them, with an explanation.
  Unknown text gets a hint naming the four known criteria.
- Evalet: the relativity example. Six fragments light up with their
  functions, their points appear on a map of eight clusters drawn as density
  glows with smooth hulls, and the map zooms into one cluster to show its
  base clusters.
- CUPID: three earlier session cards, each with a context factor and the
  preference shown there, and a current request. The model scans the cards,
  marks the one sharing a factor, a line links them, and the preference is
  copied into a one-line response. Chips switch between three requests.
- DiscoverLLM: the paper's Figure 1 example with assistant turns summarized
  as actions ("Offers two starts: a dog at home · a fox at dusk"), the
  eight-node intent tree, per-turn rewards, and a Base model switch whose
  clarifying question the simulated user cannot answer.

## Working on it

Use Node 20 or newer (`nvm use 22`). `npm run dev` for a live server,
`npm run build` for `dist/`. The build output and the `.astro/` cache are not
ignored by git, and `node_modules` is tracked, so add files by path when
committing.

To review a build as an artifact: copy `dist/` to a folder, rename `_astro/`
to `assets/` (leading underscores are reserved), rewrite root-relative paths
(`/assets`, `/images`, `/fonts`, `/favicon`, `/pdf`) to relative, and publish
`index.html` with the other files.

Headless Chrome can screenshot the flows in their finished state with
`--virtual-time-budget=30000`. Chrome enforces a minimum window width, so for
phone widths render the page inside a 390px iframe. For interaction tests,
a small CDP driver (Node 22, built-in WebSocket, `--remote-debugging-port`)
can click controls mid-walkthrough and capture element screenshots; the
scenario used in September 2026 exercised every demo's cancel-then-act path
and the map's click and drag.

The demos are curated illustrations of each system, not live model output.
Keep their text faithful to the papers and say so on the page.

## Known gaps

- EvalLM's GIF opens on a blank frame, so `public/images/evallm-still.png`
  is a later frame used as its still.
- Two poster links still point at old `/assets/pdf/` paths and 404.
- The theme names and intro sentences are draft copy.
- The bio's second paragraph is adapted from the research statement intro
  and should follow that document as it changes.
