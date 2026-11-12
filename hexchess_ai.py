"""HexChess AI -- BasicAI (one-move scoring with learned weights); AdvancedAI lives in hexchess_ai_advanced.py
and is re-exported here, so `from hexchess_ai import BasicAI, AdvancedAI` keeps working."""

import random
from typing import List, Tuple, Dict, Any, Optional
import json
import os
from hexchess_game import HexChess
from hexchess_learning import LearningModule
from hexchess_evaluation import EvaluationMixin
from collections import deque, Counter
import logging
import time

logger = logging.getLogger('hexchess.ai')

# Learned parameter files live next to this module, whatever the working directory.
MODULE_DIR = os.path.dirname(os.path.abspath(__file__))


class BasicAI(EvaluationMixin):
    def __init__(self, game, color: str, custom_filename: str = None):
        self.game = game
        self.color = color
        self.learning_module = LearningModule()
        self.custom_filename = custom_filename
        self.logger = logging.getLogger('hexchess.ai')
        self.games_played = 0
        self.wins = 0
        self.total_moves = 0
        self.load_learning_progress()
        self.position_history = deque(maxlen=20)
        self.move_history = deque(maxlen=40)
        self.repetition_threshold = 2
        self.diversity_bonus = 0.2
        self.long_loop_threshold = 10
        self.forced_random_move_threshold = 30
        self.performance_history = []
        self.king_move_count = 0
        self.early_game_threshold = 10

        self.move_stats = {
            'aggression': 0,
            'center_control': 0,
            'king_safety': 0,
            'pawn_structure': 0,
            'mobility': 0,
            'defensive': 0,
            'piece_protection': 0,
            'pawn_promotion': 0,
            'material_advantage': 0,
            'piece_effectiveness': {piece: 0 for piece in 'PNBRQKDC'},
            'piece_development': 0,
            'board_control': 0,
            'piece_coordination': 0,
            'tempo': 0,
            'endgame_preparedness': 0,
        }

        self.piece_values = {
            'P': {'attack': 1, 'defense': 1},
            'N': {'attack': 3, 'defense': 2},
            'B': {'attack': 3, 'defense': 2},
            'R': {'attack': 4, 'defense': 4},
            'Q': {'attack': 10, 'defense': 10},
            'K': {'attack': 2, 'defense': 5},
            'D': {'attack': 20, 'defense': 10},
            'C': {'attack': 2, 'defense': 2}
        }

    def penalize_parameters(self, penalty_factor: float):
        """Penalize AI parameters when game is stuck in a loop."""
        logger.info(f"{self.color} AI: Penalizing parameters with factor {penalty_factor}")
        for param in self.learning_module.params:
            if isinstance(self.learning_module.params[param], (int, float)):
                self.learning_module.params[param] *= penalty_factor
            elif isinstance(self.learning_module.params[param], dict):
                for sub_param in self.learning_module.params[param]:
                    self.learning_module.params[param][sub_param] *= penalty_factor

        self.diversity_bonus *= penalty_factor
        self.repetition_threshold = max(1, self.repetition_threshold - 1)

        logger.info(f"Penalized parameters: {self.learning_module.params}")

    def make_move(self) -> Optional[Tuple[int, int, int, int]]:
        move = self._choose_move()
        if move is not None:
            self._record_move_stats(move)
            self.total_moves += 1
        return move

    # --- what the AI's moves did, for learn_from_game ---------------------------------------------------------
    def _attacked_by(self, color: str, q: int, r: int) -> bool:
        """True if a `color` piece could move to (q, r) if it held an enemy piece (so own pieces count as defenders)."""
        board, saved = self.game.board, self.game.board.get_cell(q, r)
        board.set_cell(q, r, ('b' if color == 'w' else 'w') + 'P')
        try:
            return any((q, r) in self.game._pseudo_moves(cq, cr) for cq, cr in board.get_all_cells()
                       if board.get_cell(cq, cr) and board.get_cell(cq, cr)[0] == color and (cq, cr) != (q, r))
        finally:
            board.set_cell(q, r, saved)

    def _record_move_stats(self, move: Tuple[int, int, int, int]):
        """Count, for the move about to be played, which of the learned features it used. learn_from_game divides
        the counts by the number of moves, and LearningModule.update_params pulls each weight towards that
        fraction (scaled by the result), so features used in won games gain weight."""
        from_q, from_r, to_q, to_r = move
        board, size, s = self.game.board, self.game.board.size, self.move_stats
        piece, captured = board.get_cell(from_q, from_r), board.get_cell(to_q, to_r)
        opponent = 'b' if self.color == 'w' else 'w'
        centre = lambda q, r: max(abs(q), abs(r))  # noqa: E731
        own_near = lambda q, r, kind=None: any(  # noqa: E731
            board.get_cell(aq, ar) and board.get_cell(aq, ar)[0] == self.color and (aq, ar) != (from_q, from_r)
            and (kind is None or board.get_cell(aq, ar)[1] == kind) for aq, ar in board.get_adjacent_cells(q, r))
        moves_before = len(self.game._pseudo_moves(from_q, from_r))
        was_attacked = self._attacked_by(opponent, from_q, from_r)
        king = self._find_king()
        flags = {
            'aggression': bool(captured and captured[0] != self.color),
            'material_advantage': bool(captured and self.piece_values[captured[1]]['attack']
                                       >= self.piece_values[piece[1]]['attack']),
            'center_control': centre(to_q, to_r) < centre(from_q, from_r),
            'board_control': centre(to_q, to_r) <= size // 2,
            'king_safety': piece[1] != 'K' and bool(king) and self.game.board.distance(to_q, to_r, *king) == 1,
            'pawn_structure': piece[1] == 'P' and own_near(to_q, to_r, 'P'),
            'pawn_promotion': piece[1] == 'P',
            'piece_development': piece[1] in 'NBRQD' and from_q + from_r == (-size if self.color == 'w' else size),
            'piece_coordination': own_near(to_q, to_r),
            'tempo': self.game.board.distance(from_q, from_r, to_q, to_r) >= 2,
            'endgame_preparedness': piece[1] == 'K' and self._determine_game_phase() == 'endgame',
        }
        board.set_cell(to_q, to_r, piece)
        board.set_cell(from_q, from_r, None)
        try:
            flags['mobility'] = len(self.game._pseudo_moves(to_q, to_r)) > moves_before
            flags['defensive'] = was_attacked and not self._attacked_by(opponent, to_q, to_r)
            flags['piece_protection'] = self._attacked_by(self.color, to_q, to_r)
        finally:
            board.set_cell(from_q, from_r, piece)
            board.set_cell(to_q, to_r, captured)
        for name, used in flags.items():
            s[name] += int(bool(used))
        s['piece_effectiveness'][piece[1]] += 1
        if piece[1] == 'K':
            self.king_move_count += 1

    def _choose_move(self) -> Optional[Tuple[int, int, int, int]]:
        all_moves = self._get_all_possible_moves()
        if not all_moves:
            self.logger.warning(f"{self.color} AI: No possible moves found")
            return None

        # Check for immediate king captures
        king_capture_moves = self._find_king_capture_moves(all_moves)
        if king_capture_moves:
            chosen_move = random.choice(king_capture_moves)
            self.logger.info(f"{self.color} AI: Capturing king with move {chosen_move}")
            return chosen_move

        game_phase = self._determine_game_phase()
        move_scores = [(move, self._evaluate_move(move, game_phase)) for move in all_moves]

        # Apply diversity bonus
        move_scores = self._apply_diversity_bonus(move_scores)

        # Check for long loops and force a random move if necessary
        if self._detect_long_loop():
            logging.info(f"{self.color} AI: Long loop detected, forcing a random move")
            return random.choice(all_moves)

        best_move, best_score = max(move_scores, key=lambda x: x[1])

        # Update histories and counters
        self._update_histories(best_move)

        logging.info(f"{self.color} AI: Selected move {best_move} with score {best_score}")

        return best_move

    def _find_king_capture_moves(self, moves: List[Tuple[int, int, int, int]]) -> List[Tuple[int, int, int, int]]:
        king_captures = []
        for move in moves:
            from_q, from_r, to_q, to_r = move
            target_piece = self.game.board.get_cell(to_q, to_r)
            if target_piece and target_piece[1] == 'K' and target_piece[0] != self.color:
                king_captures.append(move)
        return king_captures

    def _determine_game_phase(self) -> str:
        total_pieces = sum(1 for _ in self.game.board.get_all_cells() if self.game.board.get_cell(*_))
        if total_pieces >= 24:
            return 'opening'
        elif total_pieces >= 12:
            return 'middlegame'
        else:
            return 'endgame'

    def _get_all_possible_moves(self) -> List[Tuple[int, int, int, int]]:
        all_moves = []
        for q, r in self.game.board.get_all_cells():
            piece = self.game.board.get_cell(q, r)
            if piece and piece[0] == self.color:
                moves = self.game.get_possible_moves(q, r)
                all_moves.extend([(q, r, move[0], move[1]) for move in moves])
        return all_moves

    def _evaluate_move(self, move: Tuple[int, int, int, int], game_phase: str) -> float:
        from_q, from_r, to_q, to_r = move
        score = 0

        moving_piece = self.game.board.get_cell(from_q, from_r)
        captured_piece = self.game.board.get_cell(to_q, to_r)

        # Prioritize king captures
        if captured_piece and captured_piece[1] == 'K':
            return float(100000)

        # Material value and piece-specific evaluations
        if captured_piece:
            score += self._evaluate_capture(moving_piece, captured_piece)

        # Evaluate based on game phase
        score += self._evaluate_phase_specific(moving_piece, from_q, from_r, to_q, to_r, game_phase)

        # Penalize early king moves
        if moving_piece[1] == 'K' and self.total_moves < self.early_game_threshold:
            score -= 50

        # Evaluate other factors
        score += self._evaluate_position(to_q, to_r)
        score += self._evaluate_king_safety(to_q, to_r)
        score += self._evaluate_mobility(to_q, to_r, from_q, from_r)
        score += self._evaluate_piece_coordination(to_q, to_r)
        score += self._evaluate_tempo(moving_piece, from_q, from_r, to_q, to_r)

        # Add evaluation for Prince
        if moving_piece[1] == 'C':
            score += self._evaluate_prince_move(from_q, from_r, to_q, to_r)

        # Add stronger repetition penalty
        score += self._evaluate_repetition(move) * 2

        # Add progress encouragement
        score += self._evaluate_progress(move)

        # Add stalemate avoidance
        score += self._evaluate_stalemate_avoidance(move)

        # Encourage development of other pieces in early game
        if self.total_moves < self.early_game_threshold:
            score += self._evaluate_early_game_development(moving_piece, to_q, to_r)

        return score

    def _detect_long_loop(self) -> bool:
        if len(self.position_history) < self.long_loop_threshold:
            return False

        recent_positions = list(self.position_history)[-self.long_loop_threshold:]
        position_counts = Counter(recent_positions)

        return any(count > self.long_loop_threshold // 2 for count in position_counts.values())

    def _get_board_state_after_move(self, from_q: int, from_r: int, to_q: int, to_r: int) -> str:
        """Board string (same format as _get_board_state) after moving the piece, ignoring promotion."""
        piece = self.game.board.get_cell(from_q, from_r)
        tokens = []
        for q, r in self.game.board.get_all_cells():
            if (q, r) == (from_q, from_r):
                tokens.append('.')
            elif (q, r) == (to_q, to_r):
                tokens.append(piece)
            else:
                tokens.append(self.game.board.get_cell(q, r) or '.')
        return ''.join(tokens)

    def _get_hypothetical_board(self, from_q: int, from_r: int, to_q: int, to_r: int):
        hypothetical_board = self.game.board.__class__(self.game.board.size)
        for q, r in self.game.board.get_all_cells():
            hypothetical_board.set_cell(q, r, self.game.board.get_cell(q, r))

        piece = hypothetical_board.get_cell(from_q, from_r)
        hypothetical_board.set_cell(from_q, from_r, None)
        hypothetical_board.set_cell(to_q, to_r, piece)

        return hypothetical_board

    def _get_possible_moves_for_piece(self, q: int, r: int, board):
        piece = board.get_cell(q, r)
        if not piece:
            return []

        directions = [(1, 0), (1, -1), (0, -1), (-1, 0), (-1, 1), (0, 1)]
        possible_moves = []
        for dq, dr in directions:
            new_q, new_r = q + dq, r + dr
            if (board.is_valid_cell(new_q, new_r) and
                    (board.get_cell(new_q, new_r) is None or
                     board.get_cell(new_q, new_r)[0] != piece[0])):
                possible_moves.append((new_q, new_r))
        return possible_moves

    def _get_index(self, q: int, r: int) -> int:
        return ((q + self.game.board.size) * (2 * self.game.board.size + 1) +
                (r + self.game.board.size))

    def _get_board_state(self) -> str:
        return ''.join(self.game.board.get_cell(q, r) or '.'
                       for q, r in self.game.board.get_all_cells())

    def _update_histories(self, move: Tuple[int, int, int, int]):
        self.move_history.append(move)
        from_q, from_r, to_q, to_r = move
        new_position = self._get_board_state_after_move(from_q, from_r, to_q, to_r)
        self.position_history.append(new_position)

        if len(self.move_history) >= self.forced_random_move_threshold:
            unique_moves = set(self.move_history)
            if len(unique_moves) <= self.forced_random_move_threshold // 2:
                logging.info(f"{self.color} AI: Forced random move due to lack of progress")
                all_moves = self._get_all_possible_moves()
                random_move = random.choice(all_moves)
                self.move_history.clear()
                self.position_history.clear()
                self._update_histories(random_move)

    def _apply_diversity_bonus(self, move_scores):
        move_counts = Counter(self.move_history)
        return [(move, score + self.diversity_bonus / (move_counts[move] + 1))
                for move, score in move_scores]

    def _find_king(self) -> Optional[Tuple[int, int]]:
        for q, r in self.game.board.get_all_cells():
            piece = self.game.board.get_cell(q, r)
            if piece == f'{self.color}K':
                return (q, r)
        return None

    def _is_piece_under_attack(self, q: int, r: int) -> bool:
        opponent_color = 'b' if self.color == 'w' else 'w'
        for opp_q, opp_r in self.game.board.get_all_cells():
            piece = self.game.board.get_cell(opp_q, opp_r)
            if piece and piece[0] == opponent_color:
                if (q, r) in self.game.get_possible_moves(opp_q, opp_r):
                    return True
        return False

    def _is_pawn_near_promotion(self, q: int, r: int) -> bool:
        if self.color == 'w':
            return q + r >= self.game.board.size - 2
        else:
            return q + r <= -self.game.board.size + 2

    def learn_from_game(self, result: float, game_stats: Dict[str, Any]):
        self.games_played += 1
        if result > 0.5:
            self.wins += 1

        total_moves = sum(self.move_stats['piece_effectiveness'].values())
        if total_moves > 0:
            for piece in self.move_stats['piece_effectiveness']:
                self.move_stats['piece_effectiveness'][piece] /= total_moves

            for param in ['aggression', 'center_control', 'king_safety', 'pawn_structure',
                          'mobility', 'defensive', 'piece_protection', 'pawn_promotion',
                          'material_advantage', 'piece_development', 'board_control',
                          'piece_coordination', 'tempo', 'endgame_preparedness']:
                if self.move_stats[param] > 0:
                    self.move_stats[param] /= total_moves

            self.move_stats['king_move_ratio'] = self.king_move_count / total_moves

            if self.move_stats['king_move_ratio'] > 0.2:
                self.learning_module.params['king_safety'] *= 0.9

        combined_stats = {**game_stats, **self.move_stats}
        self.learning_module.update_params(result, combined_stats)

        self.performance_history.append({
            'game_number': self.games_played,
            'result': result,
            'material_balance': combined_stats.get('material_balance', 0),
            'center_control': combined_stats.get('center_control', 0),
            'king_safety': combined_stats.get('king_safety', 0),
            'mobility': combined_stats.get('mobility', 0),
            'king_move_ratio': combined_stats.get('king_move_ratio', 0),
            'piece_effectiveness': combined_stats.get('piece_effectiveness', {})
        })

        if len(self.performance_history) > 100:
            self.performance_history = self.performance_history[-100:]

        for key in self.move_stats:
            if isinstance(self.move_stats[key], dict):
                self.move_stats[key] = {k: 0 for k in self.move_stats[key]}
            else:
                self.move_stats[key] = 0

        self.king_move_count = 0
        self.total_moves = 0

        logger.info(f"Game {self.games_played} completed. Result: {result}.")

    def get_learning_stats(self) -> Dict[str, Any]:
        return {
            'games_played': self.games_played,
            'wins': self.wins,
            'win_rate': self.wins / self.games_played if self.games_played > 0 else 0,
            'avg_moves_per_game': self.total_moves / self.games_played if self.games_played > 0 else 0,
            'performance_history': self.performance_history,
            'current_parameters': self.learning_module.params
        }

    def get_filename(self):
        if self.custom_filename:
            return self.custom_filename
        return os.path.join(MODULE_DIR, f'ai_params_{self.color}.json')

    def save_learning_progress(self):
        filename = self.get_filename()
        full_path = os.path.abspath(filename)
        try:
            with open(full_path, 'w') as f:
                json.dump(self.learning_module.get_save_data(), f)
            logger.info(f"AI progress saved to: {full_path}")
        except (IOError, OSError) as e:
            logger.error(f"Error saving AI progress: {str(e)}")

    def load_learning_progress(self):
        filename = self.get_filename()
        full_path = os.path.abspath(filename)
        try:
            with open(full_path, 'r') as f:
                data = json.load(f)
            self.learning_module.load_save_data(data)
            logger.info(f"AI progress loaded from: {full_path}")
            return True
        except FileNotFoundError:
            logger.info(f"No AI progress file at: {full_path}")
            return False
        except (json.JSONDecodeError, KeyError, TypeError) as e:
            logger.error(f"Corrupted AI progress file: {str(e)}")
            return False
        except (IOError, OSError) as e:
            logger.error(f"Error loading AI progress: {str(e)}")
            return False


# Imported last: hexchess_ai_advanced subclasses BasicAI from this module.
from hexchess_ai_advanced import AdvancedAI  # noqa: E402,F401
