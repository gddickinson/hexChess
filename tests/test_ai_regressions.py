"""Regression tests for AI bugs fixed in hexchess_ai.py / hexchess_evaluation.py (each failed before its fix).

Run: python -m pytest -q tests/test_ai_regressions.py
"""
import logging
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from hexchess_ai import AdvancedAI, BasicAI  # noqa: E402
from hexchess_game import HexChess  # noqa: E402
from tests.test_rules_regressions import position  # noqa: E402

logging.disable(logging.CRITICAL)


def snapshot(g):
    return dict(g.board.cells), g.current_player, list(g.move_history), g.game_over


def test_advanced_ai_search_leaves_game_untouched():
    g = HexChess()
    ai = AdvancedAI(g, 'w')
    ai.max_depth, ai.max_time = 1, float('inf')
    before = snapshot(g)
    move = ai.make_move()
    assert snapshot(g) == before
    assert g.make_move(*move)


def test_advanced_ai_as_black_takes_a_free_queen():
    g = position({(-8, 8): 'wK', (0, 0): 'wQ', (0, 3): 'bR', (8, -8): 'bK'}, to_move='b')
    ai = AdvancedAI(g, 'b')
    ai.max_depth, ai.max_time = 1, float('inf')
    assert ai.make_move() == (0, 3, 0, 0)


def test_advanced_ai_sees_the_recapture():
    # White's queen can take a pawn that the black rook defends; two plies deep that loses the queen.
    g = position({(-8, 8): 'wK', (0, 0): 'wQ', (0, 4): 'bP', (0, 7): 'bR', (8, -8): 'bK'})
    ai = AdvancedAI(g, 'w')
    ai.max_depth, ai.max_time = 2, float('inf')
    assert ai.make_move() != (0, 0, 0, 4)


def test_advanced_mobility_counts_both_sides():
    g = position({(-8, 8): 'wK', (0, 0): 'wQ', (8, -8): 'bK'})
    ai = AdvancedAI(g, 'w')
    white_to_move = ai._evaluate_advanced_mobility(g)
    g.current_player = 'b'
    assert ai._evaluate_advanced_mobility(g) == white_to_move != 0


def test_basic_ai_counts_its_moves():
    g = HexChess()
    ai = BasicAI(g, 'w')
    g.make_move(*ai.make_move())
    assert ai.total_moves == 1


def test_basic_ai_mobility_is_measured_after_the_move():
    g = position({(-8, 8): 'wK', (0, 0): 'wR', (8, -8): 'bK'})
    ai = BasicAI(g, 'w')
    assert ai._evaluate_mobility(0, 3, 0, 0) > 0
    assert g.board.get_cell(0, 0) == 'wR' and g.board.get_cell(0, 3) is None


def test_board_state_after_move_is_the_real_board():
    g = HexChess()
    ai = BasicAI(g, 'w')
    after = ai._get_board_state_after_move(-8, 1, -8, 2)
    g.make_move(-8, 1, -8, 2)
    assert after == ai._get_board_state()


def test_params_load_independent_of_working_directory(tmp_path):
    cwd = os.getcwd()
    try:
        os.chdir(tmp_path)
        ai = BasicAI(HexChess(), 'w')
    finally:
        os.chdir(cwd)
    assert os.path.isabs(ai.get_filename()) and os.path.exists(ai.get_filename())


def test_advanced_eval_is_from_the_ais_side():
    g = position({(-8, 8): 'wK', (2, 2): 'bQ', (8, -8): 'bK'}, to_move='b')
    assert AdvancedAI(g, 'b')._evaluate_board(g) > 0
    assert AdvancedAI(g, 'w')._evaluate_board(g) < 0


def test_black_values_a_guarded_king():
    far = position({(-8, 8): 'wK', (0, -8): 'bP', (8, -8): 'bK'}, to_move='b')
    near = position({(-8, 8): 'wK', (7, -8): 'bP', (8, -8): 'bK'}, to_move='b')
    assert AdvancedAI(near, 'b')._evaluate_board(near) > AdvancedAI(far, 'b')._evaluate_board(far)


def test_opponent_dragon_placement_does_not_help():
    g = position({(-8, 8): 'wK', (0, 0): 'bD', (8, -8): 'bK'})
    assert AdvancedAI(g, 'w')._evaluate_piece_positions(g) < 0
    assert AdvancedAI(g, 'b')._evaluate_piece_positions(g) > 0
