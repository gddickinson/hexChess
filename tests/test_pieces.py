"""Tests for piece movement patterns."""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import unittest
from hexchess_pieces import PieceFactory


class TestPieces(unittest.TestCase):
    def test_pawn_moves(self):
        pawn = PieceFactory.create_piece('P', 'w')
        moves = pawn.get_moves(0, 0, 5)
        self.assertIn((0, 1), moves)
        self.assertIn((1, 0), moves)
        self.assertEqual(len(moves), 2)

    def test_rook_moves(self):
        rook = PieceFactory.create_piece('R', 'w')
        moves = rook.get_moves(0, 0, 5)
        self.assertIn((0, 1), moves)
        self.assertIn((0, -1), moves)
        self.assertIn((1, 0), moves)
        self.assertIn((-1, 0), moves)

    def test_knight_moves(self):
        knight = PieceFactory.create_piece('N', 'w')
        moves = knight.get_moves(0, 0, 5)
        self.assertIn((2, -1), moves)
        self.assertIn((1, 1), moves)
        self.assertIn((-1, 2), moves)

    def test_bishop_moves(self):
        bishop = PieceFactory.create_piece('B', 'w')
        moves = bishop.get_moves(0, 0, 5)
        self.assertIn((1, -1), moves)
        self.assertIn((2, -2), moves)

    def test_queen_moves(self):
        queen = PieceFactory.create_piece('Q', 'w')
        moves = queen.get_moves(0, 0, 5)
        self.assertIn((0, 1), moves)
        self.assertIn((1, -1), moves)

    def test_king_moves(self):
        king = PieceFactory.create_piece('K', 'w')
        moves = king.get_moves(0, 0, 5)
        self.assertEqual(len(moves), 6)

    def test_dragon_moves(self):
        dragon = PieceFactory.create_piece('D', 'w')
        moves = dragon.get_moves(0, 0, 5)
        self.assertIn((0, 1), moves)  # Queen-like
        self.assertIn((2, -1), moves)  # Knight-like
        queen = PieceFactory.create_piece('Q', 'w')
        queen_moves = queen.get_moves(0, 0, 5)
        self.assertGreater(len(moves), len(queen_moves))

    def test_prince_moves(self):
        prince = PieceFactory.create_piece('C', 'w')
        moves = prince.get_moves(0, 0, 5)
        self.assertEqual(len(moves), 6)

    def test_piece_factory(self):
        for piece_type in ['P', 'R', 'N', 'B', 'Q', 'K', 'D', 'C']:
            piece = PieceFactory.create_piece(piece_type, 'w')
            self.assertIsNotNone(piece)


if __name__ == '__main__':
    unittest.main()
