import sys
from PyQt5.QtWidgets import (QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout, QPushButton,
                             QLabel, QTabWidget, QScrollArea, QGridLayout)
from PyQt5.QtGui import QPainter, QColor, QPen, QPolygonF, QPixmap, QFont
from PyQt5.QtCore import Qt, QPointF

from hexchess_board_view import VisualizationHexBoard

class HelpWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("HexChess Help")
        self.setGeometry(100, 100, 800, 600)

        central_widget = QWidget()
        layout = QVBoxLayout()

        tab_widget = QTabWidget()
        tab_widget.addTab(self.create_overview_tab(), "Overview")
        tab_widget.addTab(self.create_rules_tab(), "Rules")
        tab_widget.addTab(self.create_pieces_tab(), "Pieces")
        tab_widget.addTab(self.create_ai_tab(), "AI")
        tab_widget.addTab(self.create_updates_tab(), "Updates")

        layout.addWidget(tab_widget)
        central_widget.setLayout(layout)
        self.setCentralWidget(central_widget)

    def create_overview_tab(self):
        scroll = QScrollArea()
        content = QWidget()
        layout = QVBoxLayout()

        title = QLabel("Welcome to HexChess!")
        title.setFont(QFont("Arial", 16, QFont.Bold))
        layout.addWidget(title)

        overview_text = """
        HexChess is an exciting variant of chess played on a hexagonal board. This unique design
        introduces new strategic elements while maintaining the core essence of chess.

        Key Features:
        • Hexagonal board with 217 cells (radius 8)
        • Traditional chess pieces plus new 'Prince' and 'Dragon' pieces
        • Modified movement rules adapted to the hexagonal grid
        • AI opponent with learning capabilities

        Whether you're a chess veteran or new to the game, HexChess offers a fresh and
        challenging experience. Explore the tabs in this help window to learn more about
        the rules, pieces, and AI opponent.

        Version: 1.0.0
        """
        overview = QLabel(overview_text)
        overview.setWordWrap(True)
        layout.addWidget(overview)

        content.setLayout(layout)
        scroll.setWidget(content)
        scroll.setWidgetResizable(True)
        return scroll

    def create_rules_tab(self):
        scroll = QScrollArea()
        content = QWidget()
        layout = QVBoxLayout()

        rules_text = """
        Basic Rules:
        1. White moves first, then players alternate turns.
        2. Each type of piece has its own unique movement pattern.
        3. A piece is captured when an opponent's piece moves to its cell.
        4. You may not make a move that leaves your own King attacked (check).
        5. The game ends by checkmate (the player to move is in check and has no legal move)
           or stalemate (no legal move, not in check: a draw).
        6. Pawns reaching the far edge promote to a Queen; reaching one of the two side edges
           next to it promotes them to a Prince.
        7. There is no castling in HexChess.
        8. En passant captures are not implemented in this version.

        Winning the Game:
        • Checkmate: the opponent is in check and has no legal move

        Draws:
        • Stalemate: The player to move has no legal moves, but their King is not in check
        (Insufficient material, threefold repetition and the 50-move rule are not implemented.)

        Remember, the hexagonal board changes the dynamics of piece movements and
        strategy compared to traditional chess. Experiment and discover new tactics!
        """
        rules = QLabel(rules_text)
        rules.setWordWrap(True)
        layout.addWidget(rules)

        content.setLayout(layout)
        scroll.setWidget(content)
        scroll.setWidgetResizable(True)
        return scroll

    def create_pieces_tab(self):
        scroll = QScrollArea()
        content = QWidget()
        layout = QGridLayout()

        pieces = ['Pawn', 'Rook', 'Knight', 'Bishop', 'Queen', 'King', 'Prince', 'Dragon']
        symbols = ['♟', '♜', '♞', '♝', '♛', '♚', '♔', 'D']  # Unicode chess symbols
        descriptions = [
            "Moves one step forward in two directions: (0, +1) or (+1, 0) for white, (0, -1) or (-1, 0) for black, and captures on the same two cells. Promotes to a Queen on the far edge and to a Prince on the two side edges next to it.",
            "Moves any number of steps in straight lines (6 directions).",
            "Jumps to any of the 12 cells at distance 2: two steps in a straight line, or one step in each of two neighbouring directions. It jumps over pieces.",
            "In this version the Bishop slides along the same six straight lines as the Rook.",
            "Combines Rook and Bishop movements (in this version: any number of steps along the 6 straight lines).",
            "Moves one step in any of the 6 directions to adjacent hexes.",
            "Moves one step in any of the 6 directions, like the King. Obtained through pawn promotion.",
            "Combines Queen and Knight moves: slides like a Queen and jumps like a Knight."
        ]
        moves = [
            [(0, 1), (1, 0)],  # Pawn (moves and captures on the same cells)
            [(0, 1), (0, 2), (0, 3), (1, 0), (2, 0), (3, 0), (1, -1), (2, -2), (3, -3),
             (0, -1), (0, -2), (0, -3), (-1, 0), (-2, 0), (-3, 0), (-1, 1), (-2, 2), (-3, 3)],  # Rook
            [(2, -1), (1, 1), (-1, 2), (-2, 1), (-1, -1), (1, -2),
             (2, -2), (2, 0), (0, 2), (-2, 2), (-2, 0), (0, -2)],  # Knight
            [(1, -1), (2, -2), (3, -3), (1, 0), (2, 0), (3, 0), (0, 1), (0, 2), (0, 3),
             (-1, 1), (-2, 2), (-3, 3), (-1, 0), (-2, 0), (-3, 0), (0, -1), (0, -2), (0, -3)],  # Bishop
            [(0, 1), (0, 2), (0, 3), (1, 0), (2, 0), (3, 0), (1, -1), (2, -2), (3, -3),
             (0, -1), (0, -2), (0, -3), (-1, 0), (-2, 0), (-3, 0), (-1, 1), (-2, 2), (-3, 3)],  # Queen
            [(0, 1), (1, 0), (1, -1), (0, -1), (-1, 0), (-1, 1)],  # King
            [(0, 1), (1, 0), (1, -1), (0, -1), (-1, 0), (-1, 1)],  # Prince
            [(0, 1), (0, 2), (0, 3), (1, 0), (2, 0), (3, 0), (1, -1), (2, -2), (3, -3),
             (0, -1), (0, -2), (0, -3), (-1, 0), (-2, 0), (-3, 0), (-1, 1), (-2, 2), (-3, 3),
             (2, -1), (1, 1), (-1, 2), (-2, 1), (-1, -1), (1, -2)],  # Dragon
        ]

        for i, (piece, symbol, desc, piece_moves) in enumerate(zip(pieces, symbols, descriptions, moves)):
            label = QLabel(piece)
            label.setFont(QFont("Arial", 12, QFont.Bold))
            layout.addWidget(label, i, 0)

            board = VisualizationHexBoard()
            board.set_moves(piece_moves)
            board.set_piece(symbol)
            layout.addWidget(board, i, 1)

            description = QLabel(desc)
            description.setWordWrap(True)
            layout.addWidget(description, i, 2)

        content.setLayout(layout)
        scroll.setWidget(content)
        scroll.setWidgetResizable(True)
        return scroll

    def create_ai_tab(self):
        scroll = QScrollArea()
        content = QWidget()
        layout = QVBoxLayout()

        ai_text = """
        The AI in HexChess uses a combination of traditional chess AI techniques and machine learning
        to provide a challenging opponent.

        Key Features of the AI:
        1. Evaluation Function: The AI evaluates board positions based on material balance,
           piece positioning, king safety, and other strategic factors.

        2. Move Selection: It uses a minimax algorithm with alpha-beta pruning to search through
           possible future positions and select the best move.

        3. Learning Capability: The AI can adjust its evaluation parameters based on game outcomes,
           allowing it to improve over time.

        4. Adaptive Play: The AI considers the game phase (opening, middlegame, endgame) and adjusts
           its strategy accordingly.

        5. Two AI players: BasicAI scores each move with its learned weights (one move deep);
           AdvancedAI searches deeper with minimax (up to 5 plies or 6 seconds).

        How the AI Learns:
        • After each game, the AI analyzes its performance and the game outcome.
        • It adjusts the weights of different factors in its evaluation function.
        • Over time, this allows the AI to improve its understanding of good and bad positions.

        Playing Against the AI:
        • The AI provides a consistent and improving challenge.
        • It can help you practice and improve your own HexChess skills.
        • Observe the AI's moves to learn new strategies and tactics specific to HexChess.

        Remember, while the AI is a strong player, it's not infallible. Look for opportunities to
        outmaneuver it, especially in complex positions where long-term strategic thinking is required.
        """
        ai_info = QLabel(ai_text)
        ai_info.setWordWrap(True)
        layout.addWidget(ai_info)

        content.setLayout(layout)
        scroll.setWidget(content)
        scroll.setWidgetResizable(True)
        return scroll

    def create_updates_tab(self):
        scroll = QScrollArea()
        content = QWidget()
        layout = QVBoxLayout()

        updates_text = """
        HexChess is an evolving game, and we're committed to improving and expanding it based on
        player feedback and new ideas. Here's what you can expect in terms of updates and
        version control:

        Current Version: 1.0.0

        Version Numbering:
        We use semantic versioning (MAJOR.MINOR.PATCH):
        • MAJOR version for incompatible API changes,
        • MINOR version for backwards-compatible functionality additions,
        • PATCH version for backwards-compatible bug fixes.

        Recent Updates:
        • Rules fixes - moves must follow the piece's pattern, check is enforced, and
          checkmate and stalemate end the game
        • 1.0.0 - Initial release of HexChess
          - Implemented basic game rules and all piece movements
          - Added AI opponent with learning capabilities
          - Introduced the Prince piece as a pawn promotion option

        Planned Future Updates:
        • Improved AI with deeper search capabilities
        • Online multiplayer functionality
        • More customization options (board themes, piece sets)
        • Mobile version of HexChess

        How to Update:
        Pull the latest version from https://github.com/gddickinson/hexChess

        Feedback, Suggestions and Bug Reports:
        Please open an issue on the GitHub repository.

        Stay tuned for exciting new developments in the world of HexChess!
        """
        updates_info = QLabel(updates_text)
        updates_info.setWordWrap(True)
        layout.addWidget(updates_info)

        content.setLayout(layout)
        scroll.setWidget(content)
        scroll.setWidgetResizable(True)
        return scroll

if __name__ == '__main__':
    app = QApplication(sys.argv)
    help_window = HelpWindow()
    help_window.show()
    sys.exit(app.exec_())
