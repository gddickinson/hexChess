// Play page: you against the AI (either colour, four levels) or two players on one screen. Undo/redo, flip, hint,
// coordinates, evaluation bar, move list, captured pieces, game-over screen and save/resume in localStorage.
import { route, app, esc, onLeave } from './core.js';
import { BoardView } from './board_view.js';
import { GameRecord, save, load, clear } from './game_store.js';
import { AIClient, LEVELS, level } from './ai_client.js';
import { moveListHTML, capturedHTML, evalWhite, evalBarHTML, fmtScore, moveText, showResult } from './ui_bits.js';
import { cellName, NAMES } from './hex_engine.js';

route('play', async () => {
  const saved = load('play');
  const st = {
    side: saved?.side || 'w', lvl: saved?.lvl || 'adv2', coords: !!saved?.coords,
    rec: new GameRecord(saved?.moves || []), sel: null, targets: [], hint: null, thinking: false, report: '',
  };
  if (saved?.redo) st.rec.redoStack = saved.redo;
  const ai = new AIClient();

  app().innerHTML = `<div class="play">
    <div class="view"><div class="board-wrap" id="board"></div></div>
    <aside class="panel controls">
      <p class="status" id="status" aria-live="polite"></p>
      <div id="evalbar"></div>
      <label>You play</label>
      <div class="seg" id="side" role="group" aria-label="You play">
        <button data-v="w">White</button><button data-v="b">Black</button><button data-v="both">Both sides</button></div>
      <label for="lvl">AI level</label>
      <select id="lvl">${LEVELS.map(l => `<option value="${l.id}">${l.name}</option>`).join('')}</select>
      <p class="hint" id="lvldesc"></p>
      <div class="bar">
        <button id="new">New game</button><button class="alt" id="undo" title="Take back (U)">Undo</button>
        <button class="alt" id="redo" title="Replay (R)">Redo</button><button class="alt" id="flip" title="Flip board (F)">Flip</button>
        <button class="alt" id="hintb" title="Suggest a move (H)">Hint</button></div>
      <label class="chk"><input type="checkbox" id="coords"> Show coordinates</label>
      <p class="ai-report small mute" id="report" aria-live="polite"></p>
      <h3>Moves</h3><div class="moves" id="moves"></div>
      <h3>Captured</h3><div id="caps"></div>
      <p class="hint" id="saved"></p>
    </aside></div>`;
  const $ = s => app().querySelector(s);
  const board = new BoardView($('#board'), { onClick: click, coords: st.coords, label: 'HexChess board', startCursor: [-4, -3] });
  board.setFlip(st.side === 'b' || !!saved?.flip && st.side === 'both');
  $('#lvl').value = st.lvl; $('#coords').checked = st.coords;
  if (saved?.moves?.length) $('#saved').textContent = `Resumed your saved game (${saved.moves.length} move${saved.moves.length === 1 ? '' : 's'}). "New game" starts afresh.`;

  const humanTurn = () => !st.rec.game.over && (st.side === 'both' || st.rec.turn === st.side);
  function persist() {
    save('play', { moves: st.rec.moves, redo: st.rec.redoStack, side: st.side, lvl: st.lvl, coords: st.coords, flip: board.flip });
  }
  function draw(anim) {
    const g = st.rec.game;
    board.update({ pieces: g.pieces(), selected: st.sel, targets: st.targets, last: st.rec.last, check: st.rec.checkCell(),
      hint: st.hint }, { anim });
    const who = g.current === 'w' ? 'White' : 'Black', inCheck = !g.over && g.isInCheck(g.current);
    $('#status').innerHTML = g.over ? `<b>${esc(st.rec.result().title)}</b>`
      : `<span class="dot ${g.current}"></span> ${who} to move${inCheck ? ' <b class="checkc">Check!</b>' : ''}` +
        (st.thinking ? ' <span class="think">AI thinking<i></i><i></i><i></i></span>' : humanTurn() ? ' <span class="mute">(your move)</span>' : '');
    $('#evalbar').innerHTML = evalBarHTML(evalWhite(g));
    $('#moves').innerHTML = moveListHTML(st.rec);
    $('#moves').scrollTop = 1e6;
    $('#caps').innerHTML = capturedHTML(st.rec);
    $('#report').innerHTML = st.report;
    $('#lvldesc').textContent = level(st.lvl).desc;
    app().querySelectorAll('#side button').forEach(b => b.classList.toggle('on', b.dataset.v === st.side));
    $('#undo').disabled = !st.rec.moves.length; $('#redo').disabled = !st.rec.redoStack.length;
    if (g.over && !st.review) showResult($('#board'), st.rec.result(), [{ label: 'New game', fn: newGame },
      { label: 'Review', fn: () => { st.review = true; } }, { label: 'Undo', fn: undo }]);
    else $('#board .result')?.remove();
  }
  function apply(m, animate = true) {
    const cap = st.rec.game.get(m[2], m[3]);
    if (!st.rec.push(m)) return false;
    st.sel = null; st.targets = []; st.hint = null;
    draw(animate ? { from: [m[0], m[1]], to: [m[2], m[3]], captured: cap } : null);
    persist();
    return true;
  }
  function click(q, r) {
    if (!humanTurn() || st.thinking) return;
    const g = st.rec.game, p = g.get(q, r);
    if (st.sel && st.targets.some(([a, b]) => a === q && b === r)) {
      if (apply([st.sel[0], st.sel[1], q, r])) maybeAI();
      return;
    }
    if (p && p[0] === g.current) { st.sel = [q, r]; st.targets = g.getPossibleMoves(q, r); }
    else { st.sel = null; st.targets = []; }
    draw();
    const name = p ? `${p[0] === 'w' ? 'White' : 'Black'} ${NAMES[p[1]]} on ${cellName(q, r)}` : cellName(q, r);
    $('#status').setAttribute('aria-label', st.sel ? `${name} selected, ${st.targets.length} moves` : name);
  }
  async function maybeAI() {
    if (st.rec.game.over || humanTurn() || st.thinking) return;
    st.thinking = true; st.report = ''; draw();
    const lv = level(st.lvl), t0 = performance.now();
    let res;
    try {
      res = await ai.think(st.rec.moves, st.lvl, p => {
        st.report = `${esc(lv.name)}: depth ${p.depth} done, best so far ${moveText(p.move)} (${fmtScore(p.score)}), ` +
          `${p.nodes.toLocaleString()} positions, ${(p.ms / 1000).toFixed(1)} s`;
        $('#report').innerHTML = st.report;
      });
    } catch (e) { st.thinking = false; st.report = `<span class="err">AI error: ${esc(e.message)}</span>`; draw(); return; }
    st.thinking = false;
    if (!res || !res.move) { draw(); return; }
    const i = res.info;
    st.report = i.kind === 'basic'
      ? `${esc(lv.name)} scored ${i.top.length ? 'every move; top: ' + i.top.slice(0, 3).map(t => `${moveText(t.move)} ${t.score.toFixed(2)}`).join(', ') : ''}`
      : `${esc(lv.name)}: ${moveText(res.move)} after ${i.depth} ${i.depth === 1 ? 'ply' : 'plies'}, ${i.nodes.toLocaleString()} positions, ` +
        `${(i.ms / 1000).toFixed(1)} s, score ${fmtScore(i.score)} for the AI`;
    const wait = Math.max(0, 250 - (performance.now() - t0));
    setTimeout(() => apply(res.move), wait);
  }
  function undo() {
    ai.cancel(); st.thinking = false; st.hint = null; st.sel = null; st.targets = []; st.review = false;
    if (!st.rec.undo()) return draw();
    while (st.side !== 'both' && st.rec.moves.length && !humanTurn()) st.rec.undo();
    draw(); persist();
  }
  function redo() {
    st.sel = null; st.targets = []; st.hint = null;
    const m = st.rec.redo();
    if (!m) return;
    while (st.side !== 'both' && st.rec.redoStack.length && !humanTurn() && !st.rec.game.over) st.rec.redo();
    draw({ from: [m[0], m[1]], to: [m[2], m[3]] }); persist(); maybeAI();
  }
  function newGame() {
    ai.cancel(); st.thinking = false; st.rec = new GameRecord(); st.sel = null; st.targets = []; st.hint = null; st.report = ''; st.review = false;
    $('#saved').textContent = ''; clear('play'); board.setFlip(st.side === 'b');
    draw(); persist(); maybeAI();
  }
  async function hint() {
    if (!humanTurn() || st.thinking) return;
    st.thinking = true; draw();
    const helper = new AIClient();
    try {
      const res = await helper.think(st.rec.moves, 'adv2');
      if (res?.move) { st.hint = { from: [res.move[0], res.move[1]], to: [res.move[2], res.move[3]] }; st.report = `Hint (Club level): ${moveText(res.move)}`; }
    } finally { helper.dispose(); st.thinking = false; draw(); }
  }
  $('#new').onclick = newGame; $('#undo').onclick = undo; $('#redo').onclick = redo; $('#hintb').onclick = hint;
  $('#flip').onclick = () => { board.setFlip(!board.flip); draw(); persist(); };
  $('#coords').onchange = e => { st.coords = e.target.checked; board.setCoords(st.coords); draw(); persist(); };
  $('#lvl').onchange = e => { st.lvl = e.target.value; draw(); persist(); };
  app().querySelectorAll('#side button').forEach(b => b.onclick = () => {
    st.side = b.dataset.v; board.setFlip(st.side === 'b'); st.sel = null; st.targets = []; draw(); persist(); maybeAI();
  });
  const keys = e => {
    if (e.target.closest('input, select, textarea')) return;
    const f = { u: undo, r: redo, f: () => $('#flip').click(), h: hint }[e.key.toLowerCase()];
    if (f && !e.metaKey && !e.ctrlKey) { e.preventDefault(); f(); }
  };
  document.addEventListener('keydown', keys);
  onLeave(() => { ai.dispose(); document.removeEventListener('keydown', keys); });
  draw(); maybeAI();
});
