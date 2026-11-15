# Math Worlds

A math practice game for the kids, in the Spelling Worlds worlds. Live at https://yshi41.github.io/math-worlds/

## What it teaches

59 lessons in 8 parts, each lesson one mental-math shortcut or idea, in order from easiest to hardest:

- **Adding in Your Head**: friends of 10, make a 10, doubles, add 9, add tens, make 100, splitting, friendly pairs, numbers near 100
- **Taking Away in Your Head**: think addition, take away 9, tens, from 100 and 1,000, count up, splitting, same difference
- **Patterns**: skip counting, odd and even, same-jump and growing patterns, the hundred chart, find the rule
- **Number Sense**: place value, 10/100 more and less, rounding, estimating
- **Times Tricks**: groups, ×2 ×5 ×10, double-double, the ×9 trick, ×3 ×6 ×7, squares, tens and hundreds, ×11 ×12, break apart, double and half
- **Dividing**: sharing, ÷2 ÷5 ÷10, fact families, remainders, breaking apart
- **Telling Time**: o'clock to the minute (read the clock and set it), minutes and hours, how much later, what time will it be, earlier, AM/PM
- **Money**: coins, counting, making amounts (tap coins), dollars and cents, adding prices, making change, fewest coins, shopping math

Each lesson opens with the trick and a worked example. A round is 10 problems that get harder (3 easy, 4 medium, 3 hard).
Pick It (choices, 1 star) or Solve It (keypad, clock, coin tray; up to 3 stars). Two stars open the next lesson.
A locked lesson can be tested out of (9 of 10).

## Placement check

The first time a kid plays, a placement check runs a binary search through every part: each lesson tested asks a
medium and a hard problem; both right moves up, a miss moves down. A 3rd grader starts each part about a third of
the way in, a 4th grader a little past halfway. Lessons below where each part settles count as done (2 stars).
It saves as it goes, and can be redone from Settings.

## The coach (src/coach.js)

Every wrong answer is checked against common mistakes: forgot to carry or took the smaller digit from the bigger,
forgot to give back after using a friendly number, added instead of multiplied, one group off in a times fact,
wrong number of zeros, swapped clock hands, read the hour one ahead, read the minute number instead of counting 5s,
treated an hour as 100 minutes, mixed up nickels and dimes, put the dollar dot in the wrong place, a remainder too big,
and more. The mistake names a "tricky spot" (an idea, like "Carrying a ten" or "The 7s").

- First miss: try again, with a hint aimed at that mistake.
- Second miss: the answer and the worked shortcut, then the idea broken into small steps with the same numbers.
- End of the round: practice problems for each tricky spot found.
- Hub: tricky spots stay listed with a Practice button until 3 in a row are right. Missing a tricky spot's practice
  adds the idea one step back (carrying → making a 10 → friends of 10).
- The review mix weights lessons with more misses and tricky spots.

## Layout

- `index.html` is the built page. Do not edit it by hand. `node build.js` rebuilds it from `src/` plus the Spelling
  Worlds palettes, scenes and characters (read from the sibling `spelling-worlds` repo's last commit).
- `src/curriculum.js` lessons and problem makers, `src/coach.js` diagnosis, practice and placement, `src/game.js` the page.
- `worker/` is the save service (Cloudflare Worker + D1, tables `mw_saves` and `mw_history` in the Spelling Worlds
  database). Saves are online only; nothing is kept in the browser. Deploy from `worker/` with wrangler and
  `CLOUDFLARE_API_TOKEN` set.
- `test/`: `node math.test.js` (every lesson, difficulty and coach path, generated many times), `node logic.test.js`
  (merge rules), `node test.js ../index.html` (headless Chrome, against an in-memory stand-in for the save service).
