"""Web interface tests: every exported endpoint answers, the static build is complete, and the JS engine tests pass.

Run: python -m pytest -q tests/test_web.py
"""
import shutil
import subprocess
import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from web.app import STATIC, STATIC_ENDPOINTS, app  # noqa: E402

client = TestClient(app)


def test_index_served():
    r = client.get("/")
    assert r.status_code == 200 and "static/main.js" in r.text


@pytest.mark.parametrize("path", STATIC_ENDPOINTS)
def test_endpoint(path):
    r = client.get("/api" + path)
    assert r.status_code == 200, r.text
    assert r.json() is not None


def test_static_build(tmp_path):
    sys.path.insert(0, str(ROOT / "scripts"))
    import build_static
    build_static.build(tmp_path / "site")
    assert (tmp_path / "site" / "index.html").read_text().count("APP_STATIC") == 1
    for path in STATIC_ENDPOINTS:
        assert (tmp_path / "site" / "api" / (path.strip("/") + ".json")).exists()


def test_static_assets_referenced_exist():
    html = (STATIC / "index.html").read_text()
    for name in ("style.css", "main.js"):
        assert f"static/{name}" in html and (STATIC / name).exists()


@pytest.mark.skipif(not shutil.which("node"), reason="node not installed")
def test_js_engine():
    tests = sorted(STATIC.glob("*.test.mjs"))
    for t in tests:
        r = subprocess.run(["node", str(t)], capture_output=True, text=True)
        assert r.returncode == 0, r.stdout + r.stderr


# --- project-specific -------------------------------------------------------------------------------------------
import json  # noqa: E402
import math  # noqa: E402

sys.path.insert(0, str(ROOT / "scripts"))
import make_engine_fixtures as mef  # noqa: E402
from web import hex_record as hr  # noqa: E402

FIXTURE = json.loads((ROOT / "tests" / "fixtures" / "hex_engine_fixtures.json").read_text())


def close(a, b):
    return a == b or math.isclose(a, b, rel_tol=1e-9, abs_tol=1e-9)


def test_info_counts():
    d = client.get("/api/info").json()
    assert d["cells"] == 217 and d["piece_types"] == 8 and d["pieces_per_side"] == 19
    assert set(d["learned_games"]) == {"w", "b"}


def test_pieces_match_python_patterns():
    d = client.get("/api/pieces").json()
    assert d["N"]["w"] == [list(m) for m in hr.PieceFactory.create_piece("N", "w").get_moves(0, 0, 4)]
    assert d["P"]["w"] == [[0, 1], [1, 0]] and d["P"]["b"] == [[0, -1], [-1, 0]]
    assert sorted(d["B"]["w"]) == sorted(d["R"]["w"])          # this variant's Bishop uses the Rook's lines


def test_params_history_complete():
    d = client.get("/api/params").json()
    for c in "wb":
        h = d[c]["history"]
        assert len(h["game"]) == d[c]["games_played"] == len(h["win_rate"]) == len(h["params"]["aggression"])
    assert d["default"]["aggression"] == 0.5


def test_fixture_is_current_positions():
    assert mef.positions() == FIXTURE["positions"]
    assert FIXTURE["cells"] == [list(c) for c in mef.CELLS]


def test_fixture_is_current_random_game():
    want = FIXTURE["random_games"][1]
    g = hr.random_game(want["seed"], 30)
    assert g["moves"] == want["moves"][:30]
    assert [mef.compact(s) for s in g["states"]] == want["states"][:31]


def test_fixture_is_current_basic_ai():
    want = FIXTURE["basic_games"][0]
    got = mef.basic_game(want["params_w"], want["params_b"], 6, want["label"])
    for a, b in zip(got["plies"], want["plies"][:6]):
        assert a["move"] == b["move"]
        assert len(a["scores"]) == len(b["scores"]) and all(close(x, y) for x, y in zip(a["scores"], b["scores"]))


def test_fixture_is_current_advanced_eval():
    for a in FIXTURE["advanced"]:
        g = hr.position(a["pieces"], a["to_move"])
        for c in "wb":
            assert close(hr.make_advanced_ai(g, c, 1)._evaluate_board(g), a["eval"][c])
