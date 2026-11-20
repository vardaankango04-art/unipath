/**
 * UniPath – FastAPI & PostgreSQL Backend Service Integration Layer
 * 
 * ============================================================================
 * ARCHITECTURAL CONTRACT FOR FASTAPI + POSTGRESQL BACKEND
 * ============================================================================
 * TRIPLE-BINDING PROTOCOL:
 * SVG Location (id) <---> PostgreSQL Record (location_id) <---> Graph Node (id)
 * 
 * When the FastAPI / PostgreSQL backend is active:
 * Set `VITE_API_URL=http://localhost:8000/api/v1` in .env
 * 
 * This service automatically detects whether a live backend is available.
 * If available, it queries the PostgreSQL database via FastAPI endpoints.
 * If running in offline / frontend demonstration mode, it seamlessly uses
 * the local DSA Graph, Adjacency List, and Dijkstra pathfinding engine.
 * ============================================================================
 */

import { 
  sampleLocations, 
  locationsById, 
  CAMPUS_FLOORS, 
  floorBlueprints, 
  adjacencyList, 
  graphNodes,
  dijkstraShortestPath 
} from '../data/locations';

const API_BASE_URL = import.meta.env?.VITE_API_URL || null;

/**
 * 1. Fetch all campus locations
 * Backend endpoint: GET /api/v1/locations
 */
export async function getCampusLocations() {
  if (API_BASE_URL) {
    try {
      const res = await fetch(`${API_BASE_URL}/locations`);
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn("Backend unavailable, using demonstration dataset:", err.message);
    }
  }
  return sampleLocations;
}

/**
 * 2. Fetch single location by its immutable unique ID
 * Backend endpoint: GET /api/v1/locations/{location_id}
 */
export async function getCampusLocationById(locationId) {
  if (API_BASE_URL) {
    try {
      const res = await fetch(`${API_BASE_URL}/locations/${locationId}`);
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn("Backend unavailable, using local hash map:", err.message);
    }
  }
  return locationsById[locationId] || null;
}

/**
 * 3. Fetch floor plan layout and rooms for a specific floor
 * Backend endpoint: GET /api/v1/floors/{floor_id}/blueprint
 */
export async function getFloorBlueprint(floorId = "G") {
  if (API_BASE_URL) {
    try {
      const res = await fetch(`${API_BASE_URL}/floors/${floorId}/blueprint`);
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn("Backend unavailable, using local floor blueprint:", err.message);
    }
  }
  return floorBlueprints[floorId] || floorBlueprints["G"];
}

/**
 * 4. Get supported campus floor levels
 * Returns: ['-1', 'G', '1', '2', '3', '4'] metadata
 */
export function getAvailableFloors() {
  return CAMPUS_FLOORS;
}

/**
 * 5. Compute Dijkstra Shortest Path
 * Backend endpoint: POST /api/v1/navigation/route
 * Payload: { start_node: string, destination_node: string, options: { accessible_only: boolean } }
 */
export async function computeRoute(startNodeId, destNodeId) {
  if (API_BASE_URL) {
    try {
      const res = await fetch(`${API_BASE_URL}/navigation/route`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ start_node: startNodeId, destination_node: destNodeId })
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn("Backend route endpoint unavailable, falling back to client-side Dijkstra engine");
    }
  }

  // Client-side Dijkstra calculation using Adjacency List
  return dijkstraShortestPath(startNodeId, destNodeId);
}

