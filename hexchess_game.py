"""HexChess rules: a radius-8 hexagonal board (217 cells, axial q/r coordinates), piece setup, move legality,
check, checkmate, stalemate, promotion and undo.

Move legality (see hexchess_pieces.py for each piece's move pattern):
- the target must be in the piece's pattern and on the board, and not hold a friendly piece;
- Knights jump; a Dragon jumps when the offset is one of the Knight's offsets, otherwise it slides like a Queen;
  every other piece needs a clear path;
- the move must not leave the mover's own King attacked.
"""
from hexchess_board import HexBoard
from hexchess_pieces import PieceFactory, KNIGHT_OFFSETS
from typing import List, Tuple, Optional
import logging


class HexChess:
    def __init__(self, board_size: int = 8):
        self.board = HexBoard(board_size)
        self.current_player = 'w'
        self.move_history: List[Tuple[int, int, int, int, Optional[str]]] = []
        # Per move: (moved piece before promotion, game_over, winner) so undo_move can restore everything.
        self._undo_stack: List[Tuple[str, bool, Optional[str]]] = []
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

    # --- move generation ---------------------------------------------------------------------------------------
    def get_possible_moves(self, q: int, r: int) -> List[Tuple[int, int]]:
        """Legal target cells for the current player's piece at (q, r) ([] for an empty cell or an opponent piece)."""
        piece = self.board.get_cell(q, r)
        if not piece or piece[0] != self.current_player:
            return []
        return [move for move in self._pseudo_moves(q, r) if not self._leaves_king_in_check(q, r, *move)]

    def _pseudo_moves(self, q: int, r: int) -> List[Tuple[int, int]]:
        """Targets of the piece at (q, r) by its pattern, path and friendly-piece rules, ignoring check."""
        piece = self.board.get_cell(q, r)
        if not piece:
            return []
        piece_obj = PieceFactory.create_piece(piece[1], piece[0])
        moves = []
        for to_q, to_r in piece_obj.get_moves(q, r, self.board.size):
            if not self.board.is_valid_cell(to_q, to_r):
                continue
            target = self.board.get_cell(to_q, to_r)
            if target and target[0] == piece[0]:
                continue
            if self._jumps(piece[1], to_q - q, to_r - r) or self._is_path_clear(q, r, to_q, to_r):
                moves.append((to_q, to_r))
        return moves

    @staticmethod
    def _jumps(piece_type: str, dq: int, dr: int) -> bool:
        """Knights always jump; a Dragon jumps on its Knight-like offsets."""
        return piece_type == 'N' or (piece_type == 'D' and (dq, dr) in KNIGHT_OFFSETS)

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

    def _leaves_king_in_check(self, from_q: int, from_r: int, to_q: int, to_r: int) -> bool:
        piece = self.board.get_cell(from_q, from_r)
        captured_piece = self.board.get_cell(to_q, to_r)
        self.board.set_cell(to_q, to_r, piece)
        self.board.set_cell(from_q, from_r, None)
        in_check = self.is_in_check(piece[0])
        self.board.set_cell(from_q, from_r, piece)
        self.board.set_cell(to_q, to_r, captured_piece)
        return in_check

    def _try_move(self, from_q: int, from_r: int, to_q: int, to_r: int) -> bool:
        return not self._leaves_king_in_check(from_q, from_r, to_q, to_r)

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
        if (to_q, to_r) not in self._pseudo_moves(from_q, from_r):
            return False
        return not self._leaves_king_in_check(from_q, from_r, to_q, to_r)

    # --- making and undoing moves ------------------------------------------------------------------------------
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

        # Pawn promotion: to promotion_piece (default Queen) on the far edge (black's/white's back rank) ...
        if piece[1] == 'P':
            if piece[0] == 'w' and to_q + to_r == self.board.size:
                self.board.set_cell(to_q, to_r, piece[0] + promotion_piece)
                self.logger.info(f"White pawn promoted to {promotion_piece} at ({to_q}, {to_r})")
            elif piece[0] == 'b' and to_q + to_r == -self.board.size:
                self.board.set_cell(to_q, to_r, piece[0] + promotion_piece)
                self.logger.info(f"Black pawn promoted to {promotion_piece} at ({to_q}, {to_r})")

        # ... and to a Prince on the two side edges next to it (this wins at the two corners shared by both).
        if piece[1] == 'P':
            if (piece[0] == 'w' and to_r == self.board.size) or (piece[0] == 'b' and to_r == -self.board.size) or \
               (piece[0] == 'w' and to_q == self.board.size) or (piece[0] == 'b' and to_q == -self.board.size):
                self.board.set_cell(to_q, to_r, piece[0] + 'C')  # Promote to Prince
                self.logger.info(f"{piece[0]} pawn promoted to Prince at ({to_q}, {to_r})")

        self.move_history.append((from_q, from_r, to_q, to_r, captured_piece))
        self._undo_stack.append((piece, self.game_over, self.winner))

        # Check if a king was captured (only possible from a position set up by hand: legal moves never allow it)
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

    def undo_move(self) -> bool:
        """Take back the last move (restores the moved piece before promotion, any capture, the turn and the result)."""
        if not self.move_history:
            return False
        from_q, from_r, to_q, to_r, captured_piece = self.move_history.pop()
        piece, game_over, winner = self._undo_stack.pop()
        self.board.set_cell(from_q, from_r, piece)
        self.board.set_cell(to_q, to_r, captured_piece)
        self.current_player = piece[0]
        self.game_over, self.winner = game_over, winner
        return True

    def _undo_move(self):
        self.undo_move()

    def _is_valid_move(self, from_q: int, from_r: int, to_q: int, to_r: int) -> bool:
        return self._is_move_legal(from_q, from_r, to_q, to_r)

    def _switch_player(self):
        self.current_player = self._opposite_color(self.current_player)

    def _opposite_color(self, color: str) -> str:
        return 'b' if color == 'w' else 'w'

    def is_game_over(self) -> bool:
        return self.game_over

    def get_winner(self) -> Optional[str]:
        return self.winner

    # --- check, checkmate, stalemate ---------------------------------------------------------------------------
    def _find_king(self, color: str) -> Optional[Tuple[int, int]]:
        for q, r in self.board.get_all_cells():
            piece = self.board.get_cell(q, r)
            if piece == f'{color}K':
                return (q, r)
        return None

    def is_in_check(self, color: str) -> bool:
        """True if any opponent piece could move to `color`'s King (whoever is to move)."""
        king_pos = self._find_king(color)
        if not king_pos:
            return False

        opponent_color = self._opposite_color(color)
        for q, r in self.board.get_all_cells():
            piece = self.board.get_cell(q, r)
            if piece and piece[0] == opponent_color and king_pos in self._pseudo_moves(q, r):
                return True
        return False

    _is_king_in_check = is_in_check

    def is_checkmate(self, color: Optional[str] = None) -> bool:
        color = color or self.current_player
        return self.is_in_check(color) and not self._has_legal_moves(color)

    def is_stalemate(self, color: Optional[str] = None) -> bool:
        color = color or self.current_player
        return not self.is_in_check(color) and not self._has_legal_moves(color)

    def _has_legal_moves(self, color: str) -> bool:
        for q, r in self.board.get_all_cells():
            piece = self.board.get_cell(q, r)
            if piece and piece[0] == color:
                for move in self._pseudo_moves(q, r):
                    if not self._leaves_king_in_check(q, r, *move):
                        return True
        return False

    def print_board(self):
        for r in range(-self.board.size, self.board.size + 1):
            line = ' ' * (self.board.size + r) if r > 0 else ' ' * (self.board.size - abs(r))
            for q in range(-self.board.size, self.board.size + 1):
                if self.board.is_valid_cell(q, r):
                    piece = self.board.get_cell(q, r)
                    line += (piece if piece else '..') + ' '
            print(line)

    def reset(self):
        self.board = HexBoard(self.board.size)
        self.current_player = 'w'
        self.move_history = []
        self._undo_stack = []
        self.game_over = False
        self.winner = None
        self._setup_pieces()
