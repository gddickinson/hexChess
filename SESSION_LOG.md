# Session log

## 2026-11-11: web interface and static site; bug fixes
- Bugs fixed in the Python, each with failing-first regression tests and its own commit:
  - rules (`hexchess_game.py`, `hexchess_pieces.py`): moves never checked against the piece's pattern; check never
    detected (so no checkmate, kings walked into check); knight moves skipped the self-check test; Dragon 3-step slides
    jumped pieces; every move recorded twice in `move_history`; no working undo (promotion/result not restored);
    reset kept game_over; set()-ordered move lists. (Same fix as the sibling repo hexchess_python.)
  - AI: AdvancedAI moved pieces on the real board during search and never searched replies; black AdvancedAI chose its
    worst moves (sign error); mobility terms counted one side only / were always 0 in BasicAI; garbled board strings in
    repetition detection; total_moves never incremented; params loaded from the working directory; opponent pawn/Dragon
    placement scored for the AI.
  - Desktop stats counted only the side to move's moves.
  - Help window described rules the code lacks (91 cells, diagonal bishop/pawn captures, draw rules, levels, fake
    e-mails); missing comma hid the Dragon from the Pieces tab.
- Old tests in hexchess_tests.py aligned to the implemented rules; `hexchess_board.py` made Qt-free
  (`hexchess_board_view.py`); `hexchess_ai.py`/`hexchess_gui.py` split under 500 lines; logs/.DS_Store removed, .gitignore.
- Web: `web/` FastAPI app (port 8231) + ES-module front end; JS ports of engine, BasicAI and AdvancedAI, node-tested
  against Python fixtures (340 positions' legal-move lists, 2986 BasicAI scores + choices, 7 AdvancedAI searches).
  Pages: home, play (5 AI levels in a Web Worker, undo/redo, hint, flip, eval bar, save/resume), watch (AI vs AI),
  rules/tutorial with piece explorer, AI Lab (learning history charts), about. SVG pieces (PNG licence unknown).
- Needs George's decision: Bishop moves on the Rook's lines (so R = B = Q), unlike the Glinski-style diagram in
  images/moves.JPG; pawns capture on their move cells; the learning update compares weights with `move_stats` counters
  that are never incremented, so learning only decays weights (now ~1e-5); pawn promotion to Prince on side edges.
- Nothing ran on the Mac mini.

## 2026-11-11 (later): learning fix; rules kept as coded
- Learning: BasicAI/AdvancedAI now record move_stats for every move (`_record_move_stats`), so weights move towards
  the features used in won games (up or down); ai_params_w.json / ai_params_b.json reset to the code defaults.
  Web: Novice+ level dropped (identical to Novice now), AI Lab describes the learning, /api/params copes with an
  empty history; fixtures regenerated.
- A Bishop-on-diagonals / diagonal-pawn-capture change was tried and dropped: on this board the (1,1) diagonals skip
  the pawn row, so White could take Black's Queen on move 1. George decided to keep the variant as coded (Bishop on
  the Rook's lines, pawns capture on their move cells, Prince promotion on the side edges) and fix the docs; the
  README now says images/moves.JPG shows standard hexagonal chess, not this variant.
