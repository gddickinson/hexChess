"""HexChess AdvancedAI -- iterative-deepening minimax with alpha-beta pruning and a board evaluation."""

import random
import time
from typing import Any, Dict, List, Optional, Tuple

from hexchess_ai import BasicAI
from hexchess_game import HexChess


class AdvancedAI(BasicAI):
    def __init__(self, game, color: str, custom_filename: str = None):
        super().__init__(game, color, custom_filename)
        self.max_time = 6
        self.max_depth = 5
        self.transposition_table: Dict[str, Tuple[float, int, Tuple[int, int, int, int]]] = {}
        self.move_ordering: Dict[Tuple[int, int, int, int], float] = {}

    def make_move(self) -> Optional[Tuple[int, int, int, int]]:
        self.start_time = time.time()
        best_move = None
        best_score = float('-inf')

        for depth in range(1, self.max_depth + 1):
            move, score = self._iterative_deepening(depth)
            if move is not None:
                best_move = move
                best_score = score
            if time.time() - self.start_time > self.max_time:
                break

        if best_move is None:
            all_moves = self._get_all_possible_moves()
            if all_moves:
                best_move = random.choice(all_moves)

        return best_move

    def _iterative_deepening(self, depth: int):
        best_move = None
        best_score = float('-inf')

        all_moves = self._get_all_possible_moves()
        all_moves.sort(key=lambda m: self.move_ordering.get(m, 0), reverse=True)

        for move in all_moves:
            if time.time() - self.start_time > self.max_time:
                break

            self.game.make_move(*move)
            score = self._minimax(depth - 1, float('-inf'), float('inf'), False)
            self.game.undo_move()

            if score > best_score:
                best_score = score
                best_move = move

            self.move_ordering[move] = score

        return best_move, best_score

    def _minimax(self, depth: int, alpha: float, beta: float, maximizing_player: bool) -> float:
        if (depth == 0 or self.game.is_game_over() or
                time.time() - self.start_time > self.max_time):
            return self._evaluate_board(self.game)

        board_hash = self._get_board_hash()
        if board_hash in self.transposition_table:
            stored_score, stored_depth, _ = self.transposition_table[board_hash]
            if stored_depth >= depth:
                return stored_score

        best_score = float('-inf') if maximizing_player else float('inf')
        best_move = None

        all_moves = self._get_side_moves(self.game, self.game.current_player)
        all_moves.sort(key=lambda m: self.move_ordering.get(m, 0), reverse=maximizing_player)

        for move in all_moves:
            self.game.make_move(*move)
            score = self._minimax(depth - 1, alpha, beta, not maximizing_player)
            self.game.undo_move()

            if maximizing_player:
                if score > best_score:
                    best_score = score
                    best_move = move
                alpha = max(alpha, best_score)
            else:
                if score < best_score:
                    best_score = score
                    best_move = move
                beta = min(beta, best_score)

            if beta <= alpha:
                break

        self.transposition_table[board_hash] = (best_score, depth, best_move)
        return best_score

    def _get_board_hash(self) -> str:
        return ''.join(self.game.board.get_cell(q, r) or '.'
                       for q, r in self.game.board.get_all_cells())

    def _evaluate_board(self, game: HexChess) -> float:
        if game.is_game_over():
            winner = game.get_winner()
            if winner == self.color:
                return float('inf')
            elif winner == 'draw':
                return 0
            else:
                return float('-inf')

        # Every term is from this AI's side; material is white minus black, so it is flipped for Black.
        material = self._evaluate_material_balance_for_game(game)
        score = material if self.color == 'w' else -material
        score += self._evaluate_piece_positions(game)
        score += self._evaluate_advanced_king_safety(game)
        score += self._evaluate_advanced_pawn_structure(game)
        score += self._evaluate_advanced_center_control(game)
        score += self._evaluate_advanced_mobility(game)
        score += self._evaluate_advanced_coordination(game)

        return score

    def _evaluate_advanced_king_safety(self, game: HexChess) -> float:
        king_pos = self._find_king_position(game, self.color)
        if not king_pos:
            return 0

        safety_score = 0
        adjacent_hexes = game.board.get_adjacent_cells(*king_pos)

        for adj_q, adj_r in adjacent_hexes:
            piece = game.board.get_cell(adj_q, adj_r)
            if piece and piece[0] == self.color:
                safety_score += 1

        center_distance = max(abs(king_pos[0]), abs(king_pos[1]))
        safety_score += center_distance * 0.1

        return safety_score

    def _evaluate_advanced_pawn_structure(self, game: HexChess) -> float:
        score = 0
        for q, r in game.board.get_all_cells():
            piece = game.board.get_cell(q, r)
            if piece and piece[1] == 'P':
                if piece[0] == self.color:
                    score += self._evaluate_pawn_position(game, q, r, self.color)
                else:
                    score -= self._evaluate_pawn_position(game, q, r,
                                                          self._opposite_color(self.color))
        return score

    def _evaluate_advanced_center_control(self, game: HexChess) -> float:
        center_hexes = [(0, 0), (1, -1), (1, 0), (0, 1), (-1, 1), (-1, 0), (0, -1)]
        score = 0
        for q, r in center_hexes:
            piece = game.board.get_cell(q, r)
            if piece:
                value = 0.1 * self.piece_values[piece[1]]['attack']
                score += value if piece[0] == self.color else -value
        return score

    def _evaluate_advanced_mobility(self, game: HexChess) -> float:
        my_mobility = len(self._get_side_moves(game, self.color))
        opponent_mobility = len(self._get_side_moves(game, self._opposite_color(self.color)))
        return (my_mobility - opponent_mobility) * 0.1

    @staticmethod
    def _get_side_moves(game: HexChess, color: str) -> List[Tuple[int, int, int, int]]:
        """Legal moves of `color` in `game`, whoever is to move (get_possible_moves answers only for the mover)."""
        moves = []
        for q, r in game.board.get_all_cells():
            piece = game.board.get_cell(q, r)
            if piece and piece[0] == color:
                moves.extend((q, r, tq, tr) for tq, tr in game._pseudo_moves(q, r)
                             if not game._leaves_king_in_check(q, r, tq, tr))
        return moves

    def _evaluate_advanced_coordination(self, game: HexChess) -> float:
        score = 0
        for q, r in game.board.get_all_cells():
            piece = game.board.get_cell(q, r)
            if piece and piece[0] == self.color:
                adjacent_hexes = game.board.get_adjacent_cells(q, r)
                for adj_q, adj_r in adjacent_hexes:
                    adj_piece = game.board.get_cell(adj_q, adj_r)
                    if adj_piece and adj_piece[0] == self.color:
                        score += 0.1
        return score

    def _evaluate_pawn_position(self, game: HexChess, q: int, r: int, color: str) -> float:
        score = 0
        direction = 1 if color == 'w' else -1
        score += r * direction * 0.1

        if game.board.get_cell(q, r + direction) == f"{color}P":
            score -= 0.5

        adjacent_hexes = game.board.get_adjacent_cells(q, r)
        for adj_q, adj_r in adjacent_hexes:
            if game.board.get_cell(adj_q, adj_r) == f"{color}P":
                score += 0.3

        return score

    def _evaluate_piece_positions(self, game: HexChess) -> float:
        """Pawn and Dragon placement: this AI's pieces count for it, the opponent's against it."""
        score = 0
        for q, r in game.board.get_all_cells():
            piece = game.board.get_cell(q, r)
            if piece:
                sign = 1 if piece[0] == self.color else -1
                if piece[1] == 'P':
                    score += sign * self._evaluate_pawn_position(game, q, r, piece[0])
                elif piece[1] == 'D':
                    score += sign * self._evaluate_dragon_position(game, q, r, piece[0])
        return score

    def _evaluate_dragon_position(self, game: HexChess, q: int, r: int, color: str) -> float:
        score = 0
        center_distance = max(abs(q), abs(r))
        score += (7 - center_distance) * 0.2

        adjacent_hexes = game.board.get_adjacent_cells(q, r)
        for adj_q, adj_r in adjacent_hexes:
            piece = game.board.get_cell(adj_q, adj_r)
            if piece and piece[0] != color:
                score += 0.1

        return score

    def _is_endgame(self, game: HexChess) -> bool:
        total_pieces = sum(1 for _ in game.board.get_all_cells() if game.board.get_cell(*_))
        return total_pieces <= 10

    def _find_king_position(self, game: HexChess, color: str) -> Optional[Tuple[int, int]]:
        for q, r in game.board.get_all_cells():
            piece = game.board.get_cell(q, r)
            if piece and piece[1] == 'K' and piece[0] == color:
                return (q, r)
        return None

    def _opposite_color(self, color: str) -> str:
        return 'b' if color == 'w' else 'w'

    def _evaluate_material_balance_for_game(self, game: HexChess) -> float:
        balance = 0
        for q, r in game.board.get_all_cells():
            piece = game.board.get_cell(q, r)
            if piece:
                value = self.piece_values[piece[1]]['attack']
                balance += value if piece[0] == 'w' else -value
        return balance

    def learn_from_game(self, result: float, game_stats: Dict[str, Any]):
        super().learn_from_game(result, game_stats)
