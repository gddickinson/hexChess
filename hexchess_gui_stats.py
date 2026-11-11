"""Game statistics for the HexChess main window (material, centre control, king safety, mobility, pawn structure).

GameStatsMixin expects self.game (a HexChess); MainWindow in hexchess_gui.py mixes it in.
"""
from typing import Any, Dict, List, Optional, Tuple


class GameStatsMixin:
    def _piece_moves(self, q: int, r: int) -> List[Tuple[int, int]]:
        """Legal moves of the piece at (q, r) whoever is to move (get_possible_moves answers only for the mover)."""
        return [m for m in self.game._pseudo_moves(q, r) if not self.game._leaves_king_in_check(q, r, *m)]

    def get_game_stats(self) -> Dict[str, Any]:
        stats = {
            'total_moves': len(self.game.move_history),
            'material_balance': self._calculate_material_balance(),
            'center_control': self._calculate_center_control(),
            'king_safety': self._calculate_king_safety(),
            'mobility': self._calculate_mobility(),
            'pawn_structure': self._calculate_pawn_structure(),
            'piece_effectiveness': self._calculate_piece_effectiveness()
        }
        return stats

    def _calculate_material_balance(self) -> int:
        piece_values = {'P': 1, 'N': 3, 'B': 3, 'R': 5, 'Q': 9, 'K': 0, 'D': 15, 'C': 2}
        balance = 0
        for q, r in self.game.board.get_all_cells():
            piece = self.game.board.get_cell(q, r)
            if piece:
                value = piece_values[piece[1]]
                balance += value if piece[0] == 'w' else -value
        return balance

    def _calculate_center_control(self) -> float:
        center_hexes = [(0, 0), (1, -1), (1, 0), (0, 1), (-1, 1), (-1, 0), (0, -1)]
        white_control = 0
        black_control = 0
        for q, r in center_hexes:
            white_control += len([move for move in self._get_all_moves('w') if move[2] == q and move[3] == r])
            black_control += len([move for move in self._get_all_moves('b') if move[2] == q and move[3] == r])
        total_control = white_control + black_control
        return (white_control - black_control) / total_control if total_control > 0 else 0

    def _calculate_king_safety(self) -> float:
        def king_safety_score(color):
            king_pos = self.find_king(color)
            if not king_pos:
                return 0
            q, r = king_pos
            safety = 0
            for dq, dr in [(1, -1), (1, 0), (0, 1), (-1, 1), (-1, 0), (0, -1)]:
                adj_q, adj_r = q + dq, r + dr
                if self.game.board.is_valid_cell(adj_q, adj_r):
                    piece = self.game.board.get_cell(adj_q, adj_r)
                    if piece and piece[0] == color:
                        safety += 1
            return safety / 6

        white_safety = king_safety_score('w')
        black_safety = king_safety_score('b')
        return white_safety - black_safety

    def _calculate_mobility(self) -> int:
        white_mobility = len(self._get_all_moves('w'))
        black_mobility = len(self._get_all_moves('b'))
        return white_mobility - black_mobility

    def _calculate_pawn_structure(self) -> float:
        def pawn_structure_score(color):
            score = 0
            pawns = [(q, r) for q, r in self.game.board.get_all_cells()
                     if self.game.board.get_cell(q, r) == f'{color}P']
            for q, r in pawns:
                if self.is_passed_pawn(q, r, color):
                    score += 2
                if self.is_connected_pawn(q, r, color):
                    score += 1
            return score

        white_score = pawn_structure_score('w')
        black_score = pawn_structure_score('b')
        return white_score - black_score

    def _calculate_piece_effectiveness(self) -> Dict[str, float]:
        effectiveness = {piece: 0 for piece in 'PRNBQKDC'}
        total_moves = len(self.game.move_history)
        if total_moves == 0:
            return effectiveness

        for from_q, from_r, to_q, to_r, captured in self.game.move_history:
            piece = self.game.board.get_cell(to_q, to_r)
            if piece:
                effectiveness[piece[1]] += 1
                if captured:
                    effectiveness[piece[1]] += 2

        for piece in effectiveness:
            effectiveness[piece] /= total_moves

        return effectiveness

    def calculate_game_statistics(self):
        stats = {
            'w': {'material_balance': 0, 'center_control': 0, 'king_safety': 0, 'mobility': 0, 'pawn_structure': 0},
            'b': {'material_balance': 0, 'center_control': 0, 'king_safety': 0, 'mobility': 0, 'pawn_structure': 0}
        }
        piece_values = {'P': 1, 'N': 3, 'B': 3, 'R': 5, 'Q': 9, 'K': 0, 'D': 15, 'C': 2}
        center_hexes = [(0, 0), (1, -1), (1, 0), (0, 1), (-1, 1), (-1, 0), (0, -1)]

        for q, r in self.game.board.get_all_cells():
            piece = self.game.board.get_cell(q, r)
            if piece:
                color = piece[0]
                piece_type = piece[1]
                stats[color]['material_balance'] += piece_values[piece_type]
                if (q, r) in center_hexes:
                    stats[color]['center_control'] += 1
                moves = self._piece_moves(q, r)
                stats[color]['mobility'] += len(moves)
                if piece_type == 'P':
                    if self.is_passed_pawn(q, r, color):
                        stats[color]['pawn_structure'] += 2
                    if self.is_connected_pawn(q, r, color):
                        stats[color]['pawn_structure'] += 1

        for color in ['w', 'b']:
            king_pos = self.find_king(color)
            if king_pos:
                stats[color]['king_safety'] = self.calculate_king_safety(*king_pos, color)

        for color in ['w', 'b']:
            stats[color]['center_control'] /= len(center_hexes)
            stats[color]['king_safety'] /= 6
            stats[color]['mobility'] /= 100
            stats[color]['pawn_structure'] /= 20

        return stats

    def is_passed_pawn(self, q: int, r: int, color: str) -> bool:
        direction = 1 if color == 'w' else -1
        for dq in [-1, 0, 1]:
            for dr in range(1, self.game.board.size + 1):
                check_q = q + dq
                check_r = r + dr * direction
                if self.game.board.is_valid_cell(check_q, check_r):
                    piece = self.game.board.get_cell(check_q, check_r)
                    if piece and piece[0] != color and piece[1] == 'P':
                        return False
        return True

    def is_connected_pawn(self, q: int, r: int, color: str) -> bool:
        for dq, dr in [(1, -1), (1, 0), (0, 1), (-1, 1), (-1, 0), (0, -1)]:
            check_q, check_r = q + dq, r + dr
            if self.game.board.is_valid_cell(check_q, check_r):
                piece = self.game.board.get_cell(check_q, check_r)
                if piece and piece[0] == color and piece[1] == 'P':
                    return True
        return False

    def find_king(self, color: str) -> Optional[Tuple[int, int]]:
        for q, r in self.game.board.get_all_cells():
            piece = self.game.board.get_cell(q, r)
            if piece == f'{color}K':
                return (q, r)
        return None

    def calculate_king_safety(self, king_q: int, king_r: int, color: str) -> float:
        safety = 0
        for dq, dr in [(1, -1), (1, 0), (0, 1), (-1, 1), (-1, 0), (0, -1)]:
            check_q, check_r = king_q + dq, king_r + dr
            if self.game.board.is_valid_cell(check_q, check_r):
                piece = self.game.board.get_cell(check_q, check_r)
                if piece and piece[0] == color:
                    safety += 1
        return safety

    def _get_all_moves(self, color: str) -> List[Tuple[int, int, int, int]]:
        moves = []
        for q, r in self.game.board.get_all_cells():
            piece = self.game.board.get_cell(q, r)
            if piece and piece[0] == color:
                moves.extend([(q, r, to_q, to_r) for to_q, to_r in self._piece_moves(q, r)])
        return moves
