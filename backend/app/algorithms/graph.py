"""
UniPath - DSA Graph Architecture (Adjacency List & Hash Map)
Implements topological campus graph with O(1) node lookup and adjacency list representation.
"""

from typing import Dict, List, Optional, Tuple
from collections import defaultdict


class GraphNodeData:
    """Represents a node in the campus navigation graph."""
    def __init__(self, node_key: str, node_name: str, node_type: str = "room", floor_id: Optional[int] = None):
        self.node_key = node_key
        self.node_name = node_name
        self.node_type = node_type
        self.floor_id = floor_id

    def __repr__(self):
        return f"GraphNodeData(key='{self.node_key}', name='{self.node_name}')"


class CampusGraph:
    """
    Campus Indoor Navigation Graph.
    
    Data Structures:
    - nodes: Python dict (Hash Map) for O(1) node metadata retrieval
    - adjacency_list: Dict mapping node_key -> List of (neighbor_key, distance_meters, path_description)
    """

    def __init__(self):
        # Hash Map for O(1) node lookup
        self.nodes: Dict[str, GraphNodeData] = {}
        # Adjacency List: node_key -> list of (neighbor_key, weight, description)
        self.adjacency_list: Dict[str, List[Tuple[str, float, Optional[str]]]] = defaultdict(list)

    def add_node(self, node_key: str, node_name: str, node_type: str = "room", floor_id: Optional[int] = None):
        """Adds a node to the hash map index."""
        self.nodes[node_key] = GraphNodeData(node_key, node_name, node_type, floor_id)

    def add_edge(self, from_node: str, to_node: str, distance_m: float, is_bidirectional: bool = True, path_desc: Optional[str] = None):
        """Adds a weighted edge to the adjacency list."""
        self.adjacency_list[from_node].append((to_node, float(distance_m), path_desc))
        if is_bidirectional:
            self.adjacency_list[to_node].append((from_node, float(distance_m), path_desc))

    def get_node(self, node_key: str) -> Optional[GraphNodeData]:
        """O(1) hash map retrieval."""
        return self.nodes.get(node_key)

    def get_neighbors(self, node_key: str) -> List[Tuple[str, float, Optional[str]]]:
        """Returns adjacent nodes from the adjacency list."""
        return self.adjacency_list.get(node_key, [])

    def __len__(self):
        return len(self.nodes)

