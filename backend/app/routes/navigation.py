"""
UniPath - Navigation API Router

Routes over the walkway graph in app/data/campus_graph.json (exported from the
frontend campus data by scripts/export-graph.mjs) using the hand-written
adjacency-list graph and min-heap Dijkstra in app/algorithms.

Edge weights are layout units used only to pick the shortest path; the API
never returns distances or walking times.
"""

import json
from functools import lru_cache
from pathlib import Path
from typing import List, Optional

from fastapi import APIRouter
from pydantic import BaseModel

from ..algorithms.graph import CampusGraph
from ..algorithms.dijkstra import dijkstra_shortest_path

router = APIRouter(prefix="/navigation", tags=["Navigation"])

GRAPH_FILE = Path(__file__).resolve().parent.parent / "data" / "campus_graph.json"


class RouteRequest(BaseModel):
    from_key: str
    to_key: str


class RouteResponse(BaseModel):
    status: str  # "ok" | "no_route" | "unknown_place"
    path: Optional[List[str]] = None
    floors: List[str] = []


@lru_cache(maxsize=1)
def load_graph() -> CampusGraph:
    data = json.loads(GRAPH_FILE.read_text())
    graph = CampusGraph()
    for n in data["nodes"]:
        graph.add_node(n["key"], n.get("place") or n["key"], n["kind"], n["floor"])
    for e in data["edges"]:
        graph.add_edge(e["from"], e["to"], e["w"], True, e["kind"])
    return graph


@router.get("/graph-summary")
def graph_summary():
    """Node and edge counts of the loaded walkway graph."""
    g = load_graph()
    edges = sum(len(v) for v in g.adjacency_list.values()) // 2
    return {"nodes": len(g), "edges": edges}


@router.post("/route", response_model=RouteResponse)
def route(payload: RouteRequest):
    """Shortest walking route between two places (node keys such as 'CR-2', 'G_ENTRY')."""
    g = load_graph()
    if payload.from_key not in g.nodes or payload.to_key not in g.nodes:
        return RouteResponse(status="unknown_place")

    path, _ = dijkstra_shortest_path(g, payload.from_key, payload.to_key)
    if not path:
        return RouteResponse(status="no_route")

    floors: List[str] = []
    for key in path:
        f = g.nodes[key].floor_id
        if not floors or floors[-1] != f:
            floors.append(f)
    return RouteResponse(status="ok", path=path, floors=floors)
