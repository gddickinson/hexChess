"""Board rendering widget and stats panels for HexChess GUI."""

import math
import os
from PyQt5.QtWidgets import QWidget, QVBoxLayout, QLabel, QFrame, QTabWidget, QTableWidget, QTableWidgetItem
from PyQt5.QtGui import QPainter, QColor, QPen, QPolygonF, QBrush, QFont, QPixmap
from PyQt5.QtCore import Qt, QPointF
from hexchess_game import HexChess
from hexchess_ai import BasicAI
from typing import List, Tuple, Optional, Dict, Any
import matplotlib.pyplot as plt
from matplotlib.backends.backend_qt5agg import FigureCanvasQTAgg as FigureCanvas


class StatsWindow(QFrame):
    def __init__(self, player_color, parent=None):
        super().__init__(parent)
        self.player_color = player_color
        self.setFrameStyle(QFrame.Box | QFrame.Raised)
        self.setLineWidth(2)

        layout = QVBoxLayout()
        self.title_label = QLabel(f"{'White' if player_color == 'w' else 'Black'} Player Stats")
        self.title_label.setAlignment(Qt.AlignCenter)
        self.title_label.setFont(QFont('Arial', 12, QFont.Bold))
        layout.addWidget(self.title_label)

        self.stats_labels = {
            'material': QLabel("Material: 0"),
            'center_control': QLabel("Center Control: 0"),
            'king_safety': QLabel("King Safety: 0"),
            'mobility': QLabel("Mobility: 0"),
            'pawn_structure': QLabel("Pawn Structure: 0")
        }

        for label in self.stats_labels.values():
            layout.addWidget(label)

        self.setLayout(layout)

    def update_stats(self, stats):
        self.stats_labels['material'].setText(f"Material: {stats['material_balance']}")
        self.stats_labels['center_control'].setText(f"Center Control: {stats['center_control']:.2f}")
        self.stats_labels['king_safety'].setText(f"King Safety: {stats['king_safety']:.2f}")
        self.stats_labels['mobility'].setText(f"Mobility: {stats['mobility']}")
        self.stats_labels['pawn_structure'].setText(f"Pawn Structure: {stats['pawn_structure']:.2f}")


class HexBoardWidget(QWidget):
    def __init__(self, game: HexChess, parent=None):
        super().__init__(parent)
        self.game = game
        self.selected_cell = None
        self.setMouseTracking(True)
        self.main_window = None
        self.show_possible_moves = True
        self.use_piece_images = True
        self.piece_images = {}
        self.load_piece_images()

    def load_piece_images(self):
        pieces = ['P', 'R', 'N', 'B', 'Q', 'K', 'D', 'C']
        colors = ['w', 'b']
        script_dir = os.path.dirname(os.path.abspath(__file__))
        for color in colors:
            for piece in pieces:
                img_path = os.path.join(script_dir, "images", f"{color}{piece}.png")
                if os.path.exists(img_path):
                    self.piece_images[f"{color}{piece}"] = QPixmap(img_path)

    def set_main_window(self, main_window):
        self.main_window = main_window

    def paintEvent(self, event):
        painter = QPainter(self)
        painter.setRenderHint(QPainter.Antialiasing)

        self.calculate_hex_size()
        self.calculate_board_offset()

        for q, r in self.game.board.get_all_cells():
            self._draw_hex(painter, q, r)

    def calculate_hex_size(self):
        board_diameter = 2 * self.game.board.size + 1
        width_size = self.width() / (board_diameter * math.sqrt(3))
        height_size = self.height() / (board_diameter * 1.5)
        self.hex_size = min(width_size, height_size) * 0.95

    def calculate_board_offset(self):
        board_width = (2 * self.game.board.size + 1) * self.hex_size * math.sqrt(3)
        board_height = (2 * self.game.board.size + 1) * self.hex_size * 1.5
        self.offset_x = (self.width() - board_width) / 2 + board_width / 2
        self.offset_y = (self.height() - board_height) / 2 + board_height / 2

    def _draw_hex(self, painter: QPainter, q: int, r: int):
        x, y = self._hex_to_pixel(q, r)

        color = QColor(240, 240, 240) if (q + r) % 2 == 0 else QColor(200, 200, 200)
        if (q, r) == self.selected_cell:
            color = QColor(255, 255, 0)
        elif self.show_possible_moves and self.selected_cell:
            if (q, r) in self.game.get_possible_moves(*self.selected_cell):
                color = QColor(0, 255, 0, 100)

        painter.setBrush(QBrush(color))
        painter.setPen(QPen(Qt.black, 1))

        points = QPolygonF([QPointF(x + self.hex_size * math.cos(math.radians(angle)),
                                    y + self.hex_size * math.sin(math.radians(angle)))
                            for angle in range(30, 390, 60)])
        painter.drawPolygon(points)

        piece = self.game.board.get_cell(q, r)
        if piece:
            if self.use_piece_images and piece in self.piece_images:
                img = self.piece_images[piece].scaled(int(self.hex_size), int(self.hex_size),
                                                      Qt.KeepAspectRatio, Qt.SmoothTransformation)
                painter.drawPixmap(int(x - self.hex_size/2), int(y - self.hex_size/2), img)
            else:
                painter.setFont(QFont('Arial', int(self.hex_size / 2)))
                painter.drawText(QPointF(x - self.hex_size / 4, y + self.hex_size / 4), piece)

    def _hex_to_pixel(self, q: int, r: int):
        x = self.hex_size * (math.sqrt(3) * q + math.sqrt(3)/2 * r)
        y = self.hex_size * (3/2 * r)
        return x + self.offset_x, y + self.offset_y

    def _pixel_to_hex(self, x: float, y: float):
        x = (x - self.offset_x) / self.hex_size
        y = (y - self.offset_y) / self.hex_size
        q = (math.sqrt(3)/3 * x - 1/3 * y)
        r = (2/3 * y)
        return self._hex_round(q, r)

    def _hex_round(self, q: float, r: float):
        s = -q - r
        rq = round(q)
        rr = round(r)
        rs = round(s)
        q_diff = abs(rq - q)
        r_diff = abs(rr - r)
        s_diff = abs(rs - s)
        if q_diff > r_diff and q_diff > s_diff:
            rq = -rr - rs
        elif r_diff > s_diff:
            rr = -rq - rs
        else:
            rs = -rq - rr
        return rq, rr

    def mousePressEvent(self, event):
        q, r = self._pixel_to_hex(event.x(), event.y())
        if self.game.board.is_valid_cell(q, r):
            if self.selected_cell:
                self.main_window.make_move(self.selected_cell[0], self.selected_cell[1], q, r)
                self.selected_cell = None
            else:
                piece = self.game.board.get_cell(q, r)
                if piece and piece[0] == self.game.current_player:
                    self.selected_cell = (q, r)
            self.update()

    def resizeEvent(self, event):
        super().resizeEvent(event)
        self.calculate_hex_size()
        self.calculate_board_offset()
        self.update()


class LearningStatsWindow(QWidget):
    """Window displaying AI learning statistics with charts and tables."""

    def __init__(self, ai: BasicAI):
        super().__init__()
        self.ai = ai
        self.setWindowTitle("AI Learning Statistics")
        self.setGeometry(100, 100, 800, 600)
        layout = QVBoxLayout()
        self.tabs = QTabWidget()
        self.tabs.addTab(self._create_general_stats_widget(), "General Stats")
        self.tabs.addTab(self._create_params_widget(), "Parameters")
        self.tabs.addTab(self._create_charts_widget(), "Learning Charts")
        self.tabs.addTab(self._create_performance_widget(), "Recent Performance")
        layout.addWidget(self.tabs)
        self.setLayout(layout)

    def _create_general_stats_widget(self):
        widget = QWidget()
        layout = QVBoxLayout()
        self.games_played_label = QLabel(f"Games Played: {self.ai.learning_module.games_played}")
        self.win_rate_label = QLabel(f"Win Rate: {self.ai.learning_module.wins / max(1, self.ai.learning_module.games_played):.2%}")
        self.avg_moves_label = QLabel(f"Average Moves per Game: {self.ai.total_moves / max(1, self.ai.games_played):.2f}")
        layout.addWidget(self.games_played_label)
        layout.addWidget(self.win_rate_label)
        layout.addWidget(self.avg_moves_label)
        widget.setLayout(layout)
        return widget

    def _create_params_widget(self):
        widget = QWidget()
        layout = QVBoxLayout()
        self.params_table = QTableWidget()
        self.params_table.setColumnCount(2)
        self.params_table.setHorizontalHeaderLabels(["Parameter", "Value"])
        self._update_params_table()
        layout.addWidget(self.params_table)
        widget.setLayout(layout)
        return widget

    def _create_charts_widget(self):
        widget = QWidget()
        layout = QVBoxLayout()
        figure, (ax1, ax2) = plt.subplots(2, 1, figsize=(8, 8))
        self.chart_canvas = FigureCanvas(figure)
        self._update_charts(ax1, ax2)
        layout.addWidget(self.chart_canvas)
        widget.setLayout(layout)
        return widget

    def _create_performance_widget(self):
        widget = QWidget()
        layout = QVBoxLayout()
        self.performance_table = QTableWidget()
        self.performance_table.setColumnCount(6)
        self.performance_table.setHorizontalHeaderLabels(
            ["Game", "Result", "Material", "Center Control", "King Safety", "Mobility"])
        self._update_performance_table()
        layout.addWidget(self.performance_table)
        widget.setLayout(layout)
        return widget

    def _update_params_table(self):
        self.params_table.setRowCount(0)
        for param, value in self.ai.learning_module.params.items():
            if isinstance(value, dict):
                for sub_param, sub_value in value.items():
                    row = self.params_table.rowCount()
                    self.params_table.insertRow(row)
                    self.params_table.setItem(row, 0, QTableWidgetItem(f"{param} - {sub_param}"))
                    self.params_table.setItem(row, 1, QTableWidgetItem(f"{sub_value:.4f}"))
            else:
                row = self.params_table.rowCount()
                self.params_table.insertRow(row)
                self.params_table.setItem(row, 0, QTableWidgetItem(param))
                self.params_table.setItem(row, 1, QTableWidgetItem(f"{value:.4f}"))

    def _update_charts(self, ax1, ax2):
        history = self.ai.learning_module.learning_history
        games = [entry['games_played'] for entry in history]
        win_rates = [entry['win_rate'] for entry in history]

        ax1.clear()
        ax1.plot(games, win_rates)
        ax1.set_xlabel('Games Played')
        ax1.set_ylabel('Win Rate')
        ax1.set_title('Win Rate Progress')

        ax2.clear()
        for param, values in self.ai.learning_module.params.items():
            if not isinstance(values, dict):
                param_history = [entry['params'][param] for entry in history]
                ax2.plot(games, param_history, label=param)
        ax2.set_xlabel('Games Played')
        ax2.set_ylabel('Parameter Value')
        ax2.set_title('Parameter Changes')
        ax2.legend()

        self.chart_canvas.draw()

    def _update_performance_table(self):
        self.performance_table.setRowCount(0)
        for i, perf in enumerate(self.ai.performance_history[-20:]):
            row = self.performance_table.rowCount()
            self.performance_table.insertRow(row)
            self.performance_table.setItem(row, 0, QTableWidgetItem(str(perf['game_number'])))
            self.performance_table.setItem(row, 1, QTableWidgetItem(f"{perf['result']:.2f}"))
            self.performance_table.setItem(row, 2, QTableWidgetItem(f"{perf['material_balance']:.2f}"))
            self.performance_table.setItem(row, 3, QTableWidgetItem(f"{perf['center_control']:.2f}"))
            self.performance_table.setItem(row, 4, QTableWidgetItem(f"{perf['king_safety']:.2f}"))
            self.performance_table.setItem(row, 5, QTableWidgetItem(f"{perf['mobility']:.2f}"))

    def update_stats(self):
        self.games_played_label.setText(f"Games Played: {self.ai.learning_module.games_played}")
        self.win_rate_label.setText(
            f"Win Rate: {self.ai.learning_module.wins / max(1, self.ai.learning_module.games_played):.2%}")
        self.avg_moves_label.setText(
            f"Average Moves per Game: {self.ai.total_moves / max(1, self.ai.games_played):.2f}")
        self._update_params_table()
        self._update_charts(self.chart_canvas.figure.axes[0], self.chart_canvas.figure.axes[1])
        self._update_performance_table()

    def isVisible(self):
        """Check if the widget is visible."""
        return super().isVisible()
