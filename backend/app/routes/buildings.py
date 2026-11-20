"""
UniPath - Buildings & Floors API Router
Handles building listings and floor structure queries.
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Building, Floor
from ..schemas import BuildingResponse, FloorResponse

router = APIRouter(prefix="/buildings", tags=["Buildings"])


@router.get("", response_model=List[BuildingResponse])
def get_all_buildings(db: Session = Depends(get_db)):
    """
    Returns all campus buildings recorded in the directory.
    """
    buildings = db.query(Building).order_by(Building.building_id).all()
    return buildings


@router.get("/{building_id}/floors", response_model=List[FloorResponse])
def get_building_floors(
    building_id: int,
    db: Session = Depends(get_db)
):
    """
    Returns all floors associated with a specific building.
    Sorted by floor_number (e.g. -1, 0, 1, 2, 3).
    Raises 404 if the building does not exist.
    """
    b = db.query(Building).filter(Building.building_id == building_id).first()
    if not b:
        raise HTTPException(
            status_code=404,
            detail=f"Building with ID {building_id} not found."
        )
    floors = (
        db.query(Floor)
        .filter(Floor.building_id == building_id)
        .order_by(Floor.floor_number.nulls_last(), Floor.floor_id)
        .all()
    )
    return floors

