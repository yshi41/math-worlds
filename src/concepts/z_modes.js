/* In your head, or pencil and paper? Grades 2 to 8.
   A concept is one or the other (paper: true where it is defined; every word problem is paper). Listed here are the
   concepts where the answer depends on the level: one letter for the easy, medium and hard level, h = in your head,
   p = pencil and paper. The rule used to sort them:
   - in your head: a fact, a shortcut, or one step with numbers a child of that grade can hold (reading a picture,
     a clock or a graph counts too);
   - pencil and paper: a written method, two or more steps that have to be kept track of, a list to put in order,
     or numbers too big to hold. A word problem is always paper: draw it or write the number sentence.
   The game shows the mode on every problem, so a child knows before starting whether to pick up the pencil. */
(function (C) {
'use strict';
C.modes({
  /* marked paper where they are defined, but the easy (and sometimes medium) level is quick in your head */
  n_intadd: 'hhh', n_intsub: 'hhh', n_intmul: 'hhh',
  t_ampm: 'hpp',
  c_change5: 'hpp', c_budget: 'hhp', c_unit: 'hpp',
  f_decmul: 'hhp', f_divdec: 'hpp', f_pctchange: 'hpp', f_interest: 'hpp', f_pcterror: 'hpp',
  fa_gcf: 'hpp', fa_lcm: 'hpp', fa_primefact: 'hpp',
  g_volume: 'hpp', g_circle: 'hhh', g_convrate: 'hhp', g_scale: 'hpp',
  x_onestep: 'hhp', x_combine: 'hpp', x_ineq: 'hpp', x_rate: 'hhp',
  w_rules: 'hhp', w_sci: 'hpp',
  d_prob: 'hpp', d_complement: 'hpp', d_indep: 'hpp',
  /* shortcuts and picture reading that are in your head at first, but need writing at the harder levels */
  a_list: 'hhp',
  d_mean: 'hpp', d_sample: 'hhp', d_expect7: 'hhp', d_experiment: 'hpp', d_dotplot: 'hhp',
  g_areasplit: 'hhp', g_pairs: 'hhp', g_transversal: 'hhp', g_extangle: 'hhp',
  x_ratexpr: 'hhp', x_rates2: 'ppp', x_cross: 'hhp',
  f_undopct: 'hhp',
  fa_div7: 'hpp',
  w_fermi: 'hpp'
});
})(typeof module !== 'undefined' && module.exports ? require('../core.js') : window.MWC);
