"""Dialog windows for HexChess: game setup, tournament, options, board size, and results."""

from PyQt5.QtWidgets import (QDialog, QVBoxLayout, QHBoxLayout, QPushButton, QLabel,
                             QCheckBox, QGridLayout, QComboBox, QSpinBox,
                             QTableWidget, QTableWidgetItem, QHeaderView)
from PyQt5.QtGui import QFont
from PyQt5.QtCore import Qt


class BoardSizeDialog(QDialog):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setWindowTitle("Set Board Size")
        layout = QVBoxLayout()

        self.size_spinner = QSpinBox()
        self.size_spinner.setRange(3, 10)
        self.size_spinner.setValue(8)

        layout.addWidget(QLabel("Board Size:"))
        layout.addWidget(self.size_spinner)

        buttons = QHBoxLayout()
        ok_button = QPushButton("OK")
        ok_button.clicked.connect(self.accept)
        cancel_button = QPushButton("Cancel")
        cancel_button.clicked.connect(self.reject)
        buttons.addWidget(ok_button)
        buttons.addWidget(cancel_button)

        layout.addLayout(buttons)
        self.setLayout(layout)


class GameSetupDialog(QDialog):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setWindowTitle("Game Setup")
        self.setGeometry(300, 300, 300, 200)

        layout = QVBoxLayout()

        self.white_player = QComboBox()
        self.white_player.addItems(["Human", "BasicAI", "AdvancedAI"])
        layout.addWidget(QLabel("White Player:"))
        layout.addWidget(self.white_player)

        self.black_player = QComboBox()
        self.black_player.addItems(["Human", "BasicAI", "AdvancedAI"])
        layout.addWidget(QLabel("Black Player:"))
        layout.addWidget(self.black_player)

        self.start_button = QPushButton("Start Game")
        self.start_button.clicked.connect(self.accept)
        layout.addWidget(self.start_button)

        self.setLayout(layout)


class TournamentSetupDialog(QDialog):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setWindowTitle("Tournament Setup")
        self.setGeometry(300, 300, 300, 300)

        layout = QVBoxLayout()

        self.num_games = QSpinBox()
        self.num_games.setRange(1, 100)
        self.num_games.setValue(10)
        layout.addWidget(QLabel("Number of Games:"))
        layout.addWidget(self.num_games)

        self.ai_player1 = QComboBox()
        self.ai_player1.addItems(["BasicAI", "AdvancedAI"])
        layout.addWidget(QLabel("AI Player 1:"))
        layout.addWidget(self.ai_player1)

        self.ai_player2 = QComboBox()
        self.ai_player2.addItems(["BasicAI", "AdvancedAI"])
        layout.addWidget(QLabel("AI Player 2:"))
        layout.addWidget(self.ai_player2)

        self.visual_mode = QCheckBox("Visual Representation")
        self.visual_mode.setChecked(True)
        layout.addWidget(self.visual_mode)

        self.move_delay = QSpinBox()
        self.move_delay.setRange(0, 5000)
        self.move_delay.setValue(500)
        self.move_delay.setSuffix(" ms")
        layout.addWidget(QLabel("Move Delay (Visual Mode):"))
        layout.addWidget(self.move_delay)

        self.start_button = QPushButton("Start Tournament")
        self.start_button.clicked.connect(self.accept)
        layout.addWidget(self.start_button)

        self.setLayout(layout)


class TournamentResultsDialog(QDialog):
    def __init__(self, results, parent=None):
        super().__init__(parent)
        self.setWindowTitle("Tournament Results")
        self.setGeometry(300, 300, 400, 300)

        layout = QVBoxLayout()

        self.results_table = QTableWidget()
        self.results_table.setColumnCount(4)
        self.results_table.setHorizontalHeaderLabels(["Game", "White", "Black", "Result"])
        self.results_table.horizontalHeader().setSectionResizeMode(QHeaderView.Stretch)

        for i, result in enumerate(results):
            self.results_table.insertRow(i)
            self.results_table.setItem(i, 0, QTableWidgetItem(str(i+1)))
            self.results_table.setItem(i, 1, QTableWidgetItem(result['white']))
            self.results_table.setItem(i, 2, QTableWidgetItem(result['black']))
            self.results_table.setItem(i, 3, QTableWidgetItem(result['result']))

        layout.addWidget(self.results_table)

        self.close_button = QPushButton("Close")
        self.close_button.clicked.connect(self.accept)
        layout.addWidget(self.close_button)

        self.setLayout(layout)


class OptionsWindow(QDialog):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setWindowTitle("Game Options")
        self.setGeometry(200, 200, 300, 200)

        layout = QGridLayout()

        self.show_coordinates = QCheckBox("Show Coordinates")
        self.show_possible_moves = QCheckBox("Show Possible Moves")
        self.use_piece_images = QCheckBox("Use Piece Images")

        self.show_possible_moves.setChecked(True)
        self.use_piece_images.setChecked(True)

        layout.addWidget(self.show_coordinates, 0, 0)
        layout.addWidget(self.show_possible_moves, 1, 0)
        layout.addWidget(self.use_piece_images, 2, 0)

        self.apply_button = QPushButton("Apply")
        self.apply_button.clicked.connect(self.apply_settings)
        layout.addWidget(self.apply_button, 3, 0)

        self.setLayout(layout)

    def apply_settings(self):
        self.parent().apply_options(
            self.show_coordinates.isChecked(),
            self.show_possible_moves.isChecked(),
            self.use_piece_images.isChecked()
        )
        self.close()
