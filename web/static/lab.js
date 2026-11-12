// AI Lab: how the two AIs choose moves, and what the learning AI's saved files (ai_params_w.json / ai_params_b.json)
// record about its 125 training games.
import { route, app, api, esc } from './core.js';

const WEIGHTS = ['aggression', 'center_control', 'king_safety', 'mobility', 'board_control', 'piece_development'];
const COLORS = ['var(--accent)', 'var(--accent2)', 'var(--accent3)', '#7ee787', '#ff9e64', '#c0caf5'];
const nice = k => k.replace(/_/g, ' ');
const fmt = v => (Math.abs(v) >= 0.01 || v === 0 ? v.toFixed(3) : v.toExponential(1));

// Line chart: series [{name, color, ys}], xs shared; log y if opts.log.
function chart(xs, series, { log = false, ymin, ymax, ylabel, pct = false } = {}) {
  const W = 640, H = 240, L = 54, R = 12, T = 12, B = 34;
  const all = series.flatMap(s => s.ys).filter(v => (log ? v > 0 : Number.isFinite(v)));
  const lo = ymin ?? Math.min(...all), hi = ymax ?? Math.max(...all);
  const f = log ? Math.log10 : v => v, a = f(lo), b = f(hi);
  const X = x => L + (x - xs[0]) / (xs[xs.length - 1] - xs[0]) * (W - L - R);
  const Y = v => T + (1 - (f(Math.max(v, log ? lo : -Infinity)) - a) / (b - a)) * (H - T - B);
  const ticks = log ? Array.from({ length: Math.floor(b) - Math.ceil(a) + 1 }, (_, i) => 10 ** (Math.ceil(a) + i))
    : [0, 0.25, 0.5, 0.75, 1].map(t => lo + t * (hi - lo));
  const grid = ticks.map(t => `<line x1="${L}" x2="${W - R}" y1="${Y(t)}" y2="${Y(t)}" class="grid"/>` +
    `<text x="${L - 6}" y="${Y(t) + 4}" class="tick" text-anchor="end">${log ? '1e' + Math.round(Math.log10(t)) : pct ? Math.round(t * 100) + '%' : t.toFixed(1)}</text>`).join('');
  const xt = [xs[0], ...[25, 50, 75, 100].filter(v => v < xs[xs.length - 1]), xs[xs.length - 1]]
    .map(x => `<text x="${X(x)}" y="${H - B + 16}" class="tick" text-anchor="middle">${x}</text>`).join('');
  const lines = series.map(s => `<polyline class="ln2" stroke="${s.color}" points="${s.ys.map((v, i) => `${X(xs[i]).toFixed(1)},${Y(v).toFixed(1)}`).join(' ')}">
    <title>${esc(s.name)}</title></polyline>`).join('');
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(ylabel)} over ${xs.length} games">${grid}${xt}
    <text x="${(L + W - R) / 2}" y="${H - 4}" class="tick" text-anchor="middle">game number</text>${lines}</svg>
    <div class="legend">${series.map(s => `<span><i class="sw" style="background:${s.color}"></i>${esc(s.name)}</span>`).join('')}</div>`;
}

route('lab', async () => {
  const P = await api('/params');
  const w = P.w, b = P.b, xs = w.history.game;
  app().innerHTML = `<section class="hero"><p class="kicker">Inside the opponents</p><h1 class="glow">AI Lab</h1>
    <p class="lead">HexChess has two computer players, both ported line for line from the Python and running in your
    browser. The Basic AI also "learns": after each game it nudges its weights and saves them. Here is what it does, and
    what its saved files show.</p></section>
    <div class="tiles">
      <div class="tile"><b>${w.games_played}</b><span>games recorded for White</span></div>
      <div class="tile"><b>${w.wins}</b><span>won by White</span></div>
      <div class="tile"><b>${b.wins}</b><span>won by Black</span></div>
      <div class="tile"><b>${fmt(w.params.aggression)}</b><span>White's aggression weight now (default ${P.default.aggression})</span></div></div>

    <h2>Basic AI: score every move once</h2>
    <p>The Basic AI (the <b>Novice</b> levels) looks at each legal move without looking ahead and adds up a score:</p>
    <div class="scroll"><table><thead><tr><th>Term</th><th>What it rewards</th><th>Weight</th></tr></thead><tbody>
      <tr><td>Capture</td><td>attack value of the mover × learned value of the captured piece</td><td>aggression</td></tr>
      <tr><td>Opening (24+ pieces)</td><td>developing Knights and Bishops; moving towards the centre</td><td>piece development, centre control</td></tr>
      <tr><td>Middlegame (12–23 pieces)</td><td>moves the piece will have from its new cell; neighbouring own Pawns</td><td>mobility, pawn structure</td></tr>
      <tr><td>Endgame (under 12)</td><td>King towards the centre; Pawns towards promotion</td><td>endgame preparedness, pawn promotion</td></tr>
      <tr><td>Position</td><td>closeness to the centre; closeness to its own King; neighbouring own pieces; distance moved</td><td>board control, king safety, coordination, tempo</td></tr>
      <tr><td>Fixed terms</td><td>-50 for King moves in its first 10 moves; Prince near friends; progress forward; penalties for repeating
        positions or moves; a small bonus for variety</td><td>none (constants)</td></tr></tbody></table></div>

    <h2>Advanced AI: look ahead</h2>
    <p>The Advanced AI (<b>Casual</b>, <b>Club</b>, <b>Expert</b>) searches with minimax and alpha-beta pruning, deepening one
    ply at a time until its depth or time limit (Expert uses the desktop settings: 5 plies or 6 seconds; in the browser
    it typically completes 3 or 4 plies of a middlegame position in that time). It remembers
    positions in a transposition table and tries the best moves of the previous depth first. At the end of each line it
    scores the board from its own side: material (Pawn 1, Knight 3, Bishop 3, Rook 4, Queen 10, King 2, Dragon 20,
    Prince 2), Pawn advance and neighbouring Pawns, Dragon centralisation, its King's guards and distance from the centre, the seven centre cells, the
    difference in legal moves, and how many of its pieces touch each other. It does not use the learned weights.</p>

    <h2>What the learning did</h2>
    <p>After every game the Basic AI moves each weight a tenth of the way towards a statistic of that game, scaled by
    the result (1 for a win, 0.5 for a draw, 0 for a loss), and keeps it between 0 and 1. In the desktop tournament an
    "Exit Stuck Game" press also multiplies every weight by 0.9.</p>
    <div class="two"><div class="panel"><h3>Win rate</h3>${chart(xs, [{ name: 'White AI', color: 'var(--accent)', ys: w.history.win_rate },
      { name: 'Black AI', color: 'var(--accent2)', ys: b.history.win_rate }], { ymin: 0, ymax: 1, ylabel: 'win rate', pct: true })}</div>
    <div class="panel"><h3>White's weights (log scale)</h3>${chart(xs, WEIGHTS.map((k, i) => ({ name: nice(k), color: COLORS[i], ys: w.history.params[k] })),
      { log: true, ylabel: 'weights' })}</div></div>
    <div class="callout"><b>Why the weights fell to almost zero.</b> The statistics the update compares against
    (the AI's <span class="mono">move_stats</span> counters) are never increased anywhere in the code, so they stay 0 and
    every win pulls each weight 10% towards 0. Together with the stuck-game penalties, ${w.games_played} games took the
    weights from 0.5–0.8 down to about 1e-5. The <b>Novice</b> level plays with these saved weights (so its fixed terms
    dominate); <b>Novice+</b> uses the original defaults for comparison.</div>

    <h2>Saved weights</h2>
    <div class="scroll"><table><thead><tr><th>Weight</th><th>White</th><th>Black</th><th>Default</th></tr></thead><tbody>
      ${Object.keys(P.default).filter(k => k !== 'piece_values').map(k => `<tr><td>${nice(k)}</td><td class="mono">${fmt(w.params[k])}</td>
        <td class="mono">${fmt(b.params[k])}</td><td class="mono">${P.default[k]}</td></tr>`).join('')}
      ${Object.keys(P.default.piece_values).map(k => `<tr><td>value of ${k}</td><td class="mono">${fmt(w.params.piece_values[k])}</td>
        <td class="mono">${fmt(b.params.piece_values[k])}</td><td class="mono">${P.default.piece_values[k]}</td></tr>`).join('')}
    </tbody></table></div>
    <p class="hint">Source: ai_params_w.json and ai_params_b.json in the repository, written by the desktop app.</p>`;
});
