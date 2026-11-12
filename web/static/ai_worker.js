// Web Worker running the AIs off the main thread. Message in: { id, moves, level, params } where moves is the game so
// far from the starting position; out: { id, progress } while AdvancedAI deepens, then { id, move, info }.
import { HexGame } from './hex_engine.js';
import { BasicAI } from './hex_ai_basic.js';
import { AdvancedAI } from './hex_ai_advanced.js';

self.onmessage = ({ data }) => {
  const { id, moves, level, params } = data;
  try {
    const g = new HexGame(), color = moves.length % 2 === 0 ? 'w' : 'b';
    const t0 = performance.now();
    let ai, move, info;
    if (level.kind === 'basic') {
      ai = new BasicAI(g, color, params[color]);
      for (const m of moves) {        // rebuild the Basic AI's history of its own moves (repetition/progress terms)
        if (g.current === color) { ai.updateHistories(m); ai.totalMoves += 1; }
        g.makeMove(...m);
      }
      const ranked = ai.rankMoves().slice(0, 5);
      move = ai.makeMove();
      info = { kind: 'basic', ms: performance.now() - t0, top: ranked.map(x => ({ move: x.move, score: x.score })) };
    } else {
      for (const m of moves) g.makeMove(...m);
      ai = new AdvancedAI(g, color, { maxDepth: level.depth, maxTime: level.time });
      move = ai.makeMove((depth, m, score) => self.postMessage({ id, progress: { depth, move: m, score, nodes: ai.nodes,
        ms: performance.now() - t0 } }));
      info = { kind: 'advanced', depth: ai.depthReached, nodes: ai.nodes, score: ai.lastScore, ms: performance.now() - t0 };
    }
    self.postMessage({ id, move, info });
  } catch (e) {
    self.postMessage({ id, error: String(e && e.stack || e) });
  }
};
