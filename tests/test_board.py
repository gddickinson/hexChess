"""Tests for HexBoard initialization and cell operations."""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import unittest
from hexchess_board import HexBoard


class TestHexBoard(unittest.TestCase):
    def setUp(self):
        self.board = HexBoard(8)

    def test_board_initialization(self):
        self.assertEqual(len(self.board.cells), 217)

    def test_valid_cell(self):
        self.assertTrue(self.board.is_valid_cell(0, 0))
        self.assertTrue(self.board.is_valid_cell(8, 0))
        self.assertFalse(self.board.is_valid_cell(9, 0))

    def test_set_and_get_cell(self):
        self.board.set_cell(0, 0, 'wK')
        self.assertEqual(self.board.get_cell(0, 0), 'wK')

    def test_get_all_cells(self):
        cells = self.board.get_all_cells()
        self.assertEqual(len(cells), 217)

    def test_distance(self):
        self.assertEqual(self.board.distance(0, 0, 1, 0), 1)
        self.assertEqual(self.board.distance(0, 0, 0, 0), 0)

    def test_get_adjacent_cells(self):
        adj = self.board.get_adjacent_cells(0, 0)
        self.assertEqual(len(adj), 6)


if __name__ == '__main__':
    unittest.main()
