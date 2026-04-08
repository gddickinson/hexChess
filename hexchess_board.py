from typing import Dict, Tuple, Optional, List
import sys
import math
from PyQt5.QtWidgets import (QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout, QPushButton,
                             QLabel, QTabWidget, QScrollArea, QGridLayout)
from PyQt5.QtGui import QPainter, QColor, QPen, QPolygonF, QPixmap, QFont, QBrush
from PyQt5.QtCore import Qt, QPointF

class HexBoard:
    def __init__(self, size: int = 8):
        self.size = size
        self.cells: Dict[Tuple[int, int, int], Optional[str]] = {}
        self._initialize_board()

    def _initialize_board(self):
        for q in range(-self.size, self.size + 1):
            r1 = max(-self.size, -q - self.size)
            r2 = min(self.size, -q + self.size)
            for r in range(r1, r2 + 1):
                self.cells[(q, r, -q-r)] = None


    def get_cell(self, q: int, r: int) -> Optional[str]:
        return self.cells.get((q, r, -q-r))

    def set_cell(self, q: int, r: int, piece: Optional[str]):
        if self.is_valid_cell(q, r):
            self.cells[(q, r, -q-r)] = piece
        else:
            raise ValueError(f"Invalid cell coordinates: ({q}, {r})")

    def is_valid_cell(self, q: int, r: int) -> bool:
        return (q, r, -q-r) in self.cells

    def get_all_cells(self) -> List[Tuple[int, int]]:
        return [(q, r) for q, r, _ in self.cells.keys()]

    def distance(self, q1: int, r1: int, q2: int, r2: int) -> int:
        return max(abs(q2 - q1), abs(r2 - r1), abs((q2 + r2) - (q1 + r1)))

    def get_adjacent_cells(self, q: int, r: int) -> List[Tuple[int, int]]:
        directions = [(1, -1), (1, 0), (0, 1), (-1, 1), (-1, 0), (0, -1)]
        return [(q + dq, r + dr) for dq, dr in directions if self.is_valid_cell(q + dq, r + dr)]


class VisualizationHexBoard(QWidget):
    def __init__(self, size=3, hex_size=20):
        super().__init__()
        self.size = size
        self.hex_size = hex_size
        self.setFixedSize(self.hex_size * (self.size * 2 + 1) * 2,
                          int(self.hex_size * (self.size * 2 + 1) * 1.8))
        self.moves = []
        self.piece = None

    def set_moves(self, moves):
        self.moves = moves
        self.update()

    def set_piece(self, piece):
        self.piece = piece
        self.update()

    def paintEvent(self, event):
        painter = QPainter(self)
        painter.setRenderHint(QPainter.Antialiasing)

        for q in range(-self.size, self.size + 1):
            for r in range(max(-self.size, -q - self.size), min(self.size, -q + self.size) + 1):
                self.draw_hex(painter, q, r)

        if self.piece:
            self.draw_piece(painter)

    def draw_hex(self, painter, q, r):
        x, y = self.hex_to_pixel(q, r)

        if (q, r) == (0, 0):
            color = QColor(200, 200, 200)  # Gray for the center
        elif (q, r) in self.moves:
            color = QColor(0, 255, 0, 100)  # Light green for possible moves
        else:
            color = QColor(255, 255, 255)  # White for other cells

        points = QPolygonF([
            QPointF(x + self.hex_size * math.cos(math.radians(angle)),
                    y + self.hex_size * math.sin(math.radians(angle)))
            for angle in range(0, 360, 60)
        ])

        painter.setBrush(QBrush(color))
        painter.setPen(QPen(Qt.black, 1))
        painter.drawPolygon(points)

    def draw_piece(self, painter):
        x, y = self.hex_to_pixel(0, 0)
        painter.setFont(QFont('Arial', int(self.hex_size * 0.8)))
        painter.drawText(QPointF(x - self.hex_size / 2, y + self.hex_size / 2), self.piece)

    def hex_to_pixel(self, q, r):
        x = self.hex_size * (3/2 * q)
        y = self.hex_size * (math.sqrt(3)/2 * q + math.sqrt(3) * r)
        return x + self.width() / 2, y + self.height() / 2
