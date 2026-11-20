/**
 * UniPath - Frontend API Client
 * Connects React components to the FastAPI / PostgreSQL backend.
 * Provides live endpoints with graceful fallback if the backend is offline.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

/**
 * Maps PostgreSQL location record to frontend location structure
 */
export function mapDbLocationToFrontend(loc) {
  // Map floor_name to floorId used by SVG floor selector (null if unspecified)
  let floorId = null;
  if (loc.floor_number === -1 || (loc.floor_name && loc.floor_name.includes('-1'))) {
    floorId = '-1';
  } else if (loc.floor_number === 0 || (loc.floor_name && loc.floor_name.toLowerCase().includes('ground'))) {
    floorId = 'G';
  } else if (loc.floor_number === 1 || (loc.floor_name && loc.floor_name.toLowerCase().includes('first'))) {
    floorId = '1';
  } else if (loc.floor_number === 2 || (loc.floor_name && loc.floor_name.toLowerCase().includes('second'))) {
    floorId = '2';
  } else if (loc.floor_number === 3 || (loc.floor_name && loc.floor_name.toLowerCase().includes('third'))) {
    floorId = '3';
  } else if (loc.floor_number === 4 || (loc.floor_name && loc.floor_name.toLowerCase().includes('fourth'))) {
    floorId = '4';
  }

  // Map location_type to category filter ID
  let category = 'facilities';
  const lType = (loc.location_type || '').toLowerCase();
  if (lType.includes('classroom') || lType.includes('tutorial')) {
    category = 'classrooms';
  } else if (lType.includes('lab')) {
    category = 'laboratories';
  } else if (lType.includes('office') || lType.includes('hall') || lType.includes('theatre') || lType.includes('auditorium')) {
    category = 'offices';
  }

  // SVG coordinates coordinate mapping slot (for ground & upper floors)
  const defaultCoordinates = {
    'CR 1': { x: 190, y: 220 },
    'CR 2': { x: 430, y: 220 },
    'CR 3': { x: 170, y: 125 },
    'CR 4': { x: 450, y: 125 },
    'CL 8': { x: 170, y: 300 },
    'LT 2': { x: 310, y: 125 },
    "Registrar's Office": { x: 310, y: 460 },
    'Auditorium': { x: 450, y: 460 },
    'Placement Cell': { x: 170, y: 460 },
    'CR 5': { x: 190, y: 160 },
    'CR 6': { x: 430, y: 160 },
    'CR 7': { x: 190, y: 415 },
    'CR 8': { x: 430, y: 415 },
    'CL 9': { x: 430, y: 160 },
    'CL 6': { x: 310, y: 240 },
  };

  const lookupKey = loc.location_code || loc.location_name;
  const svgCoordinates = defaultCoordinates[lookupKey] || { x: 310, y: 240 };

  return {
    id: loc.graph_node_key || `loc-${loc.location_id}`,
    locationId: loc.location_id,
    nodeKey: loc.graph_node_key,
    name: loc.location_name,
    roomNumber: loc.location_code || loc.location_name,
    code: loc.location_code || loc.location_name,
    building: loc.building_name || 'Main Building',
    buildingId: loc.building_id,
    floor: loc.floor_name || 'Floor Not Specified',
    floorId: floorId,
    floorNumber: loc.floor_number,
    category: category,
    categoryLabel: loc.location_type,
    position: loc.position_description,
    description: loc.additional_details || loc.position_description || `${loc.location_type} in ${loc.building_name}`,
    svgCoordinates: svgCoordinates,
    isFromApi: true
  };
}

/**
 * Fetch all locations from PostgreSQL via FastAPI
 */
export async function getLocations(filters = {}) {
  try {
    const params = new URLSearchParams();
    if (filters.building_id) params.append('building_id', filters.building_id);
    if (filters.floor_id) params.append('floor_id', filters.floor_id);
    if (filters.location_type) params.append('location_type', filters.location_type);

    const url = `${API_BASE_URL}/locations${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.map(mapDbLocationToFrontend);
  } catch (err) {
    console.warn('[UniPath API] Failed to fetch locations from backend, using fallback:', err.message);
    return null;
  }
}

/**
 * Search locations via FastAPI search endpoint
 */
export async function searchLocationsApi(query) {
  try {
    if (!query || !query.trim()) return [];
    const url = `${API_BASE_URL}/locations/search?q=${encodeURIComponent(query.trim())}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.map(mapDbLocationToFrontend);
  } catch (err) {
    console.warn('[UniPath API] Failed to search locations via API:', err.message);
    return null;
  }
}

/**
 * Fetch specific location details by ID
 */
export async function getLocationDetails(locationId) {
  try {
    const response = await fetch(`${API_BASE_URL}/locations/${locationId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return mapDbLocationToFrontend(data);
  } catch (err) {
    console.warn(`[UniPath API] Failed to fetch details for location ${locationId}:`, err.message);
    return null;
  }
}

/**
 * Fetch all buildings
 */
export async function getBuildings() {
  try {
    const response = await fetch(`${API_BASE_URL}/buildings`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (err) {
    console.warn('[UniPath API] Failed to fetch buildings:', err.message);
    return null;
  }
}

/**
 * Fetch floors of a specific building
 */
export async function getBuildingFloors(buildingId) {
  try {
    const response = await fetch(`${API_BASE_URL}/buildings/${buildingId}/floors`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (err) {
    console.warn(`[UniPath API] Failed to fetch floors for building ${buildingId}:`, err.message);
    return null;
  }
}

/**
 * Fetch faculty directory
 */
export async function getFaculty(query = '') {
  try {
    const endpoint = query.trim() 
      ? `${API_BASE_URL}/faculty/search?q=${encodeURIComponent(query.trim())}`
      : `${API_BASE_URL}/faculty`;
    const response = await fetch(endpoint);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (err) {
    console.warn('[UniPath API] Failed to fetch faculty from backend:', err.message);
    return null;
  }
}

/**
 * Calculate shortest path between two points using backend Dijkstra
 */
export async function calculateShortestPathApi({ sourceLocationId, targetLocationId, sourceNodeKey, targetNodeKey }) {
  try {
    const body = {};
    if (sourceLocationId) body.source_location_id = sourceLocationId;
    if (targetLocationId) body.target_location_id = targetLocationId;
    if (sourceNodeKey) body.source_node_key = sourceNodeKey;
    if (targetNodeKey) body.target_node_key = targetNodeKey;

    const response = await fetch(`${API_BASE_URL}/navigation/shortest-path`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (err) {
    console.warn('[UniPath API] Failed to calculate shortest path:', err.message);
    return null;
  }
}

/**
 * Check backend connection status
 */
export async function checkApiHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) return false;
    const data = await response.json();
    return data.status === 'healthy';
  } catch {
    return false;
  }
}

