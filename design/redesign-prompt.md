Redesign the UniPath frontend (React + Vite + Tailwind in `src/`). Use `design/homepage-mockup.png` as the visual reference for the homepage. Before you start, read `src/data/floorBlueprints.js`, `src/data/locations.js`, `src/services/api.js`, `database/schema.sql` and `Campus Project.xlsx` so you know what real data exists.

## Pages (only these three)
1. **Home** (`/`)
2. **Campus Map** (`/map`)
3. **Navigate** (`/navigate`)

Delete the Explore, Saved Places, Classrooms, Laboratories, Faculty, Locations and Profile pages, along with their routes, nav links, bookmark buttons and any components only they use.

## Design system
- **Colours** (light mode only, so remove dark mode, the theme toggle and ThemeContext):
  - `#291C0E` ink: text, primary buttons, active states
  - `#6E473B` bark: route line, accents, the italic tagline
  - `#A78D78` taupe: muted labels, placeholders
  - `#BEB5A9` stone: borders and outlines
  - `#E1D4C2` sand: section backgrounds, dividers
  - `#F4E6D2` cream: page background
  - Put these in `tailwind.config.js` as named colours and use them everywhere. No other colours.
- **Fonts** (Google Fonts):
  - **Aboreto** for the logo and headings
  - **Arapey Italic** for taglines and short accent lines
  - **Work Sans** (300/400/500) for everything else
  - Small labels and nav links: uppercase Work Sans, 11–12px, letter-spacing about 0.3em
- The style should feel calm and editorial, like the mockup: generous whitespace, 12–24px rounded corners, thin borders and no heavy shadows.
- The layout must work from 1440px down to 375px wide, with no horizontal scrolling.

## Home
- **Top nav:**
  - "UNIPATH" logo on the left
  - Home / Campus Map / Navigate in the middle
  - a dark "Start navigating" button on the right, linking to `/navigate`
- **Hero, left half:**
  - eyebrow text "Indoor campus navigation"
  - a large "UNIPATH" heading
  - the tagline "Every room, one clear path." in Arapey Italic
  - one sentence explaining what UniPath does
  - a search card with two fields: **"You are at"** and **"Where do you want to go?"**, plus a "Find my route" button
  - 3–4 quick-pick chips for real places (Library, Auditorium, Placement Cell, Registrar's Office)
- **How the two search fields work:**
  - Both fields are searchable comboboxes over real locations.
  - The "You are at" field also includes stairwells, exits and the main entrance, for example "Floor −1 stairs".
  - Each suggestion shows its floor.
  - Submitting goes to `/navigate?from=<key>&to=<key>`.
- **Hero, right half:**
  - a live, styled preview of the real Main Building ground-floor plan, drawn with the same map component as the Map page
  - a sample route animating from the Main Entrance to a room
  - a floor switcher and a compass
- **Below the hero:** a short "What is UniPath?" section with three numbered steps:
  1. Where you are
  2. Where you're going
  3. Follow the line
- **Footer:** keep it minimal.

## Map component (shared by Home, Map and Navigate)
Rebuild `CampusMap` so it looks like a clean, professional indoor map (Google Maps or a game-style minimap), not stacked boxes.
- **Drawing:**
  - Draw each floor as a single SVG: building outline, corridors as one continuous lighter path, and rooms as softly filled shapes.
  - Show stairs and exits with a small icon.
  - Labels sit centred inside rooms and never overlap anything.
- **Interaction:**
  - Pan by dragging and zoom with the scroll wheel, pinch or the +/− buttons.
  - Add a "recenter" button.
  - The map fills its container and never scrolls the page.
- **Floor switcher:**
  - a vertical pill: 3, 2, 1, G, −1
  - Floor −1 must exist and must show CR 1 and CR 2.
  - The highlighted floor always matches the floor being shown.
- **Buildings:**
  - Add a building switcher: **Main Building** and **Civil Dept. Building**.
  - The Civil Dept. Building is separate and its floor isn't recorded. Show it as its own simple plan with CR 13, CR 14 and CR 15, and no floor switcher.
  - Don't invent rooms or a layout beyond what the data supports.
- **Selecting a room:**
  - Clicking a room highlights it with an ink outline and opens a small card. The card shows the name, code, building, floor, the location description from the Excel file, and a "Navigate here" button.
  - Selecting a room on another floor or building switches the map to it.
  - Pins must never cover a room's label. Put the pin above the room.

## Routing (the core feature)
- **Graph edges:**
  - The `graph_edges` table is empty.
  - Build the walkable graph from the floor-plan layout: room doors connect to the nearest corridor point, corridor points connect along the corridor, and stairs connect between consecutive floors.
  - Use layout distance as the hidden edge weight.
  - Keep the edges in one data file (or seed them into `graph_edges` with a script) so they can be corrected later.
  - Make sure every location in the data can reach every other location.
- **Path finding:** run the existing Dijkstra implementation in the backend (`/navigation/shortest-path`) on that graph, and return the ordered list of nodes with their floors.
- **No measurements:** never show distances, metres, walking time or ETA anywhere in the UI.

## Navigate page
- **Left panel:**
  - the "You are at" and "Where do you want to go?" comboboxes (pre-filled from the URL), with a swap button
  - below them, step-by-step directions in plain language, for example:
    - "Head along the main corridor"
    - "Take the stairs up to Floor 1"
    - "Classroom 9 is on your left"
- **Right side:**
  - the large map with the route drawn as a bark-coloured line with rounded corners, a soft halo behind it and a subtle animated dash
  - a start dot ("You are here" ring) and a destination pin
- **Multi-floor routes:**
  - Show floor-change chips (G → 1 → 2).
  - Each direction step is clickable and jumps the map to that floor.
  - The map starts on the starting floor.
- **Errors:** if no route exists, show a friendly one-line message. Never show raw error strings.

## Campus Map page
- A full-height map with a slim search bar overlaid in the top-left, plus the building and floor switchers.
- There's no long sidebar. Search results appear in a dropdown, and room details appear in the floating card.

## Data rules
- **Remove all example and mock data**, including:
  - Lecture Hall 101, Classroom 201/202, Seminar Hall 301
  - Faculty Cabin 101–401, Computing Laboratory 2, Electronics & VLSI Lab
  - "Academic Wing 1", "Central Complex", invented capacities and invented departments
- Only show rooms, labs, offices and faculty cabins that exist in `Campus Project.xlsx` and the database.
- **Floor names:** use one format everywhere ("Floor −1", "Ground Floor", "Floor 1", "Floor 2", "Floor 3").
- **Missing values:** if a value is unknown, leave that field out. Never show "Standard Room", "N/A" or "Not specified".
- **Hide developer terms**, for example: PostgreSQL badges, node keys, "Graph Origin Node", "Unique ID (Node)", "Data Contract" and `svgCoordinates`.

## Problems from the current build that must be gone
1. The floor bar overlaps the map.
2. Text is clipped, for example "ALKWAY CORRIDOR" and "(Ground Floor &".
3. Pins cover room names.
4. The Server Room overlaps the cross-passage.
5. The floor tab and the floor shown get out of sync.
6. The map goes blank when the sidebar scrolls.
7. "Expand Map" only zooms in.
8. The search icon overlaps the placeholder.
9. The dropdown uses the native macOS blue style.
10. Card titles and code badges are truncated ("FC-", "LH-").
11. Rooms are in the wrong categories.
12. The greeting in the header ("Good Evening!") takes up space; remove it.

## When you're done
- Run `npm run build` and fix any errors.
- Start the app and check Home, Map and Navigate at 1440px and 375px wide.
- Test these routes and look at screenshots of each:
  - Classroom 2 (Floor −1) → Classroom 9 (Floor 1)
  - Main Entrance → Library
  - Computer Lab 8 → Classroom 13 (Civil Dept.)
- Report what changed, and any rooms whose position on the plan you had to guess.
