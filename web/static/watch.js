// Watch page: AI against AI, any level on either side, with speed control, pause/step, a live evaluation graph and
// a move cap (the rules have no draw by repetition or move count, so engine games could otherwise run for ever).
import { route, app, esc, onLeave } from './core.js';
import { BoardView } from './board_view.js';
import { GameRecord } from './game_store.js';
import { AIClient, LEVELS, level } from './ai_client.js';
import { moveListHTML, capturedHTML, evalWhite, evalBarHTML, moveText, fmtScore, showResult } from './ui_bits.js';

const MAX_PLIES = 300;

route('watch', async (args, query) => {
  const st = { w: query.w || 'adv1', b: query.b || 'basic', delay: 600, running: false, rec: new GameRecord(), evals: [0], report: '' };
  const ai = new AIClient();
  let timer = 0;
  app().innerHTML = `<div class="play">
    <div class="view"><div class="board-wrap" id="board"></div></div>
    <aside class="panel controls">
      <p class="status" id="status" aria-live="polite"></p>
      <div id="evalbar"></div>
      <div class="row"><div><label for="lw">White</label><select id="lw">${opts()}</select></div>
        <div><label for="lb">Black</label><select id="lb">${opts()}</select></div></div>
      <label for="spd">Pause between moves <b id="spdv"></b></label>
      <input type="range" id="spd" min="0" max="2000" step="100" value="${st.delay}">
      <div class="bar"><button id="go">Start</button><button class="alt" id="step">Step</button>
        <button class="alt" id="restart">Restart</button><button class="alt" id="flip">Flip</button></div>
      <p class="ai-report small mute" id="report" aria-live="polite"></p>
      <h3>Evaluation over the game</h3><div id="graph" class="graph"></div>
      <h3>Moves</h3><div class="moves" id="moves"></div>
      <h3>Captured</h3><div id="caps"></div>
    </aside></div>`;
  const $ = s => app().querySelector(s);
  const board = new BoardView($('#board'), { label: 'AI against AI board' });
  $('#lw').value = st.w; $('#lb').value = st.b;

  function opts() { return LEVELS.map(l => `<option value="${l.id}">${esc(l.name)}</option>`).join(''); }
  function graph() {
    const n = Math.max(st.evals.length, 2), W = 300, H = 70, clamp = v => Math.max(-15, Math.min(15, v));
    const pts = st.evals.map((v, i) => `${(i / (n - 1) * W).toFixed(1)},${(H / 2 - clamp(v) / 15 * (H / 2 - 4)).toFixed(1)}`).join(' ');
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Evaluation for White after each move">
      <line x1="0" x2="${W}" y1="${H / 2}" y2="${H / 2}" class="axis"/><polyline points="${pts}" class="evline"/></svg>
      <p class="hint">Balance for White after each move: (Advanced AI evaluation for White - for Black) / 2, clipped at ±15.</p>`;
  }
  function draw(anim) {
    const g = st.rec.game, res = st.rec.result();
    board.update({ pieces: g.pieces(), last: st.rec.last, check: st.rec.checkCell() }, { anim });
    const capped = st.rec.moves.length >= MAX_PLIES && !g.over;
    $('#status').innerHTML = res ? `<b>${esc(res.title)}</b>` : capped ? `<b>Stopped after ${MAX_PLIES} moves</b> (no result)` :
      `<span class="dot ${g.current}"></span> ${g.current === 'w' ? 'White' : 'Black'} (${esc(level(st[g.current]).name)}) to move` +
      (st.running ? ' <span class="think">thinking<i></i><i></i><i></i></span>' : '');
    $('#evalbar').innerHTML = evalBarHTML(st.evals[st.evals.length - 1]);
    $('#graph').innerHTML = graph();
    $('#moves').innerHTML = moveListHTML(st.rec); $('#moves').scrollTop = 1e6;
    $('#caps').innerHTML = capturedHTML(st.rec);
    $('#report').innerHTML = st.report;
    $('#spdv').textContent = (st.delay / 1000).toFixed(1) + ' s';
    $('#go').textContent = st.running ? 'Pause' : 'Start';
    if (res) showResult($('#board'), res, [{ label: 'Play again', fn: restart }, { label: 'Close', fn: () => {} }]);
  }
  async function step() {
    const g = st.rec.game;
    if (g.over || st.rec.moves.length >= MAX_PLIES) { st.running = false; draw(); return false; }
    const lvId = st[g.current], res = await ai.think(st.rec.moves, lvId);
    if (!res || !res.move) return false;
    const cap = g.get(res.move[2], res.move[3]);
    st.rec.push(res.move);
    st.evals.push(evalWhite(st.rec.game));
    const i = res.info;
    st.report = `${esc(level(lvId).name)} played ${moveText(res.move)}` + (i.kind === 'advanced'
      ? ` (depth ${i.depth}, ${i.nodes.toLocaleString()} positions, ${(i.ms / 1000).toFixed(1)} s, ${fmtScore(i.score)})` : '');
    draw({ from: [res.move[0], res.move[1]], to: [res.move[2], res.move[3]], captured: cap });
    return true;
  }
  async function loop() {
    while (st.running) {
      if (!(await step())) break;
      await new Promise(r => { timer = setTimeout(r, st.delay); });
    }
    st.running = false; draw();
  }
  function restart() { st.running = false; ai.cancel(); clearTimeout(timer); st.rec = new GameRecord(); st.evals = [0]; st.report = ''; draw(); }
  $('#go').onclick = () => { st.running = !st.running; if (st.running) loop(); else { ai.cancel(); draw(); } };
  $('#step').onclick = () => { if (!st.running) step(); };
  $('#restart').onclick = restart;
  $('#flip').onclick = () => { board.setFlip(!board.flip); draw(); };
  $('#spd').oninput = e => { st.delay = +e.target.value; draw(); };
  $('#lw').onchange = e => { st.w = e.target.value; draw(); };
  $('#lb').onchange = e => { st.b = e.target.value; draw(); };
  onLeave(() => { st.running = false; clearTimeout(timer); ai.dispose(); });
  draw();
  if (query.autoplay) { st.running = true; loop(); }
});
