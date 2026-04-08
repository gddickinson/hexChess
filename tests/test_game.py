"""Tests for HexChess game logic -- moves, captures, check, checkmate."""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import unittest
from hexchess_game import HexChess


class TestHexChess(unittest.TestCase):
    def setUp(self):
        self.game = HexChess()

    def test_initial_setup(self):
        self.assertEqual(self.game.board.get_cell(-8, 0), 'wR')
        self.assertEqual(self.game.board.get_cell(8, 0), 'bR')

    def test_valid_pawn_move(self):
        self.assertTrue(self.game.make_move(-8, 1, -8, 2))
        self.assertEqual(self.game.board.get_cell(-8, 2), 'wP')
        self.assertIsNone(self.game.board.get_cell(-8, 1))

    def test_invalid_move_wrong_player(self):
        # Black can't move on white's turn
        self.assertFalse(self.game.make_move(8, -1, 8, -2))

    def test_valid_knight_move(self):
        self.assertTrue(self.game.make_move(-7, -1, -5, 0))
        self.assertEqual(self.game.board.get_cell(-5, 0), 'wN')

    def test_player_switch(self):
        self.assertEqual(self.game.current_player, 'w')
        self.game.make_move(-8, 1, -8, 2)
        self.assertEqual(self.game.current_player, 'b')

    def test_valid_capture(self):
        self.game.board.set_cell(0, 0, 'wR')
        self.game.board.set_cell(0, 1, 'bP')
        self.assertTrue(self.game.make_move(0, 0, 0, 1))
        self.assertEqual(self.game.board.get_cell(0, 1), 'wR')

    def test_game_over_flag(self):
        self.assertFalse(self.game.is_game_over())

    def test_reset(self):
        self.game.make_move(-8, 1, -8, 2)
        self.game.reset()
        self.assertEqual(self.game.current_player, 'w')
        self.assertEqual(len(self.game.move_history), 0)


class TestKingCapture(unittest.TestCase):
    def setUp(self):
        self.game = HexChess()
        for q, r in self.game.board.get_all_cells():
            self.game.board.set_cell(q, r, None)

        self.game.board.set_cell(-2, 0, 'wK')
        self.game.board.set_cell(0, 0, 'wQ')
        self.game.board.set_cell(2, 0, 'bK')
        self.game.current_player = 'w'

    def test_queen_captures_king(self):
        self.assertTrue(self.game.make_move(0, 0, 2, 0))
        self.assertTrue(self.game.is_game_over())
        self.assertEqual(self.game.get_winner(), 'w')


if __name__ == '__main__':
    unittest.main()
