// About page: what HexChess is, how to run the desktop and web versions, how the web port was checked, credits.
import { route, app } from './core.js';

route('about', async () => {
  app().innerHTML = `<section class="hero"><p class="kicker">About</p><h1 class="glow">About HexChess</h1>
    <p class="lead">A hexagonal chess variant with custom pieces (Dragon, Prince), a learning AI and an interactive
    PyQt5 GUI, by George Dickinson. This site is the same game in the browser.</p></section>
    <h2>Run the desktop app</h2>
    <pre>git clone https://github.com/gddickinson/hexChess
cd hexChess
pip install -r requirements.txt
python hexchess_main.py</pre>
    <p>The desktop app adds AI tournaments (with learning saved to <span class="mono">ai_params_w.json</span> and
    <span class="mono">ai_params_b.json</span>), statistics panels and a help window.</p>
    <h2>Run the web app locally</h2>
    <pre>pip install -r requirements-web.txt
python run_web.py          # http://127.0.0.1:8231</pre>
    <p>The local app serves the same pages as this site, with the data (starting position, piece patterns, learned
    weights) answered live by the Python code. <span class="mono">python scripts/build_static.py</span> exports the
    static site published on GitHub Pages.</p>
    <h2>How the web version was built</h2>
    <ul class="rules">
      <li><b>Rules engine</b> (<span class="mono">hex_engine.js</span>): a port of <span class="mono">hexchess_board.py</span>,
        <span class="mono">hexchess_pieces.py</span> and <span class="mono">hexchess_game.py</span>.</li>
      <li><b>AIs</b> (<span class="mono">hex_ai_basic.js</span>, <span class="mono">hex_ai_advanced.js</span>): ports of
        <span class="mono">BasicAI</span> (with <span class="mono">hexchess_evaluation.py</span>) and
        <span class="mono">AdvancedAI</span>, running in a Web Worker so the page stays responsive.</li>
      <li><b>Checked against the Python</b>: <span class="mono">scripts/make_engine_fixtures.py</span> records random and
        AI games from the Python; a node test replays them and requires identical legal-move lists in every position,
        identical Basic AI scores and choices, and identical Advanced AI searches.</li>
      <li><b>Pieces</b> are drawn as SVG for the web; the desktop app's PNG sprites are not reused.</li>
      <li>While porting, several bugs in the Python were found and fixed (moves not checked against the piece's
        pattern, check never detected, the Advanced AI moving pieces on the real board during its search, and others);
        see the repository's commit history and SESSION_LOG.md.</li></ul>
    <h2>Credits</h2>
    <p>HexChess by George Dickinson, MIT licence. Source:
      <a href="https://github.com/gddickinson/hexChess">github.com/gddickinson/hexChess</a>.</p>`;
});
