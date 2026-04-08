from hexchess_board import HexBoard
from hexchess_pieces import PieceFactory
from typing import List, Tuple, Optional
import logging

class HexChess:
    def __init__(self, board_size: int = 8):
        self.board = HexBoard(board_size)
        self.current_player = 'w'
        self.move_history: List[Tuple[int, int, int, int, Optional[str]]] = []
        self._setup_pieces()
        self.game_over = False
        self.winner = None
        self.logger = logging.getLogger('hexchess')

    def _setup_pieces(self):
        # Setup white pieces
        self.board.set_cell(-8, 0, 'wR')
        self.board.set_cell(-7, -1, 'wN')
        self.board.set_cell(-6, -2, 'wB')
        self.board.set_cell(-5, -3, 'wQ')
        self.board.set_cell(-4, -4, 'wK')
        self.board.set_cell(-3, -5, 'wB')
        self.board.set_cell(-2, -6, 'wN')
        self.board.set_cell(-1, -7, 'wR')
        self.board.set_cell(0, -8, 'wD')  # Dragon
        for i in range(10):
            self.board.set_cell(-8+i, 1-i, 'wP')

        # Setup black pieces
        self.board.set_cell(8, 0, 'bR')
        self.board.set_cell(7, 1, 'bN')
        self.board.set_cell(6, 2, 'bB')
        self.board.set_cell(5, 3, 'bQ')
        self.board.set_cell(4, 4, 'bK')
        self.board.set_cell(3, 5, 'bB')
        self.board.set_cell(2, 6, 'bN')
        self.board.set_cell(1, 7, 'bR')
        self.board.set_cell(0, 8, 'bD')  # Dragon
        for i in range(10):
            self.board.set_cell(8-i, -1+i, 'bP')


    def get_possible_moves(self, q: int, r: int) -> List[Tuple[int, int]]:
        piece = self.board.get_cell(q, r)
        if not piece or piece[0] != self.current_player:
            return []

        piece_obj = PieceFactory.create_piece(piece[1], piece[0])
        all_moves = piece_obj.get_moves(q, r, self.board.size)
        valid_moves = []

        for move in all_moves:
            if self.board.is_valid_cell(*move) and self._is_move_legal(q, r, *move):
                valid_moves.append(move)

        return valid_moves


    def _is_path_clear(self, from_q: int, from_r: int, to_q: int, to_r: int) -> bool:
        dq, dr = to_q - from_q, to_r - from_r
        steps = max(abs(dq), abs(dr))

        if steps <= 1:  # Adjacent move, always clear
            return True

        for step in range(1, steps):
            q = from_q + dq * step // steps
            r = from_r + dr * step // steps
            if self.board.get_cell(q, r) is not None:
                return False
        return True


    def _try_move(self, from_q: int, from_r: int, to_q: int, to_r: int) -> bool:
        piece = self.board.get_cell(from_q, from_r)
        captured_piece = self.board.get_cell(to_q, to_r)
        self.board.set_cell(to_q, to_r, piece)
        self.board.set_cell(from_q, from_r, None)
        in_check = self.is_in_check(piece[0])
        self.board.set_cell(from_q, from_r, piece)
        self.board.set_cell(to_q, to_r, captured_piece)
        return not in_check

    def _undo_move(self):
        if self.move_history:
            from_q, from_r, to_q, to_r, captured_piece = self.move_history.pop()
            piece = self.board.get_cell(to_q, to_r)
            self.board.set_cell(from_q, from_r, piece)
            self.board.set_cell(to_q, to_r, captured_piece)
            self._switch_player()

    def _is_move_legal_basic(self, from_q: int, from_r: int, to_q: int, to_r: int) -> bool:
        if not self.board.is_valid_cell(to_q, to_r):
            return False

        piece = self.board.get_cell(from_q, from_r)
        if not piece or piece[0] != self.current_player:
            return False

        target_piece = self.board.get_cell(to_q, to_r)
        if target_piece and target_piece[0] == self.current_player:
            return False

        return True

    def _is_move_legal(self, from_q: int, from_r: int, to_q: int, to_r: int) -> bool:
        if not self._is_move_legal_basic(from_q, from_r, to_q, to_r):
            return False

        piece = self.board.get_cell(from_q, from_r)
        piece_type = piece[1]

        # Knights can always jump
        if piece_type == 'N':
            return True

        # For Dragons, check if it's a Knight-like move or a Queen-like move
        if piece_type == 'D':
            dq, dr = to_q - from_q, to_r - from_r
            is_knight_move = (abs(dq), abs(dr)) in [(2, 1), (1, 2)] or (abs(dq) + abs(dr) == 3)
            if is_knight_move:
                return True
            # If it's not a Knight-like move, treat it as a Queen-like move and check for clear path

        # Check for clear path for all other pieces (including Dragon's Queen-like moves)
        if not self._is_path_clear(from_q, from_r, to_q, to_r):
            return False

        # Check if the move leaves the current player's king in check
        captured_piece = self.board.get_cell(to_q, to_r)

        # Make the move temporarily
        self.board.set_cell(to_q, to_r, piece)
        self.board.set_cell(from_q, from_r, None)

        # Check if the king is in check after the move
        king_in_check = self.is_in_check(self.current_player)

        # Undo the move
        self.board.set_cell(from_q, from_r, piece)
        self.board.set_cell(to_q, to_r, captured_piece)

        return not king_in_check

    def make_move(self, from_q: int, from_r: int, to_q: int, to_r: int, promotion_piece: str = 'Q') -> bool:
        if self.game_over:
            self.logger.warning("Attempted to make a move when the game is already over")
            return False

        if not self._is_move_legal(from_q, from_r, to_q, to_r):
            self.logger.warning(f"Illegal move attempted from ({from_q}, {from_r}) to ({to_q}, {to_r})")
            return False

        piece = self.board.get_cell(from_q, from_r)
        captured_piece = self.board.get_cell(to_q, to_r)

        self.logger.info(f"Moving {piece} from ({from_q}, {from_r}) to ({to_q}, {to_r})")
        if captured_piece:
            self.logger.info(f"Capturing {captured_piece}")

        self.board.set_cell(to_q, to_r, piece)
        self.board.set_cell(from_q, from_r, None)

        # Check for pawn promotion
        if piece[1] == 'P':
            if piece[0] == 'w' and to_q + to_r == self.board.size:
                promoted_piece = piece[0] + promotion_piece
                self.board.set_cell(to_q, to_r, promoted_piece)
                self.logger.info(f"White pawn promoted to {promotion_piece} at ({to_q}, {to_r})")
            elif piece[0] == 'b' and to_q + to_r == -self.board.size:
                promoted_piece = piece[0] + promotion_piece
                self.board.set_cell(to_q, to_r, promoted_piece)
                self.logger.info(f"Black pawn promoted to {promotion_piece} at ({to_q}, {to_r})")

        self.move_history.append((from_q, from_r, to_q, to_r, captured_piece))

        # Check for pawn promotion
        if piece[1] == 'P':
            if (piece[0] == 'w' and to_r == self.board.size) or (piece[0] == 'b' and to_r == -self.board.size):
                promoted_piece = piece[0] + 'C'  # Promote to Prince
                self.board.set_cell(to_q, to_r, promoted_piece)
                self.logger.info(f"{piece[0]} pawn promoted to Prince at ({to_q}, {to_r})")
            elif (piece[0] == 'w' and to_q == self.board.size) or (piece[0] == 'b' and to_q == -self.board.size):
                promoted_piece = piece[0] + 'C'  # Promote to Prince
                self.board.set_cell(to_q, to_r, promoted_piece)
                self.logger.info(f"{piece[0]} pawn promoted to Prince at ({to_q}, {to_r})")

        self.move_history.append((from_q, from_r, to_q, to_r, captured_piece))



        # Check if a king was captured
        if captured_piece and captured_piece[1] == 'K':
            self.game_over = True
            self.winner = self.current_player
            self.logger.info(f"Game over! {self.current_player} wins by capturing the king")
            return True

        self._switch_player()

        if self.is_checkmate(self.current_player):
            self.game_over = True
            self.winner = 'w' if self.current_player == 'b' else 'b'
            self.logger.info(f"Checkmate! {self.winner} wins")
        elif self.is_stalemate(self.current_player):
            self.game_over = True
            self.winner = 'draw'
            self.logger.info("Stalemate! The game is a draw")

        return True


    def _is_valid_move(self, from_q: int, from_r: int, to_q: int, to_r: int) -> bool:
        piece = self.board.get_cell(from_q, from_r)
        if not piece or piece[0] != self.current_player:
            print(f"Invalid piece or wrong player: {piece}")
            return False

        possible_moves = self.get_possible_moves(from_q, from_r)
        if (to_q, to_r) not in possible_moves:
            print(f"Move not in possible moves: {possible_moves}")
            return False

        # Check if the destination cell is occupied by a friendly piece
        destination_piece = self.board.get_cell(to_q, to_r)
        if destination_piece and destination_piece[0] == self.current_player:
            print(f"Destination occupied by friendly piece: {destination_piece}")
            return False

        return True

    def _switch_player(self):
        self.current_player = self._opposite_color(self.current_player)

    def _opposite_color(self, color: str) -> str:
        return 'b' if color == 'w' else 'w'

    def is_game_over(self) -> bool:
        return self.game_over


    def get_winner(self) -> Optional[str]:
        return self.winner

    def _is_king_in_check(self, color: str) -> bool:
        king_pos = self._find_king(color)
        if not king_pos:
            return False

        opponent_color = 'b' if color == 'w' else 'w'
        for q, r in self.board.get_all_cells():
            piece = self.board.get_cell(q, r)
            if piece and piece[0] == opponent_color:
                piece_obj = PieceFactory.create_piece(piece[1], piece[0])
                if king_pos in piece_obj.get_moves(q, r, self.board.size):
                    return True
        return False

    def _find_king(self, color: str) -> Optional[Tuple[int, int]]:
        for q, r in self.board.get_all_cells():
            piece = self.board.get_cell(q, r)
            if piece == f'{color}K':
                return (q, r)
        return None

    def print_board(self):
        for r in range(-self.board.size, self.board.size + 1):
            line = ' ' * (self.board.size + r) if r > 0 else ' ' * (self.board.size - abs(r))
            for q in range(-self.board.size, self.board.size + 1):
                if self.board.is_valid_cell(q, r):
                    piece = self.board.get_cell(q, r)
                    line += (piece if piece else '..') + ' '
            print(line)

    def is_in_check(self, color: str) -> bool:
        king_pos = self._find_king(color)
        if not king_pos:
            return False

        opponent_color = 'b' if color == 'w' else 'w'
        for q, r in self.board.get_all_cells():
            piece = self.board.get_cell(q, r)
            if piece and piece[0] == opponent_color:
                if king_pos in self.get_possible_moves(q, r):
                    return True
        return False

    def is_checkmate(self, color: str) -> bool:
        if not self.is_in_check(color):
            return False

        return not self._has_legal_moves(color)

    def is_stalemate(self, color: str) -> bool:
        if self.is_in_check(color):
            return False

        return not self._has_legal_moves(color)

    def _has_legal_moves(self, color: str) -> bool:
        for q, r in self.board.get_all_cells():
            piece = self.board.get_cell(q, r)
            if piece and piece[0] == color:
                possible_moves = self.get_possible_moves(q, r)
                for move in possible_moves:
                    if self._is_move_legal(q, r, *move):
                        return True


    def reset(self):
        self.board = HexBoard(self.board.size)
        self.current_player = 'w'
        self.move_history = []
        self._setup_pieces()
