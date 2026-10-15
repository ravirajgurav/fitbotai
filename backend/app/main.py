import os
import logging
from pathlib import Path
from dotenv import load_dotenv
# Load environment variables before any app modules are imported
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.chat import router as chat_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("fitbot-ai")

app = FastAPI(
    title="FitBot AI Backend",
    description="Conversational AI Gym Trainer Backend powered by Gemini & FastAPI",
    version="1.0.0",
)

# Enable CORS for local Vite development server
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(chat_router)

@app.get("/")
def root():
    return {
        "app": "FitBot AI",
        "description": "Your Personal AI Gym Trainer API",
        "endpoints": {
            "health": "/api/health",
            "chat": "/api/chat",
            "docs": "/docs",
        },
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
