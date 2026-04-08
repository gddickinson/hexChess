"""Main window for HexChess GUI application."""

import sys
import logging
from PyQt5.QtWidgets import (QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
                             QPushButton, QLabel, QAction, QMessageBox)
from PyQt5.QtGui import QFont
from PyQt5.QtCore import Qt, QTimer
from hexchess_game import HexChess
from hexchess_ai import BasicAI, AdvancedAI
from hexchess_renderer import HexBoardWidget, StatsWindow, LearningStatsWindow
from hexchess_dialogs import (BoardSizeDialog, GameSetupDialog, TournamentSetupDialog,
                               TournamentResultsDialog, OptionsWindow)
from hexchess_testing import TestingWindow
from hexchess_help import HelpWindow
from typing import List, Tuple, Optional, Dict, Any

logger = logging.getLogger('hexchess')


class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Hexagonal Chess")
        self.setGeometry(100, 100, 1200, 800)

        self.game = HexChess()
        self.white_player = "Human"
        self.black_player = "Human"
        self.white_ai = None
        self.black_ai = None
        self.ai_move_timer = QTimer(self)
        self.ai_move_timer.timeout.connect(self.make_ai_move)

        self.tournament_timer = QTimer()
        self.tournament_timer.timeout.connect(self.make_tournament_move)

        self.tournament_in_progress = False
        self.tournament_games_left = 0
        self.tournament_results = []
        self.tournament_ai_players = None
        self.tournament_paused = False

        self.learning_stats_window = None
        self.help_window = None

        self.create_menu_bar()

        central_widget = QWidget()
        main_layout = QHBoxLayout()

        self.white_stats = StatsWindow('w')
        main_layout.addWidget(self.white_stats)

        game_layout = QVBoxLayout()
        self.board_widget = HexBoardWidget(self.game, self)
        self.board_widget.set_main_window(self)
        game_layout.addWidget(self.board_widget, 1)

        self.status_label = QLabel("White's turn")
        self.status_label.setAlignment(Qt.AlignCenter)
        game_layout.addWidget(self.status_label)

        button_layout = QHBoxLayout()
        self.reset_button = QPushButton("Reset Game")
        self.reset_button.clicked.connect(self.reset_game)
        button_layout.addWidget(self.reset_button)

        self.pause_button = QPushButton("Pause Tournament")
        self.pause_button.clicked.connect(self.toggle_tournament_pause)
        self.pause_button.setEnabled(False)
        button_layout.addWidget(self.pause_button)

        self.exit_stuck_button = QPushButton("Exit Stuck Game")
        self.exit_stuck_button.clicked.connect(self.exit_stuck_game)
        self.exit_stuck_button.setEnabled(False)
        button_layout.addWidget(self.exit_stuck_button)

        game_layout.addLayout(button_layout)

        main_layout.addLayout(game_layout, 2)

        self.black_stats = StatsWindow('b')
        main_layout.addWidget(self.black_stats)

        central_widget.setLayout(main_layout)
        self.setCentralWidget(central_widget)

    def setup_new_tournament(self):
        dialog = TournamentSetupDialog(self)
        if dialog.exec_():
            self.num_games = dialog.num_games.value()
            ai_player1 = self.create_player(dialog.ai_player1.currentText(), 'w')
            ai_player2 = self.create_player(dialog.ai_player2.currentText(), 'b')
            visual_mode = dialog.visual_mode.isChecked()
            move_delay = dialog.move_delay.value()

            self.tournament_ai_players = (ai_player1, ai_player2)
            self.run_tournament(self.num_games, ai_player1, ai_player2, visual_mode, move_delay)

    def create_player(self, player_type, color):
        if player_type == "Human":
            return None
        elif player_type == "BasicAI":
            return BasicAI(self.game, color)
        elif player_type == "AdvancedAI":
            return AdvancedAI(self.game, color)
        else:
            raise ValueError("Unknown Player type")

    def run_tournament(self, num_games, ai_player1, ai_player2, visual_mode, move_delay):
        self.tournament_in_progress = True
        self.tournament_games_left = num_games
        self.tournament_results = []
        self.white_player, self.black_player = ai_player1, ai_player2
        self.tournament_paused = False

        if visual_mode:
            self.tournament_timer.setInterval(move_delay)
            self.tournament_timer.start()
            self.pause_button.setEnabled(True)
            self.pause_button.setText("Pause Tournament")
            self.exit_stuck_button.setEnabled(True)
        else:
            while self.tournament_games_left > 0:
                self.play_full_game()
                self.save_ai_progress()

        if not visual_mode:
            self.end_tournament()

    def exit_stuck_game(self):
        if self.tournament_in_progress:
            logging.info("Exiting stuck game and penalizing AI parameters")
            self.penalize_ai_parameters()
            self.end_current_game()
            if self.tournament_games_left > 0:
                self.start_new_game()
            else:
                self.end_tournament()

    def penalize_ai_parameters(self):
        penalty_factor = 0.9
        if isinstance(self.white_player, BasicAI):
            self.white_player.penalize_parameters(penalty_factor)
        if isinstance(self.black_player, BasicAI):
            self.black_player.penalize_parameters(penalty_factor)

    def make_tournament_move(self):
        if self.tournament_paused:
            return

        if self.game.is_game_over():
            self.end_current_game()
            if self.tournament_games_left > 0:
                self.start_new_game()
            else:
                self.end_tournament()
        else:
            current_player = self.white_player if self.game.current_player == 'w' else self.black_player
            move = current_player.make_move()
            if move:
                self.game.make_move(*move)
                self.board_widget.update()
                self.update_status()
                self.update_learning_stats()

                if self.game.is_game_over():
                    self.end_current_game()
                    if self.tournament_games_left > 0:
                        self.start_new_game()
                    else:
                        self.end_tournament()

    def play_full_game(self):
        self.reset_game()
        while not self.game.is_game_over():
            if self.game.current_player == 'w':
                move = self.white_player.make_move()
            else:
                move = self.black_player.make_move()

            if move:
                self.game.make_move(*move)

        self.end_current_game()

    def end_current_game(self):
        winner = self.game.get_winner()
        result = 1 if winner == 'w' else 0 if winner == 'b' else 0.5

        if isinstance(self.white_player, BasicAI):
            self.white_player.learn_from_game(result, self.get_game_stats())
        if isinstance(self.black_player, BasicAI):
            self.black_player.learn_from_game(1 - result, self.get_game_stats())

        self.tournament_results.append({
            'white': type(self.white_player).__name__,
            'black': type(self.black_player).__name__,
            'result': 'White' if winner == 'w' else 'Black' if winner == 'b' else 'Draw'
        })
        self.tournament_games_left -= 1
        self.save_ai_progress()
        self.update_learning_stats()

    def start_new_game(self):
        self.reset_game()
        self.white_player, self.black_player = self.black_player, self.white_player
        self.white_player.color, self.black_player.color = 'w', 'b'
        self.white_player.game = self.black_player.game = self.game
        self.board_widget.update()
        self.update_status()

    def end_tournament(self):
        self.tournament_in_progress = False
        if hasattr(self, 'tournament_timer'):
            self.tournament_timer.stop()
        self.save_ai_progress()
        self.show_tournament_results()
        self.update_learning_stats()

        if hasattr(self, 'learning_stats_window') and self.learning_stats_window and self.learning_stats_window.isVisible():
            self.learning_stats_window.update_stats()

        self.tournament_ai_players = None
        self.exit_stuck_button.setEnabled(False)
        self.pause_button.setEnabled(False)

    def update_status(self):
        if self.tournament_in_progress:
            self.status_label.setText(f"Tournament in progress. Games left: {self.tournament_games_left}")
        elif self.game.is_game_over():
            winner = self.game.get_winner()
            if winner == 'draw':
                self.status_label.setText("Game Over! It's a draw!")
            else:
                self.status_label.setText(f"Game Over! {'White' if winner == 'w' else 'Black'} wins!")
        else:
            self.status_label.setText("White's turn" if self.game.current_player == 'w' else "Black's turn")

    def show_tournament_results(self):
        dialog = TournamentResultsDialog(self.tournament_results, self)
        dialog.exec_()

    def make_move(self, from_q: int, from_r: int, to_q: int, to_r: int):
        if self.game.make_move(from_q, from_r, to_q, to_r):
            self.board_widget.update()
            self.update_status()
            self.update_stats()

            if self.game.is_game_over():
                self.handle_game_over()
            else:
                self.make_ai_move_if_needed()

    def make_ai_move_if_needed(self):
        current_player = self.game.current_player
        ai = self.white_ai if current_player == 'w' else self.black_ai

        if ai:
            ai_move = ai.make_move()
            if ai_move:
                self.game.make_move(*ai_move)
                self.board_widget.update()
                self.update_status()
                self.update_stats()

                if not self.game.is_game_over():
                    if (current_player == 'w' and self.black_player == "AI") or \
                       (current_player == 'b' and self.white_player == "AI"):
                        self.ai_move_timer.start(1000)
                else:
                    self.ai_move_timer.stop()

    def make_ai_move(self):
        self.make_ai_move_if_needed()

    def reset_game(self):
        self.game = HexChess()
        if self.white_ai:
            self.white_ai.game = self.game
        if self.black_ai:
            self.black_ai.game = self.game
        self.board_widget.game = self.game
        self.board_widget.selected_cell = None
        self.board_widget.update()
        self.update_status()
        self.update_stats()
        self.ai_move_timer.stop()

        if self.learning_stats_window and self.learning_stats_window.isVisible():
            if self.white_ai:
                self.learning_stats_window.ai = self.white_ai
            elif self.black_ai:
                self.learning_stats_window.ai = self.black_ai
            self.learning_stats_window.update_stats()

        if self.white_player == "AI" and self.black_player == "AI":
            self.ai_move_timer.start(1000)

    def setup_new_game(self):
        dialog = GameSetupDialog(self)
        if dialog.exec_():
            self.white_player = dialog.white_player.currentText()
            self.black_player = dialog.black_player.currentText()

            if self.white_player == "BasicAI":
                self.white_ai = BasicAI(self.game, 'w')
                self.white_ai.load_learning_progress()
            elif self.white_player == "AdvancedAI":
                self.white_ai = AdvancedAI(self.game, 'w')
                self.white_ai.load_learning_progress()
            else:
                self.white_ai = None

            if self.black_player == "BasicAI":
                self.black_ai = BasicAI(self.game, 'b')
                self.black_ai.load_learning_progress()
            elif self.black_player == "AdvancedAI":
                self.black_ai = AdvancedAI(self.game, 'b')
                self.black_ai.load_learning_progress()
            else:
                self.black_ai = None

            self.reset_game()
            self.status_label.setText("White's turn")
            self.update_stats()
            self.board_widget.update()

            if self.learning_stats_window:
                if self.white_ai:
                    self.learning_stats_window.ai = self.white_ai
                elif self.black_ai:
                    self.learning_stats_window.ai = self.black_ai
                self.learning_stats_window.update_stats()

            if 'AI' in self.white_player and 'AI' in self.black_player:
                self.ai_move_timer.start(1000)

    def create_menu_bar(self):
        menu_bar = self.menuBar()

        game_menu = menu_bar.addMenu("Game")
        new_game_action = QAction("New Game", self)
        new_game_action.triggered.connect(self.setup_new_game)
        game_menu.addAction(new_game_action)

        set_board_size_action = QAction("Set Board Size", self)
        set_board_size_action.triggered.connect(self.set_board_size)
        game_menu.addAction(set_board_size_action)

        tournament_menu = menu_bar.addMenu("Tournament")
        new_tournament_action = QAction("New Tournament", self)
        new_tournament_action.triggered.connect(self.setup_new_tournament)
        tournament_menu.addAction(new_tournament_action)

        ai_menu = menu_bar.addMenu("AI")
        show_learning_stats_action = QAction("Show Learning Stats", self)
        show_learning_stats_action.triggered.connect(self.show_learning_stats)
        ai_menu.addAction(show_learning_stats_action)

        options_menu = menu_bar.addMenu("Options")
        open_options = QAction("Open Options", self)
        open_options.triggered.connect(self.open_options_window)
        options_menu.addAction(open_options)

        help_menu = menu_bar.addMenu("Help")
        show_help_action = QAction("Show Help", self)
        show_help_action.triggered.connect(self.show_help)
        help_menu.addAction(show_help_action)

    def set_board_size(self):
        dialog = BoardSizeDialog(self)
        if dialog.exec_():
            new_size = dialog.size_spinner.value()
            self.game = HexChess(board_size=new_size)
            self.board_widget.game = self.game
            self.board_widget.update()
            self.reset_game()

    def toggle_tournament_pause(self):
        if self.tournament_in_progress:
            if self.tournament_paused:
                self.tournament_paused = False
                self.pause_button.setText("Pause Tournament")
                self.tournament_timer.start()
            else:
                self.tournament_paused = True
                self.pause_button.setText("Resume Tournament")
                self.tournament_timer.stop()

    def open_testing_window(self):
        self.testing_window = TestingWindow()
        self.testing_window.show()

    def show_help(self):
        if not self.help_window:
            self.help_window = HelpWindow()
        self.help_window.show()

    def show_learning_stats(self):
        ai = None
        if self.tournament_in_progress and self.tournament_ai_players:
            ai = self.tournament_ai_players[0]
        elif hasattr(self, 'white_ai') and isinstance(self.white_ai, BasicAI):
            ai = self.white_ai
        elif hasattr(self, 'black_ai') and isinstance(self.black_ai, BasicAI):
            ai = self.black_ai

        if ai:
            if not self.learning_stats_window:
                self.learning_stats_window = LearningStatsWindow(ai)
            elif not self.learning_stats_window.isVisible():
                self.learning_stats_window.close()
                self.learning_stats_window = LearningStatsWindow(ai)
            self.learning_stats_window.show()
            self.learning_stats_window.update_stats()
            logger.info("Learning stats window opened")
        else:
            QMessageBox.information(self, "No AI", "No AI player is currently active.")
            logger.warning("Attempted to show learning stats, but no AI is active")

    def open_options_window(self):
        options_window = OptionsWindow(self)
        options_window.show()

    def apply_options(self, show_coordinates, show_possible_moves, use_piece_images):
        self.board_widget.show_coordinates = show_coordinates
        self.board_widget.show_possible_moves = show_possible_moves
        self.board_widget.use_piece_images = use_piece_images
        self.board_widget.update()

    def update_learning_stats(self):
        if (hasattr(self, 'learning_stats_window') and
                self.learning_stats_window is not None and
                self.learning_stats_window.isVisible()):
            self.learning_stats_window.update_stats()

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

    def update_stats(self):
        game_stats = self.calculate_game_statistics()
        self.white_stats.update_stats(game_stats['w'])
        self.black_stats.update_stats(game_stats['b'])

    def handle_game_over(self):
        winner = self.game.get_winner()
        if winner == 'draw':
            result = 0.5
        else:
            result = 1 if winner == 'w' else 0

        game_stats = self.calculate_game_statistics()

        if self.white_ai:
            self.white_ai.learn_from_game(result, game_stats['w'])
            self.white_ai.save_learning_progress()
            logger.info("White AI learning progress saved after game")

        if self.black_ai:
            self.black_ai.learn_from_game(1 - result, game_stats['b'])
            self.black_ai.save_learning_progress()
            logger.info("Black AI learning progress saved after game")

        if self.learning_stats_window and self.learning_stats_window.isVisible():
            self.learning_stats_window.update_stats()

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
                moves = self.game.get_possible_moves(q, r)
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
                moves.extend([(q, r, to_q, to_r) for to_q, to_r in self.game.get_possible_moves(q, r)])
        return moves

    def save_ai_progress(self):
        if isinstance(self.white_player, BasicAI):
            self.white_player.save_learning_progress()
        if isinstance(self.black_player, BasicAI):
            self.black_player.save_learning_progress()

    def closeEvent(self, event):
        self.save_ai_progress()
        logger.info("AI progress saved on application close")
        super().closeEvent(event)


if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = MainWindow()
    window.show()
    sys.exit(app.exec_())
