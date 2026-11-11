"""Hexagonal board model (Qt-free): axial (q, r) cells within `size` of the centre (217 cells for size 8).

The help window's small move-diagram widget lives in hexchess_board_view.py.
"""
from typing import Dict, Tuple, Optional, List

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
