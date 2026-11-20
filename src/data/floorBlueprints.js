/**
 * UniPath – Verified Floor Blueprints & Schematic Geometries
 * Accurately traced from the 4 Main Building hand-drawn floor sketches:
 * Ground Floor, First Floor, Second Floor, Third Floor.
 * 
 * Rules:
 * - One clean SVG per floor (Ground, First, Second, Third)
 * - Room sides (left/right) and top-to-bottom order match sketches exactly
 * - Shaded bands with zigzag/hatch edges represent walkable cross-passages
 * - Every room shape has id="{location_code}" (e.g. id="CR-11") for clickability and styling
 * - Coordinate space [0 0 620 780] aligns with topological graph node coordinates
 */

export const MAIN_BUILDING_FLOORS = [
  { id: "G", label: "Ground Floor", shortLabel: "Ground", levelName: "Ground Floor & Main Foyer", description: "Auditorium, CL-8, LT-2, Library, Registrar" },
  { id: "1", label: "First Floor", shortLabel: "First", levelName: "First Academic Level", description: "Classrooms 5-10, Tutorial Rooms 1-5, CL-9, LT-3" },
  { id: "2", label: "Second Floor", shortLabel: "Second", levelName: "Second Academic Level", description: "CR-11, CR-12, Biotech Lab-04, ECE Labs 2-4, Faculty Cabins" },
  { id: "3", label: "Third Floor", shortLabel: "Third", levelName: "Third Academic Level", description: "Apple Lab, Robotics, CL-3, CL-5, CL-6, Biotech, PHY-2" },
];

export const schematicFloors = {
  // =========================================================================
  // GROUND FLOOR
  // Left: CL-8, Exit (stairs), DLC, Library, LT-2, Exit (stairs), Registrar Office
  // Top: Placement Cell, Exit
  // Right: CR-3, CR-4
  // Bottom: Auditorium with walkable lobby all around it, Entry below
  // =========================================================================
  "G": {
    floorId: "G",
    label: "Ground Floor",
    levelName: "Ground Floor & Main Foyer",
    viewBox: "0 0 620 780",
    corridors: [
      // Central vertical corridor between left and right rooms
      { x: 275, y: 95, width: 70, height: 475, type: "corridor" },
      // North horizontal corridor connecting Placement Cell & Exit
      { x: 240, y: 70, width: 235, height: 40, type: "corridor" },
      // Surrounding Walkable Lobby around the Auditorium
      { x: 100, y: 560, width: 420, height: 140, rx: 8, type: "lobby" },
    ],
    passages: [],
    stairs: [
      { id: "G_STAIRS_CL8_DLC", label: "Exit (Stairs)", x: 120, y: 195, width: 120, height: 35, goesTo: "First Floor Stairs", isExit: true },
      { id: "G_STAIRS_LT2", label: "Exit (Stairs)", x: 120, y: 455, width: 120, height: 35, goesTo: "First Floor Stairs", isExit: true },
      { id: "G_EXIT_PLACEMENT", label: "Exit", x: 425, y: 45, width: 80, height: 32, isExit: true, noStairs: true },
    ],
    entry: { x: 275, y: 710, width: 70, height: 32, label: "↑ ENTRY" },
    rooms: [
      // Left Column (Top to Bottom)
      { id: "CL-8", code: "CL-8", name: "Computer Lab 8", x: 100, y: 100, width: 150, height: 80, nodeKey: "G_CL8", locationId: 5 },
      { id: "DLC", code: "DLC", name: "DLC", x: 105, y: 245, width: 145, height: 45, nodeKey: "G_DLC", locationId: 121 },
      { id: "Library", code: "Library", name: "Library", x: 105, y: 305, width: 145, height: 50, nodeKey: "G_LIBRARY", locationId: 122 },
      { id: "LT-2", code: "LT-2", name: "Lecture Theatre 2", x: 100, y: 370, width: 150, height: 75, nodeKey: "G_LT2", locationId: 6 },
      { id: "Registrar Office", code: "Registrar Office", name: "Registrar's Office", x: 100, y: 505, width: 150, height: 55, nodeKey: "G_REGISTRAR", locationId: 7 },

      // Top Center
      { id: "Placement Cell", code: "Placement Cell", name: "Placement Cell", x: 235, y: 35, width: 150, height: 50, nodeKey: "G_PLACEMENT", locationId: 9 },

      // Right Column (Top to Bottom)
      { id: "CR-3", code: "CR-3", name: "Classroom 3", x: 370, y: 100, width: 150, height: 65, nodeKey: "G_CR3", locationId: 3 },
      { id: "CR-4", code: "CR-4", name: "Classroom 4", x: 370, y: 180, width: 150, height: 65, nodeKey: "G_CR4", locationId: 4 },

      // Bottom: Auditorium (Island inside the surrounding walkable lobby)
      { id: "Auditorium", code: "Auditorium", name: "Auditorium", x: 165, y: 575, width: 290, height: 95, nodeKey: "G_AUDITORIUM", locationId: 8, isAuditorium: true },
    ]
  },

  // =========================================================================
  // FIRST FLOOR
  // Left: CR-10, CR-9, TR-5, TR-4, Faculty Cabins, TR-3, TR-2, TR-1; CL-9 bottom-left
  // Right: PHY-Lab, CR-5, CR-6, CR-7, CR-8; LT-3 bottom-right
  // Central corridor with 3 shaded cross-passages, central stairs at bottom
  // =========================================================================
  "1": {
    floorId: "1",
    label: "First Floor",
    levelName: "First Academic Level",
    viewBox: "0 0 620 780",
    corridors: [
      { x: 275, y: 50, width: 70, height: 540, type: "corridor" },
    ],
    passages: [
      { id: "F1_PASS1", label: "Cross-Passage (Upper)", x: 180, y: 150, width: 260, height: 32 },
      { id: "F1_PASS2", label: "Cross-Passage (Middle)", x: 180, y: 385, width: 260, height: 35 },
      { id: "F1_PASS3", label: "Cross-Passage (Lower)", x: 180, y: 575, width: 260, height: 32 },
    ],
    stairs: [
      { id: "F1_STAIRS", label: "Stairs", x: 270, y: 625, width: 80, height: 50, goesTo: "Vertical Stairs (Ground & Second Floor)" }
    ],
    rooms: [
      // Left Column
      { id: "CR-10", code: "CR-10", name: "Classroom 10", x: 95, y: 45, width: 135, height: 45, nodeKey: "F1_CR10", locationId: 15 },
      { id: "CR-9", code: "CR-9", name: "Classroom 9", x: 95, y: 98, width: 135, height: 45, nodeKey: "F1_CR9", locationId: 14 },
      // Upper cross-passage at y=150
      { id: "TR-5", code: "TR-5", name: "Tutorial Room 5", x: 95, y: 192, width: 135, height: 40, nodeKey: "F1_TR5", locationId: 25 },
      { id: "TR-4", code: "TR-4", name: "Tutorial Room 4", x: 95, y: 247, width: 135, height: 40, nodeKey: "F1_TR4", locationId: 24 },
      { id: "Faculty Cabins", code: "Faculty Cabins", name: "Faculty Cabins", x: 95, y: 297, width: 135, height: 80, nodeKey: "F1_FACULTY", locationId: 124 },
      // Middle cross-passage at y=385
      { id: "TR-3", code: "TR-3", name: "Tutorial Room 3", x: 95, y: 430, width: 135, height: 38, nodeKey: "F1_TR3", locationId: 23 },
      { id: "TR-2", code: "TR-2", name: "Tutorial Room 2", x: 95, y: 478, width: 135, height: 38, nodeKey: "F1_TR2", locationId: 22 },
      { id: "TR-1", code: "TR-1", name: "Tutorial Room 1", x: 95, y: 526, width: 135, height: 38, nodeKey: "F1_TR1", locationId: 21 },
      // Lower cross-passage at y=575
      { id: "CL-9", code: "CL-9", name: "Computer Lab 9", x: 95, y: 620, width: 145, height: 60, nodeKey: "F1_CL9", locationId: 17 },

      // Right Column
      { id: "PHY-Lab", code: "PHY-Lab", name: "PHY-Lab", x: 390, y: 65, width: 135, height: 45, nodeKey: "F1_PHY_LAB", locationId: 123 },
      // Upper cross-passage at y=150
      { id: "CR-5", code: "CR-5", name: "Classroom 5", x: 390, y: 192, width: 135, height: 45, nodeKey: "F1_CR5", locationId: 10 },
      { id: "CR-6", code: "CR-6", name: "Classroom 6", x: 390, y: 252, width: 135, height: 45, nodeKey: "F1_CR6", locationId: 11 },
      // Middle cross-passage at y=385
      { id: "CR-7", code: "CR-7", name: "Classroom 7", x: 390, y: 432, width: 135, height: 45, nodeKey: "F1_CR7", locationId: 12 },
      { id: "CR-8", code: "CR-8", name: "Classroom 8", x: 390, y: 492, width: 135, height: 45, nodeKey: "F1_CR8", locationId: 13 },
      // Lower cross-passage at y=575
      { id: "LT-3", code: "LT-3", name: "Lecture Theatre 3", x: 385, y: 610, width: 145, height: 75, nodeKey: "F1_LT3", locationId: 16 }
    ]
  },

  // =========================================================================
  // SECOND FLOOR
  // Left: CR-12, CR-11, Faculty Cabins (large block)
  // Right: Biotech Lab-04, ECE Lab-4, ECE Lab-3, ECE Lab-2
  // Stairs in centre; upper passage between CR-11 & Faculty; lower passage below stairs
  // =========================================================================
  "2": {
    floorId: "2",
    label: "Second Floor",
    levelName: "Second Academic Level",
    viewBox: "0 0 620 780",
    corridors: [
      { x: 275, y: 60, width: 70, height: 480, type: "corridor" },
    ],
    passages: [
      { id: "F2_PASS1", label: "Cross-Passage (Upper)", x: 180, y: 220, width: 260, height: 35 },
      { id: "F2_PASS2", label: "Cross-Passage (Lower)", x: 180, y: 510, width: 260, height: 35 },
    ],
    stairs: [
      { id: "F2_STAIRS", label: "Stairs", x: 270, y: 385, width: 80, height: 60, goesTo: "Vertical Stairs (First & Third Floor)" }
    ],
    rooms: [
      // Left Column
      { id: "CR-12", code: "CR-12", name: "Classroom 12", x: 95, y: 65, width: 145, height: 55, nodeKey: "F2_CR12", locationId: 19 },
      { id: "CR-11", code: "CR-11", name: "Classroom 11", x: 95, y: 145, width: 145, height: 55, nodeKey: "F2_CR11", locationId: 18 },
      // Upper cross-passage at y=220
      { id: "Faculty Cabins", code: "Faculty Cabins", name: "Faculty Cabins", x: 95, y: 270, width: 145, height: 280, nodeKey: "F2_FACULTY", locationId: 129, isLargeBlock: true },

      // Right Column
      { id: "Biotech Lab-04", code: "Biotech Lab-04", name: "Biotech Lab-04", x: 380, y: 125, width: 150, height: 60, nodeKey: "F2_BIOTECH_04", locationId: 125 },
      // Upper cross-passage at y=220
      { id: "ECE Lab-4", code: "ECE Lab-4", name: "ECE Lab-4", x: 380, y: 270, width: 150, height: 60, nodeKey: "F2_ECE4", locationId: 126 },
      { id: "ECE Lab-3", code: "ECE Lab-3", name: "ECE Lab-3", x: 380, y: 350, width: 150, height: 60, nodeKey: "F2_ECE3", locationId: 127 },
      { id: "ECE Lab-2", code: "ECE Lab-2", name: "ECE Lab-2", x: 380, y: 430, width: 150, height: 60, nodeKey: "F2_ECE2", locationId: 128 },
      // Lower cross-passage at y=510 leads towards ECE Lab-2
    ]
  },

  // =========================================================================
  // THIRD FLOOR
  // Left: Apple Lab, Server Room, Robotics Lab, PHY-Lab-2, Biotech Lab
  // Right: CL-3, CL-5, CL-6
  // Stairs in centre; upper passage near CL-3; lower passage below stairs
  // =========================================================================
  "3": {
    floorId: "3",
    label: "Third Floor",
    levelName: "Third Academic Level",
    viewBox: "0 0 620 780",
    corridors: [
      { x: 275, y: 60, width: 70, height: 420, type: "corridor" },
    ],
    passages: [
      { id: "F3_PASS1", label: "Cross-Passage (Upper)", x: 180, y: 150, width: 260, height: 35 },
      { id: "F3_PASS2", label: "Cross-Passage (Lower)", x: 180, y: 390, width: 260, height: 35 },
    ],
    stairs: [
      { id: "F3_STAIRS", label: "Stairs", x: 270, y: 280, width: 80, height: 50, goesTo: "Vertical Stairs (Second Floor)" }
    ],
    rooms: [
      // Left Column
      { id: "Apple Lab", code: "Apple Lab", name: "Apple Lab", x: 95, y: 65, width: 145, height: 55, nodeKey: "F3_APPLE", locationId: 130 },
      { id: "Server Room", code: "Server Room", name: "Server Room", x: 105, y: 140, width: 125, height: 35, nodeKey: "F3_SERVER", locationId: 131 },
      // Upper cross-passage at y=150
      { id: "Robotics Lab", code: "Robotics Lab", name: "Robotics Lab", x: 95, y: 190, width: 145, height: 55, nodeKey: "F3_ROBOTICS", locationId: 132 },
      { id: "PHY-Lab-2", code: "PHY-Lab-2", name: "PHY-Lab-2", x: 95, y: 260, width: 145, height: 55, nodeKey: "F3_PHY2", locationId: 133 },
      // Lower cross-passage at y=390
      { id: "Biotech Lab", code: "Biotech Lab", name: "Biotech Lab", x: 95, y: 440, width: 150, height: 60, nodeKey: "F3_BIOTECH", locationId: 134 },

      // Right Column
      { id: "CL-3", code: "CL-3", name: "CL-3", x: 380, y: 70, width: 145, height: 60, nodeKey: "F3_CL3", locationId: 135 },
      // Upper cross-passage at y=150
      { id: "CL-5", code: "CL-5", name: "CL-5", x: 380, y: 240, width: 145, height: 55, nodeKey: "F3_CL5", locationId: 136 },
      { id: "CL-6", code: "CL-6", name: "Computer Lab 6", x: 380, y: 320, width: 145, height: 55, nodeKey: "F3_CL6", locationId: 20 },
      // Lower cross-passage at y=390 leads into CL-6
    ]
  }
};

