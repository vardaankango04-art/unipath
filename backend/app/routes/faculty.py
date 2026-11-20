"""
UniPath - Faculty API Router
Handles faculty directory listings and search queries.
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from ..database import get_db
from ..models import FacultyMember, Building
from ..schemas import FacultyMemberResponse

router = APIRouter(prefix="/faculty", tags=["Faculty"])


def format_faculty_response(fac: FacultyMember) -> dict:
    """Helper to format faculty response with building metadata if available."""
    return {
        "faculty_id": fac.faculty_id,
        "faculty_name": fac.faculty_name,
        "floor_label": fac.floor_label,
        "cabin_room_no": fac.cabin_room_no,
        "department": fac.department,
        "notes_contact": fac.notes_contact,
        "building_id": fac.building_id,
        "building_name": fac.building.building_name if fac.building else None,
        "location_id": fac.location_id,
    }


@router.get("", response_model=List[FacultyMemberResponse])
def get_all_faculty(db: Session = Depends(get_db)):
    """
    Returns the complete faculty directory.
    """
    faculty = db.query(FacultyMember).order_by(FacultyMember.faculty_id).all()
    return [format_faculty_response(f) for f in faculty]


@router.get("/search", response_model=List[FacultyMemberResponse])
def search_faculty(
    q: str = Query("", description="Search term for faculty name or department"),
    db: Session = Depends(get_db)
):
    """
    Case-insensitive search across faculty members by name or department.
    """
    term = q.strip()
    if not term:
        return []

    pattern = f"%{term}%"
    faculty = (
        db.query(FacultyMember)
        .filter(
            or_(
                FacultyMember.faculty_name.ilike(pattern),
                FacultyMember.department.ilike(pattern),
                FacultyMember.floor_label.ilike(pattern)
            )
        )
        .order_by(FacultyMember.faculty_id)
        .all()
    )
    return [format_faculty_response(f) for f in faculty]


@router.get("/{faculty_id}", response_model=FacultyMemberResponse)
def get_faculty_by_id(
    faculty_id: int,
    db: Session = Depends(get_db)
):
    """
    Returns details of a specific faculty member by ID.
    Raises 404 if not found.
    """
    fac = db.query(FacultyMember).filter(FacultyMember.faculty_id == faculty_id).first()
    if not fac:
        raise HTTPException(
            status_code=404,
            detail=f"Faculty member with ID {faculty_id} not found."
        )
    return format_faculty_response(fac)

