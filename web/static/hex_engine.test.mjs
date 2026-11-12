// Node test: the JS engine and AIs reproduce the Python (tests/fixtures/hex_engine_fixtures.json, written by
// scripts/make_engine_fixtures.py). Run: node web/static/hex_engine.test.mjs
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { HexGame, CELLS, cellName, moveSan } from './hex_engine.js';
import { BasicAI } from './hex_ai_basic.js';
import { AdvancedAI } from './hex_ai_advanced.js';

const here = fileURLToPath(new URL('.', import.meta.url));
const F = JSON.parse(readFileSync(here + '../../tests/fixtures/hex_engine_fixtures.json', 'utf8'));
let checks = 0, fails = 0;
const ok = (cond, msg) => { checks++; if (!cond) { fails++; if (fails < 25) console.error('FAIL', msg); } };
const close = (a, b) => a === b || Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));
const N = CELLS.length;
const INDEX = new Map(CELLS.map(([q, r], i) => [q * 100 + r, i]));
const enc = ([a, b, c, d]) => INDEX.get(a * 100 + b) * N + INDEX.get(c * 100 + d);

ok(JSON.stringify(F.cells) === JSON.stringify(CELLS), 'cell order matches HexBoard.get_all_cells');

function compare(g, s, where) {
  ok(g.current === s.to_move, `${where}: side to move`);
  ok(g.isInCheck('w') === s.check_w && g.isInCheck('b') === s.check_b, `${where}: check flags`);
  ok(g.over === s.over && g.winner === s.winner, `${where}: result ${g.over}/${g.winner} vs ${s.over}/${s.winner}`);
  ok(g.boardState() === s.board, `${where}: board`);
  const legal = g.over ? g.legalMoves() : g.legalMoves();
  const got = legal.map(enc);
  ok(got.length === s.legal.length && got.every((x, i) => x === s.legal[i]),
    `${where}: legal moves (${got.length} vs ${s.legal.length})`);
}

// 1. Random games: every position along the way.
let positions = 0;
for (const game of F.random_games) {
  const g = new HexGame();
  compare(g, game.states[0], `seed ${game.seed} ply 0`);
  game.moves.forEach((m, i) => {
    ok(g.makeMove(...m), `seed ${game.seed} ply ${i + 1}: move accepted`);
    compare(g, game.states[i + 1], `seed ${game.seed} ply ${i + 1}`);
    positions++;
  });
}

// 2. Hand-built positions (check, pins, mate, stalemate, promotion, Dragon jumps), with undo.
for (const p of F.positions) {
  const g = HexGame.from(p.pieces, p.to_move);
  compare(g, p.before, p.note + ' (before)');
  const before = g.boardState();
  ok(g.makeMove(...p.move) === p.ok, p.note + ': move accepted');
  compare(g, p.after, p.note + ' (after)');
  if (p.ok) { g.undoMove(); ok(g.boardState() === before && g.current === p.to_move && !g.over, p.note + ': undo'); }
  positions += 2;
}

// 3. BasicAI vs BasicAI: same score for every candidate move and the same move, ply after ply.
let scored = 0;
for (const bg of F.basic_games) {
  const g = new HexGame();
  const ais = { w: new BasicAI(g, 'w', bg.params_w), b: new BasicAI(g, 'b', bg.params_b) };
  bg.plies.forEach((ply, i) => {
    const ai = ais[g.current], phase = ai.gamePhase();
    const scores = ai.allMoves().map(m => ai.evaluateMove(m, phase));
    ok(scores.length === ply.scores.length && scores.every((s, j) => close(s, ply.scores[j])),
      `${bg.label} ply ${i + 1}: move scores`);
    scored += scores.length;
    const m = ai.makeMove();
    ok(m && m.join() === ply.move.join(), `${bg.label} ply ${i + 1}: chose ${m} vs ${ply.move}`);
    g.makeMove(...ply.move);
  });
}

// 4. AdvancedAI: root scores, chosen move and board evaluation at fixed depth.
for (const a of F.advanced) {
  const g = HexGame.from(a.pieces, a.to_move);
  for (const c of ['w', 'b']) ok(close(new AdvancedAI(g, c).evaluate(g), a.eval[c]), `advanced eval ${c} depth ${a.depth}`);
  const ai = new AdvancedAI(g, a.to_move, { maxDepth: a.depth, maxTime: Infinity });
  const before = g.boardState();
  const m = ai.makeMove();
  ok(g.boardState() === before, 'advanced search leaves the board unchanged');
  ok(JSON.stringify(m) === JSON.stringify(a.move), `advanced depth ${a.depth}: chose ${m} vs ${a.move}`);
  ok(a.root.length === ai.moveOrdering.size && a.root.every(([mv, s]) => close(ai.moveOrdering.get(mv.join(',')), s)),
    `advanced depth ${a.depth}: root scores`);
}

// 5. Notation.
ok(cellName(0, 0) === 'i9' && cellName(-8, 8) === 'a17', 'cell names');
ok(moveSan(new HexGame(), -7, -1, -6, 0) === 'Nb8-c9', 'move notation');
const mate = HexGame.from([[-8, 8, 'wK'], [7, 0, 'wR'], [3, -1, 'wR'], [8, -8, 'bK']], 'w');
ok(moveSan(mate, 3, -1, 8, -1).endsWith('#'), 'mate notation');

console.log(`${checks - fails}/${checks} checks passed: ${positions} positions (legal-move lists), ${scored} BasicAI move ` +
  `scores, ${F.advanced.length} AdvancedAI searches matched the Python`);
process.exit(fails ? 1 : 0);
