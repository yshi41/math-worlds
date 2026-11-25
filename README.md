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
  A method keeps its name and the sum goes on the next line ("Break it apart on paper:" then `3 × 13 = ?`).
- A sentence that only says how to type the answer ("Type a mixed number or a fraction.") is small print under the
  question. It is not part of the math.
- Long problems are set in a smaller size so the whole problem stays in view.
- No counting chores (Yan, 11/24/2026: "there is no utility in making kids count items on the screen"). A picture never
  makes a kid count a big pile one by one: the numbers are in the text or on the picture (growing-shape steps show their
  dot count, rectangles and rulers are labelled, cube boxes give their size and the top layer's count), a row of
  pictures has at most 10 in groups of 5, tallies come in bundles of 5, a dot plot has at most 4 dots a column and 12 in
  all, a coin problem has at most 8 coins, and a fraction number line is read from the whole number just before the
  dot. `node test/count-scan.js` lists every grade 2-8 picture with more than 10 objects so new ones can be checked.
- One problem, one screen, in every state (Yan, 11/24/2026: "the entire question needs to be on the screen, phone or
  computer, or tablet"): no scrolling while it is asked, after a hint, after a wrong answer, with the answer shown, after
  a right answer, in part 2, and in every step of a help lesson or "I have no clue" tutorial. On a wide screen (900 px
  and up) the keys sit beside the problem; below 900 px the character panel is hidden. `fitQ` in `src/game.js` runs on
  every change in the card (a MutationObserver) and on resize: a long message gets a little smaller (75%), then the
  picture (to half size); if worked steps still don't fit they fold under "Show the steps" (opening them fits again);
  then the text, keys and gaps shrink, and last the whole card scales down until it fits. `fitHL` scales the lesson card.
  `node test/fit-states.js ../index.html` checks every grade 2-8 concept at every level in all five states on seven
  screens (360×600 and 390×664 and 430×740 phones, 820×1050 and 1180×740 tablets, 1366×657 and 1280×600 laptops): 0
  scroll; it also lists cards scaled under 75% (12, all on the 360×600 phone, smallest 66%). `node test/fit-help.js
  ../index.html` walks every lesson. `node test/fit-shot.js ../index.html <folder> id/level ...` takes screenshots.

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

### Plain words a child does not have to work out

Every problem, break-down step and hint in grades 2 to 8 was read and reworded on 11/22/2026 so a child never has to
stop and parse a sentence. The rules that pass set, for anything written from now on:

- One fact to a sentence, told in the order it happens: "Jack had 28 stamps. Jack gave 4 stamps to Ava." not "Jack had
  28 stamps and gave 4 to Ava."
- No "that is": "Ava has 29 more beads than Nora." not "That is 29 more than Nora has."
- The question names exactly what to find, with its unit, in a whole sentence: "How many cups of water are there?" not
  "How many water?"; "How many minutes are in 4 hours?" not "4 hours = how many minutes?"
- The noun is said again where "it", "they" or "them" could lose a child: "How long is the feather?"
- A break-down step stands on its own. It is shown without the main problem's text, so it carries its own numbers
  ("In order, the numbers are 11, 13, 15, 17, 21, 25, 29. Which number is in the middle?" not "The middle number?").
  A step also keeps its problem's picture on screen (`pvis`).
- "Box" only where a box is drawn (□, or the boxes of a pattern). A "?" is "the missing number".
- Seeds still rebuild the same problems: the pass changed words only, never the numbers or the random draws.

### Say it once, and ask what you say

A problem states each thing one time, and every instruction in it is one the answer checks (the 11/22/2026 pass over
grades 2 to 8):

- When the picture is the written sum (columns, a division bracket), the text is only the instruction: "Add in
  columns." above the stack, not "Add in columns: 36 + 47." beside the same sum. The same goes for a price on a tag,
  hops drawn on a line and rules written on a table's rows. `say` keeps the numbers for the narrator of a help lesson
  (problems themselves are no longer read aloud: the speaker button, the "Read questions aloud" setting and the
  automatic reading of above-grade problems were removed 11/22/2026).
- No instruction that is never checked. "Find the mistake", "Find the rule" and "Estimate first" were said but only
  the final answer was typed. They are now either asked (below) or gone.
- One question, not two ("Which pack is the better buy? How much do you save…" is now one question).
- A typing note only says what is really accepted ("Type a mixed number or a fraction.").

`test/concepts.test.js` fails a problem whose picture is a written sum and whose sentences hold numbers, a sentence
said twice, and the unchecked instructions above.

### Two-part problems

A problem can carry a first part (`first: { text, ans, hint }`): part 1 is asked on its own screen with the same
picture, typed and checked, and then the main question is part 2. The problem is right only when both parts are
right. The screen says "Part 1 of 2" and "Part 2 of 2".

- Find the mistake (`a_fixit`, `m_fixit`): part 1 finds it, part 2 fixes it. Part 1 is said the way a child does it:
  "Start with the ones and check each digit. What is the first wrong digit? Type the digit Lily wrote." She types the
  wrong digit just as it is written in the worked answer (no code for its place). Long division starts on the left;
  a long multiplication with a wrong line asks for the first wrong number as written. The wrong digit appears only
  once in the answer, so the typed digit is never ambiguous. Typing what the digit should be gets "That is what the
  digit should be. Type the wrong digit that Lily wrote." A too-big remainder also counts for the division slip it
  shows (`alt`).
- Big numbers in columns (`a_bigcol`): part 1 is the estimate, part 2 the exact answer.
- In practice a wrong part 1 is a miss like any other: a hint and one more try, then the worked answer. A right part 1
  says so and moves on. An assessment or a memory check takes both answers without a word and judges them together;
  Back in part 2 returns to part 1.
- The parent view shows both answers and what she typed for each ("5, then 442"; "part 1: 6" for a miss in part 1).
- `text` and `ans` stay a whole problem by themselves, for the places that ask one question (print sheets, lessons,
  break-down steps).

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

A block runs straight through (11/23/2026). The end of a round or of a concept is not a stop: when a concept is
mastered its last problem says so ("Concept mastered", confetti, the button reads **Keep going**) and the next thing
starts at once, whether more of the same concept, the next concept (a new one still opens on its short lesson), or a
memory check. The streak, the "pencil and paper ready" tap and the way of working carry over (`CARRY` in
`src/game.js`). The results screen comes once, at the end of the block, and shows the whole block: right first try,
best streak, treats earned, the tricky spots found and how each idea of its memory checks did (`runsOn` and
`finishRound`). Still a stop: a round she ends herself with Stop, a tricky-spot or test-out round, and a memory check
that went by too fast to count, whose note she needs to read.

Calibration is constant (Yan, 11/24/2026, after Riley's blocks ended in about 7 minutes). A block's time (`blk.el`)
is the real time from its start to her last answer, lesson screens, feedback and help lessons included, with any gap
over 3 minutes counted as 3 (a walk-away is not her pace). Her pace is that time over an average kid's time for the
same problems, taken from her last 5 blocks with the newest counting most (`COACH.calPace`; blocks from before 11/24
are read from their saved problems). At the end of every round, `COACH.blockStretch` re-plans the block from how it is
going: when she is working faster than planned it adds problems so the block still fills about 20 minutes (`grew`,
`goal0` keeps the plan). It never takes problems away, so a block that ran long, because the concept was hard or she
needed break-downs, hints or a help lesson, makes the next block smaller, and a harder concept (written methods, word
problems) gets fewer problems. The parent view lists her last blocks in minutes. Finished blocks are kept in `bhist`.
Browser tests set `window.__mwNoStretch` (instant test answers would always stretch) except in the stretch check.

What the block does next depends on how the kid is doing:

- A memory check at the start of each block (3 due concepts, 4 when 6 or more are due) and a short one (2) after each
  concept is mastered, at most 6 concepts a block and none when fewer than 6 problems are left. One or two of them are
  earlier-grade concepts that are only assumed (see Earlier-grade spot checks below), at most 2 a block.
- When she is struggling with the concept she is learning (under 60% right after 8 tries, or she dropped a level), the
  concepts it is built on are checked, even before they are due (each at most every 3 days).
- Levels, tricky spots, break-downs and help lessons adapt within each round, as below.

## Going over mistakes

At the end of every block, practice or assessment, she goes over each problem she got wrong before anything else
(`startTut` in `src/game.js`). The results screen offers only **Go over my mistakes (N)**: the map, the next block and
the next assessment block all wait until it is done, and starting a block from the map opens it first. Each mistake
shows the same problem again, what she answered and the right answer, and the worked shortcut. Then come the problem's
break-down steps, which she answers one at a time with the usual hints and second-try help. In a practice block the
mistakes are problems missed twice and memory-check problems missed or not remembered. In an assessment block they are
the wrong answers, not the ones she said she hasn't learned yet, and not parts she went through too fast (those are
asked again). At most 8, the latest. The list is kept in the save (`tut`: items with concept, level, seed and what she
typed, `i` the one she is on, `done`), so closing the game doesn't skip it, and it picks up at the problem she was on.

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
not count: nothing changes, the results say "Too fast to count", the parent view and the parent report email note it, and the
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

**Two presses, and Back.** Check and "I haven't learned this yet" (or "I don't remember" in a memory check) take two
presses: the first lights the button up and says "Tap again", and a second press within 4 seconds goes ahead (Enter
works the same way). In an assessment or a memory check, **← Back** undoes the last answer and asks that question
again, as many questions back as the round has gone (`goBack` in `src/game.js`; the undo restores the assessment's
search, the concept's record, the daily log, the block and the treats). Practice rounds show right or wrong at once,
so they have no Back.

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

**The report rests on every block, not the assessment alone.** Grade level, percentile and how firm the numbers are
come from all the blocks done so far: assessment blocks place what she already knows, practice blocks add what she
masters, and memory checks take away what slipped. Assessment questions and practice problems both count toward how
firm the report is (`COACH.report` → `blocks`, `answered`).

**Blocks** lists every block newest first (`COACH.blockList`): each block of each assessment (the questions of the parts
planned in it; a part asked again counts in the block it was asked again in) and each practice block, including one in
progress or left unfinished on an earlier day (archived into `bhist` with `partial` when the next block starts). Open a
block to review every question: the exact problem rebuilt from its seed, the right answer, and how she answered. Practice
blocks keep their problems in `q` (`[concept, level, seed, step, kind, right first try, right in the end, ms, first wrong
answer, skipped]`; the last 15 blocks keep them). Assessment block end times are kept in `pre.bend` (and `bl`, `bi`,
`bms`, `bend` in each `asm` line); older blocks are dated from the daily log.

**Block archive and review (11/23/2026).** Every block with its questions is also kept for good in the D1 table
`mw_blocks` (`GET`/`POST /blocks/<kid>`; a block only ever gains questions there). Every device sends the blocks it
sees that the archive lacks (`Arch` in game.js; the block in progress goes in once finished or left for another day), so
blocks whose questions the save has let go of still open, and blocks the save no longer lists are shown marked
"archive" (review only, not counted in the report). Each opened block has "Go through one at a time" and "Only the
ones not right first try": the `#review` screen shows one question as she saw it, her answer, the right answer and
the worked answer, with Previous/Next, numbered dots and arrow keys. `tools/archive-blocks.js` backfills from the
current saves; `test/review-shot.js <saves.json> <dir> [kid]` takes phone and laptop screenshots against the mock.

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

### "I have no clue"

After 3 minutes on one problem an "I have no clue" button appears beside Hint (`clueMs` in `src/game.js`; the clock
starts when the problem is shown, or when she taps that her pencil and paper are ready). It takes two presses, like
Check. It opens a tutorial on that concept, at the level of the problem she is stuck on:

1. One worked problem to watch: the trick, the problem, each line of the solution coming in one at a time with the
   voice, the picture, the answer.
2. A similar problem taken step by step. Each step is typed and checked. The problem stays in view on every step, and
   the steps already done pile up under it as "Your work so far". Then she puts the steps together.
3. "How do you feel about it now?", kept for the parent report with the rest of the lesson (`from: 'clue'`).

Then "Back to my problem": the same problem is asked again. It took one miss when she pressed the button, so a right
answer now counts as right on the second try. In an assessment or a memory check the question counts as not known
(kept as "no clue" for the parent view, and left out of the mistakes to go over), and the next question follows the
tutorial. The step-by-step view (problem in view, work so far) is the same in every help lesson.

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
- `worker/`: the save service (Cloudflare Worker + D1, tables `mw_saves`, `mw_history` and `mw_blocks` in the Spelling Worlds
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

## The parent report email, after every block

`tools/daily-report.js --after-block --state <file>` makes the parent report email whenever a block has finished since
the last report: a practice or assessment block that is done, or one left untouched for 45 minutes (she stopped part
way; it is reported again if she goes on with it). The email opens with the block just finished (score, time, what was
mastered, the memory check, what she missed on the first try), then today, then grade levels worked out from every
block so far. With no new block it writes nothing and prints `NO NEW BLOCK`; `--force` makes the report anyway. The
blocks already reported are kept in the state file (on the Legion: `%LOCALAPPDATA%\math-worlds\report-state.json`).
A Claude scheduled task, "Math Worlds parent report after each block", runs it every hour from 6 AM to 10 PM Central
and emails the report when there is one. Without `--after-block` the script makes the old once-a-day report.
