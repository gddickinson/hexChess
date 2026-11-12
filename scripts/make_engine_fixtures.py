"""Record what the Python engine and AIs do, for the JS port's node test (web/static/hex_engine.test.mjs).

Writes tests/fixtures/hex_engine_fixtures.json:
- random_games: seeded random-move games with, after every move, the side to move, check flags, game result, board
  string and the full legal-move list (moves encoded as from_index * 217 + to_index over the board's cell order);
- positions: hand-built positions (check, pin, mate, stalemate, promotion, Dragon jumps) with one move applied;
- basic_games: BasicAI vs BasicAI games (learned and default weights) with every chosen move and the mover's score
  for each candidate move;
- advanced: AdvancedAI root scores and chosen move at fixed depth (no time limit), and board evaluations.

Run: python scripts/make_engine_fixtures.py   (about two minutes)
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

import hexchess_ai  # noqa: E402
from hexchess_game import HexChess  # noqa: E402
from web import hex_record as hr  # noqa: E402

OUT = ROOT / 'tests' / 'fixtures' / 'hex_engine_fixtures.json'
CELLS = HexChess().board.get_all_cells()
INDEX = {c: i for i, c in enumerate(CELLS)}
N = len(CELLS)


def enc(m):
    return INDEX[(m[0], m[1])] * N + INDEX[(m[2], m[3])]


def compact(state):
    s = dict(state)
    s['legal'] = [enc(m) for m in state['legal']]
    return s


def random_games():
    out = []
    for seed, plies in ((1, 90), (7, 90), (2024, 140)):
        g = hr.random_game(seed, plies)
        out.append({'seed': seed, 'moves': g['moves'], 'states': [compact(s) for s in g['states']]})
    return out


# Hand-built positions: [pieces, to_move, move to try, note]
POSITIONS = [
    ([[0, 0, 'wK'], [2, 0, 'bR'], [5, 3, 'bK']], 'w', [0, 0, 1, 0], 'king may not step into check'),
    ([[0, 0, 'wK'], [0, 1, 'wN'], [0, 5, 'bR'], [5, -5, 'bK']], 'w', [0, 1, 0, 3], 'pinned knight'),
    ([[-8, 8, 'wK'], [7, 0, 'wR'], [3, -1, 'wR'], [8, -8, 'bK']], 'w', [3, -1, 8, -1], 'checkmate'),
    ([[-8, 8, 'wK'], [7, 0, 'wR'], [0, 0, 'wR'], [8, -8, 'bK']], 'w', [0, 0, 0, -7], 'stalemate'),
    ([[3, 4, 'wP'], [-8, 8, 'wK'], [8, -8, 'bK']], 'w', [3, 4, 4, 4], 'promotion to Queen'),
    ([[0, 7, 'wP'], [-8, 8, 'wK'], [8, -8, 'bK']], 'w', [0, 7, 0, 8], 'promotion to Prince'),
    ([[-3, -4, 'bP'], [-8, 8, 'wK'], [8, -8, 'bK']], 'b', [-3, -4, -4, -4], 'black promotion'),
    ([[0, 0, 'wP'], [0, 1, 'bN'], [-8, 8, 'wK'], [8, -8, 'bK']], 'w', [0, 0, 0, 1], 'pawn captures on a move cell'),
    ([[0, 0, 'wB'], [0, 2, 'bP'], [3, -3, 'bR'], [-8, 8, 'wK'], [8, -8, 'bK']], 'w', [0, 0, 3, -3],
     'bishop on the rook lines'),
    ([[0, 0, 'wD'], [0, 1, 'bP'], [-1, 0, 'bP'], [1, -1, 'wP'], [-8, 8, 'wK'], [8, -8, 'bK']], 'w', [0, 0, 0, 2],
     'dragon jumps'),
    ([[0, 0, 'wQ'], [0, 3, 'bR'], [1, 1, 'bN'], [-8, 8, 'wK'], [8, -8, 'bK'], [4, -2, 'bP']], 'b', [1, 1, 0, 0],
     'knight capture'),
    ([[-4, -4, 'wK'], [-4, 0, 'bQ'], [-4, -2, 'wB'], [4, 4, 'bK'], [0, -4, 'bD']], 'w', [-4, -4, -3, -4],
     'king in check from a dragon jump line'),
]


def positions():
    out = []
    for pieces, to_move, move, note in POSITIONS:
        g = hr.position(pieces, to_move)
        before = compact(hr.snapshot(g))
        ok = g.make_move(*move)
        out.append({'note': note, 'pieces': pieces, 'to_move': to_move, 'move': move, 'ok': ok,
                    'before': before, 'after': compact(hr.snapshot(g))})
    return out


class _NoRandom(Exception):
    pass


def basic_game(params_w, params_b, plies, label):
    """BasicAI vs BasicAI; stops early if the AI would use random (a king capture or a detected loop)."""
    g = HexChess()
    ais = {'w': hr.make_basic_ai(g, 'w', params_w), 'b': hr.make_basic_ai(g, 'b', params_b)}
    record = []
    real_choice = hexchess_ai.random.choice

    def forbid(seq):
        raise _NoRandom()
    hexchess_ai.random.choice = forbid
    try:
        for _ in range(plies):
            if g.is_game_over():
                break
            ai = ais[g.current_player]
            phase = ai._determine_game_phase()
            moves = ai._get_all_possible_moves()
            scores = [ai._evaluate_move(m, phase) for m in moves]
            try:
                move = ai.make_move()
            except _NoRandom:
                break
            record.append({'move': list(move), 'scores': scores})
            assert g.make_move(*move)
    finally:
        hexchess_ai.random.choice = real_choice
    return {'label': label, 'params_w': params_w, 'params_b': params_b, 'plies': record}


def advanced():
    out = []
    g = hr.random_game(1, 90)
    samples = [(g['moves'][:k], d) for k, d in ((0, 1), (11, 1), (40, 1), (75, 1))]
    small = [([[-6, 6, 'wK'], [0, 0, 'wR'], [2, 1, 'bN'], [5, -3, 'bK'], [3, -2, 'bP']], 'w', 2),
             ([[-6, 6, 'wK'], [1, 1, 'wQ'], [4, 0, 'bR'], [6, -2, 'bK'], [-2, 3, 'wP']], 'b', 2),
             ([[-7, 7, 'wK'], [-2, 0, 'wD'], [3, 2, 'bQ'], [6, -6, 'bK']], 'w', 3)]
    jobs = []
    for moves, depth in samples:
        game = HexChess()
        for m in moves:
            game.make_move(*m)
        jobs.append((hr.pieces_of(game), game.current_player, depth))
    jobs.extend(small)
    for pieces, to_move, depth in jobs:
        game = hr.position(pieces, to_move)
        ai = hr.make_advanced_ai(game, to_move, depth)
        move = ai.make_move()
        root = [[list(m), s] for m, s in ai.move_ordering.items()]
        evals = {c: hr.make_advanced_ai(game, c, 1)._evaluate_board(game) for c in 'wb'}
        out.append({'pieces': pieces, 'to_move': to_move, 'depth': depth, 'move': list(move) if move else None,
                    'root': root, 'eval': evals})
    return out


def build():
    learned_w, learned_b = hr.load_params('w')['params'], hr.load_params('b')['params']
    default = hr.default_params()
    custom = dict(default, aggression=0.9, mobility=0.2, center_control=0.3, tempo=0.8)
    return {
        'cells': [list(c) for c in CELLS],
        'random_games': random_games(),
        'positions': positions(),
        'basic_games': [basic_game(learned_w, learned_b, 40, 'saved weights'),
                        basic_game(custom, default, 30, 'custom vs default weights')],
        'advanced': advanced(),
    }


def main():
    data = build()
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(data, separators=(',', ':')))
    print(f'wrote {OUT} ({OUT.stat().st_size / 1e3:.0f} kB)')


if __name__ == '__main__':
    main()
