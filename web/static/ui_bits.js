// Small UI pieces shared by the play and watch pages: move list, captured trays, evaluation bar, result overlay.
import { esc } from './core.js';
import { pieceIcon } from './pieces_svg.js';
import { NAMES, cellName } from './hex_engine.js';
import { AdvancedAI } from './hex_ai_advanced.js';

export function moveListHTML(rec) {
  const pairs = rec.pairs();
  if (!pairs.length) return '<p class="mute small">No moves yet.</p>';
  const n = rec.sans.length;
  return `<ol class="mlist">${pairs.map(([i, w, b]) => `<li><span class="num">${i}.</span>` +
    `<span class="${2 * i - 1 === n ? 'cur' : ''}">${esc(w)}</span><span class="${2 * i === n ? 'cur' : ''}">${esc(b)}</span></li>`).join('')}</ol>`;
}

export function capturedHTML(rec) {
  const row = (c, label) => `<div class="tray"><span class="mute small">${label}</span>${rec.captured[c].map(p =>
    pieceIcon(p, 20, NAMES[p[1]])).join('') || '<span class="mute small">none</span>'}</div>`;
  return row('w', 'White took') + row('b', 'Black took');
}

// Balance shown on the bar: (White's score - Black's score) / 2, each from the Advanced AI's evaluation function for
// that side. (That function adds a side's own king safety and coordination but not the opponent's, so one side's
// score alone is not zero in a level position; the difference is, by symmetry.)
export function evalWhite(game) {
  if (game.over) return game.winner === 'w' ? Infinity : game.winner === 'b' ? -Infinity : 0;
  return (new AdvancedAI(game, 'w').terms(game).total - new AdvancedAI(game, 'b').terms(game).total) / 2;
}
export const fmtScore = s => (s === Infinity ? '+mate' : s === -Infinity ? '-mate' : (s > 0 ? '+' : '') + s.toFixed(1));

export function evalBarHTML(score) {
  const f = score === Infinity ? 100 : score === -Infinity ? 0 : 50 + 50 * Math.tanh(score / 12);
  return `<div class="evalbar" role="meter" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${f.toFixed(0)}"
    aria-label="Balance for White ${fmtScore(score)}" title="Balance for White: (evaluation for White - evaluation for Black) / 2"><div class="evfill" style="width:${f.toFixed(1)}%"></div>
    <span>${fmtScore(score)}</span></div>`;
}

export const moveText = m => `${cellName(m[0], m[1])}-${cellName(m[2], m[3])}`;

// Result overlay on top of the board host; returns a function that removes it.
export function showResult(host, res, buttons) {
  host.querySelector('.result')?.remove();
  const div = document.createElement('div');
  div.className = 'result' + (res.winner ? ' win-' + res.winner : ' draw');
  div.setAttribute('role', 'dialog'); div.setAttribute('aria-label', res.title);
  div.innerHTML = `<div class="rbox"><p class="kicker">Game over</p><h2>${esc(res.title)}</h2><p>${esc(res.text)}</p>
    <div class="bar">${buttons.map((b, i) => `<button data-i="${i}" class="${i ? 'alt' : ''}">${esc(b.label)}</button>`).join('')}</div></div>`;
  div.addEventListener('click', e => { const b = e.target.closest('button'); if (b) { div.remove(); buttons[+b.dataset.i].fn(); } });
  host.appendChild(div);
  div.querySelector('button')?.focus();
  return () => div.remove();
}
