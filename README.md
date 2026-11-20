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

## How a problem reads

Every problem is laid out the same way (`layout` in `src/core.js`), so a child takes it in one line at a time:

- A story goes one short sentence to a line, and the question comes last with a mark beside it.
- A bare sum always looks like a sum: "What is 45 × 9?" and "Work it out: 45 × 9" are both shown as `45 × 9 = ?`.
  A method keeps its name and the sum goes on the next line ("Add in columns:" then `36 + 47`).
- A sentence that only says how to type the answer ("Type a mixed number or a fraction.") is small print under the
  question. It is not part of the math.
- Long problems are set in a smaller size so the whole problem stays in view.

`test/concepts.test.js` holds every concept in grades 2 to 8 to reading limits, over 200 problems a level:

| Grade | Longest sentence | Words in a problem | Sentences |
|-------|------------------|--------------------|-----------|
| 2     | 13 words         | 28                 | 4         |
| 3     | 13 words         | 34                 | 4         |
| 4–5   | 16 words         | 42                 | 5         |
| 6–8   | 20 words         | 50                 | 5         |

Typing notes are not counted. There are no semicolons, no asides in brackets up to 5th grade (say it in a sentence),
and nothing after the question except a typing note: an instruction such as "Round each number to the nearest ten."
comes before the question it belongs to. Stories use one fact to a sentence, the same name each time and no pronouns.

## In your head, or pencil and paper

Every problem carries a mode strip at the top of the card: **In your head** (blue, a thought bubble, "No pencil
needed") or **Pencil and paper** (warm paper color, a pencil, "Work it out on paper, then type your answer"). The card's
top edge takes the same color, the strip pops when the mode changes from one problem to the next, a pencil-and-paper
round starts with one screen asking for pencil and paper, and the map's "Up next" line and each concept's page say the
mode too.

The rule: in your head is a fact, a shortcut, or one step with numbers a child of that grade can hold (reading a
picture, a clock or a graph counts). Pencil and paper is a written method, two or more steps to keep track of, a list
to put in order, or numbers too big to hold; a word problem is always paper (draw it or write the number sentence).
A concept is one or the other (`paper: true` where it is defined) unless `src/concepts/z_modes.js` gives it a letter
for each level: `t_ampm: 'hpp'` is in your head at the easy level and on paper at the medium and hard levels.

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
  concept is mastered, at most 6 concepts a block and none when fewer than 6 problems are left. One or two of them are
  earlier-grade concepts that are only assumed (see Earlier-grade spot checks below), at most 2 a block.
- When she is struggling with the concept she is learning (under 60% right after 8 tries, or she dropped a level), the
  concepts it is built on are checked, even before they are due (each at most every 3 days).
- Levels, tricky spots, break-downs and help lessons adapt within each round, as below.

## Memory checks

Every concept mastered in the game is checked again 1, 3, 9, 27 and 81 days after it is mastered, then every 81 days.
A check is two problems per concept, medium then hard, mixed with the other
concepts being checked, with no hints and no feedback until the end, like an assessment. Both right: it held, and the
next check waits three times as long. One right: wobbly, checked again tomorrow; wobbly twice counts as slipped. None
right: slipped. A slipped concept stops counting as mastered (the parent report and grade level drop with it), goes back
on the path ahead of anything new, opens on its lesson again, and has to be mastered again from the medium level (or
the easy level if both were wrong). In the save it keeps `m` (first mastered, which the save service never drops) and
gets `lx` (when it slipped); mastering it again clears `lx` and sets `rm`.

A check answered faster than anyone can read it (under 7 seconds a problem on average) was tapped through. It does
not count: nothing changes, the results say "Too fast to count", the parent view and the daily email note it, and the
same concepts come back in a later block.

### Earlier-grade spot checks

Some concepts count as mastered without ever being practised in the game: those a placement check or assessment
placed, and everything below the grade a kid is set to start at. They are assumed, not proven, so they are audited now
and then rather than all at once (`COACH.earlyPick`):

- at most 2 in a practice block (one or two as the block opens, one more after a concept is mastered), starting the
  day after they were placed;
- the strand checked least so far goes first, and within it the most advanced concept, so the checks work down from
  the kid's grade;
- both problems right: the idea has lasted. Its next check waits 27 days, and it vouches for the concept just before
  it in the strand, which waits 81 days;
- one right: wobbly, checked again tomorrow, as usual;
- none right: it goes back on the path to be mastered again, and the concepts it is built on are checked next, to
  find where the gap starts.

For a kid who starts at 4th grade that is 88 concepts, covered in about 27 blocks if they all hold. The parent view's
Memory checks card says how many are checked, vouched for and left.

The path goes grade by grade and takes the strands in turn. Within a strand each concept needs the one before it.
Some concepts also need one from another strand: making change needs counting up, and fractions of a number need
dividing. Any locked concept can be tested out of by getting 5 hard problems right in a row.

## Placement check

The first time a kid plays, a placement check runs a binary search in every strand that has concepts up to one grade
above the kid's grade. Each concept it tests asks a medium problem and a hard problem: both right moves up, a miss moves
down. The search starts near the kid's grade (Riley is in 3rd grade, Charlie in 4th). Concepts below where each
strand settles are marked mastered, and spot-checked a couple at a time from the next day on. A concept whose medium problem was
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

A part answered faster than anyone can read it (under 7 seconds a question on average, skips included) was tapped
through and tells nothing, so it is asked again once, from where it started, and that block does not count toward her
pace. A kid can be set to start at a grade (`start` in `KIDS`; Charlie starts at 4th grade). Every Common Core concept
below that grade is marked mastered the first time she opens the game (`COACH.applyFloor`), so the map and the parent
report start at that grade straight away; no check, first or later, searches lower, and a check already under way is
moved up to it (`COACH.pretestFloor`). Memory checks spot-check those concepts a couple at a time (Earlier-grade spot
checks, above), so any that are not really known go back on the path.

## Parent view: reset and history

**Reset to this assessment** (two taps, next to Start a new assessment) rebuilds the kid's progress from the latest
assessment alone (`COACH.resetToAssessment`): what it placed is mastered and nothing else. Parts she tapped through are
opened again and come first the next time she plays; the report works from the parts done so far (once half are done)
and is worked out again when she finishes. Practice after the assessment (memory checks, tricky spots, help lessons,
practice blocks) is cleared and taken out of the daily log; treats, characters, world, settings and the assessment
history stay. The save carries `reset.t`; the save service accepts a save with a newer reset even though it drops
mastered concepts (never characters), refuses any save from before it, and merges a stale device onto the reset copy.
Every accepted save is still kept in `mw_history`.

**The report moves with every block.** At the end of each assessment block (or when she stops part way) the parts she has
finished are applied right away (`COACH.pretestApply(p, pre, now, true)`): concepts below where each finished part placed
her are mastered, while a part still being searched, or one asked again because she went too fast, waits until it is done.
`pre.nm` keeps the running total, so the last block ends exactly where one apply at the end would. A parent view left
open on any device redraws when new progress arrives (15 s poll), keeps open question sets and the scroll position,
and shows when progress was last saved.

**History** charts grade level (with the average student in her grade), the estimated national percentile, concepts
mastered, problems answered (right first try, other practice, assessment questions) and minutes, over 7 days, 30 days,
3 months, 1 year or all time (`COACH.history`): day by day up to a month, week by week up to about 6 months, month by
month beyond. Each assessment adds a line to `asm` in the save (date, questions, right, grade level, percentile),
updated after every block, shown as rings on the charts and in a table.

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
  is never lost. Every open page checks for other devices' progress every 15 seconds, and a page left open in the
  middle of a round or an assessment picks up at the next unanswered question when the same kid has moved on elsewhere. Help lessons
  are saved step by step too (`hl` in the save): another device continues at the same step of the video or the lesson. Deploy from `worker/` with wrangler and `CLOUDFLARE_API_TOKEN` set.
- `test/`:
  - `node concepts.test.js`: every concept at every level, many times over (answers typeable, no broken text, steps and traps well formed). `--show <id>` prints samples.
  - `node engine.test.js`: the path, mastery, placement and the coach.
  - `node standards.test.js`: Common Core coverage.
  - `node logic.test.js`: the merge rules.
  - `node phone-shots.js <folder> .`: phone-size screenshots of each screen, for a look by eye.
  - `node test.js ../index.html`: headless Chrome, against an in-memory stand-in for the save service.
