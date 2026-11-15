# Math Worlds

A math game for the kids, set in the Spelling Worlds worlds. It runs from 2nd to 12th grade. Live at https://yshi41.github.io/math-worlds/

## Concepts, not chapters

The game is a path through about 250 concepts. Each concept is one narrow idea or mental-math shortcut, for example
"add 9: add 10, take 1", "×25 is ×100 then ÷4", "squares ending in 5", "8% of 50 = 50% of 8", "slope is rise over run"
or "the power rule". Pattern recognition runs through every grade: skip counting, the hundred chart, growing patterns,
odd and even rules, square and triangular numbers, last-digit cycles, sequences, Pascal's triangle and finite differences.
The plan, with every concept's grade and strand, is in [docs/CONCEPTS.md](docs/CONCEPTS.md).

Every answer is typed on an on-screen keypad or a keyboard. The keypad only shows the extra keys a grade needs:
`.`, `/` and `−` come in from 4th to 6th grade, and `r` for remainders.

## Mastery

Each concept has three levels: easy, medium and hard. Three first-try answers in a row with no hint move up a level.
Three in a row at the hard level masters the concept, and the game moves on to the next concept on the path. Two misses
at a level move back down one. Mastered concepts come back for review after 1, 3, 9 and 27 days. A round is 10 problems,
and when concepts are due, two of those 10 are reviews.

The path goes grade by grade and takes the strands in turn. Within a strand each concept needs the one before it.
Some concepts also need one from another strand: making change needs counting up, and fractions of a number need
dividing. Any locked concept can be tested out of by getting 5 hard problems right in a row.

## Placement check

The first time a kid plays, a placement check runs a binary search in every strand that has concepts up to one grade
above the kid's grade. Each concept it tests asks a medium problem and a hard problem: both right moves up, a miss moves
down. The search starts near the kid's grade (Riley is in 3rd grade, Charlie in 4th). Concepts below where each
strand settles are marked mastered, with their reviews spread over the next week. A concept whose medium problem was
right but whose hard problem was missed starts at level 2. The check saves as it goes and can be redone from Settings.

## The coach

Every problem carries its worked shortcut (`how`), a break-down into smaller questions with the same numbers
(`steps`), and its likely wrong answers (`traps`). Each trap names the concept that mistake points to.

- First miss: try again, with a hint aimed at that mistake.
- Second miss: the answer and the worked shortcut, then the break-down steps.
- If the mistake points at a different concept the kid has already reached, that concept becomes a tricky spot,
  with two practice problems at the end of the round. Examples: a forgotten carry points at "Trade 10 ones for a ten",
  a sign slip at adding integers, and adding the bottoms of fractions at common denominators.
- On the hub, tricky spots keep a Practice button until 3 in a row are right. Missing a tricky spot's practice adds
  the concept one step back.
- General checks also catch answers 10 times too big or small, reversed digits, sign flips and carrying slips.

## Layout

- `index.html` is the built page; do not edit it by hand. `node build.js` rebuilds it from `src/`, plus the Spelling
  Worlds palettes, scenes and characters, which are read from the last commit of the sibling `spelling-worlds` repo.
- `src/core.js`: helpers, pictures, the concept registry, and how typed answers are read and checked.
- `src/concepts/*.js`: the concepts. Files are `a1` (number sense, adding, patterns to 5th grade), `a2` (times and
  dividing to 4th, time, money), `b` (fractions, decimals, percents, factors, shapes), `c` (algebra, data and chance)
  and `d` (shortcuts from 5th grade up, integers, later patterns, powers and logs, trig, calculus).
- `src/engine.js`: the path, mastery, review, placement and diagnosis. `src/game.js`: the page.
- `worker/`: the save service (Cloudflare Worker + D1, tables `mw_saves` and `mw_history` in the Spelling Worlds
  database). Saves are online only; nothing is kept in the browser. Two devices' saves merge, and a mastered concept
  is never lost. Deploy from `worker/` with wrangler and `CLOUDFLARE_API_TOKEN` set.
- `test/`:
  - `node concepts.test.js`: every concept at every level, many times over (answers typeable, no broken text, steps and traps well formed). `--show <id>` prints samples.
  - `node engine.test.js`: the path, mastery, placement and the coach.
  - `node logic.test.js`: the merge rules.
  - `node test.js ../index.html`: headless Chrome, against an in-memory stand-in for the save service.
