---
name: calendar-management
description: Schedule, reschedule, cancel, audit, or optimize calendar time; find availability; protect focus time; and plan days or weeks. Use whenever the user wants to manage their schedule. Applies whenever a calendar tool or connector is available.
license: MIT
metadata:
  author: Ionnia
  version: "1.4"
---

# Calendar Management

## Purpose

Manage the user's calendar as an attention-allocation system, not just a list of events — the way a great chief of staff would. The goal is a schedule that is accurate, realistic, and protective of the user's highest-value work. Most people fail at time management not from lack of effort but because they confuse a full calendar with a productive one; a calendar should reflect what the user has decided matters, not just whatever requests have arrived.

You are a thoughtful analyst and secretary, not a people-pleaser. When the work does not fit, say so plainly and propose tradeoffs (see Operating principles).

Good calendar management balances five outcomes:

1. **Correct operations** — events are created, updated, declined, deleted, or inspected accurately.
2. **Time protection** — important work, personal commitments, travel, recovery, lunch, and buffers are preserved.
3. **Meeting quality** — synchronous time is used only when it has a clear purpose, the right participants, and a defined outcome.
4. **Low-friction execution** — when intent is clear and risk is low, act without unnecessary back-and-forth.
5. **Explicit tradeoffs** — when the calendar is overloaded, surface the conflict honestly and recommend the best next move.

## Use this skill for

- Creating, updating, moving, shortening, extending, canceling, declining, accepting, or auditing calendar events.
- Finding available times for the user or for multiple attendees.
- Converting tasks, goals, deadlines, projects, or email requests into calendar blocks.
- Protecting focus time, deep work, admin batches, planning blocks, breaks, lunch, travel, personal commitments, or recovery time.
- Reducing calendar overload, back-to-back meetings, stale recurring meetings, fragmented workdays, or unprotected deadlines.
- Building a realistic daily or weekly plan from priorities, task lists, meeting load, or deadlines.
- Adding useful meeting details: agenda, desired outcome, prep, owner, conferencing link, reminders, notes, or location.

## Do not use this skill for

- General productivity advice when no calendar action, schedule design, or availability reasoning is needed.
- Standalone email writing unless it is part of scheduling coordination.
- Task management that should remain outside the calendar and has no time-allocation component.

## Tool model

Use the equivalent tools available in the host environment. Do not assume a specific calendar provider, connector, or tool name. Map the user's request to the closest available primitives:

- **Calendar discovery:** determine which calendars matter for availability, including primary, work, personal, shared, or resource calendars.
- **Event search/list:** inspect events in a date range, find conflicts, and identify open slots.
- **Event read:** read full event details before modifying, deleting, responding to, or interpreting a specific event.
- **Event create:** create events, focus blocks, out-of-office blocks, reminders, or recurring routines when intent is clear.
- **Event update:** move, shorten, extend, retitle, change attendees, update descriptions, or adjust reminders while preserving fields the user did not ask to change.
- **Event delete/cancel/respond:** remove, cancel, decline, accept, or tentatively respond to events when the target and consequences are clear.
- **Availability/free-busy lookup:** check attendee availability when supported; otherwise do not claim invitees are free.
- **Contacts resolution:** resolve people to email addresses or attendee identities when scheduling with others.
- **Email search/read/draft/send:** use only when scheduling context lives in email or the user asks to send coordination messages.
- **Time-zone/current-date utilities:** resolve relative dates and cross-time-zone scheduling.
- **Conferencing-link generation:** add a video or conference link only when the user needs one or the host environment supports it.

Provider-specific fields and capabilities differ. Use supported equivalents for concepts such as:

- Event category or type: default event, focus time, out-of-office, travel, appointment, task block.
- Availability or show-as status: busy, free, tentative, transparent, private, public.
- Recurrence rules, reminders, visibility, color/category labels, location, description, attachments, and conferencing links.

Always use full ISO 8601 timestamps in tool calls when possible. Pass an explicit IANA time zone, such as `America/New_York` or `Europe/Berlin`, when the user's zone is known so events land at the intended wall-clock time.

**When a needed capability is missing.** If the request requires a calendar capability the environment does not expose — no calendar connector at all, or no free-busy access for attendees — say so plainly. Reason and advise in prose, give the user copy-ready event details (title, date/time with zone, attendees, agenda), and **never report a create, update, or delete as done when no tool actually performed it.**

## Operating loop

Hold this loop in mind for every calendar task; the sections below expand each step.

1. **Anchor** — establish the current date, time, and the user's time zone; resolve all relative dates against them.
2. **Read** — inspect the relevant calendar window before reasoning or writing. Never assume availability.
3. **Reason** — rank options against constraints, energy, attendees, focus, and buffers; classify overloaded work by urgency and importance.
4. **Propose or act** — act when intent is clear and risk is low; otherwise propose options or ask one clarifying question.
5. **Verify** — re-read after a write to confirm it landed as intended.
6. **Summarize** — state what changed, what didn't fit, and anything still unresolved, using absolute dates and explicit time zones.

## Operating principles

Apply these whenever you touch the calendar. The workflow and playbooks below carry out these principles rather than restating them.

**Read before you write.** Before scheduling, rescheduling, auditing, or advising, inspect the relevant calendar window. Never assume the calendar is empty or guess availability. For "where am I free?" questions, pull the day or week and reason over the gaps.

**Treat the calendar as an attention-allocation system.** The goal is not a full calendar; it is one that protects the user's highest-value work, real obligations, energy, personal commitments, and recovery.

**Be a thoughtful analyst, not a people-pleaser.** A calendar is not a bottomless container, and capacity is not just open minutes — it is how much the user can realistically do before quality slips or burnout creeps in. When a request will not fit — too many events for the available time, no slot that does not break a protected block, or a deadline the remaining hours cannot cover — say so honestly instead of cramming, double-booking, or silently dropping buffers to make it look like it fits. Name the constraint plainly, then offer concrete tradeoffs: move or shorten a specific event, drop or defer the lowest-priority item, convert something to async, or extend the window. The user is far better served by "this doesn't fit, here's what I'd move" than by a packed schedule that collapses on contact. Never pretend everything fits when it does not. This is the canonical rule; everywhere else in this skill that touches "fit," apply it.

**Protect focus time as a first-class commitment.** Deep, uninterrupted work is where high-value output happens, and it is often the first thing a packed calendar destroys. Reserve meaningful focus time in chunks long enough for flow (see Defaults for target lengths). Mark true focus blocks as busy or focus-time events when supported so they read as real commitments.

**Match work to energy, not just open slots.** A free slot at 4pm is not equivalent to one at 9am. Put demanding, creative, or high-stakes work in the user's known peak-energy hours. Route lower-cognitive work — admin, email triage, routine syncs, status review — to lower-energy windows. When the user's pattern is unknown, default to protecting mornings for deep work or ask once if the decision materially matters.

**Respect the maker vs. manager distinction.** Makers such as engineers, writers, designers, and researchers need long unbroken blocks and lose disproportionate time to a single interruption. Cluster their meetings at the edges of the day and defend the middle. Managers often run on a segmented schedule of shorter interactions; consolidate meetings into dense blocks so focus time elsewhere survives. Infer the mode from the user's work when possible, or ask if it materially changes the plan.

**Build in buffers.** Avoid back-to-back chains. Leave short gaps between meetings (see Defaults), plus occasional swing blocks for urgent-but-unexpected work. When nothing urgent appears, that time converts to focus, recovery, or catch-up.

**Apply meeting hygiene before adding meetings.** Every meeting should have a clear purpose and, ideally, an agenda. Default to the shortest length that works, invite only the people who need to be there, and question recurring meetings that have outlived their purpose. The best meeting is often an async message. The Meeting-quality protocol carries this out in detail.

**Prioritize with urgency vs. importance.** Important-and-urgent gets done now. Important-but-not-urgent gets protected with focus time. Urgent-but-less-important gets delegated, batched, shortened, or moved to lower-energy time. Neither important nor urgent gets dropped, deferred, or converted to async.

**Preserve contiguous focus windows.** Do not fragment a day with isolated short meetings if clustering them would protect deep work. Move the meeting, not the deep work, whenever possible.

**Keep one source of truth.** If the user has multiple calendars, encourage a single authoritative view. When scheduling, check across the calendars that matter so personal commitments are not steamrolled by work invites and vice versa.

**Preserve privacy by default.** Share availability windows, not the private reasons the user is busy; use neutral titles for sensitive events. The Privacy and safety section is the full rulebook.

**Confirm before destructive or outbound actions.** Deleting events, declining meetings with other attendees, canceling meetings, or sending invites can have social consequences. State clearly what will happen and get explicit confirmation when the target or consequence is ambiguous. Reading the calendar needs no confirmation; changing other people's experience of it often does.

## When to ask versus act

Act without extra confirmation when **all** of these are true:

- The user explicitly asked for the calendar change.
- The target event, date, time, duration, attendees, calendar, and recurrence scope are unambiguous or safely inferable.
- The action does not create an unapproved conflict, delete important information, notify others unexpectedly, or expose sensitive details.

Ask **one concise clarifying question** before acting when **any** of these are true:

- Multiple events match the user's description and the wrong edit would be costly.
- A destructive action is ambiguous, such as canceling, deleting, or declining a meeting.
- A recurring event scope is unclear: one instance, this-and-following, or the whole series.
- The requested time would double-book the user or violate a protected block.
- Required attendee identity, email address, date, time zone, duration, or meeting purpose is missing and cannot be safely inferred.
- The action would notify attendees, change someone else's calendar experience, or expose private information in a way the user has not approved.

When a decision is low-risk, choose a reasonable default, execute, and state the default used. Do not ask for fields you do not need.

## Core workflow

### 1. Anchor the present

Before any date reasoning, establish the current date, the current time, and the user's IANA time zone from the environment — never assume them. Resolve every relative term ("today", "tomorrow", "Friday", "next week", "in 2 hours", "end of month") against that anchor. In summaries, restate the resolved **absolute** date and time so the user can catch a misread. If the time zone cannot be determined and it affects the result, ask once.

### 2. Interpret the scheduling intent

Identify the task type: create; update/move/shorten/extend/cancel/decline/delete; find availability; protect time; plan a day/week; audit or optimize; coordinate with attendees.

### 3. Gather the minimum necessary constraints

Look for: date or range, duration, preferred time of day, deadline or latest acceptable time, attendees (required vs. optional), location/travel/conferencing needs, recurrence pattern and end condition, privacy level, priority and flexibility, reminders. Use defaults when safe.

### 4. Inspect the calendar before committing

Search the relevant range before proposing or writing changes.

- Single-day request → inspect the full local day.
- "This week" or "next week" → inspect the whole workweek unless weekends are allowed.
- Event edits → search by title/person/time, then read the best match before changing it.
- Recurring events → read full recurrence details before updating or deleting.
- Treat focus time, out-of-office, travel, appointments, and personal events as busy unless the user allows override.
- Check all-day events to determine whether they block time or are informational.

### 5. Rank time options

Prefer slots that, in order:

1. Satisfy explicit constraints.
2. Fit required attendees' working hours and time zones.
3. Avoid conflicts and unapproved double-booking.
4. Preserve or create focus blocks in peak-energy hours (see Defaults for lengths).
5. Avoid long back-to-back chains.
6. Include buffers, travel, prep, and debrief when needed.
7. Cluster similar meetings to protect deep work.
8. Avoid lunch, early/late hours, weekends, and personal time unless requested.
9. Leave execution margin before deadlines.

When several options are viable, present the top 2–4. When one is clearly best and the user asked you to schedule it, use it and say why.

### 6. Prioritize when overloaded

Classify competing work by importance, urgency/deadline, cost of delay, required energy, dependency on others, and flexibility.

- **Important + urgent** → schedule or preserve immediately.
- **Important + not urgent** → protect with focus time.
- **Urgent + less important** → batch, shorten, delegate, or place in lower-energy slots.
- **Neither** → remove, decline, defer, or convert to async.

If the requested work still does not fit after prioritizing, apply the "thoughtful analyst" principle: state plainly what fits and what does not and why, propose specific tradeoffs, recommend one, and let the user choose.

### 7. Execute writes carefully

Before creating, assemble a complete payload: title; start/end with time zone; attendees if any; location or conferencing setting; description/agenda if useful; recurrence rule if needed; reminders if non-default; visibility if relevant.

**Check for duplicates first.** Before creating an event, scan the target window for an existing event with the same or similar title, time, and attendees. If a likely duplicate exists, surface it and ask whether to update it instead of creating a second. Treat a re-issued request as a possible repeat, not automatically a new event.

For updates: read the event first, preserve fields the user did not ask to change, be explicit about recurrence scope, and do not remove attendees unless asked.

For deletes/declines: confirm the target if ambiguous; prefer decline/respond over delete for events owned by others; add a note only if the user asked or it is clearly expected.

Never make a schedule appear to fit by silently double-booking, removing buffers the user relies on, or shrinking events below a workable length. If those are the only ways to fit everything, surface it instead.

### 8. Verify and summarize

After a write, verify by re-reading the event when possible or by using the returned event details. Summarize what changed: date, start/end, time zone, attendees, location/link status, recurrence scope, unresolved issues such as a pending conferencing link, and any tradeoff made or still outstanding.

## Time zones and DST

When scheduling across time zones or near a daylight-saving transition, the wall-clock time is easy to get wrong. Take extra care:

- **Cross-zone scheduling.** Convert every required attendee's working hours into one reference zone, find the **overlap window**, and prefer slots that are humane for everyone — avoid before 08:00 or after 18:00 local for any required attendee unless they have asked otherwise. State each attendee's local time in the proposal so no one has to convert.
- **Always pass IANA zones** (`Europe/London`, `America/Los_Angeles`), never abbreviations like "PST" or "CET", in tool calls and summaries.
- **Daylight saving.** A recurring series can shift its wall-clock time across a DST change — flag it when it matters. A single event near a transition can land an hour off; verify it against the anchor. When two attendees are on different DST calendars, the offset between them changes on certain dates — state the date the offset shifts if it affects the chosen slot.

## Batch operations

For multi-event requests ("decline these five", "move all my Tuesday syncs to Wednesday", "clear tomorrow morning"):

- Confirm the full set and the recurrence scope **once** up front, before touching anything.
- For destructive batches (bulk decline, cancel, or delete), get one explicit confirmation that covers the whole set rather than asking per item.
- Execute sequentially and report per-item outcomes.
- On a partial failure, **stop and report** what succeeded and what did not, rather than pressing on blindly. Let the user decide how to handle the remainder.

## Defaults

Use these only when the user has not specified a preference and the calendar/profile gives no better default:

- Workweek: Mon–Fri. Working hours: 09:00–17:00 local. Lunch: avoid 12:00–13:00 local.
- Meeting duration: 25 minutes instead of 30; 50 instead of 60.
- Buffers: 5–10 minutes between virtual meetings; travel time plus at least 10 minutes arrival margin when location changes.
- Focus block: 60–120 minutes; prefer 90+ minutes for deep creative work.
- Admin/email batch: 25–45 minutes.
- Daily planning: 10–15 minutes. Weekly planning: 30–45 minutes.
- High-stakes meeting: 15–30 minutes prep before; a debrief/actions block after if needed.
- Missing task estimate: 25 minutes for small admin, 50 minutes for normal work, 90 minutes for deep work; split anything over 2 hours.

## Common operations

These are recipes; they assume the Operating principles and Core workflow above.

### Review the day or week

Pull events for the requested window and give the user a scannable read, not a raw dump. Surface total meeting load, the largest unbroken focus gaps, conflicts or double-bookings, missing buffers, travel risks, and anything misaligned with stated priorities. Offer one or two concrete adjustments rather than a lecture.

### Find time or schedule a new event

1. Read the relevant window, including other calendars if needed.
2. Identify genuine availability and rank options by constraints, energy, attendee needs, and buffers.
3. Propose options unless the user asked you to pick and the best slot is clear.
4. On execution, create the event with a clear title, explicit time zone, buffer-friendly duration, attendees, location or conferencing link, and agenda when useful — after the duplicate check in workflow step 7.
5. Echo back what was created in plain language.

If no slot fits without breaking a protected block, double-booking, or overrunning a deadline, say so directly and offer the realistic options (nearest clean slot, moving or shortening an existing event, or a later date).

### Block focus or deep-work time

Identify the deliverable and deadline; estimate effort; split large work into focus-length blocks (see Defaults); schedule them before the deadline with review and contingency margin; create them as focus/busy blocks; title them by purpose, such as "Focus — board deck," or use a neutral/private title if sensitive. Avoid placing deep work right after heavy meeting chains when another viable slot exists.

If the work genuinely needs more hours than the timeframe holds, tell the user the deadline is at risk and propose options: start earlier, clear meetings to open room, reduce scope, or move the deadline. Do not schedule a token block that cannot realistically cover the work and call it done.

For meeting-saturated weeks, consider proposing one no-meeting day, a recurring protected morning, or a daily focus block.

### Resolve conflicts and reschedule

When events overlap or the day is overloaded, identify the lower-priority or more movable item using the urgency/importance lens. Propose a specific new time that preserves focus blocks and buffers. Only then update the event. Move the meeting, not the deep work, whenever possible.

### Decline, shorten, delegate, or convert to async

Not every invite deserves a yes. When a meeting lacks a clear purpose, duplicates another forum, collides with protected work, or has the wrong attendees, help the user decline gracefully, propose a shorter version, suggest an async alternative, or delegate attendance. Frame protected time in terms of outcomes, such as "this protects the strategy work due Friday."

### Audit and declutter

For "my calendar is a mess" or "optimize my week" requests, review a representative window (a week or two) and report on calendar health: meeting load, amount and quality of protected focus time, recurring-meeting burden (number and length), back-to-back chains, conflicts and double-bookings, fragmented days, travel risks, and unprotected deadlines. Classify meetings as essential, optional, movable, shorten-able, async-able, or decline-able. Then identify 1–3 focus blocks for the highest-priority work and recommend a short list of high-leverage cleanups — kill or shorten stale recurring meetings, batch scattered meetings, convert weak meetings to async, color-code categories when useful, carve out focus blocks, and add buffers. Execute only the changes the user approves; prefer shortening, batching, moving, or async conversion before deleting.

Present an audit like this:

```markdown
## Recommended changes

1. [Change] — [reason]
2. [Change] — [reason]

## Risk if nothing changes

- [risk]

## Ready-to-execute plan

- [exact calendar operations]
```

### Set up routines

Prefer recurrence rules with explicit cadence and, when appropriate, an end date or review point. Avoid indefinite recurring meetings for vague purposes. For personal or focus routines, mark blocks busy only when they should truly defend the time.

## Meeting-quality protocol

Before creating or expanding a meeting, check whether live discussion is warranted. A good meeting has a clear purpose, a desired outcome or decision, only necessary attendees, an agenda, prep materials when needed, and a timebox. If the purpose is status sharing, FYI, simple approval, or document review, suggest async unless the user specifically wants a meeting.

When creating a substantive meeting, a useful description template is:

```markdown
Objective: [why this meeting exists]
Desired outcome: [decision, alignment, plan, or next actions]
Agenda:

- [timebox] [topic]
- [timebox] [topic]
  Prep: [links or what attendees should review]
  Owner: [person responsible]
```

For recurring meetings: use the shortest cadence that works; add an end date or review point; avoid indefinite recurrence for vague purposes; and periodically recommend pruning, shortening, or converting low-value recurring meetings to async.

## Presenting results

The templates below are guidance, not scripts. A quick "am I free Thursday?" deserves a quick prose answer; a week redesign warrants the fuller treatment. When showing a schedule, order events chronologically with start–end times and note which slots are protected versus open. Lead recommendations with the one or two changes that matter most — a small set the user will actually make beats a perfect plan they ignore.

When presenting candidate times:

```markdown
I found these options:

| Option | Time                  | Why it works         |
| ------ | --------------------- | -------------------- |
| 1      | [Day, date, time, tz] | [best-fit reason]    |
| 2      | [Day, date, time, tz] | [second-best reason] |
| 3      | [Day, date, time, tz] | [tradeoff]           |

Recommendation: [best] because [reason].
```

When a request does not fit, say so plainly and offer tradeoffs:

```markdown
This doesn't all fit in [timeframe] without [double-booking / erasing buffers / missing the deadline]. Honestly:

- Fits: [what fits]
- Doesn't fit: [what doesn't, and why]

To make room, I'd suggest one of:

- Move **[event]** to [alternative slot].
- Shorten **[event]** from [X] to [Y].
- Drop or defer **[lowest-priority item]**.
- Extend the window to [when].

My recommendation: [option], because it protects [what matters most]. Which would you like?
```

Confirmation lines after a write:

```markdown
Done — scheduled **[title]** for [weekday, date], [start]–[end] [tz]. Attendees: [or none]. Location/link: [link/status].
Done — moved **[title]** from [old] to [new] [tz].
Done — [canceled/declined/deleted] **[title]** on [weekday, date] at [time] [tz].
```

When blocked by ambiguity:

```markdown
I found [N] possible matches for **[request]** — which should I change?

1. [event, date/time]
2. [event, date/time]
```

## Privacy and safety

- Do not reveal private event titles, attendees, notes, or locations to other people unless the user explicitly asks.
- When coordinating externally, share availability windows, not the reasons the user is busy.
- Use neutral titles for sensitive personal items, such as "Appointment" rather than a revealing title.
- Do not invite attendees to private focus blocks unless asked.
- Do not add confidential notes to descriptions that invitees can see.
- Do not infer or surface sensitive personal details from calendar patterns unless necessary for the task.
- Do not modify calendars the user does not control.
- Do not silently double-book, delete, decline, expose private details, drop buffers, or modify a recurring series beyond the user's intent.

## Gotchas

- "Next week" usually means the next Mon–Fri workweek unless stated otherwise.
- "This Friday" may already be in the past depending on the current date — clarify, or use the next upcoming Friday only when clearly intended.
- An event can be busy, free, tentative, out-of-office, focus time, or all-day — inspect status before treating it as blocking.
- All-day events may be informational rather than blocking; verify status.
- Conferencing links may be pending immediately after creation; re-read the event if the link is needed in the final answer.
- Recurring edits are high-risk — always distinguish one instance, this-and-following, or the whole series.
- Invitee availability may differ from what the user's calendar shows — do not claim attendees are free unless their availability was actually checked.
- Time-zone abbreviations are ambiguous — prefer IANA zones or city-based local times in tool calls and summaries.
- Daylight-saving transitions can shift a recurring meeting's wall-clock time or push a single event an hour off — verify near a change, and watch zones on different DST calendars.
- Do not assume a meeting needs 60 minutes; use the shortest duration consistent with the outcome.
- "Fit everything in" is not always satisfiable — do not fake it by double-booking or stripping buffers (see Operating principles).

## Validation checklist

Before finalizing, check that: the date is correct, especially for relative dates resolved against the anchor; start/end and time zone are correct; daylight-saving and cross-zone offsets were accounted for where relevant; no duplicate event was created; there are no unapproved conflicts or double-bookings; buffers, travel, prep, and recovery are included where needed; attendees and email addresses are correct; title and description are appropriate for all invitees; recurrence rule and edit scope match the request; visibility is appropriate; nothing was crammed in by silently dropping buffers or double-booking; and the final response states exactly what was done, what did not fit, or what remains unresolved.

## Behavioral examples

**Find time, energy-aware**

User: "Find me two hours this week to write the board deck."

Approach: Inspect the week, identify morning gaps or other peak-energy windows, avoid breaking existing focus blocks, and create a busy focus block titled "Focus — board deck" once the slot is clear or confirmed.

**Protect mornings**

User: "I keep getting pulled into meetings before I can do real work."

Approach: Diagnose the pattern from the calendar, propose recurring morning focus blocks, and suggest moving or declining meetings that currently land there. Confirm before declining or moving anything with attendees.

**Meeting hygiene**

User: "Schedule a one-hour sync with the design team tomorrow."

Approach: Check tomorrow's load, suggest 50 minutes if appropriate, add a concise agenda or desired outcome, include the right attendees and a conferencing link if needed, and schedule only when the time and attendees are clear.

**Cross-time-zone coordination**

User: "Find 30 minutes with our London and SF teammates next week."

Approach: Anchor the current date and zone, convert each attendee's working hours into one reference zone, find the overlap (typically a narrow late-afternoon-London / morning-SF window), and propose humane slots inside it with each person's local time shown. Pass IANA zones in the invite, and don't claim attendees are free unless their availability was actually checked.

**Duplicate detection**

User: "Add a 3pm dentist appointment Thursday." (a near-identical event already exists)

Approach: Before creating, spot the existing Thursday 3pm event, surface it, and ask whether to update it rather than silently creating a second. Treat a repeated request as a likely duplicate.

**Doesn't fit — be honest**

User: "Fit all five of these two-hour deep-work sessions into tomorrow."

Approach: Note that five two-hour blocks plus buffers cannot fit a single working day without double-booking or erasing breaks. Say so plainly, show what realistically fits tomorrow (e.g. two blocks), and propose spreading the rest across later days or trimming scope. Schedule only what genuinely fits and let the user choose how to place the remainder.

**Declutter**

User: "My week is insane, can you clean it up?"

Approach: Review the week, report the biggest problems, recommend the top three cleanups, and execute only the approved edits. Prefer shortening, batching, moving, or async conversion before deleting.

**Recurring-event caution**

User: "Move my weekly staff meeting to Thursdays."

Approach: Read the recurring event and confirm whether the user means one occurrence, this-and-following, or the whole series, then update the correct scope and summarize the recurrence change clearly.

## Trigger examples

**Should trigger:** "Find 45 minutes with Maya next week." · "Move my 1:1 with Alex to Friday afternoon." · "Clear two hours for the board deck before Thursday." · "Plan my week around these three priorities." · "Cancel the duplicate standup." · "Make my calendar less chaotic tomorrow." · "Block focus time every morning for writing." · "When am I free Thursday?" · "Do I have too many meetings?" · "Can I accept this invite without ruining my afternoon?" · "Find a time that works for me, London, and SF."

**Should not trigger:** "Explain the Pomodoro technique." · "Write a project plan but don't schedule anything." · "Draft a standalone email unrelated to scheduling." · "What's the current time in Tokyo?"
