// Rules and tutorial page: the game exactly as hexchess_game.py / hexchess_pieces.py implement it, with diagrams drawn
// from the Python move patterns (/api/pieces) and an interactive piece explorer driven by the JS port of the engine.
import { route, app, api, esc } from './core.js';
import { BoardView } from './board_view.js';
import { HexGame, NAMES, START, SIZE, CELLS, cellName } from './hex_engine.js';
import { pieceIcon } from './pieces_svg.js';

const ABOUT = {
  P: 'One step forward, in either of two directions: White to (q, r+1) or (q+1, r), Black to (q, r-1) or (q-1, r). ' +
     'A Pawn captures on the same two cells it moves to (there is no separate diagonal capture, no double step and no en passant).',
  R: 'Slides any number of cells, up to 8, along the six straight lines through its cell; it cannot jump.',
  N: 'Jumps to any of the 12 cells at distance 2: two steps straight, or one step in each of two neighbouring ' +
     'directions. It jumps over anything in between.',
  B: 'In this version the Bishop slides along the same six straight lines as the Rook (the code gives both the same ' +
     'directions), so Rook, Bishop and Queen move alike.',
  Q: 'Rook and Bishop combined: here, any number of cells (up to 8) along the six straight lines.',
  K: 'One step to any of the six neighbouring cells. It may never move into check.',
  D: 'The Dragon, a piece this game adds: it slides like a Queen and jumps like a Knight (its Knight jumps, including ' +
     'the two-step straight ones, pass over pieces).',
  C: 'The Prince (C, for Crown Prince): one step to any neighbouring cell, like a King, but it is not royal. ' +
     'Pawns that reach a side edge become Princes.',
};

const mini = (host, opts) => new BoardView(host, { interactive: false, ...opts });

function pieceCard(t, pat) {
  return `<div class="card pcard"><div class="pc-head">${pieceIcon('w' + t, 34, NAMES[t])}${pieceIcon('b' + t, 34, NAMES[t])}
    <b>${NAMES[t]}</b> <span class="tag a">${t}</span><span class="tag">${pat.w.length} cells from the centre</span></div>
    <div class="mini" data-t="${t}"></div><span>${esc(ABOUT[t])}</span></div>`;
}

route('rules', async () => {
  const pats = await api('/pieces');
  app().innerHTML = `<section class="hero"><p class="kicker">How to play</p><h1 class="glow">Rules of HexChess</h1>
    <p class="lead">Chess on a hexagon of 217 cells, with two new pieces: the Dragon and the Prince. This page describes
    the rules exactly as the code implements them: every diagram is computed by the game engine.</p></section>

    <h2>The board</h2>
    <div class="two"><div><p>The board is a hexagon of radius 8: <b>217 hexagonal cells</b>. Each cell has six neighbours,
      so there are six straight lines through every cell instead of chess's four. The three cell colours are only
      decoration (they make the lines easy to follow); they play no part in the rules.</p>
      <p>Positions use the code's axial coordinates (q, r). In the move list a cell is written as a <b>file letter</b>
      for q (a to q, for q = -8 to 8) and a <b>number</b> for r (1 to 17, for r = -8 to 8): the centre (0, 0) is
      <span class="mono">i9</span>. A move reads <span class="mono">Nb8-c9</span> (Knight from b8 to c9),
      <span class="mono">×</span> marks a capture, <span class="mono">=Q</span> a promotion, <span class="mono">+</span>
      check and <span class="mono">#</span> mate.</p>
      <p>White starts along the bottom edge and moves up the screen; Black starts along the top edge. White moves first.</p></div>
      <div class="callout a"><b>Six directions, three colours.</b> Along a straight line the cell colours cycle through all
      three, and every neighbour of a cell has a different colour from it.</div></div>
    <div class="mini huge" id="b-setup"></div>

    <h2>Starting position</h2>
    <p>Each side has <b>19 pieces</b>: on its back edge Rook, Knight, Bishop, Queen, King, Bishop, Knight, Rook and
    Dragon, with a row of ten Pawns in front.</p>
    <div class="legend">${'RNBQKBNRD'.split('').map(t => `<span>${pieceIcon('w' + t, 26, NAMES[t])}${NAMES[t]}</span>`).join('')}
      <span>${pieceIcon('wP', 26, 'Pawn')}10 Pawns</span></div>

    <h2>The pieces</h2>
    <p class="mute">Each diagram shows where a white piece in the centre of an empty board can go (the board is drawn
    with radius 4 to keep it small).</p>
    <div class="grid wide">${'PRNBQKDC'.split('').map(t => pieceCard(t, pats[t])).join('')}</div>

    <h2>Try the pieces</h2>
    <div class="side explorer"><div class="panel">
      <label>Piece</label><div class="seg" id="ex-piece" role="group" aria-label="Piece to explore">
        ${'PRNBQKDC'.split('').map(t => `<button data-t="${t}" title="${NAMES[t]}">${pieceIcon('w' + t, 22, NAMES[t])}</button>`).join('')}</div>
      <label class="chk"><input type="checkbox" id="ex-block" checked> Scatter some pieces in the way</label>
      <p class="small" id="ex-info" aria-live="polite"></p>
      <p class="hint">Click a highlighted cell to move there, or any other cell to put the piece there. Dots are
      free cells, rings are captures; friendly pieces block.</p></div>
      <div class="mini big" id="b-ex"></div></div>

    <h2>Pawns and promotion</h2>
    <div class="two"><div><p>A Pawn that reaches the far edge (q + r = 8 for White, -8 for Black) becomes a <b>Queen</b>.
      One that reaches either of the two side edges next to it (q = 8 or r = 8 for White; q = -8 or r = -8 for Black)
      becomes a <b>Prince</b>; the two far corners belong to both edges and give a Prince.</p>
      <div class="legend"><span><i class="sw q"></i>White promotes to Queen</span><span><i class="sw c"></i>White promotes to Prince</span></div></div>
      <div class="mini big" id="b-promo"></div></div>

    <h2>Check, checkmate and stalemate</h2>
    <div class="two"><div><p>A King is <b>in check</b> when an enemy piece could move to its cell. You may not make a move
      that leaves your own King in check, so Kings are never actually captured.</p>
      <p><b>Checkmate</b> (you are in check and have no legal move) loses the game. <b>Stalemate</b> (no legal move but
      not in check) is a draw. In the example White's Rook has just moved to <span class="mono">${cellName(8, -1)}</span>:
      the black King on <span class="mono">${cellName(8, -8)}</span> is attacked along its edge and every escape cell is
      covered by the other Rook.</p>
      <p class="mute small">Not in this version: castling, en passant, and draws by repetition, the 50-move rule or
      insufficient material. (On the Watch page, AI games stop after 300 moves.)</p></div>
      <div class="mini big" id="b-mate"></div></div>`;

  const setup = mini(app().querySelector('#b-setup'), { coords: true, label: 'Starting position with coordinates' });
  setup.update({ pieces: START.map(p => [...p]) });

  app().querySelectorAll('.pcard .mini').forEach(el => {
    const t = el.dataset.t, v = mini(el, { radius: 4, label: `${NAMES[t]} moves` });
    v.update({ pieces: [[0, 0, 'w' + t]], targets: pats[t].w.filter(([q, r]) => Math.max(Math.abs(q), Math.abs(r), Math.abs(q + r)) <= 4) });
  });

  const promo = mini(app().querySelector('#b-promo'), { label: 'Promotion edges for White' });
  const extra = CELLS.filter(([q, r]) => q + r === SIZE || q === SIZE || r === SIZE)
    .map(([q, r]) => [q, r, (q === SIZE || r === SIZE) ? 'm-promo-c' : 'm-promo-q']);
  promo.update({ pieces: [[3, 4, 'wP'], [0, 7, 'wP']], extra, targets: [[4, 4], [3, 5], [0, 8], [1, 7]] });

  const mate = HexGame.from([[-8, 8, 'wK'], [7, 0, 'wR'], [3, -1, 'wR'], [8, -8, 'bK']], 'w');
  mate.makeMove(3, -1, 8, -1);
  mini(app().querySelector('#b-mate'), { label: 'Checkmate example' })
    .update({ pieces: mate.pieces(), last: { from: [3, -1], to: [8, -1] }, check: mate.findKing('b') });

  // explorer
  const ex = { t: 'D', at: [0, 0], block: true };
  const blockers = [[0, 2, 'bP'], [2, -2, 'wP'], [-3, 0, 'bN'], [1, 1, 'wP'], [-2, 4, 'bR'], [4, 0, 'bB'], [0, -3, 'wN'], [-1, -1, 'bP']];
  const view = new BoardView(app().querySelector('#b-ex'), { label: 'Piece explorer', startCursor: [0, 0], onClick: (q, r) => {
    ex.at = [q, r]; drawEx();
  } });
  function drawEx() {
    const pieces = (ex.block ? blockers.filter(([q, r]) => q !== ex.at[0] || r !== ex.at[1]) : []).concat([[...ex.at, 'w' + ex.t]]);
    const g = HexGame.from(pieces, 'w'), targets = g.pseudoMoves(...ex.at);
    view.update({ pieces, selected: ex.at, targets });
    app().querySelectorAll('#ex-piece button').forEach(b => b.classList.toggle('on', b.dataset.t === ex.t));
    app().querySelector('#ex-info').textContent = `${NAMES[ex.t]} on ${cellName(...ex.at)}: ${targets.length} moves.`;
  }
  app().querySelectorAll('#ex-piece button').forEach(b => b.onclick = () => { ex.t = b.dataset.t; drawEx(); });
  app().querySelector('#ex-block').onchange = e => { ex.block = e.target.checked; drawEx(); };
  drawEx();
});
