/**
 * UniPath – Campus Navigation Data & Graph Architecture
 * 
 * ============================================================================
 * ARCHITECTURAL CONTRACT FOR FUTURE MULTI-FLOOR DATA & SVG REPLACEMENT
 * ============================================================================
 * NOTE: This is a TEMPORARY DEMONSTRATION DATASET for semester project evaluation.
 * It does NOT represent actual university campus records or final building layouts.
 * 
 * ACADEMIC BLOCK FLOOR SYSTEM:
 * - Floor -1 (Basement / Lower Ground)
 * - Ground Floor (Floor G)
 * - Floor 1
 * - Floor 2
 * - Floor 3
 * - Floor 4
 * 
 * TRIPLE-BINDING PROTOCOL FOR FUTURE DATA INTEGRATION:
 * Every campus location connects through a single immutable unique string `id`:
 * 
 * 1. SVG Floor Plan: Every room <g> element has id="{location.id}"
 * 2. Database Record: PostgreSQL / Excel column "location_id" = "{location.id}"
 * 3. DSA Graph Engine: Graph node { id: "{location.id}" } & adjacencyList["{location.id}"]
 * 
 * VERTICAL PATHWAY INTEGRATION NOTE:
 * Inter-floor connections (stairs, elevators, vertical shafts) are NOT invented.
 * `interFloorConnections` array is defined and ready to receive actual CAD pathway data.
 * ============================================================================
 */

// 1. Multi-Floor Definition & Metadata
export const CAMPUS_FLOORS = [
  { id: "-1", label: "Floor -1", shortLabel: "-1", description: "Lower Ground / Basement Level" },
  { id: "G", label: "Ground Floor", shortLabel: "G", description: "Ground Level & Main Foyer" },
  { id: "1", label: "Floor 1", shortLabel: "1", description: "First Academic Level & Computer Labs" },
  { id: "2", label: "Floor 2", shortLabel: "2", description: "Second Academic Level & Electronics" },
  { id: "3", label: "Floor 3", shortLabel: "3", description: "Third Academic Level & Seminar Halls" },
  { id: "4", label: "Floor 4", shortLabel: "4", description: "Fourth Academic Level & Faculty Wing" },
];

// 2. Multi-Floor Blueprints & Room Layouts (Demonstration Blueprint Slots)
export const floorBlueprints = {
  "-1": {
    floorId: "-1",
    label: "Floor -1",
    levelName: "Basement / Lower Ground Level",
    isDemonstrationSlot: true,
    rooms: [
      { id: "basement-archives", name: "Campus Records & Archives", x: 120, y: 160, width: 170, height: 120, code: "B-01", floorId: "-1" },
      { id: "basement-maintenance", name: "Facility Operations", x: 330, y: 160, width: 170, height: 120, code: "B-02", floorId: "-1" },
      { id: "basement-server-hub", name: "Network Infrastructure Hub", x: 220, y: 340, width: 180, height: 110, code: "B-03", floorId: "-1" }
    ],
    corridors: [
      { x: 100, y: 290, width: 420, height: 40 }
    ]
  },
  "G": {
    floorId: "G",
    label: "Ground Floor",
    levelName: "Ground Level & Main Foyer",
    isDemonstrationSlot: true,
    rooms: [
      { id: "classroom-101", name: "Lecture Hall 101", x: 100, y: 70, width: 140, height: 110, code: "LH-101", floorId: "G" },
      { id: "seminar-room-301", name: "Seminar Hall", x: 260, y: 70, width: 100, height: 110, code: "SH-301", floorId: "G" },
      { id: "classroom-202", name: "Classroom 202", x: 380, y: 70, width: 140, height: 110, code: "CR-202", floorId: "G" },

      { id: "laboratory-1", name: "Computing Lab 1", x: 100, y: 240, width: 140, height: 120, code: "LAB-101", floorId: "G" },
      { id: "library-reading-room", name: "Central Library", x: 260, y: 240, width: 100, height: 120, code: "LIB", floorId: "G" },
      { id: "laboratory-vlsi", name: "Electronics Lab", x: 380, y: 240, width: 140, height: 120, code: "LAB-201", floorId: "G" },

      { id: "faculty-cabin-101", name: "Faculty Offices", x: 100, y: 410, width: 140, height: 100, code: "FC-101", floorId: "G" },
      { id: "laboratory-physics", name: "Physics Lab", x: 260, y: 410, width: 100, height: 100, code: "LAB-301", floorId: "G" },
      { id: "cafeteria-main", name: "Campus Dining", x: 380, y: 410, width: 140, height: 100, code: "CAF", floorId: "G" },
    ],
    corridors: [
      { x: 240, y: 40, width: 140, height: 540 },
      { x: 60, y: 180, width: 500, height: 60 },
      { x: 60, y: 360, width: 500, height: 50 }
    ]
  },
  "1": {
    floorId: "1",
    label: "Floor 1",
    levelName: "First Academic Level & Computer Labs",
    isDemonstrationSlot: true,
    rooms: [
      { id: "laboratory-2", name: "Computing Lab 2", x: 100, y: 90, width: 180, height: 140, code: "LAB-102", floorId: "1" },
      { id: "laboratory-vlsi", name: "Hardware Systems Lab", x: 340, y: 90, width: 180, height: 140, code: "LAB-201", floorId: "1" },
      { id: "faculty-cabin-102", name: "CSE Faculty Suites", x: 100, y: 350, width: 180, height: 130, code: "FC-102", floorId: "1" },
      { id: "faculty-cabin-101", name: "Faculty Cabin 101", x: 340, y: 350, width: 180, height: 130, code: "FC-101", floorId: "1" }
    ],
    corridors: [
      { x: 80, y: 240, width: 460, height: 80 },
      { x: 270, y: 60, width: 80, height: 460 }
    ]
  },
  "2": {
    floorId: "2",
    label: "Floor 2",
    levelName: "Second Academic Level & Electronics",
    isDemonstrationSlot: true,
    rooms: [
      { id: "classroom-201", name: "Classroom 201", x: 100, y: 100, width: 180, height: 130, code: "CR-201", floorId: "2" },
      { id: "classroom-202", name: "Classroom 202", x: 340, y: 100, width: 180, height: 130, code: "CR-202", floorId: "2" },
      { id: "faculty-cabin-201", name: "HOD Office (ECE)", x: 100, y: 350, width: 180, height: 130, code: "HOD-201", floorId: "2" },
      { id: "faculty-cabin-301", name: "Applied Mathematics Office", x: 340, y: 350, width: 180, height: 130, code: "FC-301", floorId: "2" }
    ],
    corridors: [
      { x: 80, y: 240, width: 460, height: 80 }
    ]
  },
  "3": {
    floorId: "3",
    label: "Floor 3",
    levelName: "Third Academic Level & Seminar Halls",
    isDemonstrationSlot: true,
    rooms: [
      { id: "seminar-room-301", name: "Seminar Hall 301", x: 110, y: 90, width: 400, height: 180, code: "SH-301", floorId: "3" },
      { id: "seminar-room-302", name: "Executive Meeting Room", x: 160, y: 350, width: 300, height: 120, code: "EX-301", floorId: "3" }
    ],
    corridors: [
      { x: 100, y: 280, width: 420, height: 60 }
    ]
  },
  "4": {
    floorId: "4",
    label: "Floor 4",
    levelName: "Fourth Academic Level & Faculty Wing",
    isDemonstrationSlot: true,
    rooms: [
      { id: "faculty-dean-office", name: "Dean Academic Office", x: 100, y: 120, width: 180, height: 130, code: "ADM-401", floorId: "4" },
      { id: "conference-hall-401", name: "Academic Council Chamber", x: 340, y: 120, width: 180, height: 130, code: "CNF-401", floorId: "4" },
      { id: "faculty-research-center", name: "Research & Development Wing", x: 160, y: 340, width: 300, height: 120, code: "RD-401", floorId: "4" }
    ],
    corridors: [
      { x: 80, y: 260, width: 460, height: 70 }
    ]
  }
};

// Default demonstration floor rooms (Floor G)
export const demoFloorRooms = floorBlueprints["G"].rooms;

/**
 * Inter-Floor Pathways (Stairs, Elevators, Vertical Shafts)
 * IMPORTANT: Left unpopulated by default to strictly adhere to instructions:
 * "Do not invent lifts, stairs, corridors or inter-floor connections.
 * I will provide actual floor-plan pictures and Excel data."
 */
export const interFloorConnections = [];

// 3. Master Location Dataset (Schema ready for Excel/PostgreSQL import)
export const sampleLocations = [
  // Classrooms
  {
    id: "classroom-101",
    name: "Lecture Hall 101",
    category: "classrooms",
    categoryLabel: "Classroom",
    building: "Academic Wing 1",
    floorId: "G",
    floor: "Ground Floor",
    roomNumber: "LH-101",
    svgCoordinates: { x: 170, y: 130 },
    capacity: "120 Seats",
    department: "General Engineering & Applied Sciences",
    description: "Tiered smart lecture theatre equipped with digital projection and audio system."
  },
  {
    id: "classroom-201",
    name: "Classroom 201",
    category: "classrooms",
    categoryLabel: "Classroom",
    building: "Academic Wing 1",
    floorId: "2",
    floor: "Floor 2",
    roomNumber: "CR-201",
    svgCoordinates: { x: 190, y: 165 },
    capacity: "60 Seats",
    department: "Computer Science & Engineering",
    description: "Interactive classroom with multimedia display and group study configuration."
  },
  {
    id: "classroom-202",
    name: "Classroom 202",
    category: "classrooms",
    categoryLabel: "Classroom",
    building: "Academic Wing 2",
    floorId: "2",
    floor: "Floor 2",
    roomNumber: "CR-202",
    svgCoordinates: { x: 430, y: 165 },
    capacity: "60 Seats",
    department: "Electronics & Communication",
    description: "Standard lecture room with acoustic panels and dual display monitors."
  },
  {
    id: "seminar-room-301",
    name: "Seminar Hall 301",
    category: "classrooms",
    categoryLabel: "Classroom",
    building: "Central Complex",
    floorId: "3",
    floor: "Floor 3",
    roomNumber: "SH-301",
    svgCoordinates: { x: 310, y: 180 },
    capacity: "90 Seats",
    department: "University Academic Wing",
    description: "Conference and guest seminar hall with stepped seating and wireless microphones."
  },

  // Laboratories
  {
    id: "laboratory-1",
    name: "Computing Laboratory 1",
    category: "laboratories",
    categoryLabel: "Laboratory",
    building: "Academic Wing 1",
    floorId: "G",
    floor: "Ground Floor",
    roomNumber: "LAB-101",
    svgCoordinates: { x: 170, y: 300 },
    capacity: "45 Workstations",
    department: "Computer Science & Engineering",
    description: "High-performance networked computing facility with modern developer toolchains."
  },
  {
    id: "laboratory-2",
    name: "Computing Laboratory 2",
    category: "laboratories",
    categoryLabel: "Laboratory",
    building: "Academic Wing 1",
    floorId: "1",
    floor: "Floor 1",
    roomNumber: "LAB-102",
    svgCoordinates: { x: 190, y: 160 },
    capacity: "45 Workstations",
    department: "Computer Science & Engineering",
    description: "Data structures, algorithms and database development lab workstations."
  },
  {
    id: "laboratory-vlsi",
    name: "Electronics & VLSI Lab",
    category: "laboratories",
    categoryLabel: "Laboratory",
    building: "Academic Wing 2",
    floorId: "1",
    floor: "Floor 1",
    roomNumber: "LAB-201",
    svgCoordinates: { x: 430, y: 160 },
    capacity: "35 Benches",
    department: "Electronics & Communication",
    description: "Signal generators, digital oscilloscopes, and FPGA hardware experiment benches."
  },
  {
    id: "laboratory-physics",
    name: "Applied Physics Lab",
    category: "laboratories",
    categoryLabel: "Laboratory",
    building: "Central Complex",
    floorId: "G",
    floor: "Ground Floor",
    roomNumber: "LAB-301",
    svgCoordinates: { x: 310, y: 460 },
    capacity: "40 Students",
    department: "Physics & Material Science",
    description: "Laser optics, spectrometry, and semiconductor testing apparatus."
  },

  // Faculty Cabins
  {
    id: "faculty-cabin-101",
    name: "Faculty Cabin 101",
    category: "faculty",
    categoryLabel: "Faculty Cabin",
    building: "Academic Wing 1",
    floorId: "G",
    floor: "Ground Floor",
    roomNumber: "FC-101",
    svgCoordinates: { x: 170, y: 460 },
    capacity: "Individual Office",
    department: "Computer Science & Engineering",
    description: "Faculty consultation office. Office hours: Mon & Wed 2:00 PM – 4:00 PM."
  },
  {
    id: "faculty-cabin-102",
    name: "Faculty Cabin 102",
    category: "faculty",
    categoryLabel: "Faculty Cabin",
    building: "Academic Wing 1",
    floorId: "1",
    floor: "Floor 1",
    roomNumber: "FC-102",
    svgCoordinates: { x: 190, y: 415 },
    capacity: "Individual Office",
    department: "Computer Science & Engineering",
    description: "Faculty office for thesis advisement and project consultation."
  },
  {
    id: "faculty-cabin-301",
    name: "Faculty Cabin 301",
    category: "faculty",
    categoryLabel: "Faculty Cabin",
    building: "Central Complex",
    floorId: "2",
    floor: "Floor 2",
    roomNumber: "FC-301",
    svgCoordinates: { x: 430, y: 415 },
    capacity: "Individual Office",
    department: "Applied Mathematics",
    description: "Office for discrete mathematics and calculus course consultation."
  },
  {
    id: "faculty-cabin-401",
    name: "Faculty Cabin 401",
    category: "faculty",
    categoryLabel: "Faculty Cabin",
    building: "Academic Wing 1",
    floorId: "4",
    floor: "Floor 4",
    roomNumber: "FC-401",
    svgCoordinates: { x: 190, y: 350 },
    capacity: "Individual Office",
    department: "Data Science & AI",
    description: "Faculty research room for machine learning and artificial intelligence projects."
  },

  // 4. Institute Offices
  {
    id: "faculty-dean-office",
    name: "Dean Academic Office",
    category: "offices",
    categoryLabel: "Institute Office",
    building: "Administration Wing",
    floorId: "4",
    floor: "Floor 4",
    roomNumber: "ADM-401",
    svgCoordinates: { x: 190, y: 185 },
    capacity: "Dean Executive Suite",
    department: "University Administration",
    description: "Office of the Dean of Academic Affairs. Academic curriculum, faculty and student council consultations."
  },
  {
    id: "faculty-cabin-201",
    name: "HOD Office (ECE)",
    category: "offices",
    categoryLabel: "Institute Office",
    building: "Academic Wing 2",
    floorId: "2",
    floor: "Floor 2",
    roomNumber: "HOD-201",
    svgCoordinates: { x: 190, y: 415 },
    capacity: "Department Head",
    department: "Electronics & Communication",
    description: "Department head executive cabin. General administrative affairs and student consultations."
  },
  {
    id: "office-registrar",
    name: "Office of the Registrar",
    category: "offices",
    categoryLabel: "Institute Office",
    building: "Administration Wing",
    floorId: "4",
    floor: "Floor 4",
    roomNumber: "ADM-402",
    svgCoordinates: { x: 430, y: 185 },
    capacity: "Registrar Secretariat",
    department: "University Registry",
    description: "Student admissions, verified academic transcripts, bonafide certificates, and university enrollment records."
  },
  {
    id: "office-exam-cell",
    name: "Examination Control Cell",
    category: "offices",
    categoryLabel: "Institute Office",
    building: "Administration Wing",
    floorId: "4",
    floor: "Floor 4",
    roomNumber: "ADM-403",
    svgCoordinates: { x: 310, y: 350 },
    capacity: "Controller Office",
    department: "Examination Affairs",
    description: "Semester examination schedules, secure grade cards, degree evaluations, and hall tickets."
  },
  {
    id: "office-placement",
    name: "Training & Placement Cell",
    category: "offices",
    categoryLabel: "Institute Office",
    building: "Central Complex",
    floorId: "3",
    floor: "Floor 3",
    roomNumber: "TPC-302",
    svgCoordinates: { x: 430, y: 180 },
    capacity: "Corporate Relations",
    department: "Career Development Services",
    description: "Campus corporate placement drives, internships, technical interview coaching, and employer partnerships."
  },

  // 5. Campus Locations & Common Facilities
  {
    id: "library-reading-room",
    name: "Central Library & Study Hall",
    category: "facilities",
    categoryLabel: "Campus Location",
    building: "Central Complex",
    floorId: "G",
    floor: "Ground Floor",
    roomNumber: "LIB-01",
    svgCoordinates: { x: 310, y: 220 },
    capacity: "250 Seats",
    department: "Library Services",
    description: "Silent study cubicles, digital reference collection, and periodical reading wing."
  },
  {
    id: "cafeteria-main",
    name: "Campus Cafeteria & Dining",
    category: "facilities",
    categoryLabel: "Campus Location",
    building: "Central Complex",
    floorId: "G",
    floor: "Ground Floor",
    roomNumber: "CAF-01",
    svgCoordinates: { x: 440, y: 460 },
    capacity: "180 Seats",
    department: "Student Services",
    description: "Student cafeteria, hot beverage counter, and outdoor seating patio."
  },
  {
    id: "basement-archives",
    name: "Campus Records & Archives",
    category: "facilities",
    categoryLabel: "Campus Location",
    building: "Academic Wing 1",
    floorId: "-1",
    floor: "Floor -1",
    roomNumber: "B-01",
    svgCoordinates: { x: 205, y: 220 },
    capacity: "Restricted Access",
    department: "Central Archives",
    description: "University institutional records, historical publications, and thesis repository."
  },
  {
    id: "conference-hall-401",
    name: "Academic Council Chamber",
    category: "facilities",
    categoryLabel: "Campus Location",
    building: "Administration Wing",
    floorId: "4",
    floor: "Floor 4",
    roomNumber: "CNF-401",
    svgCoordinates: { x: 430, y: 185 },
    capacity: "50 Seats",
    department: "University Senate",
    description: "Formal meeting hall for academic senate and university governance committees."
  }
];

// 4. Hash Map for O(1) Location Lookup
export const locationsById = sampleLocations.reduce((map, location) => {
  map[location.id] = location;
  return map;
}, {});

export const getLocationById = (id) => locationsById[id] || null;

// 5. Graph Data Structure Nodes (DSA Architecture)
// Walkable nodes and corridor intersections on the indoor floor-plan
export const graphNodes = [
  { id: "node-entrance", label: "Main Foyer Entrance", x: 310, y: 550, isRoom: false, floorId: "G" },
  { id: "node-south-cross", label: "South Corridor Crossway", x: 310, y: 480, isRoom: false, floorId: "G" },
  { id: "node-mid-cross", label: "Central Corridor Atrium", x: 310, y: 380, isRoom: false, floorId: "G" },
  { id: "node-north-cross", label: "North Corridor Crossway", x: 310, y: 210, isRoom: false, floorId: "G" },
  { id: "node-west-1", label: "West Wing Junction 1", x: 170, y: 480, isRoom: false, floorId: "G" },
  { id: "node-west-2", label: "West Wing Junction 2", x: 170, y: 380, isRoom: false, floorId: "G" },
  { id: "node-west-3", label: "West Wing Junction 3", x: 170, y: 210, isRoom: false, floorId: "G" },
  { id: "node-east-1", label: "East Wing Junction 1", x: 440, y: 480, isRoom: false, floorId: "G" },
  { id: "node-east-2", label: "East Wing Junction 2", x: 440, y: 380, isRoom: false, floorId: "G" },
  { id: "node-east-3", label: "East Wing Junction 3", x: 440, y: 210, isRoom: false, floorId: "G" },
  // Room entry nodes
  { id: "classroom-101", label: "Lecture Hall 101", x: 170, y: 130, isRoom: true, floorId: "G" },
  { id: "classroom-202", label: "Classroom 202", x: 440, y: 130, isRoom: true, floorId: "G" },
  { id: "laboratory-1", label: "Computing Laboratory 1", x: 170, y: 300, isRoom: true, floorId: "G" },
  { id: "laboratory-vlsi", label: "Electronics & VLSI Lab", x: 440, y: 300, isRoom: true, floorId: "G" },
  { id: "faculty-cabin-101", label: "Faculty Cabin 101", x: 170, y: 460, isRoom: true, floorId: "G" },
  { id: "library-reading-room", label: "Central Library", x: 310, y: 220, isRoom: true, floorId: "G" }
];

// 6. Adjacency List for Graph Connections (DSA Architecture)
// Node -> [{ node, weight (meters) }]
export const adjacencyList = {
  "node-entrance": [
    { node: "node-south-cross", weight: 35 }
  ],
  "node-south-cross": [
    { node: "node-entrance", weight: 35 },
    { node: "node-west-1", weight: 45 },
    { node: "node-east-1", weight: 45 },
    { node: "node-mid-cross", weight: 40 }
  ],
  "node-mid-cross": [
    { node: "node-south-cross", weight: 40 },
    { node: "node-west-2", weight: 45 },
    { node: "node-east-2", weight: 45 },
    { node: "node-north-cross", weight: 50 }
  ],
  "node-north-cross": [
    { node: "node-mid-cross", weight: 50 },
    { node: "node-west-3", weight: 45 },
    { node: "node-east-3", weight: 45 },
    { node: "library-reading-room", weight: 15 }
  ],
  "node-west-1": [
    { node: "node-south-cross", weight: 45 },
    { node: "faculty-cabin-101", weight: 12 }
  ],
  "node-west-2": [
    { node: "node-mid-cross", weight: 45 },
    { node: "laboratory-1", weight: 15 }
  ],
  "node-west-3": [
    { node: "node-north-cross", weight: 45 },
    { node: "classroom-101", weight: 20 }
  ],
  "node-east-1": [
    { node: "node-south-cross", weight: 45 }
  ],
  "node-east-2": [
    { node: "node-mid-cross", weight: 45 },
    { node: "laboratory-vlsi", weight: 15 }
  ],
  "node-east-3": [
    { node: "node-north-cross", weight: 45 },
    { node: "classroom-202", weight: 20 }
  ],
  "faculty-cabin-101": [{ node: "node-west-1", weight: 12 }],
  "laboratory-1": [{ node: "node-west-2", weight: 15 }],
  "classroom-101": [{ node: "node-west-3", weight: 20 }],
  "laboratory-vlsi": [{ node: "node-east-2", weight: 15 }],
  "classroom-202": [{ node: "node-east-3", weight: 20 }],
  "library-reading-room": [{ node: "node-north-cross", weight: 15 }]
};

// 7. Dijkstra Shortest Path Engine (DSA Architecture)
export function dijkstraShortestPath(startNodeId, targetNodeId, graph = adjacencyList) {
  if (!graph[startNodeId] || !graph[targetNodeId]) {
    return null;
  }
  const distances = {};
  const previous = {};
  const unvisited = new Set(Object.keys(graph));

  for (const node of Object.keys(graph)) {
    distances[node] = node === startNodeId ? 0 : Infinity;
  }

  while (unvisited.size > 0) {
    let current = null;
    for (const node of unvisited) {
      if (current === null || distances[node] < distances[current]) {
        current = node;
      }
    }

    if (distances[current] === Infinity || current === targetNodeId) {
      break;
    }

    unvisited.delete(current);

    for (const neighbor of graph[current] || []) {
      if (unvisited.has(neighbor.node)) {
        const alt = distances[current] + neighbor.weight;
        if (alt < distances[neighbor.node]) {
          distances[neighbor.node] = alt;
          previous[neighbor.node] = current;
        }
      }
    }
  }

  if (distances[targetNodeId] === Infinity) return null;

  const path = [];
  let curr = targetNodeId;
  while (curr) {
    path.unshift(curr);
    curr = previous[curr];
  }

  return {
    path,
    distanceMeters: distances[targetNodeId],
    distanceLabel: `${distances[targetNodeId]} meters`,
    estimatedMinutes: Math.max(1, Math.round(distances[targetNodeId] / 50))
  };
}

// 8. Sample Predefined Routes for Demonstration
export const sampleFloorRoutes = {
  "default": {
    startPoint: { x: 310, y: 550, label: "Main Foyer Entrance" },
    destination: { x: 170, y: 300, label: "Computing Laboratory 1" },
    polyline: "310,550 310,380 170,380 170,300",
    distance: "85 meters",
    estimatedTime: "2 min walk",
    instructions: "Walk straight north along the Central Corridor, turn left into West Wing, laboratory entrance on right."
  },
  "laboratory-1": {
    startPoint: { x: 310, y: 550, label: "Main Foyer Entrance" },
    destination: { x: 170, y: 300, label: "Computing Laboratory 1" },
    polyline: "310,550 310,380 170,380 170,300",
    distance: "85 meters",
    estimatedTime: "2 min walk",
    instructions: "Walk straight north along the Central Corridor, turn left into West Wing, laboratory entrance on right."
  },
  "classroom-101": {
    startPoint: { x: 310, y: 550, label: "Main Foyer Entrance" },
    destination: { x: 170, y: 130, label: "Lecture Hall 101" },
    polyline: "310,550 310,210 170,210 170,130",
    distance: "140 meters",
    estimatedTime: "3 min walk",
    instructions: "Walk north to the North Corridor Crossway, turn left, proceed 30 m to Lecture Hall 101."
  },
  "classroom-202": {
    startPoint: { x: 310, y: 550, label: "Main Foyer Entrance" },
    destination: { x: 440, y: 130, label: "Classroom 202" },
    polyline: "310,550 310,210 440,210 440,130",
    distance: "145 meters",
    estimatedTime: "3 min walk",
    instructions: "Proceed north through the central corridor toward North Crossway, destination in East Wing."
  },
  "faculty-cabin-101": {
    startPoint: { x: 310, y: 550, label: "Main Foyer Entrance" },
    destination: { x: 170, y: 460, label: "Faculty Cabin 101" },
    polyline: "310,550 310,480 170,480 170,460",
    distance: "55 meters",
    estimatedTime: "1 min walk",
    instructions: "Turn left at first corridor crossway, Faculty Cabin 101 is the second door on the right."
  },
  "library-reading-room": {
    startPoint: { x: 310, y: 550, label: "Main Foyer Entrance" },
    destination: { x: 310, y: 220, label: "Central Library" },
    polyline: "310,550 310,220",
    distance: "70 meters",
    estimatedTime: "1.5 min walk",
    instructions: "Walk straight north through Central Corridor directly into Central Library glass doors."
  },
  "faculty-dean-office": {
    startPoint: { x: 310, y: 550, label: "Main Foyer Entrance" },
    destination: { x: 190, y: 185, label: "Dean Academic Office" },
    polyline: "310,550 310,210 190,210 190,185",
    distance: "120 meters",
    estimatedTime: "2.5 min walk",
    instructions: "Take central stairs or elevator to Floor 4, proceed down the Executive Administrative corridor."
  },
  "office-registrar": {
    startPoint: { x: 310, y: 550, label: "Main Foyer Entrance" },
    destination: { x: 430, y: 185, label: "Office of the Registrar" },
    polyline: "310,550 310,210 430,210 430,185",
    distance: "125 meters",
    estimatedTime: "2.5 min walk",
    instructions: "Navigate to Floor 4 Administration Wing, turn right into Registry Secretariat."
  },
  "office-exam-cell": {
    startPoint: { x: 310, y: 550, label: "Main Foyer Entrance" },
    destination: { x: 310, y: 350, label: "Examination Control Cell" },
    polyline: "310,550 310,350",
    distance: "95 meters",
    estimatedTime: "2 min walk",
    instructions: "Proceed north past the central atrium, entrance situated directly along Central Corridor."
  },
  "office-placement": {
    startPoint: { x: 310, y: 550, label: "Main Foyer Entrance" },
    destination: { x: 430, y: 180, label: "Training & Placement Cell" },
    polyline: "310,550 310,210 430,210 430,180",
    distance: "110 meters",
    estimatedTime: "2.5 min walk",
    instructions: "Ascend to Floor 3 Central Complex, East Wing corporate interviews suite."
  }
};
