---
name: anki-flash-cards
description: Use when creating Anki flashcards from notes, screenshots, textbook passages, lecture slides, or any study material.
license: MIT
metadata:
  author: Ionnia
  version: "0.0.1"
---

# Anki Flash Cards

Approach this as a **teacher**, not a transcriber. You are helping a student build Anki flashcards to study from, so your goal is durable understanding — cards that, once reviewed over time, leave the student actually knowing the material. Before writing anything, read the source the way a teacher reads it: what is the main idea here, what are its parts, and where do students usually trip up? Let that understanding drive the cards.

## Decide what each card tests

The most common mistake is making cards **too granular** — shattering a coherent idea into so many trivial fragments that each card is meaningless on its own and the student memorizes words without grasping the concept. Aim for cards that are atomic _in what they test_ but still self-contained and meaningful.

When the user gives you a screenshot, a block of text, a slide, or any chunk of material, work through it like this:

1. **Capture the whole first.** If the material describes a concept that exists _as a whole_ — a definition, a process, a theorem, a mechanism — make one card for that concept as a whole. This is the card that proves the student understands the big picture, not just the pieces.
2. **Then go part by part.** Break the concept into its constituent parts (the steps of a process, the terms in a formula, the clauses of a definition, the items in a classification) and make a card for each part individually.
3. **For each part, do two things:**
   - **Define it** — a clear card that tests what the part is and what it does.
   - **Hunt for the tricky bit.** Ask yourself, as a teacher: what about this part is subtle, counter-intuitive, an exception, or _commonly misunderstood_? If there is one, capture it — either as its own dedicated card or as a second prompt on the same card. Don't invent difficulty where there is none, but where a real pitfall exists, a card that targets it is worth more than ten that restate the obvious.

A concept doesn't always have a meaningful "whole" — a flat list of unrelated vocabulary, for instance. Use judgment: make the whole-concept card only when there genuinely is a whole worth understanding.

## Write formulas in LaTeX

Put any mathematical or scientific notation in LaTeX so it renders in Anki via MathJax:

- **Inline** (within a sentence): `\( ... \)` — e.g. `the gradient \(\nabla f\) points uphill`
- **Block / display** (on its own line): `\[ ... \]` — e.g. `\[ E = mc^2 \]`

MathJax expects standard TeX; chemistry works via mhchem, e.g. `\(\ce{H2O}\)`. Cloze deletions interact with LaTeX braces — [references/cloze.md](references/cloze.md) covers the fix.

## Choose the note type

Every card is one of two Anki note types. Pick the one that matches how the fact is best recalled, then open the matching reference for how to write it well.

- **Basic** (`Front` / `Back`) — a standalone question and its answer. Use it when the fact is a discrete question → answer: a definition, a "why does X happen?", a comparison, a single fact. Your whole-concept cards usually go here. → [references/basic.md](references/basic.md)
- **Cloze** (fill in the blank) — a sentence with key pieces hidden, recalled in their surrounding context. Use it when the fact only makes sense embedded in its surroundings: steps in a process, items in a list, a term defined within a sentence. Ideal for the part-by-part cards. → [references/cloze.md](references/cloze.md)

## Adding cards to Anki

Never push cards into Anki on your own. Two gates must pass first.

1. **Present every card for acceptance.** Show the complete set to the user before adding anything — grouped by the concept it came from, whole-concept card first, with each card's note type and fields (`Front`/`Back` or `Text`/`Extra`) visible. Wait for explicit approval. Apply any edits or removals the user asks for, and add only the cards they accept.
2. **Confirm the exact destination deck.** Ask the user for the precise deck name (e.g. `Biology::Cell`, where `::` denotes a subdeck) — never guess or fall back to `Default`. If the deck might not exist yet, confirm with the user, then create it before adding.

Once both gates pass, add the cards:

- **Prefer an Anki MCP tool** if one is connected (e.g. `addNote` / `addNotes`). Pass the `deckName`, the `modelName` (`Basic` or `Cloze`), and the `fields`.
- **Otherwise use AnkiConnect over HTTP.** Anki must be running with the AnkiConnect add-on installed; it listens on `http://127.0.0.1:8765`. POST a JSON body — batch with `addNotes`:

```json
{
  "action": "addNotes",
  "version": 6,
  "params": {
    "notes": [
      {
        "deckName": "Biology::Cell",
        "modelName": "Basic",
        "fields": { "Front": "...", "Back": "..." },
        "tags": ["anki-flash-cards"]
      },
      {
        "deckName": "Biology::Cell",
        "modelName": "Cloze",
        "fields": { "Text": "... {{c1::...}} ...", "Extra": "..." }
      }
    ]
  }
}
```

Useful AnkiConnect actions: `deckNames` (list existing decks to confirm the target), `createDeck` (make a new one), `addNote` / `addNotes` (add). Every response is `{ "result": ..., "error": null }` — check `error` on each and report failures (duplicate notes, a missing note type, empty fields) back to the user rather than silently dropping cards.
