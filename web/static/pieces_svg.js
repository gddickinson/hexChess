// SVG piece set drawn for the web version (the desktop app's PNG sprites have no stated licence, so they are not
// reused). Each piece is a <symbol id="pc-wK"> etc. in one hidden <svg>, added once per page by ensurePieceDefs().
// viewBox 0 0 100 100; white pieces are ivory with a dark outline, black pieces ink-violet with a neon rim.

const BASE = 'M24 90 Q24 81 33 80 L67 80 Q76 81 76 90 Z';
const SHAPES = {
  P: `<path d="M37 79 C39 64 43 56 44 48 L56 48 C57 56 61 64 63 79 Z"/>
      <ellipse cx="50" cy="48" rx="11" ry="4"/><circle cx="50" cy="33" r="12"/>`,
  R: `<path d="M33 79 L36 42 L64 42 L67 79 Z"/>
      <path d="M28 43 L28 22 L37 22 L37 29 L45 29 L45 22 L55 22 L55 29 L63 29 L63 22 L72 22 L72 43 Z"/>
      <path class="ln" d="M36 52 L64 52 M35 66 L65 66"/>`,
  N: `<path d="M33 79 C34 70 39 63 44 56 L37 58 C30 61 24 57 25 51 L29 43 C30 33 36 25 44 21 L46 11 L53 19
      C63 21 71 29 73 42 C75 55 69 66 67 79 Z"/>
      <circle class="eye" cx="47" cy="31" r="2.8"/><path class="ln" d="M57 25 C64 32 67 42 66 52"/>`,
  B: `<path d="M38 79 L41 55 L59 55 L62 79 Z"/><ellipse cx="50" cy="55" rx="13" ry="4"/>
      <path d="M50 16 C64 27 68 41 61 53 L39 53 C32 41 36 27 50 16 Z"/><circle cx="50" cy="13" r="4.5"/>
      <path class="ln" d="M55 28 L46 41"/>`,
  Q: `<path d="M30 79 L33 64 L67 64 L70 79 Z"/>
      <path d="M31 65 L21 31 L33 46 L37 22 L45 42 L50 15 L55 42 L63 22 L67 46 L79 31 L69 65 Z"/>
      <circle cx="21" cy="29" r="4"/><circle cx="37" cy="20" r="4"/><circle cx="50" cy="13" r="4.5"/>
      <circle cx="63" cy="20" r="4"/><circle cx="79" cy="29" r="4"/>`,
  K: `<path d="M31 79 L35 52 L65 52 L69 79 Z"/>
      <path d="M33 54 C29 38 43 33 50 42 C57 33 71 38 67 54 Z"/>
      <path d="M46.5 12 L53.5 12 L53.5 20 L61 20 L61 27 L53.5 27 L53.5 38 L46.5 38 L46.5 27 L39 27 L39 20 L46.5 20 Z"/>
      <path class="ln" d="M36 64 L64 64"/>`,
  C: `<path d="M35 79 L39 56 L61 56 L65 79 Z"/>
      <path d="M35 58 L30 34 L41 45 L50 27 L59 45 L70 34 L65 58 Z"/>
      <circle cx="30" cy="32" r="3.6"/><circle cx="50" cy="24" r="4"/><circle cx="70" cy="32" r="3.6"/>
      <circle class="eye" cx="50" cy="47" r="3.2"/>`,
  D: `<path d="M31 79 C33 69 38 62 43 56 L35 56 C28 56 25 51 28 46 L22 45 C24 37 30 32 37 29 L31 18 L42 25
      C47 22 53 21 58 23 L64 11 L66 25 C73 30 76 38 74 46 L84 42 C82 52 75 58 67 60 C68 67 69 73 69 79 Z"/>
      <circle class="eye" cx="51" cy="34" r="3"/><path class="ln" d="M29 47 L39 45 M60 40 C64 48 64 55 60 62"/>
      <path class="ln" d="M44 64 L49 60 L50 66 L55 62"/>`,
};

const STYLE = `
  .pc-w { fill:url(#pc-grad-w); stroke:#20243a; stroke-width:3; stroke-linejoin:round; }
  .pc-b { fill:url(#pc-grad-b); stroke:#f6c6ff; stroke-width:3; stroke-linejoin:round; }
  .pc-w .ln, .pc-b .ln { fill:none; stroke-width:2.4; stroke-linecap:round; }
  .pc-w .eye { fill:#20243a; stroke:none; } .pc-b .eye { fill:#f6c6ff; stroke:none; }`;

export function pieceSymbol(id, piece) {
  const cls = piece[0] === 'w' ? 'pc-w' : 'pc-b';
  return `<symbol id="${id}" viewBox="0 0 100 100"><g class="${cls}">
    <ellipse cx="50" cy="91" rx="28" ry="4" fill="rgba(0,0,0,.35)" stroke="none"/>
    <path d="${BASE}"/>${SHAPES[piece[1]]}</g></symbol>`;
}

let added = false;
export function ensurePieceDefs() {
  if (added || typeof document === 'undefined') return;
  added = true;
  const syms = [];
  for (const c of 'wb') for (const t of 'PRNBQKDC') syms.push(pieceSymbol(`pc-${c}${t}`, c + t));
  const div = document.createElement('div');
  div.innerHTML = `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>
    <style>${STYLE}</style>
    <linearGradient id="pc-grad-w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/>
      <stop offset=".55" stop-color="#f1ead9"/><stop offset="1" stop-color="#c9bfa6"/></linearGradient>
    <linearGradient id="pc-grad-b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a5cc9"/>
      <stop offset=".55" stop-color="#4b2a7d"/><stop offset="1" stop-color="#1c0f33"/></linearGradient>
    ${syms.join('')}</defs></svg>`;
  document.body.appendChild(div.firstElementChild);
}

// A stand-alone inline SVG of one piece (for legends, the move list and the captured-pieces tray).
export const pieceIcon = (piece, size = 22, title = '') =>
  `<svg class="pico" width="${size}" height="${size}" viewBox="0 0 100 100" role="img" aria-label="${title || piece}">` +
  `<use href="#pc-${piece}"/></svg>`;
