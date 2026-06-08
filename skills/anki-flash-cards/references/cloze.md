# Cloze note type (fill in the blank)

SKILL.md covers _when_ to reach for Cloze over Basic — this reference is about writing the card well once you've chosen it.

## How it works

A **Cloze** note hides parts of a sentence so the student recalls them in context. Default fields:

| Field   | Holds                                          | Shown                                              |
| ------- | ---------------------------------------------- | -------------------------------------------------- |
| `Text`  | The sentence/passage with `{{c...}}` deletions | Both sides (deleted bits hidden on the front)      |
| `Extra` | Optional explanation / mnemonic / source       | Answer side only                                   |

Wrap the text to hide in `{{c1::...}}`:

```
Canberra was founded in {{c1::1913}}.
```

### Multiple deletions → multiple cards

Different numbers generate separate cards from one note:

```
{{c2::Canberra}} was founded in {{c1::1913}}.
```

→ card 1 hides the year, card 2 hides the city.

### Same number → one card, revealed together

Reuse a number to hide several pieces on a single card:

```
The mitochondrion produces {{c1::ATP}} via {{c1::oxidative phosphorylation}}.
```

### Hints

Add `::hint` and Anki shows the hint in place of the blank:

```
{{c1::Canberra::Australian city}} was founded in 1913.
```

The front shows `[Australian city] was founded in 1913.`

### Math and the `}}` caveat

LaTeX/MathJax works inside `Text` and `Extra` (inline `\( ... \)`, block `\[ ... \]`). A LaTeX expression ending in `}}` placed right before a cloze's closing `}}` confuses the parser — put a space between them:

```
{{c1::\( \frac{a}{b} \) }}      ← note the space before the closing braces
```

## Writing good cards

- **Keep enough context to cue recall, but don't give the answer away.** The visible part of the sentence should jog memory, not spell out the blank.
- **Don't over-delete.** A sentence that's mostly blanks tests nothing. Hide the load-bearing word(s), not every other word.
- **One idea per number.** Hiding two unrelated facts? Give them different numbers so they become separate cards.
- **Use `Extra` for the tricky bit.** A common misconception, exception, or "why" goes in `Extra` — it shows only on the answer side, reinforcing understanding without leaking it onto the front.
- **Prefer a hint over rewording.** If a blank is too hard, add `::hint` rather than padding the sentence with give-away context.

## Examples

**Enumeration — one note, several cards**

```
Text:  The OSI model layers are {{c1::Physical}}, {{c2::Data Link}}, {{c3::Network}},
       {{c4::Transport}}, {{c5::Session}}, {{c6::Presentation}}, {{c7::Application}}.
```

**Definition in context, with the pitfall in `Extra`**

```
Text:  A {{c1::pure function}} returns the same output for the same input and has no side effects.
Extra: Reading a global constant is fine; reading mutable global state or doing I/O makes it impure.
```

**Math inside a deletion**

```
Text:  The area of a circle is {{c1::\( \pi r^2 \) }} .
Extra: \(r\) is the radius; circumference is \( 2\pi r \).
```
