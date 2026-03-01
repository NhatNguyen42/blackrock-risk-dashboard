"""
BlackRock-Inspired Portfolio Risk Dashboard — FastAPI Backend
"""
import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

from app.routes import portfolio, market, ai, reports  # noqa: E402


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    yield
    # Shutdown


app = FastAPI(
    title="BlackRock Risk Dashboard API",
    version="1.0.0",
    description="Portfolio risk analytics & GenAI commentary engine",
    lifespan=lifespan,
)

# CORS
origins = [
    os.getenv("FRONTEND_URL", "http://localhost:3000"),
    "http://localhost:3000",
    "http://localhost:3001",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(portfolio.router, prefix="/api/portfolio", tags=["Portfolio"])
app.include_router(market.router, prefix="/api/market", tags=["Market Data"])
app.include_router(ai.router, prefix="/api/ai", tags=["AI Commentary"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "service": "blackrock-risk-api"}
