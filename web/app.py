"""FastAPI web app for HexChess: serves the front end in static/ and the JSON API under /api.

Run with `python run_web.py` (http://127.0.0.1:8231, local only). `scripts/build_static.py` exports every path in
STATIC_ENDPOINTS to JSON for the GitHub Pages site, so keep that list in step with the GET routes below.
The game itself (rules engine and both AIs) runs in the browser: web/static/hex_engine.js, hex_ai_basic.js and
hex_ai_advanced.js are ports of the Python, checked against it by web/static/hex_engine.test.mjs.
"""
from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from web import hex_record as hr
from hexchess_game import HexChess

STATIC = Path(__file__).resolve().parent / "static"

app = FastAPI(title="HexChess")
app.mount("/static", StaticFiles(directory=STATIC), name="static")


@app.get("/", include_in_schema=False)
def index():
    return FileResponse(STATIC / "index.html")


@app.get("/api/info")
def info():
    """Project summary for the home page (counts come from the Python engine and the saved AI files)."""
    g = HexChess()
    w, b = hr.load_params('w'), hr.load_params('b')
    return {"title": "HexChess", "cells": len(g.board.get_all_cells()), "piece_types": len(hr.PIECE_NAMES),
            "pieces_per_side": sum(1 for p in hr.pieces_of(g) if p[2][0] == 'w'),
            "opening_moves": len(hr.legal_moves(g)),
            "learned_games": {"w": w["games_played"], "b": b["games_played"]},
            "learned_wins": {"w": w["wins"], "b": b["wins"]}}


@app.get("/api/setup")
def setup():
    """The starting position as set up by HexChess._setup_pieces: [[q, r, piece], ...]."""
    return {"size": HexChess().board.size, "pieces": hr.pieces_of(HexChess()), "names": hr.PIECE_NAMES}


@app.get("/api/pieces")
def pieces():
    """Each piece's move pattern from the centre of an empty radius-4 board (Piece.get_moves)."""
    return hr.piece_patterns(4)


@app.get("/api/params")
def params():
    """Learned BasicAI weights and learning history from ai_params_w.json / ai_params_b.json, plus the defaults."""
    return {"w": hr.params_summary('w'), "b": hr.params_summary('b'), "default": hr.default_params()}


# GET paths (without the /api prefix) written to the static site as api/<path>.json.
STATIC_ENDPOINTS = ["/info", "/setup", "/pieces", "/params"]
