// BasicAI: a JS port of hexchess_ai.BasicAI and hexchess_evaluation.EvaluationMixin.
// It scores every legal move once (no search) with the learned weights from ai_params_<colour>.json, plus fixed
// terms for repetition, progress and early development, and plays the best one. State (move/position history,
// total_moves) persists between calls exactly as in Python, so a game replays move for move.

import { HexGame, SIZE, KING_DIRS, onBoard, idx, opp } from './hex_engine.js';

// BasicAI.piece_values: fixed attack/defence weights (separate from the learned params.piece_values).
export const PIECE_ATTACK = { P: 1, N: 3, B: 3, R: 4, Q: 10, K: 2, D: 20, C: 2 };
const NEIGH = [[1, -1], [1, 0], [0, 1], [-1, 1], [-1, 0], [0, -1]];
const centreDist = (q, r) => Math.max(Math.abs(q), Math.abs(r));
const hexDist = (q1, r1, q2, r2) => Math.max(Math.abs(q2 - q1), Math.abs(r2 - r1), Math.abs((q2 + r2) - (q1 + r1)));
const key = m => m.join(',');

// Fixed-length history like collections.deque(maxlen=n).
class Deque {
  constructor(max) { this.max = max; this.a = []; }
  push(x) { this.a.push(x); if (this.a.length > this.max) this.a.shift(); }
  clear() { this.a = []; }
  get length() { return this.a.length; }
}

export class BasicAI {
  constructor(game, color, params, random = Math.random) {
    this.game = game; this.color = color; this.random = random;
    this.params = JSON.parse(JSON.stringify(params));
    this.totalMoves = 0;
    this.positionHistory = new Deque(20);   // board strings after this AI's moves
    this.moveHistory = new Deque(40);       // move keys "fq,fr,tq,tr"
    this.repetitionThreshold = 2; this.diversityBonus = 0.2;
    this.longLoopThreshold = 10; this.forcedRandomMoveThreshold = 30; this.earlyGameThreshold = 10;
  }
  allMoves() { return this.game.sideMoves(this.color); }

  makeMove() {
    const m = this.chooseMove();
    if (m) this.totalMoves += 1;
    return m;
  }
  chooseMove() {
    const g = this.game, all = this.allMoves();
    if (!all.length) return null;
    const kingCaptures = all.filter(([, , tq, tr]) => { const t = g.get(tq, tr); return t && t[1] === 'K' && t[0] !== this.color; });
    if (kingCaptures.length) return kingCaptures[Math.floor(this.random() * kingCaptures.length)];
    const phase = this.gamePhase();
    let scored = all.map(m => [m, this.evaluateMove(m, phase)]);
    const counts = new Map();
    for (const k of this.moveHistory.a) counts.set(k, (counts.get(k) || 0) + 1);
    scored = scored.map(([m, s]) => [m, s + this.diversityBonus / ((counts.get(key(m)) || 0) + 1)]);
    if (this.detectLongLoop()) return all[Math.floor(this.random() * all.length)];
    let best = scored[0];
    for (const x of scored) if (x[1] > best[1]) best = x;
    this.updateHistories(best[0]);
    return best[0];
  }
  // Scores of every legal move (for the "AI insight" panel), best first.
  rankMoves() {
    const phase = this.gamePhase();
    return this.allMoves().map(m => ({ move: m, score: this.evaluateMove(m, phase) })).sort((a, b) => b.score - a.score);
  }
  gamePhase() {
    const n = this.game.pieces().length;
    return n >= 24 ? 'opening' : n >= 12 ? 'middlegame' : 'endgame';
  }

  evaluateMove(move, phase) {
    const [fq, fr, tq, tr] = move, g = this.game, P = this.params;
    const moving = g.get(fq, fr), captured = g.get(tq, tr);
    let score = 0;
    if (captured && captured[1] === 'K') return 100000;
    if (captured) score += this.evalCapture(moving, captured);
    score += this.evalPhase(moving, fq, fr, tq, tr, phase);
    if (moving[1] === 'K' && this.totalMoves < this.earlyGameThreshold) score -= 50;
    score += P.board_control * (SIZE - centreDist(tq, tr));
    score += this.evalKingSafety(tq, tr);
    score += this.evalMobility(tq, tr, fq, fr);
    score += this.evalCoordination(tq, tr);
    score += hexDist(fq, fr, tq, tr) * P.tempo * 0.1;
    if (moving[1] === 'C') score += this.evalPrince(tq, tr);
    score += this.evalRepetition(move) * 2;
    score += this.evalProgress(move);
    score += this.evalStalemateAvoidance(move);
    if (this.totalMoves < this.earlyGameThreshold) score += this.evalEarlyDevelopment(moving, tq, tr);
    return score;
  }
  evalCapture(moving, captured) {
    const P = this.params;
    if (captured[0] !== this.color) return PIECE_ATTACK[moving[1]] * P.piece_values[captured[1]] * P.aggression;
    return -P.piece_values[captured[1]];
  }
  evalPhase(piece, fq, fr, tq, tr, phase) {
    const P = this.params;
    let s = 0;
    if (phase === 'opening') {
      if ('NB'.includes(piece[1]) && ((this.color === 'w' && fr < 0) || (this.color === 'b' && fr > 0))) s += P.piece_development;
      else s += 0;
      s += P.center_control * (SIZE - centreDist(tq, tr));
    } else if (phase === 'middlegame') {
      s += this.evalMobility(tq, tr, fq, fr);
      s += this.pawnStructure(tq, tr);
    } else {
      s += piece[1] === 'K' ? P.endgame_preparedness * (SIZE - centreDist(tq, tr)) : 0;
      if (piece[1] === 'P') {
        const dist = this.color === 'w' ? SIZE - tr : tr + SIZE;
        s += P.pawn_promotion * (SIZE - dist);
      } else s += 0;
    }
    return s;
  }
  pawnStructure(q, r) {
    let s = 0;
    for (const [a, b] of NEIGH) {
      const p = onBoard(q + a, r + b) ? this.game.get(q + a, r + b) : null;
      if (p && p[0] === this.color && p[1] === 'P') s += this.params.pawn_structure;
    }
    return s;
  }
  // Moves the piece would have from (tq, tr) after moving there.
  countMovesAfter(fq, fr, tq, tr) {
    const g = this.game, a = idx(fq, fr), b = idx(tq, tr), piece = g.board[a], cap = g.board[b];
    g.board[b] = piece; g.board[a] = null;
    const n = g.getPossibleMoves(tq, tr).length;
    g.board[a] = piece; g.board[b] = cap;
    return n;
  }
  evalMobility(tq, tr, fq, fr) { return this.countMovesAfter(fq, fr, tq, tr) * this.params.mobility * 0.1; }
  evalCoordination(q, r) {
    let s = 0;
    for (const [a, b] of NEIGH) {
      const p = onBoard(q + a, r + b) ? this.game.get(q + a, r + b) : null;
      if (p && p[0] === this.color) s += this.params.piece_coordination;
    }
    return s;
  }
  evalPrince(tq, tr) {
    let s = 0;
    s += (SIZE - centreDist(tq, tr)) * 0.1;
    for (const [a, b] of KING_DIRS) {
      const p = onBoard(tq + a, tr + b) ? this.game.get(tq + a, tr + b) : null;
      if (p && p[0] === this.color) s += 0.5;
    }
    return s;
  }
  evalEarlyDevelopment(piece, tq, tr) {
    let s = 0;
    if ('NBR'.includes(piece[1])) {
      s += (SIZE - centreDist(tq, tr)) * 0.5;
      if ((piece[0] === 'w' && tr > -SIZE) || (piece[0] === 'b' && tr < SIZE)) s += 2;
    }
    return s;
  }
  evalKingSafety(q, r) {
    const k = this.game.findKing(this.color);
    if (!k) return 0;
    const d = hexDist(q, r, k[0], k[1]);
    if (this.totalMoves < this.earlyGameThreshold) return this.params.king_safety * (1 / (d + 1));
    return this.params.king_safety * (1 / (d + 1)) * 0.5;
  }
  stateAfter([fq, fr, tq, tr]) {
    const g = this.game, a = idx(fq, fr), b = idx(tq, tr), piece = g.board[a], cap = g.board[b];
    g.board[b] = piece; g.board[a] = null;
    const s = g.boardState();
    g.board[a] = piece; g.board[b] = cap;
    return s;
  }
  evalRepetition(move) {
    const s = this.stateAfter(move);
    const reps = this.positionHistory.a.filter(x => x === s).length;
    return reps >= this.repetitionThreshold ? -2.0 * reps : 0;
  }
  evalProgress(move) {
    const k = key(move), i = this.moveHistory.a.indexOf(k);
    if (i >= 0) return -0.5 * (this.moveHistory.length - i);
    const [, fr, , tr] = move;
    return (this.color === 'w' ? tr - fr : fr - tr) * 0.1;
  }
  // 0.5 if the opponent keeps any one-step move after this move, else -1 (BasicAI._get_possible_moves_for_piece).
  evalStalemateAvoidance([fq, fr, tq, tr]) {
    const g = this.game, a = idx(fq, fr), b = idx(tq, tr), piece = g.board[a], cap = g.board[b], o = opp(this.color);
    g.board[b] = piece; g.board[a] = null;
    let any = false;
    outer: for (let i = 0; i < g.board.length; i++) {
      const p = g.board[i];
      if (!p || p[0] !== o) continue;
      const q = Math.floor(i / 17) - SIZE, r = (i % 17) - SIZE;
      for (const [dq, dr] of KING_DIRS) {
        if (!onBoard(q + dq, r + dr)) continue;
        const t = g.board[idx(q + dq, r + dr)];
        if (!t || t[0] !== p[0]) { any = true; break outer; }
      }
    }
    g.board[a] = piece; g.board[b] = cap;
    return any ? 0.5 : -1.0;
  }
  detectLongLoop() {
    if (this.positionHistory.length < this.longLoopThreshold) return false;
    const recent = this.positionHistory.a.slice(-this.longLoopThreshold), counts = new Map();
    for (const s of recent) counts.set(s, (counts.get(s) || 0) + 1);
    return [...counts.values()].some(c => c > Math.floor(this.longLoopThreshold / 2));
  }
  updateHistories(move) {
    this.moveHistory.push(key(move));
    this.positionHistory.push(this.stateAfter(move));
    if (this.moveHistory.length >= this.forcedRandomMoveThreshold) {
      if (new Set(this.moveHistory.a).size <= Math.floor(this.forcedRandomMoveThreshold / 2)) {
        // As in Python: the histories restart from a random move (the move returned is still the best one).
        const all = this.allMoves();
        const rnd = all[Math.floor(this.random() * all.length)];
        this.moveHistory.clear(); this.positionHistory.clear();
        this.updateHistories(rnd);
      }
    }
  }
}

export { HexGame };
