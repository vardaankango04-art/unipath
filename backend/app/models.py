"""
UniPath - SQLAlchemy Relational Models
Maps the 6 PostgreSQL tables for campus navigation and DSA algorithms.
"""

from sqlalchemy import (
    Column, Integer, String, Text, Numeric, 
    Boolean, ForeignKey, DateTime, Float
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base


class Building(Base):
    __tablename__ = "buildings"

    building_id = Column(Integer, primary_key=True, index=True)
    building_name = Column(String(150), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)

    # Relationships
    floors = relationship("Floor", back_populates="building", cascade="all, delete-orphan")
    locations = relationship("Location", back_populates="building")
    faculty_members = relationship("FacultyMember", back_populates="building")


class Floor(Base):
    __tablename__ = "floors"

    floor_id = Column(Integer, primary_key=True, index=True)
    building_id = Column(Integer, ForeignKey("buildings.building_id", ondelete="CASCADE"), nullable=False, index=True)
    floor_name = Column(String(100), nullable=False)
    floor_number = Column(Integer, nullable=True, index=True)

    # Relationships
    building = relationship("Building", back_populates="floors")
    locations = relationship("Location", back_populates="floor")


class Location(Base):
    __tablename__ = "locations"

    location_id = Column(Integer, primary_key=True, index=True)
    building_id = Column(Integer, ForeignKey("buildings.building_id", ondelete="CASCADE"), nullable=False, index=True)
    floor_id = Column(Integer, ForeignKey("floors.floor_id", ondelete="SET NULL"), nullable=True, index=True)
    location_code = Column(String(50), nullable=True, index=True)
    location_name = Column(String(200), nullable=False, index=True)
    location_type = Column(String(100), nullable=False, index=True)
    position_description = Column(Text, nullable=True)
    additional_details = Column(Text, nullable=True)
    graph_node_key = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    building = relationship("Building", back_populates="locations")
    floor = relationship("Floor", back_populates="locations")
    graph_node = relationship("GraphNode", back_populates="location", uselist=False)


class FacultyMember(Base):
    __tablename__ = "faculty_members"

    faculty_id = Column(Integer, primary_key=True, index=True)
    faculty_name = Column(String(200), nullable=False, index=True)
    floor_label = Column(String(100), nullable=True)
    building_id = Column(Integer, ForeignKey("buildings.building_id", ondelete="SET NULL"), nullable=True, index=True)
    cabin_room_no = Column(String(50), nullable=True)
    department = Column(String(150), nullable=True)
    notes_contact = Column(Text, nullable=True)
    location_id = Column(Integer, ForeignKey("locations.location_id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    building = relationship("Building", back_populates="faculty_members")


class GraphNode(Base):
    __tablename__ = "graph_nodes"

    graph_node_id = Column(Integer, primary_key=True, index=True)
    node_key = Column(String(100), unique=True, nullable=False, index=True)
    node_name = Column(String(200), nullable=False)
    node_type = Column(String(50), nullable=False, default="room")
    building_id = Column(Integer, ForeignKey("buildings.building_id", ondelete="SET NULL"), nullable=True)
    floor_id = Column(Integer, ForeignKey("floors.floor_id", ondelete="SET NULL"), nullable=True, index=True)
    location_id = Column(Integer, ForeignKey("locations.location_id", ondelete="SET NULL"), nullable=True)
    map_x = Column(Float, nullable=True)
    map_y = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    location = relationship("Location", back_populates="graph_node")
    outgoing_edges = relationship("GraphEdge", foreign_keys="GraphEdge.from_node_id", back_populates="from_node")
    incoming_edges = relationship("GraphEdge", foreign_keys="GraphEdge.to_node_id", back_populates="to_node")


class GraphEdge(Base):
    __tablename__ = "graph_edges"

    edge_id = Column(Integer, primary_key=True, index=True)
    from_node_id = Column(Integer, ForeignKey("graph_nodes.graph_node_id", ondelete="CASCADE"), nullable=False, index=True)
    to_node_id = Column(Integer, ForeignKey("graph_nodes.graph_node_id", ondelete="CASCADE"), nullable=False, index=True)
    distance_m = Column(Numeric(7, 2), nullable=False)
    is_bidirectional = Column(Boolean, nullable=False, default=True)
    path_description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    from_node = relationship("GraphNode", foreign_keys=[from_node_id], back_populates="outgoing_edges")
    to_node = relationship("GraphNode", foreign_keys=[to_node_id], back_populates="incoming_edges")

