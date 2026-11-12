// Main-thread side of the AI: difficulty levels, a module Web Worker, cancellation (terminate and respawn).
import { api } from './core.js';

export const LEVELS = [
  { id: 'basic', name: 'Novice', kind: 'basic', weights: 'learned',
    desc: 'Basic AI with the weights it learned in 125 desktop games: scores every move once, no look-ahead.' },
  { id: 'basic-default', name: 'Novice+', kind: 'basic', weights: 'default',
    desc: 'Basic AI with its original default weights (before learning).' },
  { id: 'adv1', name: 'Casual', kind: 'advanced', depth: 1, time: 2,
    desc: 'Advanced AI, 1 ply: picks the move with the best position evaluation.' },
  { id: 'adv2', name: 'Club', kind: 'advanced', depth: 2, time: 4,
    desc: 'Advanced AI, 2 plies of minimax with alpha-beta: sees your best reply.' },
  { id: 'adv5', name: 'Expert', kind: 'advanced', depth: 5, time: 6,
    desc: 'Advanced AI with the desktop settings: iterative deepening up to 5 plies or 6 seconds.' },
];
export const level = id => LEVELS.find(l => l.id === id) || LEVELS[3];

let paramsP = null;
export function aiParams() {
  if (!paramsP) paramsP = api('/params').then(p => ({ learned: { w: p.w.params, b: p.b.params }, default: { w: p.default, b: p.default } }));
  return paramsP;
}

export class AIClient {
  constructor() { this.seq = 0; this.worker = null; this.pending = null; }
  spawn() {
    this.worker = new Worker(new URL('./ai_worker.js', import.meta.url), { type: 'module' });
    this.worker.onmessage = ({ data }) => {
      const p = this.pending;
      if (!p || data.id !== p.id) return;
      if (data.progress) { p.onProgress?.(data.progress); return; }
      this.pending = null;
      data.error ? p.reject(new Error(data.error)) : p.resolve(data);
    };
    this.worker.onerror = e => { const p = this.pending; this.pending = null; p?.reject(new Error(e.message || 'AI worker failed')); };
  }
  async think(moves, levelId, onProgress) {
    this.cancel();
    if (!this.worker) this.spawn();
    const lv = level(levelId), all = await aiParams();
    const params = all[lv.weights === 'default' ? 'default' : 'learned'];
    const id = ++this.seq;
    return new Promise((resolve, reject) => {
      this.pending = { id, resolve, reject, onProgress };
      this.worker.postMessage({ id, moves, level: lv, params });
    });
  }
  // Stop a search in progress (the worker is busy, so it is replaced); the pending promise resolves to null.
  cancel() {
    if (this.pending) { const p = this.pending; this.pending = null; this.worker?.terminate(); this.worker = null; p.resolve(null); }
  }
  dispose() { this.cancel(); this.worker?.terminate(); this.worker = null; }
}
