# High school Common Core gaps

The game-able high school standards (CCSS-M, conceptual categories N, A, F, G, S) that no concept practises yet,
each with a proposed new concept. Standards and alignment are in `src/concepts/z_ccss_hs.js`. Grades follow the
traditional pathway: Algebra 1 = 9, Geometry = 10, Algebra 2 = 11, Precalculus = 12.

Columns: id, strand, grade, title, the typed-answer problems, standard, ✎ = `paper: true`.

## Standards without a (+)

| id | strand | g | title | problems | standard | ✎ |
|---|---|---|---|---|---|---|
| g_unitrate | meas | 9 | Convert rates with unit chains | Change 30 mph to feet per second (44) or 5 m/s to km/h by multiplying by unit fractions that cancel; type the number | N-Q.A.1 | ✎ |
| x_complexroots | alg | 11 | Quadratics with complex roots | x² − 6x + 13 = 0 has roots p ± qi (negative discriminant, or complete the square); type p or q | N-CN.C.7 | ✎ |
| x_parts | alg | 9 | Terms, factors and coefficients | In 5x³ − 2x² + 7 type the coefficient of x², the constant term or the number of terms; in 3(x + 2)(x − 5) type a factor's number | A-SSE.A.1a | |
| x_chunk | alg | 9 | See a bracket as one number | If 3(x − 2)² + 4 = 52, type (x − 2)²; in 500(1.04)ⁿ type the start amount or the yearly factor | A-SSE.A.1b | |
| x_zeros | alg | 11 | Zeros from the factors | p(x) = (x − 3)(2x + 5)(x + 1)²: type the largest zero, the sum of the distinct zeros, or how many there are (fractions fine) | A-APR.B.3 | |
| s_constraint | story | 9 | Constraints: what is possible? | With $60, adult tickets $9, child tickets $5 and at least 3 children, type the most adults who can go | A-CED.A.3 | ✎ |
| x_literal | alg | 9 | Rearrange a formula | Rewrite P = 2l + 2w as w = aP + bl, or 3x + 4y = 12 as y = mx + c; type a, b or m (fractions fine) | A-CED.A.4 | ✎ |
| x_radeq | alg | 11 | Radical equations: check for fakes | Solve √(x + 7) = x − 5: square, solve, check both roots; type the true one (the extraneous root is a trap) | A-REI.A.2 | ✎ |
| x_rateq | alg | 11 | Rational equations | Solve 3/(x − 2) = 6/x or x/(x − 3) = 3/(x − 3) + 2; clear the bottoms, type the solution that works | A-REI.A.2 | ✎ |
| x_linquad | alg | 9 | Where a line meets a parabola | Solve y = x² − 3 and y = 2x together: substitute, factor; type the larger x or its y | A-REI.C.7 | ✎ |
| x_fnotation | alg | 9 | Function notation: f(3) | f(x) = 2x² − 3x + 1: type f(−2); f(x) = 5x − 4 and f(a) = 21: type a | F-IF.A.2 | |
| x_features | alg | 9 | Read a graph: highs, lows, zeros | From a plotted curve or table of a ball's height over time, type the greatest height, when it happens, or when it lands | F-IF.B.4 | |
| x_domain | alg | 9 | Domain: inputs that make sense | Type the smallest x allowed in f(x) = √(2x − 6), or the largest number of $4 tickets $50 buys (the top of the domain) | F-IF.B.5 | |
| x_compare2 | alg | 9 | Compare two functions | f(x) = −x² + 6x as a formula and g as a table or graph: type the larger maximum, or the larger y-intercept | F-IF.C.9 | |
| x_storyfn | alg | 9 | Write the function for a story | 40 m of fence makes a pen along a wall, so A(x) = x(40 − 2x): build it, then type A(8) or the a in ax² + bx | F-BF.A.1a | ✎ |
| x_fnarith | alg | 11 | Add, subtract, multiply functions | R(x) = 12x and C(x) = 5x + 140: type the profit (R − C)(30); f(x) = x + 3, g(x) = x² − 1: type (f·g)(2) | F-BF.A.1b | |
| x_shift | alg | 9 | Shifts and stretches of graphs | y = (x − 4)² + 3 is y = x² moved right ? and up ?; g(x) = f(x + 2): type the shift (left is negative) | F-BF.B.3 | |
| w_overtake | pow | 9 | Exponential wins in the end | From a table, type the first whole n where 2ⁿ is bigger than 50n (or than n³) | F-LE.A.3 | ✎ |
| w_params | pow | 9 | What the numbers in a model mean | V = 18,000(0.85)ᵗ is a car's value: type the start value or the percent lost each year; C = 25 + 0.4m: type the cost per mile | F-LE.B.5 | |
| g_symmetry | meas | 10 | Turns and flips that fit a shape | Type the smallest turn that carries a regular 9-gon onto itself (40°), or how many lines of symmetry a rectangle or regular polygon has | G-CO.A.3 | |
| r_cofunction | trig | 10 | sin of one angle, cos of the other | sin 38° = cos x°: type x; in right triangle ABC, sin A = 5/13: type cos B | G-SRT.C.7 | |
| g_circleeq | meas | 10 | The equation of a circle | x² + y² − 6x + 8y = 11: complete the square; type the radius or the center's x; center (2, −1) through (5, 3): type r² | G-GPE.A.1 | ✎ |
| g_parabola | meas | 10 | Parabola from focus and directrix | Focus (0, 3) and directrix y = −3 give y = ax²: type a (1/12); type the vertex's y when focus and directrix are shifted | G-GPE.A.2 | ✎ |
| g_coordarea | meas | 10 | Perimeter and area from coordinates | A(1, 2), B(7, 2), C(4, 6): type the area; a polygon on the grid: type the perimeter (sides from 3-4-5 families) | G-GPE.B.7 | ✎ |
| g_density | meas | 10 | Density: how much per unit | A 6 km by 4 km town has 4,800 people: type people per km²; a 2 cm metal cube weighs 72 g: type grams per cm³ | G-MG.A.2 | |
| d_outlier | data | 9 | Outliers move the mean, not the median | 12, 14, 15, 15, 16, 70: type how much the mean drops when 70 is removed, or the median with and without it | S-ID.A.3 | ✎ |
| d_predict | data | 9 | Predict with a fitted function | Best-fit line ŷ = 2.4x + 15: type the prediction at x = 20; fitted y = 3·2ˣ: type the prediction at x = 5 | S-ID.B.6a | |
| d_residual | data | 9 | Residual: actual minus predicted | Line ŷ = 3x + 8 and data point (4, 21): type the residual (1); negative means the point is below the line | S-ID.B.6b | |
| d_slopemean | data | 9 | Slope and intercept of a data model | Plant height ŷ = 1.5w + 4 (cm, w weeks): type the growth per week or the height at planting | S-ID.C.7 | |
| d_testindep | data | 10 | Test for independence | P(A) = 0.3 and P(A and B) = 0.12: type the P(B) that makes A and B independent; or type P(A)·P(B) to compare | S-CP.A.2 | |
| d_condformula | data | 10 | P(A given B) = P(A and B) ÷ P(B) | P(A and B) = 0.12 and P(B) = 0.4: type P(A given B) as a fraction; or P(A and B) from P(B) and P(A given B) | S-CP.A.3 | |
| d_or | data | 10 | A or B: add, then take off the overlap | 30 kids, 18 play soccer, 12 piano, 5 both: type P(soccer or piano) as a fraction; heart or face card from a deck | S-CP.B.7 | |

## (+) standards

| id | strand | g | title | problems | standard | ✎ |
|---|---|---|---|---|---|---|
| x_conjugate | alg | 12 | Divide complex numbers by the conjugate | (7 + i) ÷ (1 − i) = p + qi: multiply top and bottom by 1 + i; type p or q; type the modulus \|3 + 4i\| | N-CN.A.3 | ✎ |
| x_polar | alg | 12 | Polar form of a complex number | 4(cos 60° + i sin 60°) = a + b√3 i: type a or b; 3 + 3i = r(cos θ + i sin θ): type θ in degrees, or r² | N-CN.B.4 | ✎ |
| x_polarmul | alg | 12 | Multiply in polar: lengths ×, angles + | (2 cis 40°)(3 cis 50°) = r cis θ: type r or θ; (−1 + √3 i)³: type the real number it equals | N-CN.B.5 | ✎ |
| x_cdist | alg | 12 | Distance between complex numbers | Type \|(5 + 2i) − (1 − i)\| (5), or the real part of the midpoint of 3 + 4i and −1 + 2i | N-CN.B.6 | |
| x_cfactor | alg | 11 | Factor sums of squares with i | x² + 49 = (x + ai)(x − ai): type a; x² + 2x + 10 = (x − p − qi)(x − p + qi): type q | N-CN.C.8 | ✎ |
| r_veccomp | trig | 12 | Vector components: end minus start | The vector from P(2, −1) to Q(7, 3) is ⟨a, b⟩: type a or b | N-VM.A.2 | |
| r_vecvel | trig | 12 | Velocity vectors | A boat heads north at 12 km/h in a 5 km/h east current: type its speed over the ground (13) | N-VM.A.3 | ✎ |
| r_vecadd | trig | 12 | Add vectors by components | ⟨3, −2⟩ + ⟨−5, 6⟩ = ⟨a, b⟩: type a or b; type the length of the sum when it is whole | N-VM.B.4a | |
| r_vecsum | trig | 12 | Length of a sum from two directions | 6 N east plus 8 N north, or 5 N and 5 N at 120° apart: type the size of the total; type its angle in 45° cases | N-VM.B.4b | ✎ |
| r_vecsub | trig | 12 | Subtract vectors: add the opposite | ⟨4, 1⟩ − ⟨−2, 5⟩ = ⟨a, b⟩: type a or b; type the length of v − w in 3-4-5 cases | N-VM.B.4c | |
| r_vecscale | trig | 12 | A number times a vector | −3⟨2, −5⟩ = ⟨a, b⟩: type a or b; 2v − w by components | N-VM.B.5a | |
| r_vecmag | trig | 12 | Length of a scaled vector | ‖v‖ = 7: type ‖−3v‖; v = ⟨6, 8⟩: type the length of ½v | N-VM.B.5b | |
| x_matscale | alg | 12 | Multiply a matrix by a number | 3 times the matrix with rows (2, −1) and (4, 0): type the row 2, column 1 entry | N-VM.C.7 | |
| x_matmul | alg | 12 | Add and multiply matrices | Rows (1, 2), (3, 4) times rows (5, 0), (−1, 2): type the row 1, column 2 entry (row times column); sums entry by entry | N-VM.C.8 | ✎ |
| x_matvec | alg | 12 | A matrix times a vector | Rows (2, 1), (−1, 3) times ⟨4, 5⟩ = ⟨a, b⟩: type a or b | N-VM.C.11 | |
| x_detarea | alg | 12 | The determinant scales area | Rows (3, 1), (1, 2) map the unit square to a parallelogram: type its area (5); a triangle of area 4 maps to area ? | N-VM.C.12 | |
| x_ratops | alg | 11 | Add and multiply rational expressions | 1/(x − 1) + 2/(x + 1) = (ax + b)/(x² − 1): type a or b; a product of fractions, simplified, at x = 10 | A-APR.D.7 | ✎ |
| x_matinv | alg | 12 | Inverse of a 2 × 2 matrix | Inverse of rows (5, 2), (7, 3) (det 1): type an entry; use it to solve 5x + 2y = 1, 7x + 3y = 2: type x | A-REI.C.9 | ✎ |
| x_invtable | alg | 12 | Inverse values from a table | A table gives f(1) = 4, f(2) = 7, f(3) = 12, …: type f⁻¹(12) or f⁻¹(7) + f(1) | F-BF.B.4c | |
| x_restrict | alg | 12 | Restrict the domain to invert | f(x) = (x − 3)² + 1 is one-to-one for x ≥ k: type the smallest k; then type f⁻¹(10) on that piece | F-BF.B.4d | |
| r_addform | trig | 12 | Angle addition formulas | sin A = 3/5 and sin B = 5/13, both acute: type sin(A + B) as a fraction (63/65); cos 15° = (√6 + √a)/4: type a | F-TF.C.9 | ✎ |
| r_lawsin | trig | 10 | The law of sines | a = 10, A = 30°, B = 45°: b = k√2, type k; type sin B as a fraction from a/sin A = b/sin B | G-SRT.D.10 | ✎ |
| r_lawcos | trig | 10 | The law of cosines | Sides 5 and 8 with 60° between: type the third side (7); sides 3, 5, 7: type the largest angle (120°) | G-SRT.D.11 | ✎ |
| g_ellipse | meas | 12 | Ellipses and hyperbolas from foci | Foci (±4, 0), distances add to 10: x²/25 + y²/b² = 1, type b²; hyperbola, foci (±5, 0), difference 6: type b² | G-GPE.A.3 | ✎ |
| d_noreplace | data | 10 | Two draws without putting back | 4 red and 6 blue, take two without replacing: type P(both red) as a fraction (4/10 × 3/9 = 2/15) | S-CP.B.8 | ✎ |
| d_empexp | data | 12 | Expected value from survey data | 50 homes: 10 have 0 TVs, 25 have 1, 15 have 2: type the expected TVs per home (1.1) | S-MD.A.4 | ✎ |
| d_strategy | data | 12 | Pick the plan with the better average | Plan A $40 a month; plan B $25 a month plus a $100 charge with probability 0.2: type B's expected cost or the saving | S-MD.B.5b | ✎ |

## Partly covered

These standards have a concept, but only for part of the standard. One more narrow concept would finish each.

| id | strand | g | title | problems | standard | ✎ |
|---|---|---|---|---|---|---|
| g_partition | meas | 10 | Split a segment in a ratio | P divides A(1, 2) to B(10, 8) in the ratio 2 : 1: type P's x (7) or y (x_midpoint covers only 1 : 1) | G-GPE.B.6 | ✎ |
| d_normal | data | 11 | The 68–95–99.7 rule | Mean 70, SD 5, normal: type the percent between 60 and 80 (95), or above 75 (16) (d_zscore has no percentages) | S-ID.A.4 | |
| g_pyramid | meas | 10 | Volume of a pyramid | Square base 6 cm, height 10 cm: type the volume (120 cm³), one third of the prism (g_cyl and g_sphere cover the rest) | G-GMD.A.3 | ✎ |
