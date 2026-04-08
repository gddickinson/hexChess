from typing import List, Tuple

class Piece:
    def __init__(self, color: str):
        self.color = color

    def get_moves(self, q: int, r: int, board_size: int) -> List[Tuple[int, int]]:
        raise NotImplementedError("Subclasses must implement this method")

class Pawn(Piece):
    def get_moves(self, q: int, r: int, board_size: int) -> List[Tuple[int, int]]:
        direction = 1 if self.color == 'w' else -1
        return [(q, r + direction), (q + direction, r)]

class Prince(Piece):
    def get_moves(self, q: int, r: int, board_size: int) -> List[Tuple[int, int]]:
        directions = [(1, 0), (1, -1), (0, -1), (-1, 0), (-1, 1), (0, 1)]
        return [(q + dq, r + dr) for dq, dr in directions
                if max(abs(q + dq), abs(r + dr), abs(-(q + dq)-(r + dr))) <= board_size]


class Rook(Piece):
    def get_moves(self, q: int, r: int, board_size: int) -> List[Tuple[int, int]]:
        moves = []
        directions = [(1, 0), (0, 1), (-1, 1), (-1, 0), (0, -1), (1, -1)]
        for dq, dr in directions:
            for step in range(1, board_size + 1):
                new_q, new_r = q + dq * step, r + dr * step
                if max(abs(new_q), abs(new_r), abs(-new_q-new_r)) <= board_size:
                    moves.append((new_q, new_r))
                else:
                    break
        return moves

class Knight(Piece):
    def get_moves(self, q: int, r: int, board_size: int) -> List[Tuple[int, int]]:
        knight_moves = [
            (2, -1), (1, 1), (-1, 2), (-2, 1), (-1, -1), (1, -2),
            (0, -2), (2, -2), (2, 0), (0, 2), (-2, 2), (-2, 0)
        ]
        return [(q + dq, r + dr) for dq, dr in knight_moves
                if max(abs(q + dq), abs(r + dr), abs(-(q + dq)-(r + dr))) <= board_size]

class Bishop(Piece):
    def get_moves(self, q: int, r: int, board_size: int) -> List[Tuple[int, int]]:
        moves = []
        directions = [(1, -1), (1, 0), (0, 1), (-1, 1), (-1, 0), (0, -1)]
        for dq, dr in directions:
            for step in range(1, board_size + 1):
                new_q = q + dq * step
                new_r = r + dr * step
                if max(abs(new_q), abs(new_r), abs(-new_q-new_r)) <= board_size:
                    moves.append((new_q, new_r))
                else:
                    break
        return moves

class Queen(Piece):
    def get_moves(self, q: int, r: int, board_size: int) -> List[Tuple[int, int]]:
        rook = Rook(self.color)
        bishop = Bishop(self.color)
        return list(set(rook.get_moves(q, r, board_size) + bishop.get_moves(q, r, board_size)))

class King(Piece):
    def get_moves(self, q: int, r: int, board_size: int) -> List[Tuple[int, int]]:
        directions = [(1, 0), (1, -1), (0, -1), (-1, 0), (-1, 1), (0, 1)]
        return [(q + dq, r + dr) for dq, dr in directions
                if max(abs(q + dq), abs(r + dr), abs(-(q + dq)-(r + dr))) <= board_size]

class Dragon(Piece):
    def get_moves(self, q: int, r: int, board_size: int) -> List[Tuple[int, int]]:
        queen = Queen(self.color)
        knight = Knight(self.color)
        return list(set(queen.get_moves(q, r, board_size) + knight.get_moves(q, r, board_size)))

class PieceFactory:
    @staticmethod
    def create_piece(piece_type: str, color: str) -> Piece:
        piece_classes = {
            'P': Pawn,
            'R': Rook,
            'N': Knight,
            'B': Bishop,
            'Q': Queen,
            'K': King,
            'D': Dragon,
            'C': Prince  # 'C' for Crown Prince/Princess
        }
        return piece_classes[piece_type](color)
