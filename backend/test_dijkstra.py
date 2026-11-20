"""
UniPath - Independent Dijkstra Algorithm Unit Test Suite
Verifies the DSA Dijkstra min-heap implementation on an isolated temporary graph.

Test Conditions Covered (per audit specification):
1. Shortest path between two connected nodes
2. Multi-route graph choosing the optimal shortest path
3. Unreachable/disconnected destination node
4. Starting node equal to destination node
5. Invalid or missing nodes
6. Correct total distance calculation
7. Correct step-by-step reconstructed path sequence

Note: Uses an isolated in-memory test graph.
Does NOT modify or insert test edges into the production PostgreSQL database.
"""

import sys
import os
import unittest
import math

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.app.algorithms.graph import CampusGraph
from backend.app.algorithms.dijkstra import dijkstra_shortest_path


class TestDijkstraAlgorithm(unittest.TestCase):
    """Unit test suite for Dijkstra's shortest path algorithm."""

    def setUp(self):
        """Set up an isolated in-memory graph for testing."""
        self.graph = CampusGraph()

        # Add sample nodes
        # Component 1: Connected building wing
        self.graph.add_node("ENTRANCE", "Main Entrance", "entrance")
        self.graph.add_node("FOYER", "Central Foyer", "junction")
        self.graph.add_node("HALLWAY_A", "North Hallway", "hallway")
        self.graph.add_node("HALLWAY_B", "South Hallway", "hallway")
        self.graph.add_node("CR_101", "Classroom 101", "room")
        self.graph.add_node("CR_102", "Classroom 102", "room")
        self.graph.add_node("LAB_1", "Computing Lab 1", "room")

        # Component 2: Isolated/disconnected node (different detached facility)
        self.graph.add_node("ISOLATED_ANNEX", "Remote Annex", "room")

    def test_1_connected_two_nodes(self):
        """1. Test shortest path between two directly connected nodes."""
        # Connect ENTRANCE <-> FOYER (distance 15.0 meters)
        self.graph.add_edge("ENTRANCE", "FOYER", 15.0, is_bidirectional=True)

        path, distance = dijkstra_shortest_path(self.graph, "ENTRANCE", "FOYER")
        self.assertIsNotNone(path, "Path should not be None for connected nodes")
        self.assertEqual(path, ["ENTRANCE", "FOYER"])
        self.assertEqual(distance, 15.0)

    def test_2_multiple_possible_routes(self):
        """2. Test a graph with multiple possible routes choosing the shortest."""
        # Route 1: ENTRANCE -> FOYER (15) -> HALLWAY_A (20) -> CR_101 (10) = 45m
        # Route 2: ENTRANCE -> HALLWAY_B (10) -> CR_101 (15) = 25m (Shorter!)
        # Route 3: Direct detour ENTRANCE -> CR_101 (60m)
        self.graph.add_edge("ENTRANCE", "FOYER", 15.0)
        self.graph.add_edge("FOYER", "HALLWAY_A", 20.0)
        self.graph.add_edge("HALLWAY_A", "CR_101", 10.0)

        self.graph.add_edge("ENTRANCE", "HALLWAY_B", 10.0)
        self.graph.add_edge("HALLWAY_B", "CR_101", 15.0)

        self.graph.add_edge("ENTRANCE", "CR_101", 60.0)

        path, distance = dijkstra_shortest_path(self.graph, "ENTRANCE", "CR_101")
        self.assertEqual(path, ["ENTRANCE", "HALLWAY_B", "CR_101"], "Should pick the 25m route via HALLWAY_B")
        self.assertEqual(distance, 25.0)

    def test_3_unreachable_destination(self):
        """3. Test an unreachable destination in a disconnected component."""
        self.graph.add_edge("ENTRANCE", "FOYER", 15.0)
        # ISOLATED_ANNEX has no connecting edges

        path, distance = dijkstra_shortest_path(self.graph, "ENTRANCE", "ISOLATED_ANNEX")
        self.assertIsNone(path, "Path to unreachable node must be None")
        self.assertTrue(math.isinf(distance), "Distance to unreachable node must be infinity")

    def test_4_start_equals_destination(self):
        """4. Test when starting node is equal to destination node."""
        path, distance = dijkstra_shortest_path(self.graph, "FOYER", "FOYER")
        self.assertEqual(path, ["FOYER"])
        self.assertEqual(distance, 0.0)

    def test_5_invalid_or_missing_nodes(self):
        """5. Test handling of invalid or non-existent node keys."""
        # Non-existent start
        path1, dist1 = dijkstra_shortest_path(self.graph, "NON_EXISTENT_START", "FOYER")
        self.assertIsNone(path1)
        self.assertTrue(math.isinf(dist1))

        # Non-existent target
        path2, dist2 = dijkstra_shortest_path(self.graph, "FOYER", "NON_EXISTENT_TARGET")
        self.assertIsNone(path2)
        self.assertTrue(math.isinf(dist2))

        # Both non-existent
        path3, dist3 = dijkstra_shortest_path(self.graph, "INVALID_A", "INVALID_B")
        self.assertIsNone(path3)
        self.assertTrue(math.isinf(dist3))

    def test_6_correct_total_distance(self):
        """6. Test exact accumulation and precision of total walking distance."""
        # ENTRANCE -> FOYER (12.45m) -> HALLWAY_A (8.30m) -> LAB_1 (14.25m)
        self.graph.add_edge("ENTRANCE", "FOYER", 12.45)
        self.graph.add_edge("FOYER", "HALLWAY_A", 8.30)
        self.graph.add_edge("HALLWAY_A", "LAB_1", 14.25)

        expected_total = round(12.45 + 8.30 + 14.25, 2)  # 35.00
        path, distance = dijkstra_shortest_path(self.graph, "ENTRANCE", "LAB_1")
        self.assertEqual(distance, expected_total)

    def test_7_correct_reconstructed_path(self):
        """7. Test complete ordered path sequence from start to target."""
        self.graph.add_edge("ENTRANCE", "FOYER", 10.0)
        self.graph.add_edge("FOYER", "HALLWAY_A", 5.0)
        self.graph.add_edge("HALLWAY_A", "CR_102", 7.0)

        path, _ = dijkstra_shortest_path(self.graph, "ENTRANCE", "CR_102")
        expected_sequence = ["ENTRANCE", "FOYER", "HALLWAY_A", "CR_102"]
        self.assertEqual(path, expected_sequence, "Path must strictly follow start-to-end topological sequence")


if __name__ == "__main__":
    print("=" * 60)
    print("RUNNING DIJKSTRA ALGORITHM INDEPENDENT UNIT TESTS")
    print("=" * 60)
    runner = unittest.TextTestRunner(verbosity=2)
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(TestDijkstraAlgorithm)
    result = runner.run(suite)
    if not result.wasSuccessful():
        sys.exit(1)
    print("\nALL 7 DIJKSTRA UNIT TESTS PASSED SUCCESSFULLY.")
