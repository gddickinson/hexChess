// SVG hex board: three-colour cells, piece sprites, highlights (selection, legal targets, last move, check, hint),
// coordinates, flip, keyboard cursor and smooth move animations.
// Geometry: pointy-top cells at axial (q, r), rotated so White's forward direction (q+1, r+1) points up the screen.

import { CELLS, SIZE, cellName } from './hex_engine.js';
import { ensurePieceDefs } from './pieces_svg.js';
import { esc } from './core.js';

const R3 = Math.sqrt(3), COS = Math.cos(-2 * Math.PI / 3), SIN = Math.sin(-2 * Math.PI / 3);
const HEX = [0, 1, 2, 3, 4, 5].map(i => { const a = Math.PI / 6 + i * Math.PI / 3; return [Math.cos(a), Math.sin(a)]; });
const reduced = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const k = (q, r) => q * 100 + r;

export function cellXY(q, r, flip = false) {
  const x = R3 * (q + r / 2), y = 1.5 * r;
  const X = x * COS - y * SIN, Y = x * SIN + y * COS;
  return flip ? [-X, -Y] : [X, Y];
}
const hexPath = (x, y, s = 0.97) => 'M' + HEX.map(([a, b]) => `${(x + a * s).toFixed(3)} ${(y + b * s).toFixed(3)}`).join('L') + 'Z';

export class BoardView {
  // opts: { radius (default 8), onClick(q, r), coords (bool), label, interactive (bool, default true) }
  constructor(host, opts = {}) {
    ensurePieceDefs();
    this.host = host; this.opts = opts; this.flip = false; this.radius = opts.radius ?? SIZE;
    this.cells = CELLS.filter(([q, r]) => Math.max(Math.abs(q), Math.abs(r), Math.abs(q + r)) <= this.radius);
    this.cursor = null; this.state = { pieces: [] };
    this.build();
  }
  build() {
    const pts = this.cells.map(([q, r]) => cellXY(q, r, this.flip));
    const m = Math.max(...pts.map(([x, y]) => Math.max(Math.abs(x), Math.abs(y)))) + 1.15;
    const pad = this.opts.coords ? 0.2 : 0;
    const interactive = this.opts.interactive !== false;
    this.host.innerHTML = `<svg class="hexboard" viewBox="${-m - pad} ${-m * 0.9 - pad} ${2 * (m + pad)} ${1.8 * (m + pad)}"
      ${interactive ? `tabindex="0" role="grid" aria-label="${esc(this.opts.label || 'Hexagonal chess board')}"` : 'role="img" aria-label="' + esc(this.opts.label || 'Hexagonal chess board') + '"'}>
      <defs><radialGradient id="hb-glow"><stop offset="0" stop-color="var(--accent)" stop-opacity=".55"/>
        <stop offset="1" stop-color="var(--accent)" stop-opacity="0"/></radialGradient>
        <radialGradient id="hb-check"><stop offset="0" stop-color="#ff3b5c" stop-opacity=".95"/>
        <stop offset="1" stop-color="#ff3b5c" stop-opacity="0"/></radialGradient></defs>
      <path class="rim" d="${this.rimPath()}"/>
      <g class="cells">${this.cells.map(([q, r]) => {
        const [x, y] = cellXY(q, r, this.flip);
        return `<path class="cell c${(((q - r) % 3) + 3) % 3}" data-q="${q}" data-r="${r}" d="${hexPath(x, y)}"/>`;
      }).join('')}</g>
      <g class="marks"></g><g class="coords"></g><g class="pieces"></g><g class="fx"></g><g class="over"></g></svg>`;
    this.svg = this.host.querySelector('svg');
    this.cellEls = new Map([...this.svg.querySelectorAll('.cell')].map(e => [k(+e.dataset.q, +e.dataset.r), e]));
    if (interactive) this.bindInput();
    this.drawCoords();
    this.update(this.state, { instant: true });
  }
  rimPath() {
    const R = this.radius, corners = [[R, 0], [0, R], [-R, R], [-R, 0], [0, -R], [R, -R]];
    return 'M' + corners.map(([q, r]) => { const [x, y] = cellXY(q, r, this.flip); const s = 1 + 1.1 / Math.hypot(x, y);
      return `${(x * s).toFixed(3)} ${(y * s).toFixed(3)}`; }).join('L') + 'Z';
  }
  setFlip(f) { if (this.flip !== !!f) { this.flip = !!f; this.build(); } }
  setCoords(on) { this.opts.coords = on; this.build(); }
  drawCoords() {
    const g = this.svg.querySelector('.coords');
    g.innerHTML = this.opts.coords ? this.cells.map(([q, r]) => {
      const [x, y] = cellXY(q, r, this.flip);
      return `<text x="${x.toFixed(3)}" y="${(y + 0.62).toFixed(3)}">${cellName(q, r)}</text>`;
    }).join('') : '';
  }
  bindInput() {
    this.svg.addEventListener('click', e => {
      const c = e.target.closest('.cell') || this.cellAt(e);
      if (c && this.opts.onClick) { this.cursor = [+c.dataset.q, +c.dataset.r]; this.opts.onClick(this.cursor[0], this.cursor[1]); }
    });
    this.svg.addEventListener('keydown', e => {
      const dirs = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
      if (dirs[e.key]) { e.preventDefault(); this.moveCursor(...dirs[e.key]); }
      else if ((e.key === 'Enter' || e.key === ' ') && this.cursor) { e.preventDefault(); this.opts.onClick?.(...this.cursor); }
    });
    this.svg.addEventListener('focus', () => { if (!this.cursor) { this.cursor = this.opts.startCursor || [0, 0]; this.drawCursor(); } });
  }
  // Clicks on a piece sprite land on the <use>; map the pointer to the nearest cell.
  cellAt(e) {
    const pt = this.svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
    const p = pt.matrixTransform(this.svg.getScreenCTM().inverse());
    let best = null, bd = 1;
    for (const [q, r] of this.cells) {
      const [x, y] = cellXY(q, r, this.flip), d = Math.hypot(x - p.x, y - p.y);
      if (d < bd) { bd = d; best = this.cellEls.get(k(q, r)); }
    }
    return best;
  }
  moveCursor(dx, dy) {
    const [cx, cy] = cellXY(...this.cursor, this.flip);
    let best = null, bd = Infinity;
    for (const [q, r] of this.cells) {
      const [x, y] = cellXY(q, r, this.flip), vx = x - cx, vy = y - cy, d = Math.hypot(vx, vy);
      if (d < 0.5 || (vx * dx + vy * dy) / d < 0.7) continue;     // within ~45 degrees of the arrow
      if (d < bd) { bd = d; best = [q, r]; }
    }
    if (best) { this.cursor = best; this.drawCursor(); }
  }
  drawCursor() {
    const g = this.svg.querySelector('.over');
    if (!this.cursor) { g.innerHTML = ''; return; }
    const [x, y] = cellXY(...this.cursor, this.flip);
    g.innerHTML = `<path class="cursor" d="${hexPath(x, y, 0.9)}"/>`;
    const p = this.state.pieces.find(([q, r]) => q === this.cursor[0] && r === this.cursor[1]);
    this.svg.setAttribute('aria-label', `${this.opts.label || 'Board'}: cursor on ${cellName(...this.cursor)}${p ? ' ' + p[2] : ''}`);
  }

  // state: { pieces: [[q, r, piece]], selected, targets: [[q, r]], last: {from, to}, check: [q, r], hint: {from, to} }
  // opts.anim: { from, to, captured } animates that move from the previous position.
  update(state, opts = {}) {
    this.state = state;
    const occupied = new Set(state.pieces.map(([q, r]) => k(q, r)));
    const mark = (cls, q, r, s = 0.97) => { const [x, y] = cellXY(q, r, this.flip); return `<path class="${cls}" d="${hexPath(x, y, s)}"/>`; };
    let m = '';
    if (state.last) m += mark('m-last', ...state.last.from) + mark('m-last', ...state.last.to);
    if (state.hint) m += mark('m-hint', ...state.hint.from, 0.9) + mark('m-hint', ...state.hint.to, 0.9);
    if (state.selected) m += mark('m-sel', ...state.selected);
    if (state.check) { const [x, y] = cellXY(...state.check, this.flip); m += `<circle class="m-check" cx="${x}" cy="${y}" r="1.25"/>`; }
    for (const [q, r] of state.targets || []) {
      const [x, y] = cellXY(q, r, this.flip);
      m += occupied.has(k(q, r)) ? `<circle class="m-cap" cx="${x}" cy="${y}" r="0.78"/>` : `<circle class="m-dot" cx="${x}" cy="${y}" r="0.24"/>`;
    }
    for (const [q, r, cls] of state.extra || []) m += mark(cls, q, r, 0.9);
    this.svg.querySelector('.marks').innerHTML = m;
    const anim = !opts.instant && !reduced() ? opts.anim : null;
    this.svg.querySelector('.pieces').innerHTML = state.pieces.map(([q, r, p]) => {
      let [x, y] = cellXY(q, r, this.flip);
      const moving = anim && anim.to[0] === q && anim.to[1] === r;
      if (moving) [x, y] = cellXY(...anim.from, this.flip);
      return `<use class="pc${moving ? ' moving' : ''}" href="#pc-${p}" x="-0.93" y="-1.0" width="1.86" height="1.86"
        style="transform:translate(${x.toFixed(3)}px,${y.toFixed(3)}px)"/>`;
    }).join('');
    const fx = this.svg.querySelector('.fx');
    fx.innerHTML = '';
    if (anim) {
      const el = this.svg.querySelector('.pieces .moving'), [tx, ty] = cellXY(...anim.to, this.flip);
      if (anim.captured) {
        const [cx, cy] = cellXY(...anim.to, this.flip);
        fx.innerHTML = `<use class="pc fading" href="#pc-${anim.captured}" x="-0.93" y="-1.0" width="1.86" height="1.86"
          style="transform:translate(${cx}px,${cy}px)"/>`;
      }
      el?.getBoundingClientRect();
      requestAnimationFrame(() => {
        if (el) { el.classList.add('go'); el.style.transform = `translate(${tx.toFixed(3)}px,${ty.toFixed(3)}px)`; }
        fx.querySelector('.fading')?.classList.add('gone');
      });
      setTimeout(() => { fx.innerHTML = ''; }, 450);
    }
    if (this.cursor && document.activeElement === this.svg) this.drawCursor();
  }
}
