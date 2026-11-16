# Math Worlds

A math game for the kids, set in the Spelling Worlds worlds. It runs from 2nd to 12th grade. Live at https://yshi41.github.io/math-worlds/

## Concepts, not chapters

The game is a path through 448 concepts. Each concept is one narrow idea or mental-math shortcut, for example
"add 9: add 10, take 1", "×25 is ×100 then ÷4", "squares ending in 5", "8% of 50 = 50% of 8", "slope is rise over run"
or "the power rule". Pattern recognition runs through every grade: skip counting, the hundred chart, growing patterns,
odd and even rules, square and triangular numbers, last-digit cycles, sequences, Pascal's triangle and finite differences.
The plan, with every concept's grade and strand, is in [docs/CONCEPTS.md](docs/CONCEPTS.md).

Every answer is typed on an on-screen keypad or a keyboard. The keypad only shows the extra keys a grade needs:
`.`, `/` and `−` come in from 4th to 6th grade, and `r` for remainders.

## Common Core, plus extras

Every concept is mapped to the Common Core math standards it practises, at the grade where Common Core puts it
(high school by course: Algebra 1 = 9, Geometry = 10, Algebra 2 = 11, Precalculus = 12). Every standard a
typed-answer game can practise, from grade 2 through the advanced (+) high school standards, has at least one concept.
Standards that need drawing, constructing, proofs or explaining are listed as pencil-and-paper or conversation work.
[docs/STANDARDS.md](docs/STANDARDS.md) lists every standard with its concepts; `node test/standards.test.js --strict --write`
checks the coverage and regenerates it.

On top of that, 64 extras go beyond the Common Core: mental shortcuts such as 43 × 47 = 2021, ×125, squares near 50,
cube roots from the last digit, casting out nines and the 142857 cycle, plus patterns like Fibonacci and last-digit
cycles. Extras are marked ★ on the map and their pages. They sit on the path and need what comes before them, but a
Common Core concept never waits on an extra, and the placement check only tests Common Core concepts.

## Mastery

Each concept has three levels: easy, medium and hard. Three first-try answers in a row with no hint move up a level.
Three in a row at the hard level masters the concept, and the game moves on to the next concept on the path. Two misses
at a level move back down one. A round is 10 problems on one concept. The path never moves past a concept until it is
mastered.

## Practice blocks

Practice comes in blocks planned at about 20 minutes. A block is a number of problems (6 to 40), set when it starts
(`COACH.blockGoal`): 20 minutes divided by how long one problem on her current concept takes an average kid (about
45 s in her head, 100 s on paper, 115 s for a word problem), times her pace. No clock ever ends a block: each round is
sized to the problems left (4 to 10), and the block ends with the round that finishes them, with a summary that says
how big the next block will be. Another block can be started from the map. The block lives in the online save.

Her pace is the time a finished block really took (answering, at most 4 minutes a problem, plus help lessons) over an
average kid's time for the same problems, folded half-and-half into her running pace (`COACH.blockPace`). So a block
that ran long, because the concept was hard or she needed break-downs, hints or a help lesson, makes the next block
smaller, a fast one makes it bigger, and a harder concept (written methods, word problems) gets fewer problems. Finished
blocks are kept in `bhist` for the parent view.

What the block does next depends on how the kid is doing:

- A memory check at the start of each block (3 due concepts, 4 when 6 or more are due) and a short one (2) after each
  concept is mastered, at most 6 concepts a block and none when fewer than 6 problems are left.
- When she is struggling with the concept she is learning (under 60% right after 8 tries, or she dropped a level), the
  concepts it is built on are checked, even before they are due (each at most every 3 days).
- Levels, tricky spots, break-downs and help lessons adapt within each round, as below.

## Memory checks

Every mastered concept is checked again 1, 3, 9, 27 and 81 days after it is mastered (or 1 to 7 days after the
placement check marks it mastered). A check is two problems per concept, medium then hard, mixed with the other
concepts being checked, with no hints and no feedback until the end, like an assessment. Both right: it held, and the
next check waits three times as long. One right: wobbly, checked again tomorrow; wobbly twice counts as slipped. None
right: slipped. A slipped concept stops counting as mastered (the parent report and grade level drop with it), goes back
on the path ahead of anything new, opens on its lesson again, and has to be mastered again from the medium level (or
the easy level if both were wrong). In the save it keeps `m` (first mastered, which the save service never drops) and
gets `lx` (when it slipped); mastering it again clears `lx` and sets `rm`.

The path goes grade by grade and takes the strands in turn. Within a strand each concept needs the one before it.
Some concepts also need one from another strand: making change needs counting up, and fractions of a number need
dividing. Any locked concept can be tested out of by getting 5 hard problems right in a row.

## Placement check

The first time a kid plays, a placement check runs a binary search in every strand that has concepts up to one grade
above the kid's grade. Each concept it tests asks a medium problem and a hard problem: both right moves up, a miss moves
down. The search starts near the kid's grade (Riley is in 3rd grade, Charlie in 4th). Concepts below where each
strand settles are marked mastered, with their reviews spread over the next week. A concept whose medium problem was
right but whose hard problem was missed starts at level 2. The check saves as it goes and can be redone from Settings.

The placement check and the assessments a parent starts never say right or wrong as they go. Every answer gets the
same tick, the same "Answer saved." note and the same short pause, the character stays neutral, and the treat counter is
hidden so it can't give the answer away. How many were right, and the treats earned, show on the results at the end of
each block. (Test-outs are practice, not assessments: they answer right away.)

An assessment is not limited to 20 minutes. It comes in blocks, each a set of whole parts planned at about 20 minutes,
and a block is never cut off: it ends when its parts are done. After each block the rest of the check is re-planned at
her pace (her time over an average kid's time on the same questions), so a kid who takes longer gets more blocks, never
a thinner check. It can run over several days, one block a day, for as long as it takes to find where she really is.
Her pace carries over to the next assessment.

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

## A right answer

In practice a right answer is seen and heard at once: two bell notes that climb as the streak grows (one gentler bell
when it took a second try), the answer box turns green with a check mark, stars burst from it, the keys fold away so
the praise sits right under the answer with the streak and the treats earned, the character jumps (it rides in the
praise box on a phone, where the side card is hidden), and the new progress dot pops. A miss buzzes and shakes the
answer box red. Sounds are made in the page (no recordings); on iPhones and iPads they play even with the mute switch
on, and the Sounds setting turns them off.

## Look

Everything is set in Verdana (built into Windows, Mac, iPhone and iPad), with Atkinson Hyperlegible on Android.
Two worlds remain, the axolotl lagoon and the candy sweetshop, each with a plain high-contrast color scheme (text about
15:1, secondary text about 7:1, buttons 5:1 or better) and soft dark versions; no moving scenery behind the page.
Sentences are regular weight; headings, numbers and buttons are bold. The layout is checked at phone width.

## Layout

- `index.html` is the built page; do not edit it by hand. `node build.js` rebuilds it from `src/`, plus the Spelling
  Worlds palettes, scenes and characters, which are read from the last commit of the sibling `spelling-worlds` repo.
- `src/core.js`: helpers, pictures, the concept registry, and how typed answers are read and checked.
- `src/concepts/*.js`: the concepts. `a1` (number sense, adding, patterns to 5th grade), `a2` (times and dividing to
  4th, time, money), `b` (fractions, decimals, percents, factors, shapes), `c` (algebra, data and chance), `d`
  (shortcuts from 5th grade up, integers, later patterns, powers and logs, trig, calculus), `e` (word problems, written
  methods, find the mistake), `f` (extra shortcuts), `h1`/`h2` (high school standards, regular and (+)), `k1`/`k2`
  (grades 2-5 and 6-8 standards). `z_ccss_k8` and `z_ccss_hs` list the Common Core standards, map concepts to them
  and move a few concepts to their Common Core grade.
- `src/engine.js`: the path, mastery, review, placement and diagnosis. `src/game.js`: the page.
- `worker/`: the save service (Cloudflare Worker + D1, tables `mw_saves` and `mw_history` in the Spelling Worlds
  database). Saves are online only; nothing is kept in the browser. Two devices' saves merge, and a mastered concept
  is never lost. Deploy from `worker/` with wrangler and `CLOUDFLARE_API_TOKEN` set.
- `test/`:
  - `node concepts.test.js`: every concept at every level, many times over (answers typeable, no broken text, steps and traps well formed). `--show <id>` prints samples.
  - `node engine.test.js`: the path, mastery, placement and the coach.
  - `node standards.test.js`: Common Core coverage.
  - `node logic.test.js`: the merge rules.
  - `node phone-shots.js <folder> .`: phone-size screenshots of each screen, for a look by eye.
  - `node test.js ../index.html`: headless Chrome, against an in-memory stand-in for the save service.
