-- ============================================================================
-- UniPath Database Schema: unipath_db
-- Campus Indoor Navigation & Directory Relational System
-- ============================================================================

-- Drop tables in reverse order of foreign key dependencies
DROP TABLE IF EXISTS graph_edges CASCADE;
DROP TABLE IF EXISTS graph_nodes CASCADE;
DROP TABLE IF EXISTS faculty_members CASCADE;
DROP TABLE IF EXISTS locations CASCADE;
DROP TABLE IF EXISTS floors CASCADE;
DROP TABLE IF EXISTS buildings CASCADE;

-- ----------------------------------------------------------------------------
-- 1. BUILDINGS
-- Stores campus buildings and major complexes
-- ----------------------------------------------------------------------------
CREATE TABLE buildings (
    building_id SERIAL PRIMARY KEY,
    building_name VARCHAR(150) NOT NULL UNIQUE,
    description TEXT
);

-- ----------------------------------------------------------------------------
-- 2. FLOORS
-- Stores floor levels assigned to each building
-- ----------------------------------------------------------------------------
CREATE TABLE floors (
    floor_id SERIAL PRIMARY KEY,
    building_id INTEGER NOT NULL REFERENCES buildings(building_id) ON DELETE CASCADE,
    floor_name VARCHAR(100) NOT NULL,
    floor_number INTEGER, -- NULL for unspecified, -1 for basement, 0 for ground, 1 for 1st floor, etc.
    CONSTRAINT uq_building_floor UNIQUE (building_id, floor_name)
);

-- ----------------------------------------------------------------------------
-- 3. LOCATIONS
-- Stores actual searchable campus spaces (classrooms, labs, lecture theatres, offices, halls)
-- ----------------------------------------------------------------------------
CREATE TABLE locations (
    location_id SERIAL PRIMARY KEY,
    building_id INTEGER NOT NULL REFERENCES buildings(building_id) ON DELETE CASCADE,
    floor_id INTEGER REFERENCES floors(floor_id) ON DELETE SET NULL, -- NULL if actual floor is unknown (e.g. Civil Dept. Building)
    location_code VARCHAR(50), -- e.g. 'CR 1', 'CL 8', 'LT 2', or NULL
    location_name VARCHAR(200) NOT NULL,
    location_type VARCHAR(100) NOT NULL, -- 'Classroom', 'Computer Lab', 'Lecture Theatre', 'Office / Hall', 'Tutorial room'
    position_description TEXT, -- Relative position (e.g. 'Beside CR 2', 'In front of CR 3 and CR 4')
    additional_details TEXT, -- Additional landmarks or notes
    graph_node_key VARCHAR(100), -- Slot for future graph node binding
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_building_location_name UNIQUE (building_id, location_name)
);

-- ----------------------------------------------------------------------------
-- 4. FACULTY MEMBERS
-- Stores faculty directory with associated floor / cabin information
-- ----------------------------------------------------------------------------
CREATE TABLE faculty_members (
    faculty_id SERIAL PRIMARY KEY,
    faculty_name VARCHAR(200) NOT NULL,
    floor_label VARCHAR(100), -- As listed in sheet (e.g. 'First Floor', 'Second Floor')
    building_id INTEGER REFERENCES buildings(building_id) ON DELETE SET NULL,
    cabin_room_no VARCHAR(50), -- Preserved as NULL if not provided in sheet
    department VARCHAR(150), -- Preserved as NULL if not provided in sheet
    notes_contact TEXT, -- Preserved as NULL if not provided in sheet
    location_id INTEGER REFERENCES locations(location_id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_faculty_name UNIQUE (faculty_name)
);

-- ----------------------------------------------------------------------------
-- 5. GRAPH NODES (Architecture prepared for DSA navigation)
-- Represents topological nodes (rooms, entrances, corridor junctions, turning points)
-- ----------------------------------------------------------------------------
CREATE TABLE graph_nodes (
    graph_node_id SERIAL PRIMARY KEY,
    node_key VARCHAR(100) NOT NULL UNIQUE, -- e.g. 'node-main-cr1', 'node-corridor-101'
    node_name VARCHAR(200) NOT NULL,
    node_type VARCHAR(50) NOT NULL DEFAULT 'room', -- 'room', 'entrance', 'junction', 'turn', 'hallway'
    building_id INTEGER REFERENCES buildings(building_id) ON DELETE SET NULL,
    floor_id INTEGER REFERENCES floors(floor_id) ON DELETE SET NULL,
    location_id INTEGER REFERENCES locations(location_id) ON DELETE SET NULL,
    map_x DOUBLE PRECISION,
    map_y DOUBLE PRECISION,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 6. GRAPH EDGES (Architecture prepared for Dijkstra routing)
-- Represents walkable pathways between graph nodes
-- ----------------------------------------------------------------------------
CREATE TABLE graph_edges (
    edge_id SERIAL PRIMARY KEY,
    from_node_id INTEGER NOT NULL REFERENCES graph_nodes(graph_node_id) ON DELETE CASCADE,
    to_node_id INTEGER NOT NULL REFERENCES graph_nodes(graph_node_id) ON DELETE CASCADE,
    distance_m NUMERIC(7, 2) NOT NULL, -- Walking distance in meters
    is_bidirectional BOOLEAN NOT NULL DEFAULT TRUE,
    path_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_different_nodes CHECK (from_node_id != to_node_id)
);

-- ----------------------------------------------------------------------------
-- INDEXES FOR OPTIMIZED SEARCH & DSA QUERIES
-- ----------------------------------------------------------------------------
CREATE INDEX idx_locations_name ON locations (location_name);
CREATE INDEX idx_locations_name_lower ON locations (LOWER(location_name));
CREATE INDEX idx_locations_code ON locations (location_code);
CREATE INDEX idx_locations_code_lower ON locations (LOWER(location_code));
CREATE INDEX idx_locations_type ON locations (location_type);
CREATE INDEX idx_locations_building ON locations (building_id);
CREATE INDEX idx_locations_floor ON locations (floor_id);

CREATE INDEX idx_faculty_name ON faculty_members (faculty_name);
CREATE INDEX idx_faculty_name_lower ON faculty_members (LOWER(faculty_name));
CREATE INDEX idx_faculty_building ON faculty_members (building_id);

CREATE INDEX idx_floors_building ON floors (building_id);
CREATE INDEX idx_floors_number ON floors (floor_number);

CREATE INDEX idx_graph_nodes_key ON graph_nodes (node_key);
CREATE INDEX idx_graph_nodes_floor ON graph_nodes (floor_id);
CREATE INDEX idx_graph_edges_from ON graph_edges (from_node_id);
CREATE INDEX idx_graph_edges_to ON graph_edges (to_node_id);

