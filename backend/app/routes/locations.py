"""
UniPath - Locations API Router
Handles location retrieval, searching, and details.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from ..database import get_db
from ..models import Location, Building, Floor
from ..schemas import LocationResponse, LocationDetailResponse

router = APIRouter(prefix="/locations", tags=["Locations"])


def format_location_response(loc: Location) -> dict:
    """Helper to format location response with joined building and floor names."""
    return {
        "location_id": loc.location_id,
        "building_id": loc.building_id,
        "floor_id": loc.floor_id,
        "location_code": loc.location_code,
        "location_name": loc.location_name,
        "location_type": loc.location_type,
        "position_description": loc.position_description,
        "additional_details": loc.additional_details,
        "graph_node_key": loc.graph_node_key,
        "created_at": loc.created_at,
        "building_name": loc.building.building_name if loc.building else None,
        "floor_name": loc.floor.floor_name if loc.floor else None,
        "floor_number": loc.floor.floor_number if loc.floor else None,
    }


@router.get("", response_model=List[LocationResponse])
def get_all_locations(
    building_id: Optional[int] = Query(None, description="Filter by building ID"),
    floor_id: Optional[int] = Query(None, description="Filter by floor ID"),
    location_type: Optional[str] = Query(None, description="Filter by space type (e.g. Classroom, Computer Lab)"),
    db: Session = Depends(get_db)
):
    """
    Returns all campus locations with building and floor metadata.
    Supports optional filtering by building, floor, or location type.
    """
    query = db.query(Location)
    if building_id is not None:
        query = query.filter(Location.building_id == building_id)
    if floor_id is not None:
        query = query.filter(Location.floor_id == floor_id)
    if location_type:
        query = query.filter(Location.location_type.ilike(f"%{location_type}%"))
    
    locations = query.order_by(Location.building_id, Location.floor_id, Location.location_id).all()
    return [format_location_response(l) for l in locations]


@router.get("/search", response_model=List[LocationResponse])
def search_locations(
    q: str = Query("", description="Search term for location name, code, or position"),
    db: Session = Depends(get_db)
):
    """
    Case-insensitive search across location name, room code, position, and space type.
    """
    term = q.strip()
    if not term:
        # Empty search returns empty list
        return []

    pattern = f"%{term}%"
    locations = (
        db.query(Location)
        .filter(
            or_(
                Location.location_name.ilike(pattern),
                Location.location_code.ilike(pattern),
                Location.position_description.ilike(pattern),
                Location.location_type.ilike(pattern)
            )
        )
        .order_by(Location.location_id)
        .all()
    )
    return [format_location_response(l) for l in locations]


@router.get("/{location_id}", response_model=LocationDetailResponse)
def get_location_details(
    location_id: int,
    db: Session = Depends(get_db)
):
    """
    Returns the comprehensive details of a specific campus location by ID.
    Raises 404 if not found.
    """
    loc = db.query(Location).filter(Location.location_id == location_id).first()
    if not loc:
        raise HTTPException(
            status_code=404,
            detail=f"Location with ID {location_id} not found."
        )
    return format_location_response(loc)

