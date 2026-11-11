"""Regression tests for rule bugs fixed in hexchess_game.py (each failed before its fix).

Run: python -m pytest -q tests/test_rules_regressions.py
"""
import logging
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from hexchess_game import HexChess  # noqa: E402

logging.getLogger('hexchess').setLevel(logging.CRITICAL)


def position(pieces, to_move='w'):
    g = HexChess()
    for cell in g.board.cells:
        g.board.cells[cell] = None
    for (q, r), p in pieces.items():
        g.board.set_cell(q, r, p)
    g.current_player = to_move
    return g


def test_move_must_follow_piece_pattern():
    g = HexChess()
    assert not g.make_move(-8, 1, -8, 3)   # pawn two steps
    assert not g.make_move(-8, 1, -6, 2)   # pawn off its two directions
    assert g.board.get_cell(-8, 1) == 'wP' and g.current_player == 'w'


def test_king_cannot_move_into_check():
    g = position({(0, 0): 'wK', (2, 0): 'bR', (5, 3): 'bK'})
    assert not g.make_move(0, 0, 1, 0)
    assert (1, 0) not in g.get_possible_moves(0, 0)


def test_is_in_check_independent_of_side_to_move():
    g = position({(0, 0): 'wK', (0, 4): 'bR', (5, 3): 'bK'})
    assert g.is_in_check('w')
    g.current_player = 'b'
    assert g.is_in_check('w')


def test_pinned_knight_cannot_expose_king():
    g = position({(0, 0): 'wK', (0, 1): 'wN', (0, 5): 'bR', (5, -5): 'bK'})
    assert g.get_possible_moves(0, 1) == [(0, 3)]
    assert not g.make_move(0, 1, 2, 0)


def test_checkmate_ends_game():
    g = position({(-8, 8): 'wK', (7, 0): 'wR', (3, -1): 'wR', (8, -8): 'bK'})
    assert g.make_move(3, -1, 8, -1)
    assert g.is_checkmate('b') and g.is_game_over() and g.get_winner() == 'w'


def test_dragon_knight_offsets_jump_and_slides_do_not():
    g = position({(0, 0): 'wD', (0, 1): 'bP', (-1, 0): 'bP', (-8, 8): 'wK', (8, -8): 'bK'})
    moves = g.get_possible_moves(0, 0)
    assert (0, 2) in moves          # Knight offset: jumps the pawn on (0, 1)
    assert (-3, 0) not in moves     # 3-step slide through the pawn on (-1, 0) is blocked


def test_one_history_entry_per_move_and_undo():
    g = HexChess()
    assert g.make_move(-8, 1, -8, 2)
    assert len(g.move_history) == 1
    assert g.undo_move()
    assert g.board.get_cell(-8, 1) == 'wP' and g.board.get_cell(-8, 2) is None
    assert g.current_player == 'w' and g.move_history == []


def test_undo_restores_promoted_pawn_and_result():
    g = position({(3, 4): 'wP', (-8, 8): 'wK', (8, -8): 'bK'})
    assert g.make_move(3, 4, 4, 4)
    assert g.board.get_cell(4, 4) == 'wQ'
    g.undo_move()
    assert g.board.get_cell(3, 4) == 'wP' and g.board.get_cell(4, 4) is None


def test_reset_clears_result():
    g = position({(-8, 8): 'wK', (7, 0): 'wR', (3, -1): 'wR', (8, -8): 'bK'})
    g.make_move(3, -1, 8, -1)
    g.reset()
    assert not g.is_game_over() and g.get_winner() is None
