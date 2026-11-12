// HexChess rules engine: a JS port of hexchess_board.py, hexchess_pieces.py and hexchess_game.py.
// Board: axial (q, r) cells within SIZE of the centre (217 cells), listed in the Python dict order (q outer, r inner),
// so move lists come out in exactly the order the Python code produces them. Pieces are strings such as 'wP', 'bD'.
// Checked against the Python by hex_engine.test.mjs (tests/fixtures/hex_engine_fixtures.json).

export const SIZE = 8;
const W = 2 * SIZE + 1;                       // 17: width of the (q, r) index square
export const idx = (q, r) => (q + SIZE) * W + (r + SIZE);
export const onBoard = (q, r) => Math.max(Math.abs(q), Math.abs(r), Math.abs(q + r)) <= SIZE;

export const CELLS = [];                      // [q, r] in Python order
for (let q = -SIZE; q <= SIZE; q++) {
  for (let r = Math.max(-SIZE, -q - SIZE); r <= Math.min(SIZE, -q + SIZE); r++) CELLS.push([q, r]);
}
export const CELL_INDEX = new Map(CELLS.map(([q, r], i) => [idx(q, r), i]));

export const KING_DIRS = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]];
const ROOK_DIRS = [[1, 0], [0, 1], [-1, 1], [-1, 0], [0, -1], [1, -1]];
const BISHOP_DIRS = [[1, -1], [1, 0], [0, 1], [-1, 1], [-1, 0], [0, -1]];  // same lines as the Rook (see rules page)
export const KNIGHT_OFFSETS = [[2, -1], [1, 1], [-1, 2], [-2, 1], [-1, -1], [1, -2],
  [0, -2], [2, -2], [2, 0], [0, 2], [-2, 2], [-2, 0]];
const KNIGHT_SET = new Set(KNIGHT_OFFSETS.map(([a, b]) => a * 100 + b));
export const NAMES = { P: 'Pawn', R: 'Rook', N: 'Knight', B: 'Bishop', Q: 'Queen', K: 'King', D: 'Dragon', C: 'Prince' };
export const opp = c => (c === 'w' ? 'b' : 'w');

function rays(q, r, dirs, size) {
  const out = [];
  for (const [dq, dr] of dirs) {
    for (let s = 1; s <= size; s++) {
      const nq = q + dq * s, nr = r + dr * s;
      if (Math.max(Math.abs(nq), Math.abs(nr), Math.abs(nq + nr)) <= size) out.push([nq, nr]); else break;
    }
  }
  return out;
}
const steps = (q, r, offs, size) => offs.map(([a, b]) => [q + a, r + b])
  .filter(([a, b]) => Math.max(Math.abs(a), Math.abs(b), Math.abs(a + b)) <= size);
function unique(moves) {
  const seen = new Set();
  return moves.filter(([a, b]) => { const k = a * 100 + b; if (seen.has(k)) return false; seen.add(k); return true; });
}

// Piece.get_moves(q, r, size): the cells a piece's pattern reaches (pawns are not filtered to the board, as in Python).
export function pattern(type, color, q, r, size = SIZE) {
  switch (type) {
    case 'P': { const d = color === 'w' ? 1 : -1; return [[q, r + d], [q + d, r]]; }
    case 'C': case 'K': return steps(q, r, KING_DIRS, size);
    case 'R': return rays(q, r, ROOK_DIRS, size);
    case 'N': return steps(q, r, KNIGHT_OFFSETS, size);
    case 'B': return rays(q, r, BISHOP_DIRS, size);
    case 'Q': return unique([...rays(q, r, ROOK_DIRS, size), ...rays(q, r, BISHOP_DIRS, size)]);
    case 'D': return unique([...pattern('Q', color, q, r, size), ...steps(q, r, KNIGHT_OFFSETS, size)]);
    default: throw new Error('unknown piece ' + type);
  }
}
// Pattern cache for the full board (patterns never depend on the position).
const PAT = new Map();
function patternCached(type, color, q, r) {
  const k = type + color + idx(q, r);
  let v = PAT.get(k);
  if (!v) { v = pattern(type, color, q, r); PAT.set(k, v); }
  return v;
}
const jumps = (type, dq, dr) => type === 'N' || (type === 'D' && KNIGHT_SET.has(dq * 100 + dr));

export const START = (() => {
  const p = [[-8, 0, 'wR'], [-7, -1, 'wN'], [-6, -2, 'wB'], [-5, -3, 'wQ'], [-4, -4, 'wK'], [-3, -5, 'wB'],
    [-2, -6, 'wN'], [-1, -7, 'wR'], [0, -8, 'wD']];
  for (let i = 0; i < 10; i++) p.push([-8 + i, 1 - i, 'wP']);
  p.push([8, 0, 'bR'], [7, 1, 'bN'], [6, 2, 'bB'], [5, 3, 'bQ'], [4, 4, 'bK'], [3, 5, 'bB'], [2, 6, 'bN'],
    [1, 7, 'bR'], [0, 8, 'bD']);
  for (let i = 0; i < 10; i++) p.push([8 - i, -1 + i, 'bP']);
  return p;
})();

export class HexGame {
  constructor(pieces = START, toMove = 'w') {
    this.board = new Array(W * W).fill(null);
    for (const [q, r, p] of pieces) this.board[idx(q, r)] = p;
    this.current = toMove;
    this.history = [];       // {from:[q,r], to:[q,r], piece, captured, placed, over, winner}
    this.over = false;
    this.winner = null;      // 'w', 'b', 'draw' or null
  }
  static from(pieces, toMove) { return new HexGame(pieces, toMove); }
  get(q, r) { return onBoard(q, r) ? this.board[idx(q, r)] : null; }
  set(q, r, p) { this.board[idx(q, r)] = p; }
  pieces() { return CELLS.filter(([q, r]) => this.board[idx(q, r)]).map(([q, r]) => [q, r, this.board[idx(q, r)]]); }
  boardState() { let s = ''; for (const [q, r] of CELLS) s += this.board[idx(q, r)] || '.'; return s; }

  isPathClear(fq, fr, tq, tr) {
    const dq = tq - fq, dr = tr - fr, n = Math.max(Math.abs(dq), Math.abs(dr));
    if (n <= 1) return true;
    for (let s = 1; s < n; s++) {
      if (this.board[idx(fq + Math.floor(dq * s / n), fr + Math.floor(dr * s / n))] !== null) return false;
    }
    return true;
  }
  // Targets by pattern, path and friendly-piece rules, ignoring check (HexChess._pseudo_moves).
  pseudoMoves(q, r) {
    const piece = this.get(q, r);
    if (!piece) return [];
    const out = [];
    for (const [tq, tr] of patternCached(piece[1], piece[0], q, r)) {
      if (!onBoard(tq, tr)) continue;
      const t = this.board[idx(tq, tr)];
      if (t && t[0] === piece[0]) continue;
      if (jumps(piece[1], tq - q, tr - r) || this.isPathClear(q, r, tq, tr)) out.push([tq, tr]);
    }
    return out;
  }
  findKing(color) {
    const k = color + 'K';
    for (const [q, r] of CELLS) if (this.board[idx(q, r)] === k) return [q, r];
    return null;
  }
  // True if any `by` piece's pseudo-moves include (q, r): same answer as scanning every piece, found from (q, r) out.
  attacked(q, r, by) {
    const d = by === 'w' ? 1 : -1;
    if (this.get(q, r - d) === by + 'P' || this.get(q - d, r) === by + 'P') return true;
    for (const [a, b] of KNIGHT_OFFSETS) {
      const p = this.get(q - a, r - b);
      if (p && p[0] === by && (p[1] === 'N' || p[1] === 'D')) return true;
    }
    for (const [a, b] of KING_DIRS) {
      for (let s = 1; s <= SIZE; s++) {
        const nq = q + a * s, nr = r + b * s;
        if (!onBoard(nq, nr)) break;
        const p = this.board[idx(nq, nr)];
        if (!p) continue;
        if (p[0] === by && ('RBQD'.includes(p[1]) || (s === 1 && (p[1] === 'K' || p[1] === 'C')))) return true;
        break;
      }
    }
    return false;
  }
  isInCheck(color) {
    const k = this.findKing(color);
    return k ? this.attacked(k[0], k[1], opp(color)) : false;
  }
  leavesKingInCheck(fq, fr, tq, tr) {
    const a = idx(fq, fr), b = idx(tq, tr), piece = this.board[a], cap = this.board[b];
    this.board[b] = piece; this.board[a] = null;
    const res = this.isInCheck(piece[0]);
    this.board[a] = piece; this.board[b] = cap;
    return res;
  }
  // Legal targets for the side to move's piece at (q, r) ([] for empty cells and opponent pieces).
  getPossibleMoves(q, r) {
    const piece = this.get(q, r);
    if (!piece || piece[0] !== this.current) return [];
    return this.pseudoMoves(q, r).filter(([tq, tr]) => !this.leavesKingInCheck(q, r, tq, tr));
  }
  // Legal moves of `color` whoever is to move, [fq, fr, tq, tr] in Python order.
  sideMoves(color) {
    const out = [];
    for (const [q, r] of CELLS) {
      const p = this.board[idx(q, r)];
      if (!p || p[0] !== color) continue;
      for (const [tq, tr] of this.pseudoMoves(q, r)) if (!this.leavesKingInCheck(q, r, tq, tr)) out.push([q, r, tq, tr]);
    }
    return out;
  }
  legalMoves() { return this.sideMoves(this.current); }
  hasLegalMoves(color) {
    for (const [q, r] of CELLS) {
      const p = this.board[idx(q, r)];
      if (!p || p[0] !== color) continue;
      for (const [tq, tr] of this.pseudoMoves(q, r)) if (!this.leavesKingInCheck(q, r, tq, tr)) return true;
    }
    return false;
  }
  isCheckmate(color = this.current) { return this.isInCheck(color) && !this.hasLegalMoves(color); }
  isStalemate(color = this.current) { return !this.isInCheck(color) && !this.hasLegalMoves(color); }

  isLegal(fq, fr, tq, tr) {
    if (!onBoard(tq, tr)) return false;
    const piece = this.get(fq, fr);
    if (!piece || piece[0] !== this.current) return false;
    const t = this.get(tq, tr);
    if (t && t[0] === this.current) return false;
    if (!this.pseudoMoves(fq, fr).some(([a, b]) => a === tq && b === tr)) return false;
    return !this.leavesKingInCheck(fq, fr, tq, tr);
  }
  // HexChess.make_move: returns false (and changes nothing) for an illegal move or a finished game.
  makeMove(fq, fr, tq, tr, promotion = 'Q') {
    if (this.over || !this.isLegal(fq, fr, tq, tr)) return false;
    const piece = this.get(fq, fr), captured = this.get(tq, tr), c = piece[0];
    let placed = piece;
    if (piece[1] === 'P') {
      if ((c === 'w' && tq + tr === SIZE) || (c === 'b' && tq + tr === -SIZE)) placed = c + promotion;
      if ((c === 'w' && (tr === SIZE || tq === SIZE)) || (c === 'b' && (tr === -SIZE || tq === -SIZE))) placed = c + 'C';
    }
    this.set(tq, tr, placed); this.set(fq, fr, null);
    this.history.push({ from: [fq, fr], to: [tq, tr], piece, captured, placed, over: this.over, winner: this.winner });
    if (captured && captured[1] === 'K') { this.over = true; this.winner = c; return true; }
    this.current = opp(c);
    if (this.isCheckmate(this.current)) { this.over = true; this.winner = c; }
    else if (this.isStalemate(this.current)) { this.over = true; this.winner = 'draw'; }
    return true;
  }
  undoMove() {
    const h = this.history.pop();
    if (!h) return false;
    this.set(h.from[0], h.from[1], h.piece);
    this.set(h.to[0], h.to[1], h.captured);
    this.current = h.piece[0];
    this.over = h.over; this.winner = h.winner;
    return true;
  }
  clone() {
    const g = new HexGame([], this.current);
    g.board = this.board.slice(); g.history = this.history.slice(); g.over = this.over; g.winner = this.winner;
    return g;
  }
}

// --- notation ------------------------------------------------------------------------------------------------------
// Cells are named by file letter (q = -8..8 -> a..q) and number (r = -8..8 -> 1..17), e.g. (0, 0) = i9.
export const cellName = (q, r) => String.fromCharCode(105 + q) + (r + 9);
export function moveSan(game, fq, fr, tq, tr) {
  // Call before the move is made on `game`; returns e.g. "Nb8-c9", "Q×e5+", "Pi16=C#".
  const piece = game.get(fq, fr), cap = game.get(tq, tr), g = game.clone();
  if (!g.makeMove(fq, fr, tq, tr)) return '?';
  const placed = g.history[g.history.length - 1].placed;
  let s = piece[1] + cellName(fq, fr) + (cap ? '×' : '-') + cellName(tq, tr);
  if (placed !== piece) s += '=' + placed[1];
  if (g.over && g.winner !== 'draw') s += '#';
  else if (g.isInCheck(g.current)) s += '+';
  return s;
}
