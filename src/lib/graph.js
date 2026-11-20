/**
 * UniPath walkway graph + Dijkstra (min-heap) shortest path.
 *
 * The graph is built from the corridor polylines in src/data/campus.js:
 *  - every room door connects to the nearest point on a corridor
 *  - corridor points connect to their neighbours along the corridor
 *  - stairs connect between floors (LINKS)
 * Edge weights are layout distances; they're never shown to people.
 *
 * The same graph is exported to backend/app/data/campus_graph.json by
 * scripts/export-graph.mjs so the FastAPI Dijkstra uses identical data.
 */
import { FLOORS, LINKS, PLACES, PLACE_BY_KEY, FLOOR_ORDER } from '../data/campus.js';

export const STAIR_COST = 150;
export const OUTDOOR_COST = 600;

const ptKey = (floor, [x, y]) => `${floor}@${Math.round(x)},${Math.round(y)}`;
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

function projectOnSegment(p, a, b) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len2 = dx * dx + dy * dy || 1;
  const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / len2));
  return [a[0] + t * dx, a[1] + t * dy];
}

export function buildGraph() {
  const nodes = {}; // key -> { key, floor, x, y, kind, place? }
  const edges = []; // { from, to, w, kind }

  const addNode = (key, floor, [x, y], kind, place) => {
    if (!nodes[key]) nodes[key] = { key, floor, x: Math.round(x), y: Math.round(y), kind, ...(place ? { place } : {}) };
    return key;
  };

  for (const [floorId, floor] of Object.entries(FLOORS)) {
    const segments = floor.walkways.flatMap((line) => line.slice(1).map((b, i) => [line[i], b]));
    const onSegment = segments.map(() => []);

    // Corridor vertices that touch another segment (T-junctions)
    floor.walkways.forEach((line) => line.forEach((p) => {
      segments.forEach(([a, b], si) => {
        if (dist(projectOnSegment(p, a, b), p) < 0.5) onSegment[si].push(p);
      });
    }));

    // Corridors that cross each other (X-junctions)
    segments.forEach(([a, b], si) => segments.forEach(([c, d], sj) => {
      if (sj <= si) return;
      const den = (b[0] - a[0]) * (d[1] - c[1]) - (b[1] - a[1]) * (d[0] - c[0]);
      if (Math.abs(den) < 1e-9) return;
      const t = ((c[0] - a[0]) * (d[1] - c[1]) - (c[1] - a[1]) * (d[0] - c[0])) / den;
      const u = ((c[0] - a[0]) * (b[1] - a[1]) - (c[1] - a[1]) * (b[0] - a[0])) / den;
      if (t < 0 || t > 1 || u < 0 || u > 1) return;
      const p = [a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])];
      onSegment[si].push(p);
      onSegment[sj].push(p);
    }));

    // Rooms: door node + nearest corridor point. Side rooms (no explicit
    // door) step straight out sideways into the corridor.
    for (const place of PLACES.filter((p) => p.floor === floorId)) {
      const sideways = !FLOORS[floorId].rooms.find((r) => r.key === place.key).door;
      let best = null;
      for (const pass of sideways ? [true, false] : [false]) {
        segments.forEach(([a, b], si) => {
          const q = projectOnSegment(place.door, a, b);
          if (pass && Math.abs(q[1] - place.door[1]) > 0.5) return;
          const d = dist(q, place.door);
          if (!best || d < best.d) best = { d, q, si };
        });
        if (best) break;
      }
      const hall = best.q.map(Math.round);
      onSegment[best.si].push(hall);
      addNode(place.key, floorId, place.door, place.type, place.key);
      const hallKey = addNode(ptKey(floorId, hall), floorId, hall, 'hall');
      if (hallKey !== place.key) edges.push({ from: place.key, to: hallKey, w: dist(place.door, hall), kind: 'door' });
    }

    // Chain points along each segment
    segments.forEach(([a, b], si) => {
      const pts = [a, b, ...onSegment[si]]
        .map((p) => [Math.round(p[0]), Math.round(p[1])])
        .sort((p, q) => dist(a, p) - dist(a, q));
      for (let i = 1; i < pts.length; i++) {
        const k1 = addNode(ptKey(floorId, pts[i - 1]), floorId, pts[i - 1], 'hall');
        const k2 = addNode(ptKey(floorId, pts[i]), floorId, pts[i], 'hall');
        if (k1 !== k2) edges.push({ from: k1, to: k2, w: dist(pts[i - 1], pts[i]), kind: 'hall' });
      }
    });
  }

  // A room door sitting exactly on a corridor point shares coordinates with a
  // hall node: link them with a zero-cost edge.
  for (const p of PLACES) {
    const hk = ptKey(p.floor, p.door);
    if (nodes[hk] && hk !== p.key && !edges.some((e) => e.from === p.key && e.to === hk)) {
      edges.push({ from: p.key, to: hk, w: 0, kind: 'door' });
    }
  }

  for (const [a, b, kind] of LINKS) {
    edges.push({ from: a, to: b, w: kind === 'stairs' ? STAIR_COST : OUTDOOR_COST, kind });
  }

  for (const e of edges) e.w = Math.round(e.w * 10) / 10;
  return { nodes, edges };
}

// ---------------------------------------------------------------- min-heap
class MinHeap {
  constructor() { this.a = []; }
  get size() { return this.a.length; }
  push(item) {
    const a = this.a;
    a.push(item);
    let i = a.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (a[p][0] <= a[i][0]) break;
      [a[p], a[i]] = [a[i], a[p]];
      i = p;
    }
  }
  pop() {
    const a = this.a;
    const top = a[0];
    const last = a.pop();
    if (a.length) {
      a[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1;
        const r = l + 1;
        let m = i;
        if (l < a.length && a[l][0] < a[m][0]) m = l;
        if (r < a.length && a[r][0] < a[m][0]) m = r;
        if (m === i) break;
        [a[m], a[i]] = [a[i], a[m]];
        i = m;
      }
    }
    return top;
  }
}

export function adjacency(graph) {
  const adj = {};
  for (const k of Object.keys(graph.nodes)) adj[k] = [];
  for (const e of graph.edges) {
    adj[e.from].push([e.to, e.w]);
    adj[e.to].push([e.from, e.w]);
  }
  return adj;
}

/** Dijkstra with a binary min-heap. O((V + E) log V). Returns node keys or null. */
export function dijkstra(adj, start, target) {
  if (!adj[start] || !adj[target]) return null;
  const distTo = { [start]: 0 };
  const prev = {};
  const done = new Set();
  const heap = new MinHeap();
  heap.push([0, start]);
  while (heap.size) {
    const [d, u] = heap.pop();
    if (done.has(u)) continue;
    done.add(u);
    if (u === target) break;
    for (const [v, w] of adj[u]) {
      const nd = d + w;
      if (nd < (distTo[v] ?? Infinity)) {
        distTo[v] = nd;
        prev[v] = u;
        heap.push([nd, v]);
      }
    }
  }
  if (!(target in distTo)) return null;
  const path = [target];
  while (path[0] !== start) path.unshift(prev[path[0]]);
  return path;
}

export const GRAPH = buildGraph();
const ADJ = adjacency(GRAPH);

export function findPathLocal(from, to) {
  return dijkstra(ADJ, from, to);
}

// ------------------------------------------------------------- directions

const turn = (a, b, c) => {
  const v1 = [b.x - a.x, b.y - a.y];
  const v2 = [c.x - b.x, c.y - b.y];
  const cross = v1[0] * v2[1] - v1[1] * v2[0];
  const dot = v1[0] * v2[0] + v1[1] * v2[1];
  const angle = Math.abs(Math.atan2(cross, dot));
  if (angle < 0.35) return null;
  return cross > 0 ? 'right' : 'left';
};

function floorWord(f) {
  return f === 'G' ? 'the ground floor' : f === '-1' ? 'Floor −1' : `Floor ${f}`;
}

/**
 * Turns a node path into:
 *  - segments: [{ floor, points: [[x,y]...] }] for drawing
 *  - steps:    [{ text, floor }] plain-language directions
 */
export function describeRoute(path) {
  const N = path.map((k) => GRAPH.nodes[k]);
  const segments = [];
  for (const n of N) {
    const last = segments[segments.length - 1];
    if (!last || last.floor !== n.floor) segments.push({ floor: n.floor, points: [[n.x, n.y]] });
    else {
      const lp = last.points[last.points.length - 1];
      if (lp[0] !== n.x || lp[1] !== n.y) last.points.push([n.x, n.y]);
    }
  }

  // Floors you only pass through on the stairs aren't stops on the route
  for (let k = segments.length - 2; k > 0; k--) {
    const only = segments[k].points.length === 1;
    if (only) segments.splice(k, 1);
  }

  const start = PLACE_BY_KEY[path[0]];
  const end = PLACE_BY_KEY[path[path.length - 1]];
  const steps = [];

  // Collapse to corner points per floor so we only describe real turns
  let i = 0;
  while (i < N.length) {
    const floor = N[i].floor;
    let j = i;
    while (j + 1 < N.length && N[j + 1].floor === floor) j++;
    const run = N.slice(i, j + 1).filter((n, k, arr) => k === 0 || n.x !== arr[k - 1].x || n.y !== arr[k - 1].y);
    const enteringPlace = i === 0 ? start : PLACE_BY_KEY[N[i].key];
    const leavingTo = j + 1 < N.length ? N[j + 1] : null;
    const isWaypoint = (p) => ['stairs', 'entrance', 'exit'].includes(p.type);

    if (i === 0 && start) {
      if (run.length < 3) steps.push({ floor, text: `Start at ${start.name}` });
    } else if (enteringPlace?.type === 'entrance') {
      steps.push({ floor, text: `Enter the ${enteringPlace.building === 'civil' ? 'Civil Dept. Building' : 'Main Building'}` });
    } else if (enteringPlace?.type === 'stairs' && run.length > 2) {
      steps.push({ floor, text: 'Step off the stairs into the corridor' });
    }

    // Walk the raw points; every real change of direction is a turn.
    const lastK = j === N.length - 1 ? run.length - 2 : run.length - 1;
    let inLobby = false;
    for (let k = 1; k < lastK; k++) {
      const dir = turn(run[k - 1], run[k], run[k + 1]);
      if (k === 1 && i === 0 && start) {
        if (isWaypoint(start)) {
          const from = `From the ${(start.label || start.name).toLowerCase()},`;
          steps.push({ floor, text: dir ? `${from} turn ${dir}` : `${from} head straight on` });
        } else {
          steps.push({ floor, text: dir ? `Leave ${start.name} and turn ${dir} into the corridor` : `Leave ${start.name} and head straight into the corridor` });
        }
        continue;
      }
      if (!dir) continue;
      if (floor === 'G' && run[k].y >= 600) {
        if (!inLobby) steps.push({ floor, text: 'Walk around the auditorium lobby' });
        inLobby = true;
        continue;
      }
      const nextPlace = PLACE_BY_KEY[run[k + 1].key];
      const hint = nextPlace?.type === 'stairs' ? ' toward the stairs' : nextPlace?.type === 'entrance' ? ' toward the entrance' : '';
      steps.push({ floor, text: `Turn ${dir}${hint}` });
    }

    if (leavingTo) {
      const here = GRAPH.nodes[N[j].key];
      const link = LINKS.find(([a, b]) => (a === here.key && b === leavingTo.key) || (b === here.key && a === leavingTo.key));
      if (link?.[2] === 'outdoor') {
        steps.push({ floor, text: leavingTo.floor === 'C' ? 'Leave through the main entrance and walk to the Civil Dept. Building' : 'Leave the Civil Dept. Building and walk to the Main Building entrance' });
      } else {
        // skip through consecutive stair hops
        let k = j + 1;
        while (k + 1 < N.length && N[k + 1].kind === 'stairs' && N[k].kind === 'stairs' && N[k + 1].floor !== N[k].floor) k++;
        const target = N[k].floor;
        const up = FLOOR_ORDER[target] > FLOOR_ORDER[floor];
        steps.push({ floor, text: `Take the stairs ${up ? 'up' : 'down'} to ${floorWord(target)}`, toFloor: target });
        i = k;
        continue;
      }
    }
    i = j + 1;
  }

  if (end) {
    const lastSeg = N.filter((n) => n.floor === end.floor);
    const tail = lastSeg.filter((n, k, arr) => k === 0 || n.x !== arr[k - 1].x || n.y !== arr[k - 1].y);
    let side = null;
    if (tail.length >= 3) side = turn(tail[tail.length - 3], tail[tail.length - 2], tail[tail.length - 1]);
    const noun = end.type === 'stairs' ? 'The stairs are' : end.type === 'faculty' ? 'The faculty cabins are' : end.type === 'entrance' ? `The ${end.name.toLowerCase()} is` : `${end.name} is`;
    steps.push({
      floor: end.floor,
      text: side ? `${noun} on your ${side}` : tail.length <= 1 ? `You're already at ${end.name}` : `${noun} straight ahead`,
      arrive: true,
    });
  }

  const floors = segments.map((s) => s.floor).filter((f, k, a) => a.indexOf(f) === k);
  return { segments, steps, floors };
}
