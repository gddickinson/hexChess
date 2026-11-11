"""Small Qt widget drawing a hex board with highlighted move targets (used by the help window's piece diagrams)."""
import math

from PyQt5.QtWidgets import QWidget
from PyQt5.QtGui import QPainter, QColor, QPen, QPolygonF, QFont, QBrush
from PyQt5.QtCore import Qt, QPointF


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
