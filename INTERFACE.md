# HexChess -- Interface Map

## Desktop game (PyQt5)
| File | Purpose |
|------|---------|
| `hexchess_main.py` | Entry point: logging setup, launches `MainWindow` |
| `hexchess_gui.py` | `MainWindow`: menus, game/tournament flow, AI turns, learning hooks |
| `hexchess_gui_stats.py` | `GameStatsMixin`: material, centre control, king safety, mobility, pawn-structure stats |
| `hexchess_renderer.py` | `HexBoardWidget` (board drawing, clicks), `StatsWindow`, `LearningStatsWindow` |
| `hexchess_dialogs.py` | Game/tournament setup, board size, results and options dialogs |
| `hexchess_help.py` | `HelpWindow` (overview, rules, pieces, AI, updates tabs) |
| `hexchess_board_view.py` | `VisualizationHexBoard`: small Qt move diagram used by the help window |
| `hexchess_testing.py` | In-app testing window |

## Rules and AI (Qt-free)
| File | Key contents |
|------|---------|
| `hexchess_board.py` | `HexBoard`: radius-8 hexagon of axial (q, r) cells (217), distance, neighbours |
| `hexchess_pieces.py` | `Piece` subclasses (`Pawn`, `Rook`, `Knight`, `Bishop`, `Queen`, `King`, `Dragon`, `Prince`), `KNIGHT_OFFSETS`, `PieceFactory` |
| `hexchess_game.py` | `HexChess`: setup, `get_possible_moves`, `_pseudo_moves`, `is_in_check`, `make_move` (promotion, mate/stalemate), `undo_move` |
| `hexchess_ai.py` | `BasicAI` (one-move scoring with learned weights, histories, learning, save/load of `ai_params_<c>.json`); re-exports `AdvancedAI` |
| `hexchess_ai_advanced.py` | `AdvancedAI`: iterative-deepening minimax, alpha-beta, transposition table, `_evaluate_board` |
| `hexchess_evaluation.py` | `EvaluationMixin`: BasicAI's move-scoring terms |
| `hexchess_learning.py` | `LearningModule`: weights, `update_params`, validation, save/load |
| `ai_params_w.json`, `ai_params_b.json` | Learned weights + per-game learning history (125 games each) |

## Web interface
| File | Purpose |
|------|---------|
| `run_web.py` | Starts the web app on http://127.0.0.1:8231 |
| `web/app.py` | FastAPI: `/api/info`, `/api/setup`, `/api/pieces`, `/api/params`; `STATIC_ENDPOINTS` |
| `web/hex_record.py` | Qt-free helpers: positions, legal-move lists, random games, piece patterns, params summary |
| `web/static/hex_engine.js` | JS port of board + pieces + game (`HexGame`, `CELLS`, `cellName`, `moveSan`) |
| `web/static/hex_ai_basic.js` / `hex_ai_advanced.js` | JS ports of `BasicAI` (+ EvaluationMixin) and `AdvancedAI` |
| `web/static/hex_engine.test.mjs` | Node test against `tests/fixtures/hex_engine_fixtures.json` |
| `web/static/ai_worker.js`, `ai_client.js` | Web Worker running the AIs; difficulty `LEVELS`, cancellation |
| `web/static/board_view.js`, `pieces_svg.js` | SVG board (highlights, animation, flip, keyboard cursor) and SVG piece set |
| `web/static/game_store.js`, `ui_bits.js` | Move record (undo/redo, notation, captures, localStorage save) and shared panels |
| `web/static/{home,play,watch,rules,lab,about}.js` | Pages; `main.js` entry; `core.js`/`style.css` shared kit; `style_app.css` |
| `scripts/make_engine_fixtures.py` | Records Python games/AI scores for the node test (~6 min) |
| `scripts/build_static.py`, `scripts/screenshots.py` | Static export to `site/`; Playwright smoke test + `docs/img/` |

## Tests
`tests/` (pytest): board, pieces, game, AI, `test_rules_regressions.py`, `test_ai_regressions.py`, `test_gui_stats.py`,
`test_web.py` (API, static build, fixture currency, node engine test). Older suites: `hexchess_tests.py`,
`test_ai_learning.py`, `hexchess_full_game_test.py` (slow, ~2 min).

## Dependencies
```
hexchess_gui -> hexchess_renderer, hexchess_dialogs, hexchess_help -> hexchess_board_view
             -> hexchess_gui_stats, hexchess_ai -> hexchess_ai_advanced, hexchess_evaluation, hexchess_learning
hexchess_ai/hexchess_game -> hexchess_board, hexchess_pieces
web/app.py -> web/hex_record.py -> hexchess_game, hexchess_ai, hexchess_pieces, hexchess_learning
web/static/play.js, watch.js -> board_view, game_store, ai_client -> ai_worker -> hex_ai_* -> hex_engine
```
