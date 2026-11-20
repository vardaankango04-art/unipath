"""
UniPath - Smart Campus Indoor Navigation System
FastAPI Main Application Entry Point
"""

import os
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from dotenv import load_dotenv

from .database import engine, get_db
from .routes.locations import router as locations_router
from .routes.buildings import router as buildings_router
from .routes.faculty import router as faculty_router
from .routes.navigation import router as navigation_router

# Load environment configuration
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

app = FastAPI(
    title="UniPath Campus Navigation API",
    description=(
        "Production REST API for UniPath Smart Campus Indoor Navigation System. "
        "Provides campus locations, building and floor structures, faculty directory, "
        "and DSA graph navigation algorithms."
    ),
    version="1.0.0"
)

# CORS Configuration
# Allows requests from Vite React dev server, Vercel deployments (*.vercel.app), and all clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(locations_router)
app.include_router(buildings_router)
app.include_router(faculty_router)
app.include_router(navigation_router)


@app.get("/", tags=["Root"])
def root_status(db: Session = Depends(get_db)):
    """API health and service information."""
    try:
        db.execute(text("SELECT 1;"))
        db_status = "connected"
    except Exception as e:
        db_status = f"disconnected: {e}"

    return {
        "project": "UniPath – Smart Campus Indoor Navigation System",
        "status": "online",
        "version": "1.0.0",
        "database": db_status,
        "docs_url": "/docs",
        "redoc_url": "/redoc"
    }


@app.get("/health", tags=["Health"])
def health_check(db: Session = Depends(get_db)):
    """Health check endpoint for containerization and monitoring."""
    db.execute(text("SELECT 1;"))
    return {"status": "healthy", "database": "connected"}


if __name__ == "__main__":
    import uvicorn
    host = os.getenv("API_HOST", "127.0.0.1")
    port = int(os.getenv("API_PORT", 8000))
    uvicorn.run("backend.app.main:app", host=host, port=port, reload=True)

