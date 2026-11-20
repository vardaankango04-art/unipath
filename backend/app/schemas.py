"""
UniPath - Pydantic Request & Response Schemas
Defines validation and JSON serialization contracts for FastAPI endpoints.
"""

from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, ConfigDict


# -----------------------------------------------------------------------------
# Buildings
# -----------------------------------------------------------------------------
class BuildingBase(BaseModel):
    building_name: str
    description: Optional[str] = None


class BuildingResponse(BuildingBase):
    building_id: int

    model_config = ConfigDict(from_attributes=True)


# -----------------------------------------------------------------------------
# Floors
# -----------------------------------------------------------------------------
class FloorBase(BaseModel):
    building_id: int
    floor_name: str
    floor_number: Optional[int] = None


class FloorResponse(FloorBase):
    floor_id: int

    model_config = ConfigDict(from_attributes=True)


# -----------------------------------------------------------------------------
# Locations
# -----------------------------------------------------------------------------
class LocationBase(BaseModel):
    location_code: Optional[str] = None
    location_name: str
    location_type: str
    position_description: Optional[str] = None
    additional_details: Optional[str] = None
    graph_node_key: Optional[str] = None


class LocationResponse(LocationBase):
    location_id: int
    building_id: int
    floor_id: Optional[int] = None
    building_name: Optional[str] = None
    floor_name: Optional[str] = None
    floor_number: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)


class LocationDetailResponse(LocationResponse):
    created_at: Optional[datetime] = None


# -----------------------------------------------------------------------------
# Faculty Members
# -----------------------------------------------------------------------------
class FacultyMemberBase(BaseModel):
    faculty_name: str
    floor_label: Optional[str] = None
    cabin_room_no: Optional[str] = None
    department: Optional[str] = None
    notes_contact: Optional[str] = None


class FacultyMemberResponse(FacultyMemberBase):
    faculty_id: int
    building_id: Optional[int] = None
    building_name: Optional[str] = None
    location_id: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)


# -----------------------------------------------------------------------------
# Navigation & Graph DSA
# -----------------------------------------------------------------------------
class ShortestPathRequest(BaseModel):
    source_location_id: Optional[int] = None
    target_location_id: Optional[int] = None
    source_node_key: Optional[str] = None
    target_node_key: Optional[str] = None


class PathNodeDetail(BaseModel):
    node_key: str
    node_name: str
    node_type: str
    floor_id: Optional[int] = None
    floor_number: Optional[int] = None
    floor_name: Optional[str] = None
    map_x: Optional[float] = None
    map_y: Optional[float] = None


class ShortestPathResponse(BaseModel):
    status: str
    message: str
    nodes_available: int
    path: Optional[List[str]] = None
    total_distance: Optional[float] = None  # In map units
    total_distance_m: Optional[float] = None  # Backward-compatibility alias
    floors_crossed: Optional[List[str]] = None
    path_nodes: Optional[List[PathNodeDetail]] = None
    polyline_by_floor: Optional[dict] = None

