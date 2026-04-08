# HexChess

A PyQt5 hexagonal chess variant with custom pieces (Dragon, Prince), a learning AI system, and an interactive GUI with custom piece images and a help system.

## Features

- **Hexagonal board** with unique movement rules adapted for hex geometry
- **Custom pieces** -- Dragon and Prince in addition to standard chess pieces
- **Learning AI** that saves and loads parameters, with decision logging
- **Full game testing** and move validation
- **Help system** with piece movement guides
- **Custom piece images** support

## Requirements

- Python 3.7+
- PyQt5

```bash
pip install PyQt5
```

## Usage

```bash
python hexchess_main.py
```

## Project Structure

```
hexchess/
├── hexchess_main.py          # Application entry point
├── hexchess_gui.py           # MainWindow and board rendering
├── hexchess_game.py          # Game logic and rules
├── hexchess_board.py         # Hex board representation
├── hexchess_pieces.py        # Piece definitions (including Dragon, Prince)
├── hexchess_ai.py            # Learning AI with parameter persistence
├── hexchess_help.py          # Help system
├── hexchess_testing.py       # Game testing utilities
├── hexchess_tests.py         # Test suite
├── hexchess_full_game_test.py
├── ai_params_b.json          # AI parameters (black)
├── ai_params_w.json          # AI parameters (white)
├── ai_decisions.log          # AI decision log
└── game_moves.log            # Move history log
```
