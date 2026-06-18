# Pedagogy rules for writing a conspect

Distilled from research on cognitive load theory, the worked-example effect, retrieval practice (testing effect), refutation texts, dual coding, advance organizers, and proven note structures (outline method, Cornell notes, concept mapping, layered summaries). Rules are imperative; apply them at the phase they belong to.

## Planning the outline

- **Set a learning objective per topic.** Before writing, state (to yourself) what the reader will be able to *do or explain* after the topic. Select content against that objective; cut what doesn't serve it.
- **Order by prerequisites, always.** Sequence topics so every concept is built only from concepts already covered (or declared external knowledge). This is how you control intrinsic cognitive load: complexity comes from how many *new* interacting elements the reader must juggle at once.
- **Size the smallest topic as one study session's coherent idea.** Not a glossary entry, not a whole course. If a topic's outline needs sub-headings that are themselves teachable units, split it into children; if a child would be three paragraphs, merge it up.
- **Plan the through-line.** A conspect is a single argument from first topic to last, not a pile of articles. For each topic, know which later topics will need it — if none do and it's not a leaf goal, question why it's there.
- **Plan figures and examples at outline time**, not as decoration afterward. Decide where a picture carries the idea (dual coding) and where a worked example is the explanation. These outline-time picks are provisional — per-topic research (SKILL step 4) confirms, corrects, or replaces the specific examples before you write.
- **Use hierarchy visibly.** The outline (general → specific, consistent levels) is itself a learning aid: readers form a mental map from the structure before reading a word of content.

## Explaining (per topic)

- **Open with an advance organizer.** First the `prereq` block, then one short paragraph anchoring the new topic to what the reader already knows and previewing where this topic goes. New knowledge sticks only when attached to existing structure.
- **Intuition first, formalism second.** Lead with a concrete case, picture, or analogy that makes the reader *feel* the idea; then generalize into the precise definition or theorem. After an analogy, state explicitly where it breaks — unrepaired analogies become misconceptions.
- **One new element per step.** Working memory holds roughly four chunks. Each paragraph should add one new idea on top of established ground. If a derivation needs five new ideas, introduce them one at a time, each motivated before used.
- **Elaborate: answer "why" and "how", not just "what".** State the mechanism, the motivation, the consequence. Explicitly link back to earlier topics ("this is the same limit trick from §X, applied to..."), so knowledge forms a network, not a list.
- **Keep representation and explanation together.** Discuss a formula right where it appears; explain a figure in its caption or the adjacent sentence. Forcing the reader to hold a formula in mind while reading prose three blocks away is split attention — pure wasted load.
- **Introduce every symbol when a formula first appears.** A formula whose symbols aren't named is decoration. Read the formula aloud in prose at least once ("the derivative is the limit of the average rate of change as the window shrinks").
- **For a load-bearing formula, attach a `formula` block.** When a formula is central and a student would genuinely stumble on it, use a `formula` block (display formula + clickable `?` opening a dialog) and put the full intuition in its `explain`: a concrete analogy, then a piece-by-piece reading of every symbol, then a one-line "what the whole thing says". This keeps the main flow uncluttered while a reader who needs the unpacking can summon it on demand. Reserve it for formulas that carry their weight — don't decorate routine algebra with it.
- **Define terms at first use, in place.** Use tooltips for compact definitions so the reader never leaves the flow; use the same term for the same thing for the rest of the conspect — synonym variety is a cost, not a style.
- **No redundancy, no tangents.** Don't restate the same content in parallel forms (prose that merely transcribes an adjacent figure, history asides, "interestingly..."). Every sentence either advances the objective or goes.
- **Fade the scaffolding.** Be maximally explicit early in a topic and progressively terser as the reader gains footing; what was spelled out in step 1 can be assumed by step 4. Over-explaining to a reader who already gets it is itself a load (expertise reversal).
- **Simplify the path, not the claim.** Never replace the true statement with a comfortable approximation without flagging it. If you give a simplified version first, say it's provisional and state precisely how the full version differs when you reach it.

## Examples

- **Use worked examples for anything procedural** (computations, derivations, algorithms, proofs-as-method). Show *every* step, and annotate each with the reason it's taken — the why, not just the algebra. Studying annotated worked examples beats premature problem-solving for novices.
- **Give multiple examples with different surface features.** One example binds the idea to its packaging; two or three with varied dressing (different domains, numbers, notation) teach the deep structure and enable transfer.
- **Fade across examples.** First example fully worked; later examples partially worked ("completion problems") with the reader asked to supply the missing step — the bridge from reading to doing.
- **Pick examples concrete enough to grasp, generic enough to transfer.** Vivid-but-tangential examples are remembered instead of the concept; keep the example's structure aligned with the concept's structure.
- **Choose boundary examples deliberately.** One example near the edge of the definition (or a non-example) sharpens the concept more than three central ones.

## Self-check design

- **Test retrieval, not recognition.** Questions must make the reader pull the idea from memory or apply it — "compute", "explain why", "what breaks if". Avoid questions answerable by glancing one paragraph up or by pattern-matching the wording.
- **Always provide the answer** (collapsed). Unsuccessful retrieval without feedback teaches nothing; the answer should be a model answer, not just "yes".
- **Mix question types**: one conceptual "why", one application, and — where the topic has a classic trap — one question that walks into it.
- **Interleave backward.** Occasionally ask a question that requires an *earlier* topic combined with the current one. Spaced, mixed retrieval is what makes the material stick.
- **Place self-checks at real concept boundaries** — end of a topic or after a dense subtopic — and only where there is something worth retrieving. A reflexive quiz after every block trains the reader to skip them.

## Common-mistakes callouts (attention blocks)

- **Use the refutation structure**: (1) state the misconception in the reader's own likely words, (2) acknowledge why it's tempting, (3) show why it's wrong — ideally with a concrete counterexample, (4) state the correct conception. Explicit refutation beats merely stating the correct fact; readers don't overwrite beliefs that are never confronted.
- **Place the callout at the point of need** — right where the reader is about to make the error (the step in the derivation, the lookalike formula), not collected at the end.
- **Only real, attested pitfalls.** A pitfall is something learners of this subject actually get wrong (sign conventions, lookalike terms, illegal generalizations, off-by-one boundaries). Manufactured "be careful!" boxes train the reader to ignore the real ones.
- **Lookalikes deserve contrast.** When two concepts/notations are commonly confused, put them side by side and name the discriminating feature explicitly — don't just describe each in isolation.
