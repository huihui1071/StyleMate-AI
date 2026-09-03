from __future__ import annotations

from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

from .engine import MERCHANTS, PRODUCTS, handle_request


app = FastAPI(
    title="StyleMate Supply API",
    description="Anonymous, deterministic wholesale assortment workspace API.",
    version="0.2.0",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=1000)
    merchant_id: Optional[str] = None
    mode: str = Field(default="auto", pattern="^(auto|selection|assortment|account)$")


@app.get("/api/health")
def health() -> dict[str, object]:
    return {"status": "ok", "product_count": len(PRODUCTS), "merchant_count": len(MERCHANTS), "data": "anonymized_demo"}


@app.get("/api/merchants")
def merchants() -> list[dict[str, object]]:
    return [
        {
            "id": item["id"],
            "name": item["name"],
            "platform": item["platform"],
            "business_stage": item["business_stage"],
            "target_customer": item["target_customer"],
            "price_band": item["price_band"],
            "tier": item["tier"],
            "default_budget": item["default_budget"],
            "discount_rate": item["discount_rate"],
            "sample_quota": item["sample_quota"],
        }
        for item in MERCHANTS
    ]


@app.post("/api/chat")
def chat(payload: ChatRequest) -> dict[str, object]:
    return handle_request(payload.message.strip(), payload.merchant_id, payload.mode)


# In production the Vite build is copied into this directory. Keeping the SPA
# and API on one origin makes the portfolio demo deployable as a single service.
WEB_DIST = Path(__file__).resolve().parents[1] / "web" / "dist"

if WEB_DIST.is_dir():
    web_root = WEB_DIST.resolve()

    @app.get("/{full_path:path}", include_in_schema=False)
    def serve_web_app(full_path: str) -> FileResponse:
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="API route not found")

        requested_file = (web_root / full_path).resolve()
        if requested_file.is_relative_to(web_root) and requested_file.is_file():
            return FileResponse(requested_file)

        return FileResponse(web_root / "index.html")
