// AdvancedAI: a JS port of hexchess_ai.AdvancedAI: iterative-deepening minimax with alpha-beta pruning, a board-string
// transposition table and root move ordering, all as in the Python (including its quirks: the table is keyed by
// the board alone and its entries are reused whenever their depth is enough). The evaluation is the Python
// _evaluate_board, from this AI's side, summed in the same order so scores match to the last bit.

import { SIZE, CELLS, idx, opp } from './hex_engine.js';
import { PIECE_ATTACK } from './hex_ai_basic.js';

const NEIGH = [[1, -1], [1, 0], [0, 1], [-1, 1], [-1, 0], [0, -1]];
const CENTER = [[0, 0], [1, -1], [1, 0], [0, 1], [-1, 1], [-1, 0], [0, -1]];
const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

export class AdvancedAI {
  constructor(game, color, { maxDepth = 5, maxTime = 6, random = Math.random } = {}) {
    this.game = game; this.color = color; this.random = random;
    this.maxDepth = maxDepth; this.maxTime = maxTime;     // seconds, as in Python (max_time = 6, max_depth = 5)
    this.tt = new Map();                                  // board string -> [score, depth]
    this.moveOrdering = new Map();                        // "fq,fr,tq,tr" -> last root score
    this.nodes = 0; this.depthReached = 0;
  }
  timeUp() { return (now() - this.start) / 1000 > this.maxTime; }

  makeMove(onDepth) {
    this.start = now(); this.nodes = 0; this.depthReached = 0;
    let best = null, bestScore = -Infinity;
    for (let d = 1; d <= this.maxDepth; d++) {
      const [m, s] = this.searchRoot(d);
      if (m) { best = m; bestScore = s; this.depthReached = d; if (onDepth) onDepth(d, m, s); }
      if (this.timeUp()) break;
    }
    if (!best) {
      const all = this.game.sideMoves(this.color);
      if (all.length) best = all[Math.floor(this.random() * all.length)];
    }
    this.lastScore = bestScore;
    return best;
  }
  ordered(moves, desc) {
    const v = m => this.moveOrdering.get(m.join(',')) || 0;
    const cmp = (x, y) => (x < y ? -1 : x > y ? 1 : 0);                      // handles +-Infinity scores
    return moves.slice().sort((a, b) => (desc ? cmp(v(b), v(a)) : cmp(v(a), v(b))));  // stable, like Python's sort
  }
  searchRoot(depth) {
    const g = this.game;
    let best = null, bestScore = -Infinity;
    for (const m of this.ordered(g.sideMoves(this.color), true)) {
      if (this.timeUp()) break;
      g.makeMove(...m);
      const s = this.minimax(depth - 1, -Infinity, Infinity, false);
      g.undoMove();
      if (s > bestScore) { bestScore = s; best = m; }
      this.moveOrdering.set(m.join(','), s);
    }
    return [best, bestScore];
  }
  minimax(depth, alpha, beta, maximizing) {
    const g = this.game;
    this.nodes++;
    if (depth === 0 || g.over || this.timeUp()) return this.evaluate(g);
    const h = g.boardState(), hit = this.tt.get(h);
    if (hit && hit[1] >= depth) return hit[0];
    let best = maximizing ? -Infinity : Infinity;
    for (const m of this.ordered(g.sideMoves(g.current), maximizing)) {
      g.makeMove(...m);
      const s = this.minimax(depth - 1, alpha, beta, !maximizing);
      g.undoMove();
      if (maximizing) { if (s > best) best = s; alpha = Math.max(alpha, best); }
      else { if (s < best) best = s; beta = Math.min(beta, best); }
      if (beta <= alpha) break;
    }
    this.tt.set(h, [best, depth]);
    return best;
  }

  // --- evaluation (AdvancedAI._evaluate_board), from this AI's side ---------------------------------------------
  evaluate(g) {
    if (g.over) return g.winner === this.color ? Infinity : g.winner === 'draw' ? 0 : -Infinity;
    return this.terms(g).total;
  }
  // The individual terms, for the evaluation bar and the AI Lab page.
  terms(g) {
    const material = this.material(g);
    const t = { material: this.color === 'w' ? material : -material };
    let score = t.material;
    score += (t.positions = this.piecePositions(g));
    score += (t.kingSafety = this.kingSafety(g));
    score += (t.pawns = this.pawnStructure(g));
    score += (t.centre = this.centreControl(g));
    score += (t.mobility = this.mobility(g));
    score += (t.coordination = this.coordination(g));
    t.total = score;
    return t;
  }
  material(g) {
    let b = 0;
    for (const [q, r] of CELLS) {
      const p = g.board[idx(q, r)];
      if (p) b += p[0] === 'w' ? PIECE_ATTACK[p[1]] : -PIECE_ATTACK[p[1]];
    }
    return b;
  }
  pawnPosition(g, q, r, color) {
    let s = 0;
    const d = color === 'w' ? 1 : -1;
    s += r * d * 0.1;
    if (g.get(q, r + d) === color + 'P') s -= 0.5;
    for (const [a, b] of NEIGH) if (g.get(q + a, r + b) === color + 'P') s += 0.3;
    return s;
  }
  dragonPosition(g, q, r, color) {
    let s = 0;
    s += (7 - Math.max(Math.abs(q), Math.abs(r))) * 0.2;
    for (const [a, b] of NEIGH) { const p = g.get(q + a, r + b); if (p && p[0] !== color) s += 0.1; }
    return s;
  }
  piecePositions(g) {
    let s = 0;
    for (const [q, r] of CELLS) {
      const p = g.board[idx(q, r)];
      if (!p) continue;
      const sign = p[0] === this.color ? 1 : -1;
      if (p[1] === 'P') s += sign * this.pawnPosition(g, q, r, p[0]);
      else if (p[1] === 'D') s += sign * this.dragonPosition(g, q, r, p[0]);
    }
    return s;
  }
  kingSafety(g) {
    const k = g.findKing(this.color);
    if (!k) return 0;
    let s = 0;
    for (const [a, b] of NEIGH) { const p = g.get(k[0] + a, k[1] + b); if (p && p[0] === this.color) s += 1; }
    s += Math.max(Math.abs(k[0]), Math.abs(k[1])) * 0.1;
    return s;
  }
  pawnStructure(g) {
    let s = 0;
    for (const [q, r] of CELLS) {
      const p = g.board[idx(q, r)];
      if (!p || p[1] !== 'P') continue;
      if (p[0] === this.color) s += this.pawnPosition(g, q, r, this.color);
      else s -= this.pawnPosition(g, q, r, opp(this.color));
    }
    return s;
  }
  centreControl(g) {
    let s = 0;
    for (const [q, r] of CENTER) {
      const p = g.get(q, r);
      if (p) { const v = 0.1 * PIECE_ATTACK[p[1]]; s += p[0] === this.color ? v : -v; }
    }
    return s;
  }
  mobility(g) { return (g.sideMoves(this.color).length - g.sideMoves(opp(this.color)).length) * 0.1; }
  coordination(g) {
    let s = 0;
    for (const [q, r] of CELLS) {
      const p = g.board[idx(q, r)];
      if (!p || p[0] !== this.color) continue;
      for (const [a, b] of NEIGH) { const n = g.get(q + a, r + b); if (n && n[0] === this.color) s += 0.1; }
    }
    return s;
  }
}

export { SIZE };
