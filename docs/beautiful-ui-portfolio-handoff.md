# Portfolio handoff: Beautiful UI direction

Recorded September 14, 2026. Start here for the latest conversation direction; older exploration documents are historical context.

## What the user wants

A professional, minimal personal research portfolio with an Apple-like aesthetic, representative visuals, and thoughtful interactions. The user rejected earlier elaborate gadget/Dynamic Island explorations and later archived three simpler layout prototypes. None is an approved final design.

The strongest new signal is the user's response to **https://www.beautifului.dev/**:

> “Very strong reference … I really like this … Let's first imagine how we can make our personal website kind of based on this.”

Beautiful UI should be the primary reference for the next discussion. The user approved its relevance, not a particular implementation. The subsequent adaptation ideas below were proposed by the assistant and remain open for discussion. The latest request was to record these ideas for another agent, not to start building.

## Working concept

**A personal collection of research interfaces, presented with the care and precision of a component showcase.**

The appeal we inferred: a calm, stable page containing small pieces of software that invite manipulation. This preserves tangibility and a little malleability through the research demonstrations themselves. Visitors should understand the profile and contributions without operating anything.

In the reference, we observed compact typography, a narrow identity/navigation column, fine borders, numbered entries, and generous demonstration surfaces. Each example focuses on a particular interface behavior. Desktop screenshots were inspected in September 2026; both captures appeared dark, including an attempt with a light browser color preference. The site's light theme and mobile behavior were not verified. Revisit the actual site before matching its details.

## Proposed adaptation

- **Left column:** modest portrait, name, current role, short research statement, CV/Scholar/email links, and anchors for selected projects. Keep the personal introduction visible and concise.
- **Right column:** one stream of research demonstrations. Each has a small project heading, a one-sentence contribution, a generous interactive area, and visible paper/project links plus venue/year.
- **Remaining publications:** a readily browsable section with static, representative visuals and scholarly metadata.
- **Visual language:** restrained neutrals, modest headings, fine separators, lightly rounded surfaces, small but usable controls. Color mainly belongs inside the research visuals and conveys meaning. Earlier preference was white/soft neutrals; light versus dark remains undecided.
- **Motion:** explain state changes—fragments separating, comparisons updating, styling taking effect, optional details expanding in place. Avoid elaborate navigation, scroll-gated reveals, and requiring interaction to access basic information.
- **Reading behavior:** normal scrolling, useful untouched demo states, direct links, and a sensible stacked layout on mobile.

Two compositions were proposed:

1. **Research collection:** persistent profile at left, one column of demonstrations at right. Assistant's recommended starting point; closest to Beautiful UI.
2. **Personal showcase:** short introduction across the top, followed by the same research entries. More conventional personal-page framing.

Neither composition has been selected. Avoid simply reusing the archived editorial prototype and treating that as the new design.

## Six selected papers: proposed interactive content

The user explicitly wants interactive previews for all six selected papers, and static visuals for the others. These are candidate mechanisms, not approved scripts:

| Paper | Candidate demonstration | Primary source |
| --- | --- | --- |
| Stylette | Apply a styling suggestion to a real webpage excerpt. | https://stylette.kixlab.org/ |
| Cells, Generators, and Lenses | Manipulate input cells, a generator, and an output lens. | https://llm-objects.kixlab.org/ |
| EvalLM | Compare outputs through different evaluation criteria. | https://evallm.kixlab.org/ |
| Evalet | Select answer fragments to inspect their rhetorical functions. | https://evalet.kixlab.org/ |
| CUPID | Explore how context determines the relevance of a preference in an actual benchmark example. | https://cupid.kixlab.org/ |
| DiscoverLLM | Step through an interaction that progressively reveals a user's intent. | https://taesookim.com/discoverllm/ |

Select actual paper/system examples before implementation. A faithful excerpt or focused reconstruction is preferable to a generic decorative interaction. CUPID is a benchmark: any explorer would be a new explanatory presentation, not its original research UI. Label curated/prerecorded outputs honestly; do not imply live inference or fabricate experimental results.

## Supporting references

Beautiful UI takes priority. Earlier references remain useful for specific aspects:

- [Fred Hohman](https://fredhohman.com/) and [Ryo Suzuki](https://ryosuzuki.org/): visual research evidence and publication access.
- [João Gallas](https://joao-gallas.com/): project framing across product design, HCI, and prototypes.
- [Ken Nakagaki](https://www.ken-nakagaki.com/) and [Jasmine Lu](https://jasminelu.site/Publications): tangible systems and illustrated research entries. Ken's selected-work list states it is not updated after 2022.
- [Bartosz Ciechanowski](https://ciechanow.ski/mechanical-watch/): direct manipulation that explains the subject.
- [Ink & Switch](https://www.inkandswitch.com/): concrete tools connected to research questions.
- [Nutshell](https://ncase.me/nutshell/): optional inline depth.
- [Rauno Freiberg](https://rauno.me/): interaction craft.

These are inspiration, not user-approved templates. Other designer/researcher sites discussed: https://peterkun.com/portfolio/, https://judithamores.com/, and https://bimster.com/.

## Repository and next-agent starting point

- Main branch is named `master`. Current live-site source and publication/profile data are the factual starting point; inspect them again before changing content.
- `docs/minimal-portfolio-direction.md` is the preceding short brief. `docs/portfolio-design-handoff.md` and `docs/portfolio-concepts.md` contain older exploration; they do not override this newer preference.
- Three simpler prototypes were saved on `archive/clean-portfolio-layouts`, commit `78ce6d84`. Earlier complex explorations are on `archive/portfolio-interaction-explorations`.
- Git still lists `/private/tmp/tsook-portfolio-clean`, but marks that worktree **prunable** as of this handoff. Do not assume it or its preview server still exists. The committed archive branch is the durable copy.
- Archived previews were curated illustrations, not original live research systems. Semantic Reader lacked an image in that version's data and used a labeled schematic.

Next: inspect Beautiful UI visually, discuss a focused adaptation with the user, and settle the composition and demo fidelity before substantial implementation. Keep exploration isolated and reversible. No Beautiful UI-based prototype has been built or approved in this conversation.
