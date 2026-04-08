import unittest
from hexchess_board import HexBoard
from hexchess_game import HexChess
from hexchess_pieces import PieceFactory
from hexchess_ai import BasicAI

class TestHexBoard(unittest.TestCase):
    def setUp(self):
        self.board = HexBoard(8)

    def test_board_initialization(self):
        self.assertEqual(len(self.board.cells), 217)  # 8-radius hexagon has 217 cells

    def test_valid_cell(self):
        self.assertTrue(self.board.is_valid_cell(0, 0))
        self.assertTrue(self.board.is_valid_cell(8, 0))
        self.assertFalse(self.board.is_valid_cell(9, 0))

class TestHexChess(unittest.TestCase):
    def setUp(self):
        self.game = HexChess()

    def test_initial_setup(self):
        self.assertEqual(self.game.board.get_cell(-8, 0), 'wR')
        self.assertEqual(self.game.board.get_cell(8, 0), 'bR')

    def test_valid_pawn_move(self):
        self.assertTrue(self.game.make_move(-8, 1, -8, 2))  # Move white pawn
        self.assertEqual(self.game.board.get_cell(-8, 2), 'wP')
        self.assertIsNone(self.game.board.get_cell(-8, 1))

    def test_invalid_pawn_move(self):
        self.assertFalse(self.game.make_move(-8, 1, -8, 3))  # Invalid pawn move (2 steps)

    def test_invalid_rook_move_blocked(self):
        self.assertFalse(self.game.make_move(-8, 0, -8, 2))  # Invalid rook move (blocked by pawn)

    def test_valid_rook_move(self):
        self.game.board.set_cell(-8, 0, None)  # Remove rook from starting position
        self.game.board.set_cell(0, 0, 'wR')  # Place rook in the center
        self.game.board.set_cell(0, 3, None)  # Remove any piece at the destination
        self.assertTrue(self.game.make_move(0, 0, 0, 3))  # Valid rook move
        self.assertEqual(self.game.board.get_cell(0, 3), 'wR')
        self.assertIsNone(self.game.board.get_cell(0, 0))

    def test_invalid_rook_move_jumping(self):
        self.game.board.set_cell(0, 0, 'wR')
        self.game.board.set_cell(0, 1, 'wP')
        self.assertFalse(self.game.make_move(0, 0, 0, 2))  # Rook can't jump over pawn

    def test_valid_knight_move(self):
        self.assertTrue(self.game.make_move(-7, -1, -5, 0))  # Knight can jump
        self.assertEqual(self.game.board.get_cell(-5, 0), 'wN')

    def test_player_switch(self):
        self.assertEqual(self.game.current_player, 'w')
        self.game.make_move(-8, 1, -8, 2)  # Move white pawn
        self.assertEqual(self.game.current_player, 'b')

    def test_move_into_check(self):
        self.game.board.set_cell(0, 0, 'wK')
        self.game.board.set_cell(2, 0, 'bR')
        self.game.current_player = 'w'
        self.assertFalse(self.game.make_move(0, 0, 1, 0))  # Moving into check should be invalid

    def test_valid_capture(self):
        self.game.board.set_cell(0, 0, 'wR')
        self.game.board.set_cell(0, 1, 'bP')
        self.assertTrue(self.game.make_move(0, 0, 0, 1))
        self.assertEqual(self.game.board.get_cell(0, 1), 'wR')

    def test_pawn_diagonal_capture(self):
        self.game.board.set_cell(0, 0, 'wP')
        self.game.board.set_cell(1, 1, 'bP')
        self.assertTrue(self.game.make_move(0, 0, 1, 1))
        self.assertEqual(self.game.board.get_cell(1, 1), 'wP')

    def test_bishop_diagonal_move(self):
        self.game.board.set_cell(0, 0, 'wB')
        self.assertTrue(self.game.make_move(0, 0, 2, 2))
        self.assertEqual(self.game.board.get_cell(2, 2), 'wB')

    def test_invalid_bishop_move(self):
        self.game.board.set_cell(0, 0, 'wB')
        self.assertFalse(self.game.make_move(0, 0, 2, 1))  # Not a diagonal move


    def test_queen_move(self):
        self.game.board.set_cell(0, 0, 'wQ')
        self.assertTrue(self.game.make_move(0, 0, 3, 3))  # Diagonal move
        self.game.board.set_cell(0, 0, 'wQ')
        self.assertTrue(self.game.make_move(0, 0, 0, 3))  # Straight move


    def test_dragon_move(self):
        self.game.board.set_cell(0, 0, 'wD')
        self.assertTrue(self.game.make_move(0, 0, 2, -1))  # Knight-like move
        self.game.board.set_cell(0, 0, 'wD')
        self.assertTrue(self.game.make_move(0, 0, 0, 3))  # Queen-like move


    def test_checkmate(self):
        self.game.board.set_cell(0, 0, 'wK')
        self.game.board.set_cell(1, 0, 'bR')
        self.game.board.set_cell(0, 1, 'bR')
        self.game.current_player = 'w'
        self.assertTrue(self.game.is_checkmate())
        self.assertTrue(self.game.is_game_over())
        self.assertEqual(self.game.get_winner(), 'b')

    def test_stalemate(self):
        self.game.board.set_cell(0, 0, 'wK')
        self.game.board.set_cell(2, 0, 'bQ')
        self.game.board.set_cell(1, 2, 'bR')
        self.game.current_player = 'w'
        self.assertTrue(self.game.is_stalemate())
        self.assertTrue(self.game.is_game_over())
        self.assertEqual(self.game.get_winner(), 'draw')


    def test_pawn_promotion(self):
        # Pawn promotion is not implemented in the current version, but we can test for its absence
        self.game.board.set_cell(0, 7, 'wP')
        self.game.make_move(0, 7, 0, 8)  # Move pawn to the last rank
        self.assertEqual(self.game.board.get_cell(0, 8), 'wP')  # Should still be a pawn

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
        self.assertIn((0, 5), moves)
        self.assertIn((5, 0), moves)
        self.assertIn((0, -5), moves)
        self.assertIn((-5, 0), moves)

    def test_knight_moves(self):
        knight = PieceFactory.create_piece('N', 'w')
        moves = knight.get_moves(0, 0, 5)
        expected_moves = [(2, -1), (1, 1), (-1, 2), (-2, 1), (-1, -1), (1, -2),
                          (2, 1), (1, 2), (-1, -2), (-2, -1)]
        for move in expected_moves:
            self.assertIn(move, moves)
        self.assertEqual(len(moves), len(expected_moves))

    def test_bishop_moves(self):
        bishop = PieceFactory.create_piece('B', 'w')
        moves = bishop.get_moves(0, 0, 5)
        self.assertIn((1, -1), moves)
        self.assertIn((2, -2), moves)
        self.assertIn((1, 0), moves)
        self.assertIn((0, 1), moves)
        self.assertIn((-1, 1), moves)
        self.assertIn((-2, 2), moves)
        self.assertIn((5, -5), moves)
        self.assertIn((5, 0), moves)
        self.assertIn((0, 5), moves)
        self.assertIn((-5, 5), moves)

    def test_queen_moves(self):
        queen = PieceFactory.create_piece('Q', 'w')
        moves = queen.get_moves(0, 0, 5)
        self.assertIn((0, 1), moves)  # Rook-like move
        self.assertIn((1, -1), moves)  # Bishop-like move
        self.assertIn((5, 0), moves)  # Long range move
        self.assertIn((0, 5), moves)  # Long range move
        self.assertIn((-5, 5), moves)  # Long range diagonal move
        self.assertIn((5, -5), moves)  # Long range diagonal move

    def test_king_moves(self):
        king = PieceFactory.create_piece('K', 'w')
        moves = king.get_moves(0, 0, 5)
        expected_moves = [(0, 1), (1, 0), (1, -1), (-1, 0), (-1, 1), (0, -1)]
        for move in expected_moves:
            self.assertIn(move, moves)
        self.assertEqual(len(moves), 6)  # King should have 6 possible moves in hexagonal chess

    def test_dragon_moves(self):
        dragon = PieceFactory.create_piece('D', 'w')
        moves = dragon.get_moves(0, 0, 5)
        # Queen-like moves
        self.assertIn((0, 1), moves)
        self.assertIn((1, -1), moves)
        self.assertIn((5, 0), moves)
        self.assertIn((0, 5), moves)
        self.assertIn((-5, 5), moves)
        # Knight-like moves
        self.assertIn((2, -1), moves)
        self.assertIn((1, 2), moves)
        self.assertIn((-1, -2), moves)
        self.assertIn((-2, 1), moves)
        # Check that dragon has more moves than a queen (due to knight-like moves)
        queen = PieceFactory.create_piece('Q', 'w')
        queen_moves = queen.get_moves(0, 0, 5)
        self.assertGreater(len(moves), len(queen_moves))

class TestBasicAI(unittest.TestCase):
    def setUp(self):
        self.game = HexChess()
        self.ai = BasicAI(self.game, 'w')

    def test_ai_makes_valid_move(self):
        move = self.ai.make_move()
        self.assertIsNotNone(move)
        self.assertTrue(self.game.make_move(*move))


class TestKingCapture(unittest.TestCase):
    def setUp(self):
        self.game = HexChess()
        # Clear the board
        for q, r in self.game.board.get_all_cells():
            self.game.board.set_cell(q, r, None)

        # Set up a white queen and black king
        self.game.board.set_cell(-2, 0, 'wK')  # White king
        self.game.board.set_cell(0, 0, 'wQ')  # White queen at the center
        self.game.board.set_cell(2, 0, 'bK')  # Black king two cells to the right
        self.game.current_player = 'w'  # Ensure it's white's turn

    def test_queen_captures_king(self):
        print("Initial board state:")
        self.game.print_board()

        # Check if the move is considered legal
        is_legal = self.game._is_move_legal(0, 0, 2, 0)
        print(f"Is move (0, 0) to (2, 0) legal? {is_legal}")

        # Get all possible moves for the queen
        possible_moves = self.game.get_possible_moves(0, 0)
        print(f"Possible moves for white queen: {possible_moves}")

        # Attempt to make the move
        move_made = self.game.make_move(0, 0, 2, 0)
        print(f"Was the move made successfully? {move_made}")

        print("Board state after attempted move:")
        self.game.print_board()

        # Assertions
        self.assertTrue(is_legal, "The move should be considered legal")
        self.assertIn((2, 0), possible_moves, "Capturing the king should be a possible move")
        self.assertTrue(move_made, "The move to capture the king should be successful")
        self.assertTrue(self.game.is_game_over(), "The game should be over after capturing the king")
        self.assertEqual(self.game.get_winner(), 'w', "White should be the winner")

    def test_ai_captures_king(self):
        ai = BasicAI(self.game, 'w')

        print("Initial board state:")
        self.game.print_board()

        # Get AI's move
        ai_move = ai.make_move()
        print(f"AI's chosen move: {ai_move}")

        # Attempt to make the AI's move
        if ai_move:
            move_made = self.game.make_move(*ai_move)
            print(f"Was the AI's move made successfully? {move_made}")

        print("Board state after AI's move:")
        self.game.print_board()

        # Assertions
        self.assertIsNotNone(ai_move, "AI should choose a move")
        self.assertEqual(ai_move, (0, 0, 2, 0), "AI should choose to capture the king")
        self.assertTrue(move_made, "The move to capture the king should be successful")
        self.assertTrue(self.game.is_game_over(), "The game should be over after capturing the king")
        self.assertEqual(self.game.get_winner(), 'w', "White should be the winner")

if __name__ == '__main__':
    unittest.main()

if __name__ == '__main__':
    unittest.main()
