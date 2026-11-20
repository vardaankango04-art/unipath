# UniPath – Smart Campus Indoor Navigation System

A full-stack university campus indoor navigation web application designed for campus wayfinding and built as a **B.Tech CSE (AI/ML) Data Structures and Algorithms (DSA)** semester project.

---

## 🏛️ 1. Project Technology Stack

* **Frontend**: React.js 18, Vite, Tailwind CSS (warm brown palette; Aboreto, Arapey and Work Sans), Lucide Icons, interactive SVG floor plans.
* **Backend**: Python 3.14, FastAPI 0.139, SQLAlchemy 2.0 ORM, Uvicorn ASGI Server, Pydantic 2.
* **Database**: PostgreSQL 18.4 (`unipath_db`), relational constraints, foreign keys, and B-tree search indexes.
* **Data Structures & Algorithms (DSA)**:
  - **Graph Representation**: Topological Adjacency List (`CampusGraph`) with directed/bidirectional weighted pathways.
  - **Node Indexing**: Hash Map (Python dictionary) providing $O(1)$ constant-time node and room lookup.
  - **Shortest Path Engine**: Dijkstra's algorithm implemented with a min-heap priority queue ($O((V + E) \log V)$).

---

## 📁 2. Project Directory Structure

```
UniPath/
├── backend/                        # FastAPI Application
│   ├── app/
│   │   ├── algorithms/             # DSA Graph & Dijkstra Shortest Path
│   │   │   ├── __init__.py
│   │   │   ├── graph.py            # Adjacency List & O(1) Hash Map
│   │   │   └── dijkstra.py         # Priority Queue Dijkstra's Algorithm
│   │   ├── routes/                 # REST API Routers
│   │   │   ├── __init__.py
│   │   │   ├── locations.py        # /locations endpoints & case-insensitive search
│   │   │   ├── buildings.py        # /buildings & /buildings/{id}/floors
│   │   │   ├── faculty.py          # /faculty & /faculty/search
│   │   │   └── navigation.py       # /navigation/route (Dijkstra over the walkway graph)
│   │   ├── __init__.py
│   │   ├── database.py             # SQLAlchemy Session & Engine Setup
│   │   ├── main.py                 # FastAPI Application & CORS configuration
│   │   ├── models.py               # SQLAlchemy Relational Models (6 Tables)
│   │   └── schemas.py              # Pydantic Validation & Serialization Schemas
│   ├── test_api.py                 # Automated Test Suite (12 Endpoint Tests)
│   ├── requirements.txt            # Python Dependencies
│   ├── .env                        # Local Environment Variables
│   └── .env.example                # Environment Template
│
├── database/                       # PostgreSQL Database Setup & Data Import
│   ├── schema.sql                  # DDL Schema (6 Tables, Foreign Keys, Indexes)
│   ├── import_data.py              # Excel to PostgreSQL Importer
│   └── verify_data.py              # Automated Integrity & Audit Verification Queries
│
├── src/                            # React.js Frontend
│   ├── components/                 # UI & Navigation Components
│   ├── data/                       # Blueprint Slots & Graph Routing Metadata
│   ├── pages/                      # HomePage, MapPage, NavigatePage
│   └── services/
│       └── api.js                  # Frontend API Client connecting React to FastAPI
│
├── Campus Project.xlsx             # Source Excel Campus Workbook
└── package.json                    # Frontend Node Dependencies
```

---

## 📊 3. Excel Dataset & Source-of-Truth Resolution

The database is populated directly from `Campus Project.xlsx`:

| Source Sheet | Target Database Table | Records Imported | Source-of-Truth Notes |
| :--- | :--- | :--- | :--- |
| **Main Building** | `locations` | **27 spaces** | Detailed tab lists 27 distinct rooms (CR 1–12, CL 6/8/9, LT 2/3, 3 Offices, TR 1–7). Resolves summary discrepancy where overview listed 25. |
| **Civil Dept. Building** | `locations` | **3 rooms** | Detailed tab explicitly lists 3 classrooms (CR13, CR14, CR15). Resolves summary count of 5. Floor preserved as "Not specified". |
| **Faculty Cabin Directory** | `faculty_members` | **12 members** | Detailed tab lists 12 faculty across First & Second floors. Unspecified cabin numbers and departments are preserved strictly as `SQL NULL`. |
| **Buildings / Floors** | `buildings`, `floors` | **2 Buildings, 6 Floors** | Main Building (-1, G, 1, 2, 3) and Civil Dept. Building (Not specified). |
| **DSA Nodes** | `graph_nodes` | **30 Nodes** | Pre-registered for graph topology binding. |
| **Walkway graph** | `backend/app/data/campus_graph.json` | **144 nodes, 145 edges** | Built from the corridor layout in `src/data/campus.js` (`node scripts/export-graph.mjs`). Weights are layout units, never shown as distances. |

---

## 🗄️ 4. PostgreSQL Relational Schema (`unipath_db`)

The database contains six interconnected tables:

1. **`buildings`**:
   - `building_id` (PK, Serial), `building_name` (Unique), `description`
2. **`floors`**:
   - `floor_id` (PK, Serial), `building_id` (FK), `floor_name`, `floor_number` (Integer: -1 to 4 or NULL)
3. **`locations`**:
   - `location_id` (PK, Serial), `building_id` (FK), `floor_id` (FK), `location_code`, `location_name`, `location_type`, `position_description`, `additional_details`, `graph_node_key`
4. **`faculty_members`**:
   - `faculty_id` (PK, Serial), `faculty_name`, `floor_label`, `building_id` (FK), `cabin_room_no`, `department`, `notes_contact`, `location_id` (FK)
5. **`graph_nodes`**:
   - `graph_node_id` (PK, Serial), `node_key` (Unique), `node_name`, `node_type`, `building_id` (FK), `floor_id` (FK), `location_id` (FK), `map_x`, `map_y`
6. **`graph_edges`**:
   - `edge_id` (PK, Serial), `from_node_id` (FK), `to_node_id` (FK), `distance_m`, `is_bidirectional`, `path_description`

### Search Indexes:
- Case-insensitive B-Tree indexes: `LOWER(location_name)`, `LOWER(location_code)`, `LOWER(faculty_name)`.
- Foreign key and categorical indexes on `building_id`, `floor_id`, and `location_type`.

---

## 🚀 5. Setup & Execution Instructions

### A. Prerequisites
- Python 3.10+ (Tested on Python 3.14)
- Node.js 18+ and npm
- PostgreSQL 14+ (Running on port 5432)

### B. Database Setup & Data Import
1. Configure credentials in `backend/.env` (or use defaults):
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_NAME=unipath_db
   ```
2. Execute the automated importer:
   ```bash
   python database/import_data.py
   ```
3. Run the verification audit:
   ```bash
   python database/verify_data.py
   ```

### C. Run the FastAPI Backend Server
```bash
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
* **Interactive Swagger UI**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
* **ReDoc Documentation**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)
* **API Root Status**: [http://127.0.0.1:8000/](http://127.0.0.1:8000/)

### D. Run Automated Backend Tests
```bash
python backend/test_api.py
```
*(Executes 12 automated tests verifying root status, locations, searching, 404 handling, buildings, floors, faculty, and navigation architecture).*

### E. Run the React Frontend
```bash
npm install
npm run dev
```
* **Frontend Application**: [http://localhost:5173](http://localhost:5173)

---

## 📡 6. REST API Endpoints Reference

### Locations
* `GET /locations`: Return all campus locations (with joined building and floor names; supports `?building_id=`, `?floor_id=`, `?location_type=`).
* `GET /locations/{location_id}`: Return comprehensive details of a specific location.
* `GET /locations/search?q=CR 1`: Case-insensitive search across name, code, position, and space type.

### Buildings & Floors
* `GET /buildings`: Return all campus buildings.
* `GET /buildings/{building_id}/floors`: Return floors associated with a building sorted by level.

### Faculty
* `GET /faculty`: Return complete faculty directory.
* `GET /faculty/search?q=name`: Case-insensitive search across faculty members and departments.
* `GET /faculty/{faculty_id}`: Return details of a specific faculty member.

### Navigation
* `POST /navigation/route` with `{"from_key": "CR-2", "to_key": "CR-9"}`: runs Dijkstra (min-heap) over the walkway graph and returns `{status, path, floors}`. Keys are the place keys in `src/data/campus.js`.
* `GET /navigation/graph-summary`: node and edge counts of the loaded graph.

The frontend calls this endpoint and falls back to the identical in-browser Dijkstra (`src/lib/graph.js`) when the backend isn't running.

---

## 🧭 7. Frontend Pages & Campus Data

* **Home** (`/`): hero with a "You are at / Where do you want to go?" search and a live floor-plan preview.
* **Campus Map** (`/map`): pan and zoom every floor (−1 to 3) of the Main Building plus the Civil Dept. Building; click a room for details.
* **Navigate** (`/navigate?from=…&to=…`): route drawn on the plan with floor changes and plain-language directions.

All rooms, labs, offices and faculty come from `Campus Project.xlsx` and the floor sketches, kept in `src/data/campus.js`. After editing that file, run `node scripts/export-graph.mjs` so the backend uses the same graph. Positions marked `estimated: true` (Floor −1 layout and its stair link, TR 6 and TR 7, the Civil Dept. room layout) were not on the sketches and should be checked on site.
