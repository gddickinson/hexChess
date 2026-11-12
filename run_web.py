"""Start the HexChess web app on http://127.0.0.1:8231 (local only). Requires requirements-web.txt."""
import uvicorn

if __name__ == "__main__":
    uvicorn.run("web.app:app", host="127.0.0.1", port=8231)
