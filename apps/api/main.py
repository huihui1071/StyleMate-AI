from __future__ import annotations

from typing import Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .engine import MEMBERS, PRODUCTS, handle_request


app = FastAPI(
    title="StyleMate AI API",
    description="Anonymous, deterministic retail advisor demo API.",
    version="0.1.0",
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
    member_id: Optional[str] = None
    mode: str = Field(default="auto", pattern="^(auto|shopping|outfit|member)$")
    subscription_already_shown: bool = False


@app.get("/api/health")
def health() -> dict[str, object]:
    return {"status": "ok", "product_count": len(PRODUCTS), "member_count": len(MEMBERS), "data": "synthetic"}


@app.get("/api/members")
def members() -> list[dict[str, object]]:
    return [
        {
            "id": item["id"],
            "name": item["name"],
            "tier": item["tier"],
            "points": item["points"],
            "subscription_status": item["subscription_status"],
        }
        for item in MEMBERS
    ]


@app.post("/api/chat")
def chat(payload: ChatRequest) -> dict[str, object]:
    return handle_request(
        payload.message.strip(),
        payload.member_id,
        payload.mode,
        payload.subscription_already_shown,
    )
