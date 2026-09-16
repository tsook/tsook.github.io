# Personal portfolio redesign — fresh-agent brief

Prepared from the design conversation on September 5, 2026.

This is a standalone brief for a new agent. It captures the user's instructions,
how their preferences evolved, and the references discussed before the previous
prototype round. Start with an independent interpretation. The previous agent's
concept names and implementations are context, not approved designs.

## 1. The task and the current direction

Help Tae Soo Kim develop a new personal research portfolio. Review the existing
site and content, study relevant references, articulate a concept, explore
meaningfully different directions, and create lightweight interactive prototypes
before committing to a finished design.

The latest preference takes priority over the earlier, more elaborate ideas.
Paraphrased from the user:

> Make the portfolio more professional, clean, and minima. Content in the middle that can expand is still  
> interesting, and some principles from

The user has asked for one fresh attempt with a new agent's research, ideation,
and prototypes. Do not assume the task is to refine one of the rejected examples.
Also do not assume all motion, expansion, or tangibility has been rejected.

## 2. The user's enduring preferences

- **Minimalist, Apple-like visual design.** Apply this generally to color,
typography, spacing, and finish. The agent has discretion over the specific
implementation and how that language combines with the concept.
- **Professional and easy to read.** The website's purpose is to communicate a
person and their work. Visitors must be able to understand the profile and
encounter useful work without navigating an elaborate interaction system.
- **Motion and interaction are welcome.** The user is attracted to responsive,
tangible software and continuity between states.
- **Some sense of malleability remains interesting.** Words the user used include
“malleable,” “moldable,” “gadget that expands,” “tangibility,” “centered,” and,
tentatively, “gloopy” or “liquidy.” These are exploratory descriptions, not a
requirement for literal blobs or glass.
- **Avoid excessive interaction to reach details.** The user explicitly worried
that visitors would not engage with their profile if accessing information
required too much work.
- **Be open to substantially different designs.** A concept can look and behave
very differently from the original gadget while retaining the higher-level
qualities. Do not restrict alternatives to variations of one card layout.

Near-white backgrounds, restrained grays, readable dark text, careful sans-serif
typography, and subtle depth were proposed by the previous agent as ways to
interpret Apple-like design. They are reasonable starting points, not a locked
palette, font choice, or component system. Translucency, monospace labels, tiny
text, bouncy springs, and heavily rounded panels are not user requirements.

## 3. How the user wanted the exploration to work

The sequence of requests was:

1. Read the rough notes in `docs/design-principles.md` (initially typed as
 `docs/desing-principles`). The user was not fully invested in those ideas.
2. Before imagining specific designs, help articulate the concept they were
 struggling to describe. Iterate on the concept first.
3. Find references that help describe the feeling and support ideation.
4. Broaden beyond conceptual research: find concrete sci-fi objects, design
 examples, real interfaces, and actual systems.
5. Keep promising references in play while exploring other avenues. Requests for
 more references were additions, not rejections of everything already shown.
6. Imagine many distinct designs, including the expanding-card idea. Describe
 each briefly, at the level of its general concept, before detailing it.
7. Select ten interesting directions worth exploring, using a shared minimalist,
 Apple-like visual language.
8. Build light prototypes to understand the interactions and compare concepts  
 before choosing a direction for further development.

The request for ten concepts belonged to the previous exploration. Preserve the
breadth of thinking, but do not infer that the new attempt must reproduce the
same ten concepts or necessarily build another ten-way gallery. Present the new
concepts before substantial implementation, and keep early experiments light.
If the user requests an autonomous prototype round, choose and explain a sensible
scope rather than treating every routine choice as an approval gate.

## 4. The concrete gadget idea the user described

One candidate was a single central card or block containing the main profile and
description. Links or section controls might sit along its side or float nearby.
Clicking Publications would cause a blob to extend from the card and become a
full publication list, perhaps to the right. Other sections could emerge from
the same body, gradually building a more complex assembly with something of
Teenage Engineering's instrument character.

The user associated this with Dynamic Island: one recognizable thing expands or
changes in response to interaction. They explicitly left room for other ideas.
This was never selected as the final design, and the latest preference cautions
against taking its complexity too far.

Potentially useful questions for an independent interpretation:

- Is the appealing quality the centered composition, the continuous transition,
the tangible response, or the expandable information structure?
- Can that quality survive within a straightforward portfolio layout?
- What is already visible before the first click?
- What useful reading action does each interaction support?

These questions are synthesis by the previous agent, not answers supplied by the
user. A new agent should form its own conclusions.

## 6. Reference library from before prototyping

Use these as starting points, not templates to reproduce. Links and descriptions
are carried forward from the conversation; this handoff does not claim every
reference was visually inspected, interacted with, or verified again today.
Product names and availability may change. Review the sources independently,
including the actual motion where it matters.

### A. Original personal-site references

These four sites were supplied in the original notes as visual inspiration:

- [Gabriel Beaugonin](https://www.gabrielbeaugonin.com/)
- [Made by Null, 2022](https://2022.madebynull.com/?ref=minimal.gallery)
- [J. Kane](https://www.jkane.co/?ref=minimal.gallery)
- [hw-6890](https://hw-6890.com/?ref=minimal.gallery)

The old notes associated them with pale grounds, white panels, hairline borders,
soft shadows, restrained color, and small labels. Treat that as the notes'
interpretation; inspect the sites rather than assuming the description is still
accurate. Reference screenshots exist on the archive branch at
`docs/imgs/gabriel.png`, `madebynull.png`, `jkane.png`, and `hwali.png`.

### B. Original research and other source links

These were listed in the user's reference document. The conversation did not
establish reliable paper titles or complete reviews for the three ACM links:

- [ACM DOI 10.1145/3173574.3173797](https://dl.acm.org/doi/pdf/10.1145/3173574.3173797)
- [ACM DOI 10.1145/2858036.2858075](https://dl.acm.org/doi/pdf/10.1145/2858036.2858075)
- [ACM DOI 10.1145/3706598.3714259](https://dl.acm.org/doi/pdf/10.1145/3706598.3714259)
- [CDG Research Agenda, 2014](https://dynamicland.org/2014/CDG_Research_Agenda.pdf)
- [yui540 reference post](https://x.com/yui540/status/2090674357286920688?s=20)

The original notes interpreted the papers as inspiration for controls located
near what they act on and controls having an object-like identity. Verify that
interpretation before attributing it to the papers. The CDG PDF fetch failed in
the conversation; its contents were not analyzed. The X post was listed but not
substantively reviewed. “Check Claude artifact” also appeared in the notes, but
no usable artifact link or contents were provided.

### C. Apple: continuity, materiality, and expanding interfaces

- [Meet Liquid Glass, WWDC25](https://developer.apple.com/videos/play/wwdc2025/219/)
— especially the Dynamics section beginning at 1:29. Discussed for flexibility,
controls changing shape, and quiet resting states that respond to interaction.
The user does not require the glass appearance.
- [Spotlight on the Dynamic Island](https://developer.apple.com/news/?id=mis6swzt)
— a compact recognizable presence adapting to different content and activities.
This is the reference the user most explicitly connected to their own idea.
- [Designing Fluid Interfaces, WWDC18](https://developer.apple.com/videos/play/wwdc2018/803/)
— immediate response, interruption and redirection, spatial continuity,
lightweight gestures, soft boundaries, and believable motion.

### D. Tangible and malleable systems

- [Radical Atoms / Perfect Red, MIT Tangible Media Group](https://tangible.media.mit.edu/project/radical-atoms/)
— a vision of computationally transformable physical materials; the page
includes the speculative Perfect Red film. An imagination reference, not a
claim that a production system implements the full vision.
- [LineFORM](https://tangible.media.mit.edu/project/lineform/)
— an actuated, shape-changing line explored as an interface. Consulted during
research, though not foregrounded in the final reference shortlist.
- [Malleable Software, Ink &amp; Switch](https://www.inkandswitch.com/essay/malleable-software/)
— software people can reshape to suit their needs. Useful for distinguishing
actual user agency from a merely pliable appearance.
- [Potluck: Dynamic documents as personal software](https://www.inkandswitch.com/potluck/)
— text documents gradually acquiring computation and interactive behavior.
The recipe example was suggested as an accessible demonstration.
- [Tangle, Bret Victor](https://worrydream.com/Tangle/)
— working reactive-document examples with manipulable values in prose. Useful
for readable content that also behaves as an instrument.

### E. Concrete sci-fi references

- **Man of Steel — Kryptonian Liquid Geo.** Information forms from metallic
elements into tactile surfaces and moving reliefs.
[Effects breakdown video](https://www.wired.com/video/watch/design-fx-man-of-steel-designing-krypton-s-tech-effects-exclusive)
· [Interview with VFX supervisor Dan Lemmon](https://www.artofvfx.com/man-of-steel-dan-lemmon-vfx-supervisor-weta-digital/)
· [fxguide breakdown](https://www.fxguide.com/fxfeatured/man-of-steel-vfx-milestones/).
Discussed for material transformation and sculptural depth.
- **Treasure Planet — map sphere.** A small object gives access to a much larger
spatial map. Discussed for a stable center and unfolding possibility.
[Fan reference with images](https://disney.fandom.com/wiki/Map_of_Treasure_Planet)
· [Official film page](https://disneyanimation.com/films/treasure-planet/).
The fan source is not an authoritative account of design intent.
- **Oblivion — Vika's light table and screen graphics.**
[GMUNK's design case study and montage](https://gmunk.com/Oblivion-GFX).
Discussed for a composed working surface, coherent graphic language, and
purposeful motion. The film's interface density is not a portfolio requirement.
- **Her — personal technology and OS interfaces.**
[Interview with interface designer Geoff McFetridge](https://www.pushing-pixels.org/2018/04/05/screen-graphics-of-her-interview-with-geoff-mcfetridge.html)
· [Production-design discussion](https://www.wired.com/story/her-ui-design/).
Discussed for intimate, understated, warm technology rather than an elaborate
futuristic control system.

The original reference note also catalogued fictional pocket-device mechanisms:


| Mechanism                      | Examples listed in the original notes                                                                                                                        |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Mechanical unfolding           | Duel Disk (Yu-Gi-Oh!), tricorder and communicator (Star Trek), Pip-Boy (Fallout), Compowder (Totally Spies), sonic screwdriver (Doctor Who)                  |
| Holographic expansion          | Omni-tool (Mass Effect), iDroid (Metal Gear Solid V), kimoyo beads (Black Panther), mobiGlas (Star Citizen), Focus (Horizon Zero Dawn), datapads (Star Wars) |
| Matter reconfiguration         | Nanotech arc reactor (Iron Man), Dominator (Psycho-Pass), Omnitrix (Ben 10)                                                                                  |
| Summoning from compact storage | Hoi-Poi Capsules (Dragon Ball), Pym discs (Ant-Man), Greed Island cards (Hunter x Hunter), summoning scrolls (Naruto), Digivice (Digimon), Doraemon's pocket |
| Token slotting                 | Rouze and Ride Cards (Kamen Rider), Ridewatches (Zi-O), Yo-kai medals, Dials (One Piece)                                                                     |


These are informal inspiration categories from the notes, not verified claims
about precisely how every fictional device works. They were not all individually
researched. The common attraction was a compact object with unexpectedly broad
capability.

### F. Real physical design references

- [Teenage Engineering OP-1](https://teenage.engineering/products/op-1/original)
— a compact instrument, distinctive controls, and visual feedback. The user
independently mentioned its character as relevant to the gadget idea.
- [Playdate](https://play.date/)
— a small handheld with a fold-out crank used as a controller. Discussed for
concentrating personality in one memorable tactile interaction.
- [Lumio Lito Classic](https://www.hellolumio.com/products/lito-classic)
— a book-shaped lamp that opens into different configurations. Discussed for
expansion with visible structural continuity.
- [Nendo paper-torch](https://www.nendo.jp/en/works/paper-torch/)  
— a paper-based light whose roll changes its behavior. Discussed for the shape  
change itself functioning as a control.

## 7. The old design-principles document: useful history, not current law

The original document treated the site as one body that changes shape without
navigating away. It recorded these lessons from explorations predating this
conversation:

- Communicate origin through contact or motion rather than connector lines.
- Use consistent opening directions and avoid branches doubling back.
- Group a list into one block rather than scattering one card per item.
- Bound visible depth, compressing intermediate steps into labeled strips.
- Keep satellite controls to one side rather than a full ring.
- Make controls respond tangibly to pressing.

It also said that research themes were provisional, phone layouts must not clip,
and readable/searchable content must be available without JavaScript.

The user explicitly said these ideas were rough and negotiable. The spatial
rules are specific to the old gadget concept; they must not force the next
agent back into it. Mobile readability, accessible controls, reduced-motion
support, and reliable access to content remain sensible quality requirements.

## 8. Repository context and preservation boundary

Repository: `/Users/tsook/Documents/research/tsook.github.io`.
The primary branch is named **master**, despite the conversation sometimes saying
“main.” At handoff creation it points to `02a3a6de`.

The previous work was committed as a complete snapshot:

- Branch: `archive/portfolio-interaction-explorations`
- Commit: `2c52467f` — `Archive portfolio redesign and interaction explorations`
- Saved locally; it was not pushed during this session.

The working checkout has returned to master. The archive includes the earlier
redesign, ten prototypes, source/reference notes, dependencies, and generated
artifacts. Do not merge that entire snapshot merely to retrieve a reference.
Read individual files from it if needed, for example:

```sh
git show archive/portfolio-interaction-explorations:docs/design-principles.md
git show archive/portfolio-interaction-explorations:docs/references.md
```

Relevant existing content is in `src/data/profile.json`,
`src/data/publications.json`, `public/images/`, and `public/pdf/`. Inspect the
current files before editing; retain factual attribution, publications, and
working links. The old archive's research groupings are provisional.

Master uses Astro. React and Motion were added in the archived experiments;
do not assume they are dependencies of the current baseline. Inspect
`package.json` and the current site before choosing an implementation approach.
Generated cache files may have changed when the development server ran; verify
current Git state rather than assuming a clean checkout from this document.

Keep new experiments isolated and reversible. No deployment, merge, or push is
requested by this brief. The request that produced this document was only to
write the handoff, not to begin a new design implementation immediately.

## 9. Suggested opening approach for the next agent

1. Restate the current aim: a professional, clean, minimal portfolio with optional
 subtle continuity, expansion, and tactility.
2. Inspect the current portfolio and identify what makes it feel busy, separating
 content problems from navigation, visual density, and motion.
3. Revisit the most relevant references and find additional concrete examples.
 Explain the particular behavior or visual decision each makes useful.
4. Offer concise, genuinely distinct concepts. Include a restrained baseline so
 the value of added interaction can be judged. Avoid prematurely promoting one
 metaphor into the whole brief.
5. Develop light prototypes once the concept discussion has a useful direction.  
 Show actual content, a resting state, one meaningful interaction, and a clear  
 return path. Keep typography and color coherent across alternatives.

