# Basic note type (front / back)

SKILL.md covers _when_ to reach for Basic over Cloze — this reference is about writing the card well once you've chosen it.

## How it works

A **Basic** note has two fields and produces one card:

| Field   | Holds                 | Shown         |
| ------- | --------------------- | ------------- |
| `Front` | The prompt / question | Question side |
| `Back`  | The answer            | Answer side   |

The card asks the `Front`, the student recalls, then flips to check against the `Back`.

## Writing good cards

- **One thing per card.** The front should have a single, unambiguous answer. If the back is a list of five things, that's usually five cards (or a Cloze).
- **Make the front a real question.** "Photosynthesis" is a topic, not a prompt. "What is photosynthesis?" or "What are the inputs and outputs of photosynthesis?" forces recall.
- **Keep the back minimal.** Put exactly what's being tested. Supporting detail, mnemonics, or the "why" can go on the back _below_ the answer, separated clearly — but don't bury the answer.
- **Put the tricky bit on the back.** When a part has a common misconception or exception, add it as a second prompt on the back, e.g.:
  - Front: `What does the volatile keyword guarantee in Java?`
  - Back: `Visibility of writes across threads (reads/writes go to main memory). — Common pitfall: it does NOT provide atomicity for compound operations like i++.`
- **Avoid yes/no fronts.** "Is HTTP stateless?" is a coin flip; "Why is HTTP described as stateless?" forces real recall.

## Examples

**Whole concept**

- Front: `What is the CAP theorem?`
- Back: `A distributed data store can provide at most two of: Consistency, Availability, Partition tolerance — simultaneously.`

**A part + its tricky point on one card**

- Front: `In CAP, what does "Partition tolerance" mean, and why is it effectively non-optional?`
- Back: `The system keeps working despite dropped/delayed messages between nodes. It's non-optional because network partitions will happen, so real systems really choose between C and A during a partition.`

**Definition with math**

- Front: `What is the derivative of \(f(x)\) by definition?`
- Back: `\[ f'(x) = \lim_{h \to 0} \frac{f(x+h) - f(x)}{h} \]`
