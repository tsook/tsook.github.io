# Interactive paper demos: how they are built

This is the reusable recipe behind the six figures on the front page, so the
next paper can get one without rediscovering the approach. Everything here
is in `src/`; there is no build step beyond `npm run build`.

## What a demo is

Each selected paper gets one figure, about 500 by 212 pixels, that shows
the paper's core mechanism as a working miniature of the real system:

1. It rests in a meaningful state. The inputs are visible before anything
   moves: the web page and mic for Stylette, the cells in their tray, the
   two prompt outputs, the response text, the session cards, the first user
   turn.
2. When the visitor reaches it, it plays a scripted walkthrough once. A fake
   cursor moves to controls and clicks them, text is typed or streamed, the
   system responds. Walkthroughs play one at a time in page order.
3. After that it is interactive. Every control the cursor used is a real
   control the visitor can use, and a replay button appears in the corner.
4. Any click on a control during the walkthrough cancels it cleanly and runs
   the visitor's action instead.

The text in a demo is curated, not live model output. Keep it short: the
mechanism should be readable at a glance, and the paper's own terms should
appear where the real interface would show them.

## Files

- `src/scripts/flow.js`: the shared runtime. A cancel `token()`, `sleep`,
  `typeInto` (characters, with a caret) and `stream` (words), the `cursor`
  (a fake pointer with `show`, `moveTo`, `click`, `hide`), `esc` for HTML,
  `reduced()` for the reduced-motion query, and `run` which swallows the
  cancel sentinel. Animated writes stamp their element so a cancelled run
  can never overwrite a newer one.
- `src/scripts/demos.js`: registers the modules, adds the replay button,
  plays walkthroughs one at a time via IntersectionObserver, sweeps
  transient classes on cancel, and routes clicks and Enter or Space on
  `[data-act]` elements to the module's `act`.
- `src/scripts/demos/<name>.js`: one module per demo (see the contract).
- `src/components/demos/<Name>.astro`: the markup, wrapped in
  `<div class="fig" data-demo="<name>">`.
- `src/styles/demos.css`: shared chrome at the top (`.fig`, `.fig-replay`,
  `.fcur`, `.chip`, marks, keyframes), then one block per demo, then the
  phone container query at the bottom.
- `src/components/Entry.astro`: maps a paper id to its demo component.

## The module contract

```js
export default {
  init(d),            // render the resting state, wire non-click listeners
  async flow(d, tok), // the walkthrough; await sleep(ms, tok) between beats
  final(d),           // jump straight to the finished state (reduced motion,
                      // or when the visitor scrolls away mid-walkthrough)
  clean(d),           // optional: settle half-finished state after a cancel
  async act(d, el, tok), // a visitor clicked el (has data-act); do the thing
};
```

`d` is the `.fig` element. Keep the demo's state on it (`d._xx = {...}`)
so modules stay self-contained. Every step of `flow` that waits must pass
`tok`, so a cancel rejects the sleep and unwinds the flow. If `act` starts
something that takes time (a generation animation, a scan), it also takes
`tok`; the runtime gives each action a fresh token and cancels the previous
one, so two fast clicks never interleave. Functions that a settle-run can
re-enter should carry a run stamp (see `infer` in `cupid.js` or `speak` in
`stylette.js`) and bail after each await if a newer run started.

Rules the runtime relies on:

- Controls are `<button data-act="...">` (or an SVG `<g data-act tabindex="0"
  role="button">` when it has to be SVG). Never put `data-act` on a `<div>`.
- Transient classes that the walkthrough adds (`is-typing`, `is-busy`,
  `is-listening`, `is-running`, `is-flowing`, `is-scan`, `is-down`) are
  removed by the runtime on cancel; anything else half-done is `clean`'s job.
- `flow` should begin by resetting to the resting state, so replay works.
- Use `reduced()` to skip delays and typing when the visitor prefers
  reduced motion; `final` must produce the same end state as `flow`.

## Designing a new demo

1. Read the paper's system section and look at its figures or teaser video.
   Write down the one interaction that is the contribution: the request and
   the palette (Stylette), cells assembled into a prompt (Cells), a
   criterion lighting up evidence (EvalLM), fragments landing on a map
   (Evalet), the scan for the shared context (CUPID), options surfacing
   intents (DiscoverLLM). The demo shows that and nothing else.
2. Use an example from the paper where one exists (DiscoverLLM's animal
   poem, EvalLM's photosynthesis prompts, Stylette's "tone down the text").
   Where you write new text, keep it plain and short; long or florid sample
   text reads as model output.
3. Lay it out for the frame: about 500 wide, 212 tall, 10 by 12 padding,
   11px type. Two columns is the usual shape (input or state on the left,
   result on the right). Count the vertical budget before writing markup:
   every row of text at 11px costs about 16 pixels.
4. Markup goes in the `.astro` file, curated data and behavior in the module,
   styles in a new block of `demos.css` using the tokens from `global.css`
   (`--ink`, `--ink-2`, `--ink-3`, `--line`, `--blue-*`, `--orange-*`,
   `--green-*`, `--violet-*`). Micro-labels are 9.5px mono uppercase; use two
   per figure at most.
5. Script the walkthrough as beats: `await c.moveTo(el, tok)`, `await
   c.click(tok)`, do the thing, `await sleep(500, tok)`. Aim for 10 to 15
   seconds. Hide the cursor at the end.
6. Add the phone variant to the container query at the bottom of
   `demos.css` (the frame stacks when its content box is under 440px).
7. Register it: import the module in `demos.js`, the component in
   `Entry.astro`, and set the paper's id in `src/data/themes.json`.

## Checking it

- Build and serve: `npm run build`, then `python3 -m http.server 4173
  --bind 127.0.0.1` inside `dist/`.
- Finished-state screenshots: headless Chrome with
  `--virtual-time-budget=30000` fast-forwards every walkthrough.
- Interactions: a small Node 22 script over the DevTools protocol (launch
  Chrome with `--remote-debugging-port`, connect with the built-in
  WebSocket, `Runtime.evaluate` to click, `Page.captureScreenshot` with a
  clip in page coordinates and `captureBeyondViewport`). Click controls
  mid-walkthrough and confirm the state settles, then exercise each control.
  SVG groups need a dispatched `MouseEvent`, not `.click()`.
- Overflow: for each `.fig`, no descendant's bottom should pass the frame's
  bottom in the finished state. Check at the design width and at a phone
  width (render inside a 390px iframe; headless Chrome will not open a
  window narrower than about 500px).
- Console: no exceptions during a full run.

## Page structure, for orientation

One page, built by Astro from `src/data/*.json`. A fixed left column
(portrait, name, role, bio with three theme phrases, links). "Selected
Publications" in three themes (`themes.json`), each paper one row: venue,
award, title (linked), authors, links on the left, the figure on the right.
Then "All Publications" with fitted thumbnails from `public/images/thumbs/`
(regenerate with `python3 scripts/make-thumbs.py` after changing a
teaser) and linked authors. Fonts are Geist and Geist Mono from
`public/fonts/`. The CV source lives in `cv/`; `npm run cv` compiles it
and updates `public/pdf/TaeSooKim_CV.pdf`. Pushing `master` deploys
through GitHub Pages. An earlier page map (a rail of ticks at the right
edge) was removed on 2026-09-16; it is in git history if ever wanted.
