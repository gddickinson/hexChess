// Home page: hero with a live AI-vs-AI board, real counts from the Python engine, and links to every page.
import { route, app, api, onLeave } from './core.js';
import { BoardView } from './board_view.js';
import { HexGame } from './hex_engine.js';
import { BasicAI } from './hex_ai_basic.js';
import { aiParams } from './ai_client.js';

route('home', async () => {
  const [info, params] = await Promise.all([api('/info'), aiParams()]);
  app().innerHTML = `<section class="hero split"><div>
      <p class="kicker">Hexagonal chess · Dragon &amp; Prince · learning AI</p>
      <h1 class="glow">HexChess</h1>
      <p class="lead">Chess reimagined on a board of ${info.cells} hexagons. Every cell has six neighbours and six straight
      lines through it, and a Dragon slides like a Queen and leaps like a Knight. Play the AI
      in your browser at four levels, watch it play itself, or learn the rules piece by piece.</p>
      <a class="btn" href="#/play">Play now</a><a class="btn alt" href="#/watch?autoplay=1">Watch AI vs AI</a>
      <a class="btn alt" href="#/rules">Learn the rules</a></div>
    <div class="hero-board" id="hero"></div></section>
    <div class="tiles">
      <div class="tile"><b>${info.cells}</b><span>hexagonal cells</span></div>
      <div class="tile"><b>${info.piece_types}</b><span>piece types, 2 of them new</span></div>
      <div class="tile"><b>${info.pieces_per_side}</b><span>pieces per side</span></div>
      <div class="tile"><b>${info.opening_moves}</b><span>legal first moves for White</span></div>
      <div class="tile"><b>6</b><span>straight lines through every cell</span></div>
      <div class="tile"><b>4</b><span>AI levels, in a Web Worker</span></div></div>
    <h2>Explore</h2>
    <div class="grid">
      <a class="card" href="#/play"><b>Play</b><small>you against the AI, or two players</small>
        <span>Undo and redo, hints, flip the board, evaluation bar, and your game is saved in this browser.</span></a>
      <a class="card" href="#/watch"><b>Watch</b><small>AI against AI</small>
        <span>Pick a level for each side and watch the evaluation swing move by move.</span></a>
      <a class="card" href="#/rules"><b>Rules</b><small>tutorial and piece explorer</small>
        <span>The board, every piece's moves, promotion, check and mate, with interactive diagrams.</span></a>
      <a class="card" href="#/lab"><b>AI Lab</b><small>how the opponents think</small>
        <span>The Basic AI's scoring terms, the Advanced AI's search, and how the Basic AI learns its weights.</span></a>
      <a class="card" href="#/about"><b>About</b><small>desktop app, web app, credits</small>
        <span>How to run the PyQt5 desktop game and this web version, and how the port was checked.</span></a></div>
    <h2>One engine, two languages</h2>
    <div class="flow"><div>The rules and both AIs are the repository's Python (PyQt5 desktop game).</div>
      <div>They are ported to JavaScript so this site needs no server: the game runs entirely in your browser.</div>
      <div>A test replays games recorded from the Python and checks every legal-move list, every AI score and every
        AI choice match exactly.</div></div>`;

  // Hero: two Basic AIs (learned weights) playing quietly; restarts after 60 moves or a result.
  const view = new BoardView(app().querySelector('#hero'), { interactive: false, label: 'AI against AI demonstration' });
  let g, ais, n, timer = 0, alive = true;
  const reset = () => { g = new HexGame(); ais = { w: new BasicAI(g, 'w', params.learned.w), b: new BasicAI(g, 'b', params.learned.b) }; n = 0; };
  reset(); view.update({ pieces: g.pieces() });
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const tick = () => {
    if (!alive) return;
    if (g.over || n >= 60) reset();
    const m = ais[g.current].makeMove();
    if (!m) { reset(); } else {
      const cap = g.get(m[2], m[3]); g.makeMove(...m); n++;
      const h = g.history[g.history.length - 1];
      view.update({ pieces: g.pieces(), last: { from: h.from, to: h.to }, check: g.isInCheck(g.current) ? g.findKing(g.current) : null },
        { anim: { from: h.from, to: h.to, captured: cap } });
    }
    timer = setTimeout(tick, 1400);
  };
  if (!still) timer = setTimeout(tick, 900);
  onLeave(() => { alive = false; clearTimeout(timer); });
});
