from PyQt5.QtWidgets import (QWidget, QVBoxLayout, QPushButton, QTextEdit,
                             QComboBox, QHBoxLayout, QLabel, QSpinBox)
from PyQt5.QtCore import QObject, QRunnable, QThreadPool, pyqtSignal, pyqtSlot
from hexchess_game import HexChess
from hexchess_ai import BasicAI
import unittest
import io
import sys
import traceback

class WorkerSignals(QObject):
    finished = pyqtSignal()
    error = pyqtSignal(tuple)
    result = pyqtSignal(object)
    progress = pyqtSignal(str)

class TestWorker(QRunnable):
    def __init__(self, test_case, num_games):
        super().__init__()
        self.test_case = test_case
        self.num_games = num_games
        self.signals = WorkerSignals()

    @pyqtSlot()
    def run(self):
        try:
            for _ in range(self.num_games):
                stream = io.StringIO()
                runner = unittest.TextTestRunner(stream=stream)
                result = runner.run(self.test_case)
                output = stream.getvalue()
                self.signals.progress.emit(output)
            self.signals.result.emit("All tests completed.")
        except Exception:
            traceback.print_exc()
            exctype, value = sys.exc_info()[:2]
            self.signals.error.emit((exctype, value, traceback.format_exc()))
        finally:
            self.signals.finished.emit()

class TestingWindow(QWidget):
    def __init__(self):
        super().__init__()
        self.threadpool = QThreadPool()
        self.init_ui()

    def init_ui(self):
        layout = QVBoxLayout()

        # Test selection
        test_layout = QHBoxLayout()
        test_layout.addWidget(QLabel("Select Test:"))
        self.test_combo = QComboBox()
        self.test_combo.addItem("Full Game Simulation")
        test_layout.addWidget(self.test_combo)
        layout.addLayout(test_layout)

        # Number of games
        games_layout = QHBoxLayout()
        games_layout.addWidget(QLabel("Number of Games:"))
        self.num_games_spin = QSpinBox()
        self.num_games_spin.setRange(1, 100)
        self.num_games_spin.setValue(1)
        games_layout.addWidget(self.num_games_spin)
        layout.addLayout(games_layout)

        # Run button
        self.run_button = QPushButton("Run Tests")
        self.run_button.clicked.connect(self.run_tests)
        layout.addWidget(self.run_button)

        # Output area
        self.output_text = QTextEdit()
        self.output_text.setReadOnly(True)
        layout.addWidget(self.output_text)

        self.setLayout(layout)
        self.setWindowTitle("HexChess Testing")

    def run_tests(self):
        self.output_text.clear()
        test_case = unittest.TestLoader().loadTestsFromTestCase(TestFullGameSimulation)
        worker = TestWorker(test_case, self.num_games_spin.value())
        worker.signals.progress.connect(self.update_output)
        worker.signals.result.connect(self.update_output)
        worker.signals.finished.connect(self.test_complete)
        worker.signals.error.connect(self.test_error)

        self.run_button.setEnabled(False)
        self.threadpool.start(worker)

    def update_output(self, text):
        self.output_text.append(text)

    def test_complete(self):
        self.run_button.setEnabled(True)
        self.update_output("All tests completed.")

    def test_error(self, error_tuple):
        self.run_button.setEnabled(True)
        exctype, value, tb_str = error_tuple
        self.update_output(f"An error occurred: {exctype}\n{value}\n{tb_str}")

class TestFullGameSimulation(unittest.TestCase):
    def setUp(self):
        self.game = HexChess()
        self.white_ai = BasicAI(self.game, 'w')
        self.black_ai = BasicAI(self.game, 'b')

    def test_full_game_simulation(self):
        move_count = 0
        max_moves = 1000  # Prevent infinite loops

        while not self.game.is_game_over() and move_count < max_moves:
            current_ai = self.white_ai if self.game.current_player == 'w' else self.black_ai
            move = current_ai.make_move()
            if move:
                self.game.make_move(*move)
            else:
                self.fail("AI failed to choose a move")
            move_count += 1

        self.assertTrue(self.game.is_game_over(), "Game should be over")
        self.assertIsNotNone(self.game.get_winner(), "There should be a winner")

    def tearDown(self):
        del self.game
        del self.white_ai
        del self.black_ai
