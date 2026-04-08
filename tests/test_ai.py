"""Tests for HexChess AI -- move generation and learning."""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import unittest
import json
import tempfile
from hexchess_game import HexChess
from hexchess_ai import BasicAI
from hexchess_learning import LearningModule


class TestBasicAI(unittest.TestCase):
    def setUp(self):
        self.game = HexChess()
        self.ai = BasicAI(self.game, 'w')

    def test_ai_makes_valid_move(self):
        move = self.ai.make_move()
        self.assertIsNotNone(move)
        self.assertTrue(self.game.make_move(*move))

    def test_ai_captures_king_when_possible(self):
        for q, r in self.game.board.get_all_cells():
            self.game.board.set_cell(q, r, None)

        self.game.board.set_cell(-2, 0, 'wK')
        self.game.board.set_cell(0, 0, 'wQ')
        self.game.board.set_cell(2, 0, 'bK')
        self.game.current_player = 'w'

        ai = BasicAI(self.game, 'w')
        move = ai.make_move()
        self.assertIsNotNone(move)
        self.assertEqual(move, (0, 0, 2, 0))


class TestLearningModule(unittest.TestCase):
    def test_initialization(self):
        lm = LearningModule()
        self.assertIn('piece_values', lm.params)
        self.assertEqual(lm.games_played, 0)

    def test_save_and_load(self):
        lm = LearningModule()
        lm.games_played = 10
        lm.wins = 5

        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
            tmpfile = f.name

        try:
            lm.save_params(tmpfile)
            lm2 = LearningModule()
            lm2.load_params(tmpfile)
            self.assertEqual(lm2.games_played, 10)
            self.assertEqual(lm2.wins, 5)
        finally:
            os.unlink(tmpfile)

    def test_validate_corrupted_data(self):
        lm = LearningModule()
        self.assertFalse(lm._validate_params({'bad': 'data'}))
        self.assertTrue(lm._validate_params({
            'params': {}, 'games_played': 0, 'wins': 0, 'learning_history': []
        }))


if __name__ == '__main__':
    unittest.main()
