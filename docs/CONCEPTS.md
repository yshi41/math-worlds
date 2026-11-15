# Math Worlds concept plan (2nd to 12th grade)

Math Worlds is a math game for two girls (Riley, 3rd grade; Charlie, 4th grade) that will keep growing with them through
12th grade. It is **concept based**: each concept is one narrow idea or mental-math shortcut, for example "add 10",
"add 9 by adding 10 and taking 1", "×25 is ×100 then ÷4", "squares ending in 5", "slope is rise over run". The game
teaches a concept, practises it from easy to hard, and moves on once it is mastered. Pattern recognition and mental-math
shortcuts are the heart of it. **Every answer is typed** (no multiple choice).

## How a concept is written

Each file in `src/concepts/` looks like this:

```js
/* a short comment saying what this file covers */
(function (C) {
'use strict';
const { B, num, MINUS, frac, pw, rt, gcd, reduce, seqHTML, hopsSVG } = C;   // whatever you use from src/core.js

C.defs([
  { id: 'a_plus9', s: 'add', g: 2, title: 'Add 9', pre: ['a_ten'],
    tip: 'Adding 9? Add 10, then take 1 away. 46 + 9: 46 + 10 = 56, take 1 → 55.',
    gen(d, R) {
      const a = d === 0 ? R.i(11, 40) : d === 1 ? R.i(41, 89) : R.i(101, 480), b = d === 2 ? R.pick([9, 19, 29]) : 9;
      const ten = b + 1, mid = a + ten, ans = a + b;
      return {
        text: 'What is ' + B(a + ' + ' + b) + '?', ans,
        how: ['Adding ' + b + ' is close to adding ' + ten + '. ' + a + ' + ' + ten + ' = ' + mid + '.',
              'You added 1 too many, so take 1 away: ' + mid + ' ' + MINUS + ' 1 = ' + B(ans) + '.'],
        steps: [ { text: 'What is ' + B(a + ' + ' + ten) + '?', ans: mid },
                 { text: B(mid + ' ' + MINUS + ' 1') + ' = ?', ans } ],
        traps: [ { v: mid, c: 'a_plus9', why: 'You added ' + ten + '. Now take the extra 1 away.' },
                 { v: ans - 10, c: 'a_ten', why: 'Check the tens: adding 9 makes the number bigger by almost 10.' } ],
      };
    } },
]);
})(typeof module !== 'undefined' && module.exports ? require('../core.js') : window.MWC);
```

Concept fields:

- `id`: the id from the tables below (keep it exactly). `s`: strand id. `g`: grade 2..12 (from the table).
- `title`: short, plain, kid-facing (≤ 40 characters).
- `tip`: the trick in one or two plain sentences with a tiny example (≤ 220 characters). This is what the game shows
  when the concept is introduced.
- `pre`: prerequisite concepts **from other strands** (ids from this document). Do not list the concept before it in the
  same strand; that link is automatic (strand order = grade, then the order concepts are defined).
- `gen(d, R)`: returns one problem. `d` is 0 (easy), 1 (medium), 2 (hard). `R` is the random source:
  `R.i(a, b)` whole number from a to b inclusive, `R.pick(list)`, `R.chance(p)`, `R.shuffle(list)`, `R.f()` in [0,1).
  Return `null` to ask for another try (for example when a random pick makes a dull or broken problem).
  Never use Math.random; always use R.

Problem fields:

- `text` (HTML): the question. Use `B(...)` to bold the numbers to work with. Keep it short, plain and friendly.
  Use the real minus sign `MINUS` (or `num(v)` which formats negatives and commas), `×` and `÷`, `frac(3,4)` for
  fractions, `pw(2,5)` for powers, `rt(72)` for roots, `poly([1,-5,6])` for x² − 5x + 6.
- `ans` and `type`:
  - `type: 'num'` (the default): `ans` is a number (whole, negative or decimal). Typed fractions equal to it count.
  - `type: 'frac'`: `ans` is `{n, d}`. Add `low: true` when the answer must be in lowest terms (say so in the text).
    Use frac for probabilities, fraction answers and exact trig values that are rational.
  - `type: 'money'` with `fmt: 'c'` (cents, ans 45) or `fmt: 'd'` (dollars, ans in cents, typed 3.05).
  - `type: 'time'`: `ans` is `{h, m}` (12-hour clock, h 1..12). With `dur: true` it is a length of time typed as
    hours then minutes (`{h:1, m:45}`), h may be 0.
  - `type: 'rem'`: `ans` is `{q, r}`, typed `7r2`.
  - `unit`: optional word shown after the answer box (`'cm'`, `'minutes'`, `'°'`).
  - Answers must be exact. If a real answer would be irrational, ask for a part that is exact ("√72 = a√2. What is a?",
    "The area is k·π. What is k?", "Round to the nearest whole number").
  - The answer must never be guessable from the text alone, and never be the only number in the text.
- `how` (array of HTML strings, 2 to 4 lines): the shortcut worked out **for these exact numbers**, ending with the
  answer in bold. This is the teaching. It must use the concept's trick, not a generic method.
- `steps` (array of small problems, 2 to 4): the idea broken into smaller questions **using the same numbers**, in
  order, each with its own `text` and `ans` (and `type` if not num). The game asks these after a second miss. Give
  steps at every difficulty where the problem has more than one move.
- `traps` (array): the likely wrong answers. Each `{ v, c, why }`: `v` in the same form as `ans`, `c` the concept id
  that this mistake shows a gap in (often this concept, often an earlier one from any strand, e.g. a forgotten carry
  points at `a_regroup`, a sign slip points at `n_intadd`), and `why`: one kind sentence aimed at that mistake, without
  giving the answer away. Give 2 to 4 traps per problem.
- `vis` (optional HTML/SVG picture shown with the question). Use the picture helpers in core.js when a picture helps
  younger kids (number lines, ten frames, arrays, clocks, coins, bars, fraction bars, rectangles, triangles, grids,
  tables). `howVis` is an optional picture shown with the worked answer.
- `hint` (optional): the hint button text (defaults to the first `how` line, so make that line a real hint).
- `key` (optional): a string that identifies the problem, to avoid repeats (defaults to the text).

Difficulty: d0 is the gentlest version of the idea (small, friendly numbers), d1 is typical, d2 is the stretch that
proves mastery (bigger numbers, reversed questions like "what was the start?", or the trick in a new setting). All three
must use the same concept. Make sure each difficulty can make plenty of different problems.

Grade-level fit: words and contexts should suit the grade (a 2nd grader reads "take away"; a 9th grader reads
"solve"). Keep reading load low at every grade. No US-only trivia; money uses US coins (penny, nickel, dime, quarter).

## Picture and helper toolbox (src/core.js)

Numbers: `num(v)`, `n(v)` (commas), `B(s)`, `MINUS`, `signed(v)` ("+ 5" / "− 5"), `par2(v)` ("(−2)"), `gcd`, `lcm`,
`reduce(n,d)`, `isPrime`, `factorize(v)` ({2:3,3:2}), `factorsOf(v)`, `frac(n,d)`, `mixed(w,n,d)`, `pw(b,e)`, `rt(x,k)`,
`PI` ('π'), `DEG` ('°'), `ord(k)` ('3rd'), `term(c,'x')`, `poly(coeffs,'x')`, `plural(k,'apple')`, `sum(list)`,
`pad2`, `fmtT(h,m)`, `fmtM(cents)`, `fmtD(cents)`, `T` (time: `T.add(h,m,k)`, `T.min(h,m)`, `T.words(k)`, `T.dur(k)`,
`T.fmtMin(t)`), `NAMES` (kid names for stories), `ITEMS` ([emoji, name] shop items), `COIN` ({p,n,d,q,b1,b5} with `.v`
value, `.name`, `.many`), `COIN_ORDER`, `greedy(cents, allowed)`, `coinNames(list)`, `countOn(list)`.

Pictures (return SVG/HTML strings): `stackHTML([347,285],'+',{carry:['1','1',''], ans})` (a problem in columns, digits lined up by place; the answer row shows ? boxes unless `ans` is given), `seqHTML([3,6,null,12])` (boxes, null shows ?), `hopsSVG(start, [hops], {fmt, lab})`
(jumps on an open number line), `tenFrame(a,b)`, `dotsSVG(rows,cols)` (array), `rowDots(k)`, `groupsSVG(groups, each)`,
`blocksSVG(h,t,o)` (base-ten blocks), `chartSVG(start,target)` (hundred chart), `roundLine(lo,hi,v,step)`,
`ioTable(rows, ask, reverse)` (in/out machine), `clockSVG(h,m,{cls:'sm'})`, `coinsRow(['q','d','n'])`,
`tagsHTML([[emoji,name,cents]])` (price tags), `rectSVG(w,h,{grid,w:'8 cm',h:'3 cm'})`, `triSVG('3','4','?',{angle:'30°'})`,
`barSVG(labels, values)`, `fracBarSVG(n,d)`, `numLineSVG(lo,hi,step,[{v,t:'?'}],labelEvery)`,
`plotSVG([{x,y,t}], {r:6, line:[p,q]})`, `angleSVG(deg,label)`, `table([['x',1,2,3],['y',5,8,'?']])`.
Older write-up helpers also exist (`compHow`, `mulHow(a,b,force)`, `breakHow`, `seqProblem`, `constSeq`, `skipGen`).

## Testing

`node test/concepts.test.js --file <yourfile>.js` checks every concept at every difficulty (answers can be typed and are
accepted, no broken text, enough variety, steps and traps well formed). `--show <id>` prints samples to read. Read the
samples for every concept: the how lines must read well and be correct.

## Pencil and paper

The game is designed to be used with a pencil and paper beside the screen. Kids work problems out on paper, then type
the answer. Every concept is one of two kinds, and the game labels each problem:

- **In your head** (mental shortcuts and facts): the point is a strategy you can do without writing, though jotting
  is fine. The `how` lines show the shortcut.
- **Pencil and paper** (written methods, multi-step and word problems, most algebra and up): add `paper: true` to
  the concept. Its `how` lines must read like a model written solution, **one line per line of written work**, in
  the order a kid writes them, so the kid can compare their paper line by line and find the first line where their
  work differs. Its `steps` follow the same written lines. Put the setup a kid copies onto paper in the question
  (for column work use `stackHTML([347, 285], '+')`; for equations write the equation plainly). Hard problems may
  take a few minutes; that is fine.

Every concept, whichever kind, should build understanding first (pictures, place value, bar models, number lines) and
efficiency second, and its traps should name the real misconception (for example "subtracted the smaller digit from
the bigger one" points at `a_borrow`).

## The concepts

Grades are US grade levels. Within a strand, the order listed is the teaching order. Cross-strand `pre` suggestions are
given in brackets; use ids exactly as written here.

### File a1.js: Number Sense (2–4), Adding & Taking Away (2–4), Patterns (2–5)

Port and improve the matching lessons in the old `src/curriculum.js` and the mistake logic in `src/coach.js` (old ids in
parentheses). Old "choice" problems (odd/even, AM/PM, which is more) must become typed questions.

count:
| id | g | concept |
|---|---|---|
| n_place | 2 | Place value: what each digit is worth (placeval) |
| n_expand | 2 | Expanded form: 347 = 300 + 40 + 7 |
| n_tenmore | 2 | 10 more, 10 less, 100 more, 100 less (tenmore) |
| n_compare | 2 | Biggest and smallest numbers from digits; compare by the biggest place |
| n_numline | 3 | Read a number line marked by 2s, 5s, 10s, 25s |
| n_round10 | 3 | Round to the nearest 10 (round) |
| n_round100 | 3 | Round to the nearest 100 |
| n_estimate | 3 | Estimate sums and differences by rounding first (estimate) [a_split] |
| n_big | 4 | Place value up to a million |
| n_roundbig | 4 | Round to the nearest 1,000 and 10,000 |
| n_times10 | 4 | ×10 and ÷10 move every digit one place [m_xtens] |

add:
| id | g | concept |
|---|---|---|
| a_bonds10 | 2 | Friends of 10 (bond10) |
| a_make10 | 2 | Make a 10: 8 + 5 = 8 + 2 + 3 (make10) |
| a_doubles | 2 | Doubles and near doubles: 6 + 7 = 6 + 6 + 1 (doubles) |
| a_ten | 2 | Add or take away 10: only the tens digit changes |
| a_fives | 2 | Adding and taking away 5s (35 + 5, 40 − 5, 45 + 15) [p_skip] |
| a_plus9 | 2 | Add 9: add 10, take 1 (add9) |
| a_thinkadd | 2 | Take away by thinking addition: 13 − 8, 8 + ? = 13 (thinkadd) |
| a_minus9 | 2 | Take away 9: take 10, add 1 (sub9) |
| a_tens | 2 | Add and take away whole tens: 47 + 30 (addtens, subtens) |
| a_bond100 | 2 | Friends of 100: 35 + 65 (bond100) |
| a_regroup | 2 | Trade 10 ones for a ten: 4 tens 17 ones = 57 (the carrying idea) |
| a_split | 2 | Add 2-digit numbers: tens, then ones (split) |
| a_borrow | 2 | Trade a ten for 10 ones: 53 = 4 tens 13 ones (the borrowing idea) |
| a_countup | 2 | Take away by counting up: 62 − 38 (countup) |
| a_subsplit | 3 | Take away 2-digit numbers by splitting (subsplit) |
| a_compensate | 3 | Round and adjust: 47 + 29 = 47 + 30 − 1 |
| a_friendly | 3 | Add in a smart order: find pairs that make 10s and 100s (friendly) |
| a_samediff | 3 | Same-difference trick: 72 − 38 = 74 − 40 (samediff) |
| a_from100 | 3 | Take away from 100 and 1,000: the 9s and the 10 (from100) |
| a_plus99 | 3 | Add and take away 99, 199, 999 (nearhund) |
| a_3digit | 3 | Add 3-digit numbers place by place |
| a_sub3 | 3 | Take away 3-digit numbers (count up or by place) |
| a_thousands | 4 | Add and take away thousands: 4,500 + 2,800 |
| a_list | 4 | Add a list fast: group into 10s and 100s first |

pat:
| id | g | concept |
|---|---|---|
| p_skip | 2 | Skip count by 2s, 5s, 10s (skip1) |
| p_oddeven | 2 | Odd and even: only the last digit matters (oddeven) — ask typed questions, e.g. "the next even number after 347" |
| p_hundred | 2 | Hundred chart moves: down is +10, right is +1, diagonals are +9 and +11 (hundred) [n_tenmore] |
| p_skip2 | 3 | Skip count by 3s, 4s, 25s, 100s, and backwards (skip2) |
| p_rule | 3 | Same-jump patterns: find the missing number (addrule) |
| p_grow | 3 | Growing patterns: the jump grows each time (growpat) |
| p_machine | 3 | Rule machines: find the rule, then use it (rulemachine) |
| p_evenrules | 4 | Odd and even rules: odd + odd = even, odd × odd = odd |
| p_shapes | 4 | Growing shapes: how many in step 10? |
| p_twostep | 5 | Two-step rules: ×2 then +1 |
| p_squares | 5 | Square numbers and their odd jumps: 1, 4, 9, 16 |
| p_triangle | 5 | Triangular numbers: 1, 3, 6, 10 |

### File a2.js: Times & Dividing (2–4), Time (all), Money (all)

Port and improve from the old `src/curriculum.js` / `src/coach.js`. Clock setting and coin tapping become typed answers
(read a clock and type the time; "how many coins at the fewest?").

mul:
| id | g | concept |
|---|---|---|
| m_groups | 2 | Equal groups and arrays: repeated adding (groups) [p_skip] |
| m_x2510 | 3 | ×2, ×5, ×10 (x2510) |
| m_turn | 3 | Turnaround facts, ×0 and ×1: 7 × 3 = 3 × 7 |
| m_x4x8 | 3 | ×4 is double-double, ×8 is double three times (x48) |
| m_x9 | 3 | ×9: ×10, take one group away (x9) |
| m_x3x6 | 3 | ×3 is double plus one more group; ×6 is ×5 plus one more (x36) |
| m_x7 | 3 | ×7 is ×5 plus ×2 |
| m_squares | 3 | Square facts: 6 × 6, 7 × 7, 8 × 8 |
| m_share | 3 | Dividing is sharing equally (share) |
| m_divfam | 3 | Divide by thinking times: 56 ÷ 7, 7 × ? = 56 (factfam, div2510) |
| m_xtens | 3 | Times tens and hundreds: 30 × 4, 6 × 700 (xtens) |
| m_remain | 4 | Remainders: the leftovers (remain) |
| m_breakapart | 4 | Break apart: 14 × 6 = 10 × 6 + 4 × 6 (breakapart) |
| m_x11 | 4 | ×11 and ×12: 43 × 11, ×12 = ×10 + ×2 (x1112) |
| m_x5half | 4 | ×5 is ×10 then half: 48 × 5 = 240 |
| m_dblhalf | 4 | Double and half: 16 × 25 = 8 × 50 = 4 × 100 (dblhalf) |
| m_tensxtens | 4 | Tens times tens: 30 × 40, 200 × 30 (multiply, then add the zeros) |
| m_divbig | 4 | Divide big numbers by splitting: 84 ÷ 4 = 80 ÷ 4 + 4 ÷ 4 (divbig) |
| m_x25 | 4 | ×25: ×100, then ÷4 (think quarters) |

time:
| id | g | concept |
|---|---|---|
| t_hour | 2 | O'clock and half past (oclock) |
| t_quarter | 2 | Quarter past and quarter to (quarter) |
| t_five | 2 | Time to 5 minutes: count by 5s (fivemin) [p_skip] |
| t_minute | 3 | Time to the minute (tominute) |
| t_facts | 3 | Minutes and hours: 60 minutes in an hour, 90 minutes = 1 h 30 min (timefacts) |
| t_elapsed | 3 | How long? Count up to the next hour, then on (elapsed) [a_countup] |
| t_later | 3 | What time will it be? (later) |
| t_earlier | 3 | What time was it? (earlier) |
| t_ampm | 4 | Across noon and midnight: AM and PM (earlier ampm) |
| t_convert | 4 | Seconds, minutes, hours, days, weeks [m_x2510] |
| t_24h | 5 | 24-hour time: 15:40 is 3:40 PM |
| t_weekday | 5 | Calendar patterns: the same weekday every 7 days [m_remain] |

money:
| id | g | concept |
|---|---|---|
| c_coins | 2 | Coin values: how many nickels make a quarter? (coins) |
| c_count | 2 | Count coins, biggest first (countcoins) [p_skip] |
| c_fewest | 3 | Fewest coins: biggest coin first, as many as fit (fewest, makeamt) |
| c_dollars | 3 | Dollars and cents: 3 dollars 5 cents is $3.05 (dollars) |
| c_add | 3 | Add prices: round to a dollar, then fix: $2.99 + $1.99 (addprice) [a_compensate] |
| c_change | 3 | Make change from $1 by counting up (change1) [a_countup] |
| c_change5 | 4 | Change from $5, $10, $20 (change5) |
| c_budget | 4 | How many can you buy, and how much is left? (budget) [m_remain] |
| c_unit | 5 | Better buy: the price for one [m_divfam] |

### File b.js: Fractions, Decimals & Percents; Factors & Primes; Measuring & Shapes

frac:
| id | g | concept |
|---|---|---|
| f_half | 2 | Half of a number: half of 14, half of 50, half of 36 (split tens and ones) |
| f_unit | 3 | A unit fraction of a number: 1/4 of 20 is 20 ÷ 4 [m_divfam] |
| f_of | 3 | A fraction of a number: 3/4 of 20, find one part then times |
| f_compunit | 3 | Compare unit fractions: more pieces means smaller pieces |
| f_equiv | 3 | Equivalent fractions: times the top and bottom by the same number |
| f_whole | 3 | Fractions that make wholes: 12/4 = 3, 5/5 = 1 |
| f_compare | 4 | Compare fractions: same bottom, same top, or use 1/2 |
| f_addlike | 4 | Add and take away with the same bottom |
| f_mixed | 4 | Mixed numbers and improper fractions |
| f_xwhole | 4 | A fraction times a whole number |
| f_dec10 | 4 | Tenths and hundredths: 0.7 = 7/10, 0.25 = 25/100 |
| f_simplify | 5 | Lowest terms: divide top and bottom by the biggest common factor [fa_factors] |
| f_addunlike | 5 | Add with different bottoms: find a common bottom [fa_multiples] |
| f_decadd | 5 | Add and take away decimals: make whole numbers, line up places |
| f_mult | 5 | A fraction times a fraction: cancel first |
| f_decx10 | 5 | Decimals ×10, ×100, ÷10: the point hops [n_times10] |
| f_decmul | 5 | Multiply decimals: multiply, then count the decimal places |
| f_divunit | 5 | Divide by a unit fraction: how many quarters are in 3? |
| f_divfrac | 6 | Divide fractions: flip the second one and multiply |
| f_bench | 6 | Fraction, decimal, percent friends: 1/8 = 0.125 = 12.5% |
| f_pct10 | 6 | 10% and 1% first, then build: 30% of 70 |
| f_pctof | 6 | Percents that are fractions: 25% of 36 is 1/4 of 36 |
| f_ratio | 6 | Ratios and equal ratios: 3 : 5 = ? : 20 |
| f_rate | 6 | Unit rates: the amount for one |
| f_divdec | 6 | Divide by a decimal: move both points: 4.2 ÷ 0.6 = 42 ÷ 6 |
| f_pctswap | 7 | Swap the percent: 8% of 50 = 50% of 8 |
| f_tip | 7 | Tips and tax: 10%, then half of that for 5% (15%, 20%) |
| f_pctchange | 7 | Percent increase and decrease |
| f_discount | 7 | Sale prices: 30% off means pay 70% |
| f_findwhole | 7 | Find the whole: 20% of what is 12? |
| f_proportion | 7 | Proportions: scale up, or cross multiply |
| f_repeat | 8 | Repeating decimals: 0.777… = 7/9, 0.272727… = 27/99 |

fact:
| id | g | concept |
|---|---|---|
| fa_factors | 4 | Factor pairs: check 1, 2, 3, … until they meet [m_divfam] |
| fa_multiples | 4 | Multiples and the first common multiple |
| fa_prime | 4 | Prime or not: the smallest factor that is not 1 |
| fa_div2510 | 4 | Divisible by 2, 5, 10: look at the last digit |
| fa_div39 | 5 | Divisible by 3 and 9: add the digits |
| fa_div46 | 5 | Divisible by 4 (last two digits) and 6 (by 2 and by 3) |
| fa_gcf | 6 | Greatest common factor |
| fa_lcm | 6 | Least common multiple |
| fa_primefact | 6 | Prime factorization: factor trees |
| fa_units | 6 | Units digits: only the last digits decide the last digit of a product |
| fa_div11 | 7 | Divisible by 11: alternating digit sums |
| fa_count | 8 | Count factors from the prime factorization: (a+1)(b+1) [w_exp] |
| fa_mod | 8 | Remainder tricks: the remainder of a sum or product |

meas:
| id | g | concept |
|---|---|---|
| g_perim | 3 | Perimeter: add the sides; rectangle = 2 × (length + width) [a_split] |
| g_area | 3 | Area of a rectangle: rows × columns [m_groups] |
| g_custom | 3 | Inches, feet, yards; cups, pints, quarts, gallons [m_x2510] |
| g_metric | 4 | Metric units: ×10, ×100, ×1,000 (cm, m, km; g, kg; mL, L) [n_times10] |
| g_areaL | 4 | Area of L-shapes: split into rectangles |
| g_angles | 4 | Angles: right 90°, straight 180°, full turn 360°; find the missing angle |
| g_triangle | 5 | Angles in a triangle add to 180° |
| g_volume | 5 | Volume of a box: length × width × height |
| g_tri | 6 | Area of a triangle: half of the rectangle |
| g_para | 6 | Area of parallelograms and trapezoids |
| g_pairs | 7 | Angle pairs: complementary, supplementary, vertical |
| g_circle | 7 | Circles: circumference and area as a number times π |
| g_scale | 7 | Scale drawings and maps [f_ratio] |
| g_polygon | 8 | Angles in polygons: (n − 2) × 180°; outside angles add to 360° |
| g_cyl | 8 | Volume of cylinders and cones (a number times π) |
| g_similar | 8 | Similar shapes: lengths ×k, area ×k², volume ×k³ |
| g_sphere | 10 | Spheres, arcs and sectors (a number times π) |

### File c.js: Algebra & Functions; Data & Chance

alg:
| id | g | concept |
|---|---|---|
| x_missing | 3 | Missing numbers: 7 + ? = 15, ? × 6 = 42 (undo it) [a_thinkadd] |
| x_order | 5 | Order of operations: brackets, powers, × and ÷, then + and − [m_breakapart] |
| x_eval | 6 | Evaluate an expression: 3x + 2 when x = 5 |
| x_onestep | 6 | One-step equations: undo it |
| x_distribute | 6 | The distributive property: 6 × 47 = 6 × 40 + 6 × 7; 3(x + 4) |
| x_combine | 6 | Combine like terms |
| x_twostep | 7 | Two-step equations: undo in reverse order [n_intadd] |
| x_ineq | 7 | Inequalities: the biggest or smallest whole number that works |
| x_rate | 7 | Distance = speed × time [f_rate] |
| x_bothsides | 8 | Variables on both sides |
| x_slope | 8 | Slope from two points: rise over run |
| x_intercept | 8 | Intercepts: where the line crosses the axes |
| x_linear | 8 | Use y = mx + b |
| x_system | 8 | Systems of equations: add or subtract to cancel a letter |
| x_functab | 8 | Function tables: find the rule y = mx + b |
| x_perp | 9 | Parallel and perpendicular slopes |
| x_foil | 9 | Multiply binomials: (x + a)(x + b) |
| x_factor | 9 | Factor x² + bx + c: two numbers that multiply to c and add to b |
| x_diffsq | 9 | Difference of squares: a² − b² = (a − b)(a + b), also for mental math: 41² − 39² |
| x_absval | 9 | Absolute value equations [n_abs] |
| x_vertex | 9 | The vertex of a parabola: x = −b ÷ 2a |
| x_quadform | 10 | The quadratic formula and the discriminant |
| x_vieta | 10 | Sum and product of the roots: −b/a and c/a |
| x_compose | 10 | Composing functions: f(g(x)) |
| x_inverse | 10 | Inverse functions: undo it |
| x_complete | 10 | Completing the square |
| x_polyrem | 11 | The remainder theorem: the remainder is p(a) |
| x_complex | 11 | Complex numbers: powers of i repeat every 4; multiplying |
| x_matrix | 11 | 2 × 2 matrices: the determinant |
| x_rational | 11 | Rational expressions: factor and cancel first |

data:
| id | g | concept |
|---|---|---|
| d_bar | 3 | Read bar graphs and picture graphs: how many more? |
| d_mean | 6 | Mean: even out the numbers (balance around a guess) |
| d_median | 6 | Median, mode and range |
| d_meanmiss | 7 | The missing number for a mean: total needed minus total so far |
| d_prob | 7 | Probability as a fraction: ways it can happen over all ways [f_simplify] |
| d_complement | 7 | Not happening: 1 − P |
| d_countways | 7 | Counting choices: multiply (outfits, codes) |
| d_indep | 7 | Two things in a row: multiply the chances [f_mult] |
| d_weighted | 8 | Weighted averages: combine two groups' means |
| d_factorial | 10 | Factorials: cancel before multiplying (10! ÷ 8!) |
| d_perm | 10 | Arrangements in order (permutations) |
| d_comb | 10 | Choosing groups (combinations): 10C8 = 10C2 |
| d_pascal | 10 | Pascal's triangle: row sums are powers of 2 [w_exp] |
| d_expected | 11 | Expected value |
| d_stdev | 11 | Standard deviation of small sets [w_roots] |
| d_zscore | 12 | z-scores: how many standard deviations away |
| d_binom | 12 | Binomial probability: nCk · p^k · q^(n−k) |
| d_condprob | 12 | Conditional probability from a table |

### File d.js: Times & Dividing (5–8), Number Sense (5–7), Patterns (6–11), Powers/Roots/Logs, Triangles & Trig, Calculus

mul:
| id | g | concept |
|---|---|---|
| m_x99 | 5 | ×9, ×99, ×999: ×10, ×100, ×1,000 minus one group |
| m_div5 | 5 | ÷5 is double then ÷10; ÷25 is ×4 then ÷100 |
| m_divzeros | 5 | Cancel zeros first: 2,400 ÷ 60 = 240 ÷ 6 |
| m_x15 | 5 | ×15 is ×10 plus half of that |
| m_x11big | 5 | ×11 with carrying, and 3-digit numbers × 11 |
| m_est | 5 | Estimate products and quotients: round to friendly numbers |
| m_teens | 6 | Teens times teens: 13 × 14 = (13 + 4) × 10 + 3 × 4 |
| m_sq5 | 6 | Squares ending in 5: 35² is 3 × 4 then 25 = 1,225 [w_exp] |
| m_nearsq | 7 | Squares near a known square: 51² = 2,500 + 100 + 1 |
| m_near100 | 7 | Numbers near 100: 97 × 96 = 93 \| 12 |
| m_diffsq | 8 | Around a middle: 47 × 53 = 50² − 3² |

count:
| id | g | concept |
|---|---|---|
| n_decplace | 5 | Decimal place value: tenths, hundredths, thousandths |
| n_decround | 5 | Round decimals |
| n_neg | 6 | Negative numbers on the number line: compare and count the distance |
| n_abs | 6 | Absolute value: distance from zero |
| n_intadd | 7 | Add integers: same signs add, different signs take away |
| n_intsub | 7 | Subtract integers: add the opposite |
| n_intmul | 7 | Multiply and divide integers: the sign patterns |

pat:
| id | g | concept |
|---|---|---|
| p_gauss | 6 | Add 1 to 100 fast: pair the ends |
| p_oddsum | 6 | Adding odd numbers makes squares: 1 + 3 + 5 + 7 = 16 |
| p_fib | 6 | Each term is the sum of the two before |
| p_lastdigit | 7 | Last-digit cycles of powers: 2, 4, 8, 6 [w_exp] |
| p_cycle | 7 | Repeating cycles: the 100th item, what day in 50 days [m_remain] |
| p_nth | 8 | The nth term of a same-jump pattern: start + (n − 1) × jump |
| p_geo | 8 | Multiply patterns (geometric): ×r each time |
| p_diffs | 9 | Second differences: find the next term of a curved pattern |
| p_recursive | 10 | Recursive rules: each term from the one before |
| p_series | 11 | Sum an arithmetic series: average of the ends × how many |
| p_geoseries | 11 | Geometric series and infinite sums |

pow:
| id | g | concept |
|---|---|---|
| w_pow10 | 5 | Powers of 10: count the zeros |
| w_exp | 6 | Exponents: repeated multiplying (2⁵) |
| w_roots | 6 | Square roots of perfect squares, cube roots of cubes |
| w_sqrtest | 8 | Estimate square roots: between which whole numbers? nearest? |
| w_sci | 8 | Scientific notation |
| w_rules | 8 | Exponent rules: multiply → add the powers, power of a power → multiply |
| w_negexp | 8 | Zero and negative exponents |
| w_radical | 9 | Simplify square roots: √72 = 6√2 |
| w_fracexp | 10 | Fractional exponents: 8^(2/3) = 4 |
| w_expeq | 10 | Exponential equations: make the bases match (2^x = 64) |
| w_growth | 10 | Doubling and halving: growth and half-life |
| w_log | 10 | Logarithms: what power? log₂ 32 = 5 |
| w_logrules | 11 | Log rules: log a + log b = log ab |
| w_rule72 | 11 | Compound growth: growth factors and the rule of 72 [f_pctchange] |
| w_ln | 12 | e and natural logs |

trig:
| id | g | concept |
|---|---|---|
| r_pyth | 8 | Pythagorean theorem: the long side (3-4-5, 5-12-13 families) [w_roots] |
| r_leg | 8 | Pythagorean theorem: a short side |
| r_dist | 8 | Distance between two points [n_intsub] |
| r_special | 9 | 45-45-90 and 30-60-90 triangles [w_radical] |
| r_ratio | 10 | Sine, cosine and tangent from a right triangle [f_simplify] |
| r_area | 10 | Triangle area = ½ab·sin C |
| r_radians | 11 | Degrees and radians |
| r_unit | 11 | Unit circle values |
| r_identity | 11 | sin² + cos² = 1 |
| r_inverse | 11 | Inverse trig: which angle? |
| r_period | 11 | Period and amplitude of sine waves |

calc:
| id | g | concept |
|---|---|---|
| k_rate | 11 | Average rate of change: the slope between two points [x_slope] |
| k_limit | 12 | Limits: plug in, or factor and cancel first [x_factor] |
| k_infinity | 12 | Limits at infinity: compare the top and bottom powers |
| k_power | 12 | The power rule: d/dx xⁿ = n·xⁿ⁻¹ |
| k_poly | 12 | Derivatives of polynomials at a point |
| k_tangent | 12 | Tangent lines |
| k_chain | 12 | The chain rule |
| k_product | 12 | Product and quotient rules |
| k_crit | 12 | Critical points: where the slope is 0 |
| k_anti | 12 | Antiderivatives: the power rule backwards |
| k_integral | 12 | Definite integrals: area under a curve |

### File e.js: Word Problems; written methods; gaps an expert review found

Written by a math educator's review of the plan above against the US grade-level progressions (Common Core) and
child development. These fill gaps: word problems with bar models (the strand that most needs pencil and paper), the
standard written algorithms that follow the mental strategies, error analysis ("find the mistake"), and a few
grade-level topics the plan missed. Concepts marked ✎ are `paper: true`.

story (new strand: Word Problems; every one ✎; draw a bar model, write the number sentence, solve, answer in words):
| id | g | concept |
|---|---|---|
| s_join | 2 | Put together and take apart: part + part = whole, find a missing part (bar model) [a_split] |
| s_compare | 2 | How many more? How many fewer? Compare two bars [a_countup] |
| s_twostep | 3 | Two-step stories: plan the two steps, then solve [a_subsplit] |
| s_groups | 3 | Equal groups stories: times or divide? [m_divfam] |
| s_times | 4 | Times as many: comparing by multiplying [m_breakapart] |
| s_leftover | 4 | Stories with remainders: what does the leftover mean? (round up, drop it, or it is the answer) [m_remain] |
| s_multistep | 4 | Multi-step stories with all four operations [x_missing] |
| s_fracstory | 5 | Fraction stories with bar models [f_of] |
| s_ratio | 6 | Ratio stories with bar models: 3 : 5 with a total of 40 [f_ratio] |
| s_percent | 7 | Percent stories: discounts, tax, part of a whole [f_pctchange] |
| s_equation | 7 | Write an equation for the story, then solve it [x_twostep] |
| s_rate | 8 | Rate stories: distance, work together, catching up [x_rate] |
| s_system | 9 | Two-unknown stories: write a system and solve it [x_system] |

written methods and gaps (strand in brackets after the grade):
| id | g | strand | concept |
|---|---|---|---|
| a_coladd ✎ | 2 | add | Column adding: line up the places, add the ones first, carry a ten [a_regroup] |
| a_colsub ✎ | 3 | add | Column taking away: borrow when the top digit is smaller [a_borrow] |
| a_zeros ✎ | 3 | add | Taking away across zeros: 400 − 167 |
| a_fixit ✎ | 3 | add | Find and fix the mistake in a worked adding or taking-away problem |
| a_bigcol ✎ | 4 | add | Big numbers in columns (to a million), and estimate to check [n_roundbig] |
| m_area ✎ | 4 | mul | Area model: 23 × 45 as four boxes [m_breakapart] |
| m_longdiv ✎ | 4 | mul | Long division by one digit: divide, multiply, subtract, bring down [m_remain] |
| m_std ✎ | 5 | mul | Multiplying the standard way: 2- and 3-digit numbers |
| m_longdiv2 ✎ | 5 | mul | Long division by a 2-digit number: estimate each digit |
| m_fixit ✎ | 5 | mul | Find and fix the mistake in multiplying or long division |
| f_numline | 3 | frac | Fractions on a number line |
| f_mixedops ✎ | 5 | frac | Add and take away mixed numbers |
| f_decdiv ✎ | 6 | frac | Divide decimals by long division |
| g_length | 2 | meas | Measure length with a ruler (inches and centimeters) |
| g_surface ✎ | 6 | meas | Surface area from nets |
| g_transform | 8 | meas | Moves on a grid: slide, flip, turn |
| g_inscribed | 10 | meas | Circle angles: an inscribed angle is half its arc |
| d_picture | 2 | data | Picture graphs and tally charts |
| d_quartile ✎ | 7 | data | Quartiles and the interquartile range |
| x_coord | 5 | alg | Points on a grid: (x, y) means across, then up |
| x_coord4 | 6 | alg | All four quadrants, and distance along a line |
| x_midpoint | 8 | alg | The midpoint: average the x's, average the y's |
| x_synth ✎ | 11 | alg | Synthetic division |

Concept ids that mistakes often point to (any file may use them in traps): a_regroup (forgot to carry), a_borrow
(borrowing slip), a_bonds10, a_make10, n_place (place value slip), n_times10 (decimal point / zeros slip), m_divfam,
m_x7 etc. (a times fact slip: pick the fact family's own concept), n_intadd / n_intsub / n_intmul (sign slips),
f_equiv, f_simplify, f_addunlike (added the bottoms), x_order (order of operations), w_rules (exponent slips),
x_distribute (forgot to distribute to every term).
