"""Qt-free helpers shared by the web API and the fixture script: positions, legal-move lists, piece patterns and the
learned AI parameters, all computed by the repo's own Python (hexchess_game, hexchess_pieces, hexchess_ai).
"""
import json
import logging
import random
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from hexchess_ai import AdvancedAI, BasicAI  # noqa: E402
from hexchess_game import HexChess  # noqa: E402
from hexchess_learning import LearningModule  # noqa: E402
from hexchess_pieces import PieceFactory  # noqa: E402

logging.getLogger('hexchess').setLevel(logging.CRITICAL)
logging.getLogger('hexchess.ai').setLevel(logging.CRITICAL)

PIECE_NAMES = {'P': 'Pawn', 'R': 'Rook', 'N': 'Knight', 'B': 'Bishop', 'Q': 'Queen', 'K': 'King',
               'D': 'Dragon', 'C': 'Prince'}


def pieces_of(game):
    """[[q, r, 'wP'], ...] in the board's cell order."""
    return [[q, r, game.board.get_cell(q, r)] for q, r in game.board.get_all_cells() if game.board.get_cell(q, r)]


def position(pieces, to_move='w'):
    """A game holding only `pieces` ([[q, r, piece], ...]) with `to_move` to play."""
    g = HexChess()
    for cell in g.board.cells:
        g.board.cells[cell] = None
    for q, r, p in pieces:
        g.board.set_cell(q, r, p)
    g.current_player = to_move
    return g


def legal_moves(game):
    """All legal moves of the side to move, [[fq, fr, tq, tr], ...] in the order the Python AIs list them."""
    out = []
    for q, r in game.board.get_all_cells():
        piece = game.board.get_cell(q, r)
        if piece and piece[0] == game.current_player:
            out.extend([q, r, tq, tr] for tq, tr in game.get_possible_moves(q, r))
    return out


def snapshot(game):
    """State summary checked by the JS engine test after each move."""
    return {'to_move': game.current_player, 'legal': legal_moves(game),
            'check_w': game.is_in_check('w'), 'check_b': game.is_in_check('b'),
            'over': game.is_game_over(), 'winner': game.get_winner(), 'board': board_state(game)}


def board_state(game):
    """The board as one string, cell by cell ('.' for empty), the same format as BasicAI._get_board_state."""
    return ''.join(game.board.get_cell(q, r) or '.' for q, r in game.board.get_all_cells())


def random_game(seed, plies):
    """A game of uniformly random legal moves (Python's random.Random(seed)), with a snapshot after every move."""
    rng = random.Random(seed)
    g = HexChess()
    moves, states = [], [snapshot(g)]
    for _ in range(plies):
        legal = legal_moves(g)
        if g.is_game_over() or not legal:
            break
        m = rng.choice(legal)
        assert g.make_move(*m)
        moves.append(m)
        states.append(snapshot(g))
    return {'seed': seed, 'moves': moves, 'states': states}


def piece_patterns(size=4):
    """For each piece type, the cells its pattern reaches from the centre of an empty radius-`size` board."""
    return {t: {'name': name, 'w': [list(m) for m in PieceFactory.create_piece(t, 'w').get_moves(0, 0, size)],
                'b': [list(m) for m in PieceFactory.create_piece(t, 'b').get_moves(0, 0, size)]}
            for t, name in PIECE_NAMES.items()}


def load_params(color):
    """The learned parameter file ai_params_<color>.json as saved by the desktop app."""
    return json.loads((ROOT / f'ai_params_{color}.json').read_text())


def _sig(x, digits=5):
    return float(f'{x:.{digits}g}')


def params_summary(color):
    """Learned weights plus the learning history as columns (game number, win rate, each weight; 5 significant
    digits): one entry per game the desktop app recorded in ai_params_<color>.json."""
    d = load_params(color)
    hist = d['learning_history']
    names = [k for k in hist[0]['params'] if k != 'piece_values']
    pieces = list(hist[0]['params']['piece_values'])
    return {'color': color, 'games_played': d['games_played'], 'wins': d['wins'], 'params': d['params'],
            'history': {'game': [h['games_played'] for h in hist],
                        'win_rate': [_sig(h['win_rate']) for h in hist],
                        'params': {k: [_sig(h['params'][k]) for h in hist] for k in names},
                        'piece_values': {k: [_sig(h['params']['piece_values'][k]) for h in hist] for k in pieces}}}


def default_params():
    return LearningModule().params


def make_basic_ai(game, color, params=None):
    ai = BasicAI(game, color)
    if params is not None:
        ai.learning_module.params = json.loads(json.dumps(params))
    return ai


def make_advanced_ai(game, color, depth, max_time=float('inf')):
    ai = AdvancedAI(game, color)
    ai.max_depth, ai.max_time = depth, max_time
    return ai
