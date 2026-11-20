/**
 * UniPath campus data — the single source of truth for the frontend map,
 * search and routing, and for the walkway graph exported to the backend.
 *
 * Rooms come from "Campus Project.xlsx" and the hand-drawn floor sketches
 * (see floor order in each section). Coordinates are SVG units, not metres;
 * they are only used to draw the plan and as hidden edge weights.
 *
 * Positions marked `estimated: true` are not on the sketches and were placed
 * by best guess — correct them here when the real position is known.
 */

export const BUILDINGS = [
  { id: 'main', name: 'Main Building', floors: ['3', '2', '1', 'G', '-1'] },
  { id: 'civil', name: 'Civil Dept. Building', floors: ['C'] },
];

export const FLOOR_LABELS = {
  '-1': 'Floor −1',
  G: 'Ground Floor',
  1: 'Floor 1',
  2: 'Floor 2',
  3: 'Floor 3',
  C: 'Civil Dept. Building',
};

export const FLOOR_SHORT = { '-1': '−1', G: 'G', 1: '1', 2: '2', 3: '3', C: '' };

export const FLOOR_ORDER = { '-1': -1, G: 0, 1: 1, 2: 2, 3: 3, C: 0 };

// Room types drive the search grouping and map styling.
export const TYPE_LABELS = {
  classroom: 'Classroom',
  tutorial: 'Tutorial room',
  lab: 'Lab',
  theatre: 'Lecture theatre',
  office: 'Office',
  facility: 'Facility',
  faculty: 'Faculty cabins',
  stairs: 'Stairs',
  exit: 'Exit',
  entrance: 'Entrance',
};

const L = { x: 70, w: 175 }; // left column
const R = { x: 355, w: 175 }; // right column

/**
 * Each floor:
 *  - outline: building wall rect
 *  - halls: corridor rects (drawn)
 *  - walkways: polylines people walk along (graph is built from these)
 *  - rooms: places; door defaults to the corridor-facing edge midpoint
 */
export const FLOORS = {
  // ---------------------------------------------------------------- Floor −1
  // Only CR 1 and CR 2 are recorded here ("beside each other").
  '-1': {
    building: 'main',
    outline: { x: 40, y: 30, w: 520, h: 290 },
    halls: [{ x: 265, y: 40, w: 70, h: 270 }],
    walkways: [[[300, 70], [300, 290]]],
    rooms: [
      { key: 'B_STAIRS', name: 'Stairs', type: 'stairs', x: 268, y: 45, w: 64, h: 50, door: [300, 70], estimated: true },
      { key: 'CR-1', code: 'CR 1', name: 'Classroom 1', type: 'classroom', ...L, y: 110, h: 72, position: 'Beside CR 2', estimated: true },
      { key: 'CR-2', code: 'CR 2', name: 'Classroom 2', type: 'classroom', ...L, y: 192, h: 72, position: 'Beside CR 1', estimated: true },
    ],
  },

  // ------------------------------------------------------------ Ground floor
  // Left: CL-8, stairs, DLC, Library, LT-2, stairs, Registrar
  // Top: Placement Cell, exit · Right: CR-3, CR-4 · Bottom: Auditorium in lobby
  G: {
    building: 'main',
    outline: { x: 40, y: 30, w: 520, h: 712 },
    halls: [
      { x: 70, y: 100, w: 460, h: 36 },
      { x: 265, y: 100, w: 70, h: 490 },
      { x: 70, y: 585, w: 460, h: 145, rx: 10 },
    ],
    walkways: [
      [[105, 118], [495, 118]],
      [[300, 118], [300, 600]],
      [[300, 600], [105, 600], [105, 712], [495, 712], [495, 600], [300, 600]],
      [[300, 712], [300, 742]],
    ],
    rooms: [
      { key: 'PLACEMENT', name: 'Placement Cell', type: 'office', x: 150, y: 45, w: 150, h: 55, door: [225, 100] },
      { key: 'G_EXIT_N', name: 'Exit', label: 'Exit', type: 'exit', x: 380, y: 55, w: 90, h: 45, door: [425, 100] },
      { key: 'CL-8', code: 'CL 8', name: 'Computer Lab 8', type: 'lab', ...L, y: 145, h: 70, position: 'In front of CR 3 and CR 4' },
      { key: 'G_STAIRS_A', name: 'Stairs near Computer Lab 8', label: 'Stairs', type: 'stairs', ...L, y: 225, h: 38 },
      { key: 'DLC', name: 'DLC', type: 'facility', ...L, y: 273, h: 45 },
      { key: 'LIBRARY', name: 'Library', type: 'facility', ...L, y: 328, h: 52 },
      { key: 'LT-2', code: 'LT 2', name: 'Lecture Theatre 2', type: 'theatre', ...L, y: 390, h: 68, position: "In front of the Registrar's Office" },
      { key: 'G_STAIRS_B', name: 'Stairs near Lecture Theatre 2', label: 'Stairs', type: 'stairs', ...L, y: 468, h: 38 },
      { key: 'REGISTRAR', name: "Registrar's Office", type: 'office', ...L, y: 516, h: 58, position: 'In front of LT 2' },
      { key: 'CR-3', code: 'CR 3', name: 'Classroom 3', type: 'classroom', ...R, y: 145, h: 70, position: 'Beside CR 4, at the far end of the ground floor, in front of Computer Lab 8' },
      { key: 'CR-4', code: 'CR 4', name: 'Classroom 4', type: 'classroom', ...R, y: 225, h: 70, position: 'Beside CR 3, at the far end of the ground floor, in front of Computer Lab 8' },
      { key: 'AUDITORIUM', name: 'Auditorium', type: 'theatre', x: 150, y: 622, w: 300, h: 72, door: [300, 622] },
      { key: 'G_ENTRY', name: 'Main Entrance', label: 'Main entrance', type: 'entrance', x: 262, y: 742, w: 76, h: 0, door: [300, 742] },
    ],
  },

  // ----------------------------------------------------------------- Floor 1
  // Left: CR-10, CR-9, TR-5, TR-4, Faculty Cabins, TR-3, TR-2, TR-1, CL-9
  // Right: PHY-Lab, CR-5, CR-6, CR-7, CR-8, LT-3 · Stairs bottom centre
  1: {
    building: 'main',
    outline: { x: 40, y: 30, w: 520, h: 700 },
    halls: [
      { x: 265, y: 40, w: 70, h: 610 },
      { x: 70, y: 163, w: 460, h: 30 },
      { x: 70, y: 395, w: 460, h: 30 },
      { x: 70, y: 587, w: 460, h: 30 },
    ],
    walkways: [
      [[300, 48], [300, 650]],
      [[90, 178], [510, 178]],
      [[90, 410], [510, 410]],
      [[90, 602], [510, 602]],
    ],
    rooms: [
      { key: 'CR-10', code: 'CR 10', name: 'Classroom 10', type: 'classroom', ...L, y: 45, h: 50, position: "At the far end of the first floor, opposite the girls' washroom" },
      { key: 'CR-9', code: 'CR 9', name: 'Classroom 9', type: 'classroom', ...L, y: 103, h: 50, position: "At the far end of the first floor, opposite the girls' washroom" },
      { key: 'TR-5', code: 'TR 5', name: 'Tutorial Room 5', type: 'tutorial', ...L, y: 203, h: 44 },
      { key: 'TR-4', code: 'TR 4', name: 'Tutorial Room 4', type: 'tutorial', ...L, y: 255, h: 44 },
      { key: 'F1_FACULTY', name: 'Faculty Cabins', label: 'Faculty Cabins', type: 'faculty', ...L, y: 307, h: 78 },
      { key: 'TR-3', code: 'TR 3', name: 'Tutorial Room 3', type: 'tutorial', ...L, y: 435, h: 42 },
      { key: 'TR-2', code: 'TR 2', name: 'Tutorial Room 2', type: 'tutorial', ...L, y: 485, h: 42 },
      { key: 'TR-1', code: 'TR 1', name: 'Tutorial Room 1', type: 'tutorial', ...L, y: 535, h: 42 },
      { key: 'CL-9', code: 'CL 9', name: 'Computer Lab 9', type: 'lab', ...L, y: 627, h: 72, door: [157, 627], position: 'In front of the water dispenser' },
      { key: 'PHY-LAB', name: 'Physics Lab', label: 'PHY Lab', type: 'lab', ...R, y: 55, h: 58 },
      { key: 'CR-5', code: 'CR 5', name: 'Classroom 5', type: 'classroom', ...R, y: 203, h: 55, position: 'In a straight line with CR 6, CR 7 and CR 8' },
      { key: 'CR-6', code: 'CR 6', name: 'Classroom 6', type: 'classroom', ...R, y: 266, h: 55, position: 'In a straight line with CR 5, CR 7 and CR 8' },
      { key: 'CR-7', code: 'CR 7', name: 'Classroom 7', type: 'classroom', ...R, y: 435, h: 55, position: 'In a straight line with CR 5, CR 6 and CR 8' },
      { key: 'CR-8', code: 'CR 8', name: 'Classroom 8', type: 'classroom', ...R, y: 498, h: 55, position: 'In a straight line with CR 5, CR 6 and CR 7' },
      { key: 'LT-3', code: 'LT 3', name: 'Lecture Theatre 3', type: 'theatre', ...R, y: 627, h: 85, door: [442, 627] },
      { key: 'F1_STAIRS', name: 'Stairs', type: 'stairs', x: 268, y: 655, w: 64, h: 55, door: [300, 655] },
    ],
  },

  // ----------------------------------------------------------------- Floor 2
  // Left: CR-12, CR-11, Faculty Cabins · Right: Biotech Lab-04, ECE Labs 4/3/2
  2: {
    building: 'main',
    outline: { x: 40, y: 30, w: 520, h: 690 },
    halls: [
      { x: 265, y: 40, w: 70, h: 670 },
      { x: 70, y: 200, w: 460, h: 32 },
      { x: 70, y: 552, w: 460, h: 32 },
    ],
    walkways: [
      [[300, 50], [300, 700]],
      [[90, 216], [510, 216]],
      [[90, 568], [510, 568]],
    ],
    rooms: [
      { key: 'CR-12', code: 'CR 12', name: 'Classroom 12', type: 'classroom', ...L, y: 60, h: 58 },
      { key: 'CR-11', code: 'CR 11', name: 'Classroom 11', type: 'classroom', ...L, y: 128, h: 58 },
      { key: 'F2_FACULTY', name: 'Faculty Cabins', label: 'Faculty Cabins', type: 'faculty', ...L, y: 242, h: 300 },
      { key: 'BIOTECH-04', name: 'Biotech Lab 04', type: 'lab', ...R, y: 110, h: 65 },
      { key: 'ECE-4', name: 'ECE Lab 4', type: 'lab', ...R, y: 242, h: 62 },
      { key: 'ECE-3', name: 'ECE Lab 3', type: 'lab', ...R, y: 314, h: 62 },
      { key: 'ECE-2', name: 'ECE Lab 2', type: 'lab', ...R, y: 386, h: 62 },
      { key: 'TR-6', code: 'TR 6', name: 'Tutorial Room 6', type: 'tutorial', ...R, y: 594, h: 50, estimated: true },
      { key: 'TR-7', code: 'TR 7', name: 'Tutorial Room 7', type: 'tutorial', ...R, y: 654, h: 50, estimated: true },
      { key: 'F2_STAIRS', name: 'Stairs', type: 'stairs', x: 268, y: 458, w: 64, h: 60, door: [300, 488] },
    ],
  },

  // ----------------------------------------------------------------- Floor 3
  // Left: Apple Lab, Server Room, Robotics Lab, PHY-Lab-2, Biotech Lab
  // Right: CL-3, CL-5, CL-6 · Stairs centre
  3: {
    building: 'main',
    outline: { x: 40, y: 30, w: 520, h: 480 },
    halls: [
      { x: 265, y: 40, w: 70, h: 460 },
      { x: 70, y: 176, w: 460, h: 32 },
      { x: 70, y: 380, w: 460, h: 32 },
    ],
    walkways: [
      [[300, 50], [300, 490]],
      [[90, 192], [510, 192]],
      [[90, 396], [510, 396]],
    ],
    rooms: [
      { key: 'APPLE-LAB', name: 'Apple Lab', type: 'lab', ...L, y: 52, h: 60 },
      { key: 'SERVER', name: 'Server Room', type: 'facility', ...L, y: 122, h: 44 },
      { key: 'ROBOTICS', name: 'Robotics Lab', type: 'lab', ...L, y: 218, h: 58 },
      { key: 'PHY-LAB-2', name: 'Physics Lab 2', label: 'PHY Lab 2', type: 'lab', ...L, y: 286, h: 58 },
      { key: 'BIOTECH', name: 'Biotech Lab', type: 'lab', ...L, y: 422, h: 66 },
      { key: 'CL-3', code: 'CL 3', name: 'Computer Lab 3', type: 'lab', ...R, y: 52, h: 66 },
      { key: 'CL-5', code: 'CL 5', name: 'Computer Lab 5', type: 'lab', ...R, y: 218, h: 58 },
      { key: 'CL-6', code: 'CL 6', name: 'Computer Lab 6', type: 'lab', ...R, y: 286, h: 58 },
      { key: 'F3_STAIRS', name: 'Stairs', type: 'stairs', x: 268, y: 296, w: 64, h: 56, door: [300, 324] },
    ],
  },

  // ---------------------------------------------------- Civil Dept. Building
  // Separate building; floor and room positions are not recorded.
  C: {
    building: 'civil',
    outline: { x: 40, y: 30, w: 520, h: 300 },
    halls: [
      { x: 70, y: 152, w: 460, h: 38 },
      { x: 265, y: 152, w: 70, h: 168 },
    ],
    walkways: [
      [[105, 171], [495, 171]],
      [[300, 171], [300, 330]],
    ],
    rooms: [
      { key: 'CR-13', code: 'CR 13', name: 'Classroom 13', type: 'classroom', x: 70, y: 52, w: 140, h: 92, door: [140, 144], estimated: true },
      { key: 'CR-14', code: 'CR 14', name: 'Classroom 14', type: 'classroom', x: 230, y: 52, w: 140, h: 92, door: [300, 144], estimated: true },
      { key: 'CR-15', code: 'CR 15', name: 'Classroom 15', type: 'classroom', x: 390, y: 52, w: 140, h: 92, door: [460, 144], estimated: true },
      { key: 'C_ENTRY', name: 'Civil Dept. Building entrance', label: 'Entrance', type: 'entrance', x: 262, y: 330, w: 76, h: 0, door: [300, 330] },
    ],
  },
};

// Connections between floors / buildings: [a, b, kind]
export const LINKS = [
  ['B_STAIRS', 'G_STAIRS_B', 'stairs'], // estimated: which ground staircase reaches −1 isn't recorded
  ['G_STAIRS_A', 'F1_STAIRS', 'stairs'],
  ['G_STAIRS_B', 'F1_STAIRS', 'stairs'],
  ['F1_STAIRS', 'F2_STAIRS', 'stairs'],
  ['F2_STAIRS', 'F3_STAIRS', 'stairs'],
  ['G_ENTRY', 'C_ENTRY', 'outdoor'],
];

// Faculty from the "Faculty Cabin Directory" sheet. Cabin numbers aren't
// recorded, so each person points at the faculty cabin block on their floor.
export const FACULTY = [
  { name: 'Mrs. Meghna Dhalaria', room: 'F1_FACULTY' },
  { name: 'Mr. Gaurav Negi', room: 'F1_FACULTY' },
  { name: 'Mr. Aman Sharma', room: 'F1_FACULTY' },
  { name: 'Mr. Vivek Sehgal', room: 'F1_FACULTY' },
  { name: 'Mr. Amit Kumar', room: 'F1_FACULTY' },
  { name: 'Mr. Raja Durai', room: 'F2_FACULTY' },
  { name: 'Mr. Salman Raju Talluri', room: 'F2_FACULTY' },
  { name: 'Mr. Neelkanth', room: 'F2_FACULTY' },
  { name: 'Mr. Bhupendra Kumar Pathak', room: 'F2_FACULTY' },
  { name: 'Dr. Rakesh Bajaj', room: 'F2_FACULTY' },
  { name: 'Dr. Vaishali Dhiman', room: 'F2_FACULTY' },
  { name: 'Dr. Shruti Jain', room: 'F2_FACULTY' },
];

// ----------------------------------------------------------------- derived

function withDoor(room, floorId) {
  const { x, y, w, h } = room;
  let door = room.door;
  if (!door) door = x + w <= 265 ? [x + w, y + h / 2] : [x, y + h / 2];
  return { ...room, floor: floorId, building: FLOORS[floorId].building, door };
}

export const PLACES = Object.entries(FLOORS).flatMap(([floorId, f]) =>
  f.rooms.map((r) => withDoor(r, floorId)),
);

export const PLACE_BY_KEY = Object.fromEntries(PLACES.map((p) => [p.key, p]));

export function floorLabel(id) {
  return FLOOR_LABELS[id] ?? '';
}

export function placeSubtitle(p) {
  const where = p.building === 'civil' ? 'Civil Dept. Building' : floorLabel(p.floor);
  return p.code ? `${p.code} · ${where}` : where;
}

// Destinations people search for (no stairs/exits/entrances)
export const DESTINATIONS = PLACES.filter((p) => !['stairs', 'exit', 'entrance'].includes(p.type));

// Search index: places + faculty members
export const SEARCH_ITEMS = [
  ...PLACES.map((p) => ({
    id: p.key,
    place: p.key,
    title: p.name,
    subtitle: placeSubtitle(p),
    kind: p.type,
    terms: [p.name, p.code, p.label, TYPE_LABELS[p.type]].filter(Boolean).join(' ').toLowerCase(),
  })),
  ...FACULTY.map((f) => {
    const p = PLACE_BY_KEY[f.room];
    return {
      id: `faculty:${f.name}`,
      place: f.room,
      title: f.name,
      subtitle: `Faculty Cabins · ${floorLabel(p.floor)}`,
      kind: 'person',
      terms: `${f.name} faculty teacher professor`.toLowerCase(),
    };
  }),
];

export function searchPlaces(query, { includeWaypoints = true, limit = 8 } = {}) {
  const q = query.trim().toLowerCase().replace(/[-\s]+/g, ' ');
  const pool = SEARCH_ITEMS.filter((i) => includeWaypoints || !['stairs', 'exit', 'entrance'].includes(i.kind));
  if (!q) return pool.slice(0, limit);
  const norm = (s) => s.replace(/[-\s]+/g, ' ');
  const scored = [];
  for (const item of pool) {
    const hay = norm(item.terms);
    const title = norm(item.title.toLowerCase());
    let score = -1;
    if (title.startsWith(q)) score = 3;
    else if (hay.split(' ').some((w) => w.startsWith(q))) score = 2;
    else if (hay.includes(q) || hay.replace(/ /g, '').includes(q.replace(/ /g, ''))) score = 1;
    if (score >= 0) scored.push([score, item]);
  }
  scored.sort((a, b) => b[0] - a[0] || a[1].title.localeCompare(b[1].title, undefined, { numeric: true }));
  return scored.slice(0, limit).map(([, i]) => i);
}
