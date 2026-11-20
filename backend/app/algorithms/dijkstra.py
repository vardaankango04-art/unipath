"""
UniPath - Dijkstra's Shortest Path Algorithm
Computes the shortest walking distance between two campus nodes using min-heap priority queue.
"""

import heapq
from typing import Dict, List, Optional, Tuple
from .graph import CampusGraph


def dijkstra_shortest_path(
    graph: CampusGraph, 
    start_key: str, 
    target_key: str
) -> Tuple[Optional[List[str]], float]:
    """
    Computes shortest path from start_key to target_key using Dijkstra's algorithm.

    Time Complexity: O((V + E) * log V) using min-heap.
    Space Complexity: O(V) for distance table and predecessor mapping.

    Returns:
        (path_list, total_distance_meters)
        If no path exists, returns (None, float('inf')).
    """
    if start_key not in graph.nodes or target_key not in graph.nodes:
        return None, float('inf')

    if start_key == target_key:
        return [start_key], 0.0

    # Priority queue: entries of (current_distance, current_node)
    pq = [(0.0, start_key)]
    distances: Dict[str, float] = {start_key: 0.0}
    previous: Dict[str, Optional[str]] = {start_key: None}
    visited = set()

    while pq:
        curr_dist, curr_node = heapq.heappop(pq)

        if curr_node in visited:
            continue
        visited.add(curr_node)

        if curr_node == target_key:
            break

        for neighbor, weight, _ in graph.get_neighbors(curr_node):
            if neighbor in visited:
                continue

            new_dist = curr_dist + weight
            if new_dist < distances.get(neighbor, float('inf')):
                distances[neighbor] = new_dist
                previous[neighbor] = curr_node
                heapq.heappush(pq, (new_dist, neighbor))

    if target_key not in distances:
        return None, float('inf')

    # Reconstruct path by following predecessors
    path = []
    curr = target_key
    while curr is not None:
        path.append(curr)
        curr = previous[curr]
    path.reverse()

    return path, round(distances[target_key], 2)

