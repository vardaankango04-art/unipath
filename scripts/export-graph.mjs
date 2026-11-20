// Writes the walkway graph used by the frontend to backend/app/data/campus_graph.json
// so the FastAPI Dijkstra endpoint routes over exactly the same data.
// Run after editing src/data/campus.js:  node scripts/export-graph.mjs
import { writeFileSync } from 'node:fs';
import { GRAPH } from '../src/lib/graph.js';

const out = new URL('../backend/app/data/campus_graph.json', import.meta.url);
writeFileSync(out, JSON.stringify({ nodes: Object.values(GRAPH.nodes), edges: GRAPH.edges }, null, 1));
console.log(`Wrote ${Object.keys(GRAPH.nodes).length} nodes and ${GRAPH.edges.length} edges to ${out.pathname}`);
