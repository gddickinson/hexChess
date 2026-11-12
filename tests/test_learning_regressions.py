"""Regression tests: the learning AI records what its moves did, so learning can raise a weight (failed before the fix:
BasicAI.move_stats was never increased, so every win pulled every weight towards 0)."""
import logging
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from hexchess_ai import AdvancedAI, BasicAI  # noqa: E402
from hexchess_game import HexChess  # noqa: E402
from tests.test_rules_regressions import position  # noqa: E402

logging.disable(logging.CRITICAL)


def test_make_move_records_move_stats():
    g = HexChess()
    ai = BasicAI(g, 'w')
    move = ai.make_move()
    piece = g.board.get_cell(move[0], move[1])
    assert sum(ai.move_stats['piece_effectiveness'].values()) == 1
    assert ai.move_stats['piece_effectiveness'][piece[1]] == 1


def test_advanced_ai_records_move_stats_too():
    g = HexChess()
    ai = AdvancedAI(g, 'w')
    ai.max_depth, ai.max_time = 1, float('inf')
    ai.make_move()
    assert sum(ai.move_stats['piece_effectiveness'].values()) == 1


def test_learning_can_increase_a_weight():
    g = position({(-8, 8): 'wK', (0, 0): 'wR', (0, 3): 'bN', (8, -8): 'bK'})
    ai = BasicAI(g, 'w')
    ai.learning_module.params['aggression'] = 0.1
    ai._record_move_stats((0, 0, 0, 3))               # the Rook takes the Knight
    assert ai.move_stats['aggression'] == 1
    ai.learn_from_game(1.0, {})
    assert abs(ai.learning_module.params['aggression'] - (0.1 + 0.1 * (1 - 0.1))) < 1e-12


def test_prince_moves_are_counted():
    g = position({(-8, 8): 'wK', (0, 0): 'wC', (8, -8): 'bK'})
    ai = BasicAI(g, 'w')
    ai._record_move_stats((0, 0, 1, 0))
    assert ai.move_stats['piece_effectiveness']['C'] == 1


def test_saved_params_are_the_defaults():
    from hexchess_learning import LearningModule
    for c in 'wb':
        ai = BasicAI(HexChess(), c)
        assert ai.learning_module.params == LearningModule().params
        assert ai.learning_module.games_played == 0
