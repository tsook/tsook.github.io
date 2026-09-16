# Portfolio concepts, round three

Written September 5, 2026, from the brief in `portfolio-design-handoff.md`.
This is a fresh reading of the problem. Nothing below reuses the archived
gadget, its ten studies, or the earlier concept lists.

Wireframe sketches of the five concepts, on the real content:
https://claude.ai/code/artifact/aa1de6eb-3d07-4a9a-b0be-2bac13f2be51

## 1. The aim

A professional, clean, minimal research portfolio. A visitor should understand
who Tae Soo is and find a useful paper within a few seconds and zero clicks.
Motion and a sense of one thing expanding are welcome, but as a finish on a
readable page, not as the way the page is navigated.

## 2. What makes the current site feel busy

Looked at the live site at 1440 and 390 px wide and read every component.
The problems separate cleanly into three groups.

**Content.** The second bio paragraph is one long sentence carrying six bold
phrases, four of them dashed-underlined because they are hover triggers. It
reads like a glossary rather than a sentence. The role line
"SkillBench / KAIST · HCI+NLP" is compressed to the point of being a code.
Paper tiles show a title and a clipped subtitle but never a plain sentence
about what the paper found. The full list of seventeen papers and eight
posters is hidden behind "Show all".

**Layout and density.** Two thirds of the desktop viewport is an animated
canvas with no information on it; the content is confined to a 45 % column.
Six paper tiles sit inside a hand-drawn 2 × 2 matrix (HCI / NLP against
Execution / Evaluation) with axis labels at 9.6 px, emoji, paper-grain
texture, gradients, glow on hover, and gold medal icons. Body text is 13.6 px
and the smallest text is 8 px. Two fonts arrive from Google and five pixel
fonts are shipped but unused. The body is locked to the viewport height with
inner scroll regions, so the page does not behave like a page.

**Motion.** Nothing is readable until a sequence finishes: the research
sentence types itself, shimmers, then grid lines draw, then labels fade,
then tiles drop in. Behind it, two hundred text fragments drift on a
Bayer-dithered cloud. Opening a paper scrambles its title into box-drawing
characters before resolving. Each effect is well made; together they are
the definition of busy, and they run before the visitor has read a word.

One thing worth keeping: the 2 × 2 matrix is a real idea about the work
(method: HCI or NLP; target: helping people state intents or audit
behavior). It is the content of the "disentangle" sentence made spatial.
It should survive as structure, not as decoration.

## 3. What the references actually teach

Each line names one behavior or decision worth borrowing.

- **Emil Kowalski, emilkowal.ski.** Name, role, two short paragraphs, a list
  of projects with one-line descriptions. Nothing else. It proves that for a
  maker of interfaces, restraint on the home page reads as confidence.
- **Rauno Freiberg, rauno.me.** One large statement and one bold shape per
  screen. Everything else is small and quiet. Teaches: one focal element.
- **Gabriel Beaugonin.** Pale ground, white rounded card, two round buttons,
  a single project card at a time. This is the visual DNA of "a card in the
  middle" without any machinery around it.
- **J. Kane.** A fixed identity panel on the left, work scrolling on the
  right, both as white panels on gray. Teaches a two-column pattern that
  stays readable, and shows how quickly panel chrome (dots, pills, tickers)
  adds up.
- **Hasan Wali, hw-6890.** A centered sentence with thumbnails orbiting it.
  Teaches the danger directly: satellites make the center unreadable.
- **Made by Null 2022.** Scattered windows and taped notes on a desk. Charming
  as a poster, useless as a profile. A warning about arrangement as content.
- **Dynamic Island.** One container keeps its identity while it changes shape
  around different content. Two rules follow: the resting state must already
  be useful (never empty), and the thing that expands must be the same
  object afterwards, not a replacement.
- **Designing Fluid Interfaces, WWDC18.** Respond instantly, let the visitor
  redirect an animation midway, keep spatial consistency, and make the
  transition a continuation of the gesture. This is the motion contract for
  any concept below.
- **Liquid Glass dynamics, WWDC25.** Controls flex under touch and rest
  quietly. The glass look is not needed; the resting quietness is.
- **The three papers.** They are DataInk (Xia et al., CHI 2018),
  Object-Oriented Drawing (Xia et al., CHI 2016) and AI-Instruments (Riche et
  al., CHI 2025). The shared idea is reification: turn a property or an
  intent into an object you can hold and put it next to the thing it acts
  on. For a site this means the words in the bio can be the controls.
- **Tangle and Potluck.** Prose that stays prose while also being an
  instrument. Same lesson from a different angle.
- **OP-1 and Playdate.** Concentrate personality in one memorable control
  rather than many. One signature interaction, everything else standard.
- **Family, family.co (the iOS wallet).** Its sheets and buttons morph into
  their next state instead of being replaced. A concrete production example
  of Dynamic Island behavior on a flat, near-white interface.

## 4. Five concepts

All five share the same page skeleton so that only the interaction differs:
name and role, a three-sentence bio, a links row, selected work, all
publications, posters, footer. What changes is where the expansion lives.

### A. The plain page (baseline)

One centered column. Selected work is six rows with a small thumbnail, the
title, venue and year, and one plain sentence. All publications follow,
grouped by year. No JavaScript.

- Visible before any click: everything.
- Interaction: none beyond links.
- Cost: a day. Risk: none. It is the control against which the other four
  must justify themselves.

### B. Rows that expand in place

Same column as A, but each publication row is a compact object. Clicking it
grows the row into a full card, in place: teaser image, a short paragraph,
authors, links. The rows below slide down to make room. One open at a time;
clicking again or pressing Escape shrinks it back to the row.

- Visible before any click: the whole list, compact.
- Interaction: one, and it happens exactly where you clicked.
- Why it fits: this is "content in the middle that expands" with the Dynamic
  Island rule kept honest. The row and the card are the same object.
- Build: `<details>` and `<summary>` give a no-JavaScript fallback for free;
  the height animation is a few lines. Works identically on a phone.
- Risk: low. The danger is over-decorating the open state.

### C. The bio is the instrument

Same column as A. Three or four phrases in the bio are live: "HCI", "NLP",
"state what they want", "audit what a model does". Hovering one highlights
the matching papers in the list below; clicking it pins that filter and the
list reorders so the matching papers rise, the others fade back. A small
"all" control, or clicking the phrase again, resets.

- Visible before any click: the bio and the full list.
- Interaction: one, and it enacts the research itself, which is about
  disentangling language into interactive parts. The current site gestures
  at this with the dashed underlines; this version makes it the whole idea.
- Build: a data mapping from phrase to paper ids, one list, FLIP reordering.
- Risk: medium. If more than four phrases are live it becomes a puzzle.
  Also depends on the research grouping settling, which the brief flags as
  provisional. Compatible with B, and could be added to it later.

### D. One card that grows

The user's own idea at its minimum. A single white card sits centered on a
pale ground holding the name, bio, links, and a row of four plain buttons:
Work, Publications, Posters, CV. Selected work is already open inside the
card by default. Pressing Publications grows the card downward to include
the full list; pressing again folds it back. No satellites, no side blobs,
one direction.

- Visible before any click: identity and selected work.
- Interaction: the container changes size; the content inside does not move
  relative to itself.
- Why it differs from B: the object that expands is the whole card, so the
  page has one visible body with edges and a shadow. That is what gives it
  the gadget character.
- Risk: medium. On a phone a card is just a page with margins, so the idea
  only reads on desktop. And the card has to stay honest about its resting
  state; if everything useful is already open, the buttons do little.

### E. Identity panel and stage

Two columns, as the current site is. Left: a fixed identity panel with bio
and a compact list of papers. Right: a stage showing one paper large, with
its teaser, paragraph and links. Clicking a row in the list moves its
thumbnail across to the stage and swaps the text with a crossfade. Nothing
is hidden; the stage always shows something, starting with the most recent
paper.

- Visible before any click: bio, list, and one paper in full.
- Interaction: selection with a shared-element transition.
- Why include it: it is the classic research-portfolio layout done well,
  and it uses the half of the screen the current site leaves to the canvas.
- Risk: on a phone it collapses to a list plus a modal, and the sense of a
  single centered thing is lost. It is the least "malleable" of the five.

## 5. Shared visual language

- Ground `#F5F5F3`, panels white, hairline `#E6E6E2`, ink `#111`, one
  secondary gray `#6B6B6B`. Links in ink with an underline, no blue.
- One typeface. Geist Sans, self-hosted from the `geist` package already in
  `package.json`. Body 16 px, meta 13 px, nothing smaller than 12 px.
- Depth: at most one shadow, wide and faint, only on the object that moves.
- Motion: 240 to 360 ms, ease-out, interruptible. Size changes animate;
  colors and opacity cross-fade. With `prefers-reduced-motion` everything
  snaps. Nothing animates on page load.
- The 2 × 2 matrix survives as small text labels on rows or as the phrase
  filters in C, not as a drawn grid.

## 6. Recommendation

Build **B** as the site, with **A** as its no-JavaScript fallback, which it
already is. Then decide whether **C** is added on top once the phrase-to-paper
mapping is settled. B is the only concept where the expansion is both
centered and cheap to reach, where the resting page is a complete profile,
and where the phone version is the same design rather than a fallback.

D is the honest version of the original gadget, and if the card character is
what matters most it can be treated as a visual variable of B: the same
expanding rows inside one bordered card instead of on the open page. That
decision does not need a separate prototype.

## 7. Content fixes independent of the choice

- Rewrite the second bio paragraph as two sentences with at most two
  emphasized phrases, and expand the role line into words.
- Add a one-sentence plain summary per paper. The existing `description`
  paragraphs are 60 to 120 words and work as the expanded text in B.
- `evalet` points at a Lottie JSON as its teaser; give it a PNG.
- `semantic-reader` has no image.
- The `chi2025-dc` poster link still uses the old Jekyll `/assets/pdf/` path.
- Drop the Google Fonts request and the five unused GeistPixel faces.

## 8. Proposed next step

One light prototype of B on the `design/clean-portfolio` worktree at
`/private/tmp/tsook-portfolio-clean`, using the real data: resting state,
one row open, and the return. Then, if wanted, the same page with the C
filters switched on, so the two can be compared on the same content.
