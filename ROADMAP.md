# HexChess -- Roadmap

## Current State
A hexagonal chess variant with custom pieces (Dragon, Prince), a learning AI system with parameter persistence, and a PyQt5 GUI. The project is well-modularized across 8+ files. However, `hexchess_gui.py` (1146 lines) and `hexchess_ai.py` (1185 lines) are oversized. The AI uses JSON parameter files and decision logging. Multiple test files exist but lack a unified test runner.

## Short-term Improvements
- [ ] Split `hexchess_gui.py` (1146 lines): extract board rendering into `hexchess_renderer.py` and dialog/panel code into `hexchess_dialogs.py`
- [ ] Split `hexchess_ai.py` (1185 lines): extract evaluation functions into `hexchess_evaluation.py` and learning logic into `hexchess_learning.py`
- [ ] Consolidate test files (`hexchess_testing.py`, `hexchess_tests.py`, `hexchess_full_game_test.py`, `test_ai_learning.py`) into a proper `tests/` directory with pytest
- [ ] Add `.gitignore` for `__pycache__/`, `*.log`, and AI parameter JSON files
- [ ] Add a `requirements.txt` with PyQt5 pinned
- [ ] Validate AI parameter JSON on load to prevent crashes from corrupted files

## Feature Enhancements
- [ ] Add an opening book for the AI based on logged game data in `game_moves.log`
- [ ] Implement undo/redo with a proper command pattern (currently move_history exists but no undo)
- [ ] Add game save/load functionality (serialize board state to JSON)
- [ ] Add network multiplayer support using sockets or WebSockets
- [ ] Implement AI difficulty levels beyond the current parameter-based learning
- [ ] Add move animation in the GUI for smoother piece transitions
- [ ] Display captured pieces panel alongside the board

## Long-term Vision
- [ ] Port the AI to use Monte Carlo Tree Search (MCTS) for stronger play
- [ ] Add an ELO rating system for tracking AI improvement over games
- [ ] Create a web-based version using PyScript or a separate JS frontend
- [ ] Implement a puzzle mode with curated positions for practice
- [ ] Add sound effects for moves, captures, and check

## Technical Debt
- [ ] `hexchess_pieces.py` is only 89 lines -- Dragon and Prince logic may be scattered across other files; consolidate all piece movement rules here
- [ ] Log files (`hexchess.log`, `ai_decisions.log`, `game_moves.log`) are written to project root -- use a `logs/` directory
- [ ] AI parameter files (`ai_params_b.json`, `ai_params_w.json`) are in the project root -- move to a `data/` directory
- [ ] No type hints on most functions in `hexchess_game.py`
- [ ] The `images/` folder contents are unclear -- document what piece images are expected
