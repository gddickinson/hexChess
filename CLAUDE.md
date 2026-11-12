# HexChess

@INTERFACE.md

Run tests: `python -m pytest -q tests` and `node web/static/hex_engine.test.mjs`.
After changing rules or AI code, regenerate `tests/fixtures/hex_engine_fixtures.json` with
`python scripts/make_engine_fixtures.py` and keep the JS ports in step.
