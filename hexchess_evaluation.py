"""Evaluation functions for HexChess AI -- scoring moves, positions, and board state."""

import logging
from typing import Tuple, Optional
from collections import Counter

logger = logging.getLogger('hexchess.ai')


class EvaluationMixin:
    """Mixin providing evaluation methods for AI classes.

    Expects self.game, self.color, self.learning_module, self.total_moves,
    self.early_game_threshold, self.piece_values to be set.
    """

    def _evaluate_capture(self, moving_piece: str, captured_piece: str) -> float:
        if captured_piece[0] != self.color:
            attack_value = self.piece_values[moving_piece[1]]['attack']
            target_value = self.learning_module.params['piece_values'][captured_piece[1]]
            return attack_value * target_value * self.learning_module.params['aggression']
        else:
            return -self.learning_module.params['piece_values'][captured_piece[1]]

    def _evaluate_phase_specific(self, piece: str, from_q: int, from_r: int,
                                  to_q: int, to_r: int, phase: str) -> float:
        score = 0
        if phase == 'opening':
            score += self._evaluate_development(piece, from_q, from_r, to_q, to_r)
            score += self._evaluate_center_control(to_q, to_r)
        elif phase == 'middlegame':
            score += self._evaluate_piece_activity(piece, to_q, to_r, from_q, from_r)
            score += self._evaluate_pawn_structure(to_q, to_r)
        else:  # endgame
            score += self._evaluate_king_activity(piece, to_q, to_r)
            score += self._evaluate_pawn_promotion_potential(piece, to_q, to_r)
        return score

    def _evaluate_development(self, piece: str, from_q: int, from_r: int,
                               to_q: int, to_r: int) -> float:
        if piece[1] in ['N', 'B'] and (
                (self.color == 'w' and from_r < 0) or (self.color == 'b' and from_r > 0)):
            return self.learning_module.params['piece_development']
        return 0

    def _evaluate_center_control(self, q: int, r: int) -> float:
        center_distance = max(abs(q), abs(r))
        return self.learning_module.params['center_control'] * (self.game.board.size - center_distance)

    def _evaluate_piece_activity(self, piece: str, q: int, r: int,
                                 from_q: Optional[int] = None, from_r: Optional[int] = None) -> float:
        return self._evaluate_mobility(q, r, from_q, from_r)

    def _count_moves_after(self, from_q: int, from_r: int, to_q: int, to_r: int) -> int:
        """Number of legal moves the piece would have from (to_q, to_r) after moving there."""
        board = self.game.board
        piece, captured = board.get_cell(from_q, from_r), board.get_cell(to_q, to_r)
        board.set_cell(to_q, to_r, piece)
        board.set_cell(from_q, from_r, None)
        try:
            return len(self.game.get_possible_moves(to_q, to_r))
        finally:
            board.set_cell(from_q, from_r, piece)
            board.set_cell(to_q, to_r, captured)

    def _evaluate_pawn_structure(self, q: int, r: int) -> float:
        score = 0
        for dq, dr in [(1, -1), (1, 0), (0, 1), (-1, 1), (-1, 0), (0, -1)]:
            if self.game.board.is_valid_cell(q + dq, r + dr):
                neighbor = self.game.board.get_cell(q + dq, r + dr)
                if neighbor and neighbor[0] == self.color and neighbor[1] == 'P':
                    score += self.learning_module.params['pawn_structure']
        return score

    def _evaluate_king_activity(self, piece: str, q: int, r: int) -> float:
        if piece[1] == 'K':
            center_distance = max(abs(q), abs(r))
            return self.learning_module.params['endgame_preparedness'] * (
                self.game.board.size - center_distance)
        return 0

    def _evaluate_pawn_promotion_potential(self, piece: str, q: int, r: int) -> float:
        if piece[1] == 'P':
            distance_to_promote = (self.game.board.size - r if self.color == 'w'
                                   else r + self.game.board.size)
            return self.learning_module.params['pawn_promotion'] * (
                self.game.board.size - distance_to_promote)
        return 0

    def _evaluate_position(self, q: int, r: int) -> float:
        return self.learning_module.params['board_control'] * (
            self.game.board.size - max(abs(q), abs(r)))

    def _evaluate_mobility(self, q: int, r: int,
                           from_q: Optional[int] = None, from_r: Optional[int] = None) -> float:
        # Mobility of the moving piece on its new cell: before the move that cell is empty or holds an enemy,
        # so asking get_possible_moves without making the move always gave 0.
        if from_q is None:
            count = len(self.game.get_possible_moves(q, r))
        else:
            count = self._count_moves_after(from_q, from_r, q, r)
        return count * self.learning_module.params['mobility'] * 0.1

    def _evaluate_piece_coordination(self, q: int, r: int) -> float:
        score = 0
        for dq, dr in [(1, -1), (1, 0), (0, 1), (-1, 1), (-1, 0), (0, -1)]:
            if self.game.board.is_valid_cell(q + dq, r + dr):
                neighbor = self.game.board.get_cell(q + dq, r + dr)
                if neighbor and neighbor[0] == self.color:
                    score += self.learning_module.params['piece_coordination']
        return score

    def _evaluate_tempo(self, piece: str, from_q: int, from_r: int,
                         to_q: int, to_r: int) -> float:
        distance_moved = self.game.board.distance(from_q, from_r, to_q, to_r)
        return distance_moved * self.learning_module.params['tempo'] * 0.1

    def _evaluate_prince_move(self, from_q: int, from_r: int,
                               to_q: int, to_r: int) -> float:
        score = 0
        center_distance = max(abs(to_q), abs(to_r))
        score += (self.game.board.size - center_distance) * 0.1

        for dq, dr in [(1, 0), (1, -1), (0, -1), (-1, 0), (-1, 1), (0, 1)]:
            adj_q, adj_r = to_q + dq, to_r + dr
            if self.game.board.is_valid_cell(adj_q, adj_r):
                adj_piece = self.game.board.get_cell(adj_q, adj_r)
                if adj_piece and adj_piece[0] == self.color:
                    score += 0.5
        return score

    def _evaluate_early_game_development(self, piece: str, to_q: int, to_r: int) -> float:
        score = 0
        if piece[1] in ['N', 'B', 'R']:
            distance_to_center = max(abs(to_q), abs(to_r))
            score += (self.game.board.size - distance_to_center) * 0.5

            if ((piece[0] == 'w' and to_r > -self.game.board.size) or
                    (piece[0] == 'b' and to_r < self.game.board.size)):
                score += 2
        return score

    def _evaluate_king_safety(self, q: int, r: int) -> float:
        king_pos = self._find_king()
        if king_pos:
            king_q, king_r = king_pos
            distance_to_king = self.game.board.distance(q, r, king_q, king_r)

            if self.total_moves < self.early_game_threshold:
                return self.learning_module.params['king_safety'] * (1 / (distance_to_king + 1))
            else:
                return self.learning_module.params['king_safety'] * (
                    1 / (distance_to_king + 1)) * 0.5
        return 0

    def _evaluate_repetition(self, move: Tuple[int, int, int, int]) -> float:
        from_q, from_r, to_q, to_r = move
        current_position = self._get_board_state_after_move(from_q, from_r, to_q, to_r)

        repetitions = self.position_history.count(current_position)

        if repetitions >= self.repetition_threshold:
            return -2.0 * repetitions
        return 0

    def _evaluate_progress(self, move: Tuple[int, int, int, int]) -> float:
        from_q, from_r, to_q, to_r = move

        if move in self.move_history:
            return -0.5 * (len(self.move_history) - self.move_history.index(move))

        progress = to_r - from_r if self.color == 'w' else from_r - to_r
        return progress * 0.1

    def _evaluate_stalemate_avoidance(self, move: Tuple[int, int, int, int]) -> float:
        from_q, from_r, to_q, to_r = move

        hypothetical_board = self._get_hypothetical_board(from_q, from_r, to_q, to_r)

        opponent_color = 'b' if self.color == 'w' else 'w'
        opponent_has_moves = any(
            self._get_possible_moves_for_piece(q, r, hypothetical_board)
            for q, r in self.game.board.get_all_cells()
            if hypothetical_board.get_cell(q, r)
            and hypothetical_board.get_cell(q, r)[0] == opponent_color)

        return 0.5 if opponent_has_moves else -1.0

    def _evaluate_material_advantage(self) -> float:
        material_score = 0
        for q, r in self.game.board.get_all_cells():
            piece = self.game.board.get_cell(q, r)
            if piece:
                value = self.learning_module.params['piece_values'][piece[1]]
                if piece[0] == self.color:
                    material_score += value
                else:
                    material_score -= value
        return material_score / 100
