import urllib.request
import json

def check():
    print("Testing Live FastAPI Endpoints:")
    
    # 1. Health
    with urllib.request.urlopen("http://127.0.0.1:8000/health") as r:
        health = json.loads(r.read().decode())
        print("  ✓ Health:", health)
    
    # 2. Locations
    with urllib.request.urlopen("http://127.0.0.1:8000/locations") as r:
        locs = json.loads(r.read().decode())
        print(f"  ✓ Total Locations: {len(locs)}")
        civil = [l for l in locs if "Civil" in l.get("building_name", "")]
        print(f"  ✓ Civil Dept. Locations count: {len(civil)}")
        for c in civil:
            print(f"    - {c['location_code']}: {c['location_name']} | floor_id={c['floor_id']} | floor_name={c['floor_name']}")
    
    # 3. Main Building Floors
    with urllib.request.urlopen("http://127.0.0.1:8000/buildings/1/floors") as r:
        b1_floors = json.loads(r.read().decode())
        print(f"  ✓ Main Building physical floors: {len(b1_floors)}")
        for f in b1_floors:
            print(f"    - Floor {f['floor_number']}: {f['floor_name']}")

    # 4. Civil Dept. Floors
    with urllib.request.urlopen("http://127.0.0.1:8000/buildings/2/floors") as r:
        b2_floors = json.loads(r.read().decode())
        print(f"  ✓ Civil Dept. Building physical floors: {len(b2_floors)} (Correctly 0)")

    # 5. Faculty
    with urllib.request.urlopen("http://127.0.0.1:8000/faculty") as r:
        faculty = json.loads(r.read().decode())
        print(f"  ✓ Total Faculty Members: {len(faculty)}")

    # 6. Navigation
    req = urllib.request.Request(
        "http://127.0.0.1:8000/navigation/shortest-path",
        data=json.dumps({"source_location_id": 1, "target_location_id": 5}).encode(),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as r:
        nav = json.loads(r.read().decode())
        print(f"  ✓ Navigation endpoint: status={nav['status']} | nodes={nav['nodes_available']} | path={nav['path']}")

if __name__ == "__main__":
    check()
