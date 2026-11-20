"""
UniPath - Navigation & Shortest Path API Router
Implements hand-written Dijkstra shortest path computation using adjacency list and min-heap.
All distance calculations are expressed in map units (never meters).
"""

import math
from typing import Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import GraphNode, GraphEdge, Location, Floor
from ..schemas import ShortestPathRequest, ShortestPathResponse, PathNodeDetail
from ..algorithms.graph import CampusGraph
from ..algorithms.dijkstra import dijkstra_shortest_path
from ..config import STAIR_COST

router = APIRouter(prefix="/navigation", tags=["Navigation"])


def _floor_number_to_code(f_num: Optional[int]) -> str:
    """Maps integer floor number to standard frontend floorId ('-1', 'G', '1', '2', '3')."""
    if f_num == -1:
        return "-1"
    elif f_num == 0:
        return "G"
    elif f_num is not None:
        return str(f_num)
    return "G"


@router.post("/shortest-path", response_model=ShortestPathResponse)
def calculate_shortest_path(
    payload: ShortestPathRequest,
    db: Session = Depends(get_db)
):
    """
    Computes optimal walking route between two campus locations using hand-written Dijkstra.
    Returns ordered path nodes, total distance in map units, floors crossed, and SVG polyline coordinates.
    """
    # 1. Fetch all graph nodes and floor metadata
    db_nodes = db.query(GraphNode).all()
    node_count = len(db_nodes)
    if node_count == 0:
        return ShortestPathResponse(
            status="no_route",
            message="No graph nodes are registered in the database.",
            nodes_available=0
        )

    db_floors = {f.floor_id: f for f in db.query(Floor).all()}
    node_lookup: Dict[str, GraphNode] = {n.node_key: n for n in db_nodes}

    # Location ID -> node_key lookup
    loc_to_node: Dict[int, str] = {}
    for n in db_nodes:
        if n.location_id is not None:
            loc_to_node[n.location_id] = n.node_key

    # 2. Resolve start node key
    start_key: Optional[str] = payload.source_node_key
    if not start_key and payload.source_location_id:
        start_key = loc_to_node.get(payload.source_location_id)
    if not start_key:
        # Default start point is the main campus entrance
        start_key = "G_ENTRY" if "G_ENTRY" in node_lookup else (db_nodes[0].node_key if db_nodes else None)

    # 3. Resolve target node key
    target_key: Optional[str] = payload.target_node_key
    if not target_key and payload.target_location_id:
        target_key = loc_to_node.get(payload.target_location_id)

    if not start_key or not target_key or start_key not in node_lookup or target_key not in node_lookup:
        return ShortestPathResponse(
            status="no_route",
            message=f"Invalid start ({start_key}) or destination ({target_key}) node specified.",
            nodes_available=node_count,
            path=None,
            total_distance=None,
            total_distance_m=None,
            floors_crossed=[],
            path_nodes=[],
            polyline_by_floor={}
        )

    # 4. Build in-memory CampusGraph from PostgreSQL records
    campus_graph = CampusGraph()
    for n in db_nodes:
        campus_graph.add_node(
            node_key=n.node_key,
            node_name=n.node_name,
            node_type=n.node_type,
            floor_id=n.floor_id
        )

    db_edges = db.query(GraphEdge).all()
    id_to_key = {n.graph_node_id: n.node_key for n in db_nodes}
    for e in db_edges:
        from_k = id_to_key.get(e.from_node_id)
        to_k = id_to_key.get(e.to_node_id)
        if from_k and to_k:
            campus_graph.add_edge(
                from_node=from_k,
                to_node=to_k,
                distance_m=float(e.distance_m),
                is_bidirectional=e.is_bidirectional,
                path_desc=e.path_description
            )

    # 5. Compute shortest path via hand-written Dijkstra
    path, raw_dist = dijkstra_shortest_path(campus_graph, start_key, target_key)

    if path is None or math.isinf(raw_dist):
        return ShortestPathResponse(
            status="no_route",
            message="No route available between the specified locations.",
            nodes_available=node_count,
            path=None,
            total_distance=None,
            total_distance_m=None,
            floors_crossed=[],
            path_nodes=[],
            polyline_by_floor={}
        )

    # 6. Format path nodes, floors crossed, and SVG polyline coordinates
    path_nodes: List[PathNodeDetail] = []
    floors_crossed: List[str] = []
    polyline_coords: Dict[str, List[str]] = {}

    for k in path:
        n = node_lookup[k]
        floor_obj = db_floors.get(n.floor_id)
        f_num = floor_obj.floor_number if floor_obj else None
        f_name = floor_obj.floor_name if floor_obj else "Unknown Floor"
        f_code = _floor_number_to_code(f_num)

        if f_name not in floors_crossed:
            floors_crossed.append(f_name)

        path_nodes.append(PathNodeDetail(
            node_key=n.node_key,
            node_name=n.node_name,
            node_type=n.node_type,
            floor_id=n.floor_id,
            floor_number=f_num,
            floor_name=f_name,
            map_x=n.map_x,
            map_y=n.map_y
        ))

        if n.map_x is not None and n.map_y is not None:
            if f_code not in polyline_coords:
                polyline_coords[f_code] = []
            polyline_coords[f_code].append(f"{n.map_x},{n.map_y}")

    polyline_by_floor = {
        code: " ".join(pts) for code, pts in polyline_coords.items() if pts
    }

    total_dist_map_units = round(raw_dist, 1)

    return ShortestPathResponse(
        status="success",
        message=f"Shortest path calculated across {len(floors_crossed)} floor(s).",
        nodes_available=node_count,
        path=path,
        total_distance=total_dist_map_units,
        total_distance_m=total_dist_map_units,
        floors_crossed=floors_crossed,
        path_nodes=path_nodes,
        polyline_by_floor=polyline_by_floor
    )
