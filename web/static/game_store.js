// Game record for the play and watch pages: the move list (replayed through the engine), redo stack, notation,
// captured pieces, result text and save/resume in localStorage (every access wrapped: storage can be unavailable).
import { HexGame, moveSan, opp } from './hex_engine.js';

const KEY = 'hexchess.save.v1';

export class GameRecord {
  constructor(moves = []) { this.reset(); for (const m of moves) if (!this.push(m)) break; }
  reset() { this.game = new HexGame(); this.moves = []; this.sans = []; this.redoStack = []; this.captured = { w: [], b: [] }; }
  push(m, keepRedo = false) {
    const san = moveSan(this.game, ...m), cap = this.game.get(m[2], m[3]);
    if (!this.game.makeMove(...m)) return false;
    this.moves.push(m); this.sans.push(san);
    if (cap) this.captured[cap[0] === 'w' ? 'b' : 'w'].push(cap);   // pieces captured BY each side
    if (!keepRedo) this.redoStack = [];
    return true;
  }
  undo() {
    if (!this.moves.length) return null;
    const m = this.moves.pop(); this.sans.pop();
    const h = this.game.history[this.game.history.length - 1];
    if (h.captured) this.captured[h.captured[0] === 'w' ? 'b' : 'w'].pop();
    this.game.undoMove();
    this.redoStack.push(m);
    return m;
  }
  redo() { const m = this.redoStack.pop(); if (m && !this.push(m, true)) this.redoStack = []; return m || null; }
  get last() { const h = this.game.history[this.game.history.length - 1]; return h ? { from: h.from, to: h.to, captured: h.captured } : null; }
  get turn() { return this.game.current; }
  checkCell() { const g = this.game, c = g.current; return g.isInCheck(c) ? g.findKing(c) : null; }
  result() {
    const g = this.game;
    if (!g.over) return null;
    if (g.winner === 'draw') return { title: 'Stalemate', text: `${g.current === 'w' ? 'White' : 'Black'} has no legal move but is not in check: the game is drawn.` };
    const w = g.winner === 'w' ? 'White' : 'Black';
    return { title: `Checkmate: ${w} wins`, text: `${opp(g.winner) === 'w' ? 'White' : 'Black'}'s King is attacked and no move can save it.`, winner: g.winner };
  }
  // Numbered move pairs: [[1, 'Pa9-a10', 'Pq8-q7'], ...]
  pairs() { const out = []; this.sans.forEach((s, i) => { if (i % 2 === 0) out.push([i / 2 + 1, s, '']); else out[out.length - 1][2] = s; }); return out; }
}

export function save(slot, data) {
  try { const all = JSON.parse(localStorage.getItem(KEY) || '{}'); all[slot] = { ...data, saved: Date.now() }; localStorage.setItem(KEY, JSON.stringify(all)); return true; }
  catch { return false; }
}
export function load(slot) {
  try { return (JSON.parse(localStorage.getItem(KEY) || '{}') || {})[slot] || null; } catch { return null; }
}
export function clear(slot) {
  try { const all = JSON.parse(localStorage.getItem(KEY) || '{}'); delete all[slot]; localStorage.setItem(KEY, JSON.stringify(all)); } catch { /* storage unavailable */ }
}
