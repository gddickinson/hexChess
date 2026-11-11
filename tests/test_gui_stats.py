"""Regression test: the desktop statistics count both sides' moves, whoever is to move (failed before the fix)."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from hexchess_game import HexChess  # noqa: E402
from hexchess_gui_stats import GameStatsMixin  # noqa: E402


class Stats(GameStatsMixin):
    def __init__(self, game):
        self.game = game


def test_mobility_counts_both_sides():
    s = Stats(HexChess())
    white_to_move = s.calculate_game_statistics()
    assert white_to_move['w']['mobility'] > 0 and white_to_move['b']['mobility'] > 0
    assert s._calculate_mobility() == 0          # the opening position is symmetric
