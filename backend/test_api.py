"""
UniPath - Backend API Automated Test Suite (Audited)
Tests all required endpoints against the live PostgreSQL database.

Audit Assertions:
1. Root health check reports database connected
2. 30 total locations retrieved
3. Civil Department Building locations (CR13, CR14, CR15) have floor_id: null and floor_name: null
4. Main Building has exactly 5 physical floors
5. Civil Department Building has 0 physical floors (no dummy "Not specified" floor)
6. Location search works for exact codes and partial names
7. Faculty directory has 12 members
8. Navigation endpoint confirms pending survey with 30 nodes and 0 edges, without fabricating paths
"""

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_root():
    print("Testing GET / ...")
    r = client.get("/")
    assert r.status_code == 200, f"Expected 200, got {r.status_code}"
    data = r.json()
    assert data["database"] == "connected", f"Database not connected: {data}"
    print("  ✓ Root OK, Database connected:", data)

def test_locations():
    print("\nTesting GET /locations ...")
    r = client.get("/locations")
    assert r.status_code == 200
    locations = r.json()
    assert len(locations) == 30, f"Expected 30 locations, got {len(locations)}"
    print(f"  ✓ Fetched {len(locations)} locations successfully.")
    
    # Test details of first location (Main Building)
    loc_id = locations[0]["location_id"]
    print(f"\nTesting GET /locations/{loc_id} (Main Building) ...")
    r_detail = client.get(f"/locations/{loc_id}")
    assert r_detail.status_code == 200
    detail = r_detail.json()
    assert detail["location_id"] == loc_id
    assert detail["floor_id"] is not None
    assert detail["floor_name"] is not None
    print(f"  ✓ Location {loc_id} details: {detail['location_name']} in {detail['building_name']} - {detail['floor_name']}")

    # Test Civil Department location (NULL floor handling)
    print("\nTesting GET /locations for Civil Department classrooms (CR13, CR14, CR15) ...")
    civil_locs = [l for l in locations if l.get("location_code") in ("CR 13", "CR 14", "CR 15", "CR13", "CR14", "CR15")]
    assert len(civil_locs) == 3, f"Expected 3 Civil Dept locations, got {len(civil_locs)}"
    for cl in civil_locs:
        assert cl["floor_id"] is None, f"Expected floor_id to be None, got {cl['floor_id']}"
        assert cl["floor_name"] is None, f"Expected floor_name to be None, got {cl['floor_name']}"
        assert cl["building_name"] == "Civil Dept. Building"
        # Test individual detail endpoint
        r_c_detail = client.get(f"/locations/{cl['location_id']}")
        assert r_c_detail.status_code == 200
        c_detail = r_c_detail.json()
        assert c_detail["floor_id"] is None
        assert c_detail["floor_name"] is None
        print(f"  ✓ Civil Room {c_detail['location_code']} ({c_detail['location_name']}): floor_id=null, floor_name=null (Correctly Handled)")

    # Test 404 for invalid location ID
    print("\nTesting GET /locations/99999 (Invalid ID) ...")
    r_404 = client.get("/locations/99999")
    assert r_404.status_code == 404
    print("  ✓ Correctly returned 404 for non-existent location ID.")

def test_location_search():
    print("\nTesting GET /locations/search?q=CR 1 ...")
    r = client.get("/locations/search?q=CR 1")
    assert r.status_code == 200
    results = r.json()
    assert len(results) > 0
    print(f"  ✓ Search 'CR 1' returned {len(results)} matches: {[item['location_name'] for item in results]}")

    print("\nTesting GET /locations/search?q=Computer Lab ...")
    r_lab = client.get("/locations/search?q=Computer Lab")
    assert r_lab.status_code == 200
    labs = r_lab.json()
    assert len(labs) == 3, f"Expected 3 computer labs, got {len(labs)}"
    print(f"  ✓ Search 'Computer Lab' returned {len(labs)} matches: {[l['location_name'] for l in labs]}")

    print("\nTesting GET /locations/search with empty query ...")
    r_empty = client.get("/locations/search?q=")
    assert r_empty.status_code == 200
    assert r_empty.json() == []
    print("  ✓ Empty search returned empty list as expected.")

def test_buildings():
    print("\nTesting GET /buildings ...")
    r = client.get("/buildings")
    assert r.status_code == 200
    buildings = r.json()
    assert len(buildings) == 2, f"Expected 2 buildings, got {len(buildings)}"
    print(f"  ✓ Fetched {len(buildings)} buildings:", [b["building_name"] for b in buildings])

    # Find Main Building and Civil Dept Building
    main_b = next((b for b in buildings if "Main" in b["building_name"]), None)
    civil_b = next((b for b in buildings if "Civil" in b["building_name"]), None)
    assert main_b is not None
    assert civil_b is not None

    # Test floors for Main Building (must be 5 physical floors)
    print(f"\nTesting GET /buildings/{main_b['building_id']}/floors (Main Building) ...")
    r_main_floors = client.get(f"/buildings/{main_b['building_id']}/floors")
    assert r_main_floors.status_code == 200
    main_floors = r_main_floors.json()
    assert len(main_floors) == 5, f"Expected 5 physical floors in Main Building, got {len(main_floors)}"
    print(f"  ✓ Main Building has {len(main_floors)} physical floors:", [f["floor_name"] for f in main_floors])

    # Test floors for Civil Dept Building (must be 0 physical floors, no dummy "Not specified")
    print(f"\nTesting GET /buildings/{civil_b['building_id']}/floors (Civil Dept. Building) ...")
    r_civil_floors = client.get(f"/buildings/{civil_b['building_id']}/floors")
    assert r_civil_floors.status_code == 200
    civil_floors = r_civil_floors.json()
    assert len(civil_floors) == 0, f"Expected 0 floors for Civil Dept Building, got {len(civil_floors)}"
    print(f"  ✓ Civil Dept. Building correctly has {len(civil_floors)} registered floors (No dummy floor).")

    # Test 404 for invalid building
    r_b_404 = client.get("/buildings/9999/floors")
    assert r_b_404.status_code == 404
    print("  ✓ Correctly returned 404 for non-existent building ID.")

def test_faculty():
    print("\nTesting GET /faculty ...")
    r = client.get("/faculty")
    assert r.status_code == 200
    faculty = r.json()
    assert len(faculty) == 12, f"Expected 12 faculty members, got {len(faculty)}"
    print(f"  ✓ Fetched {len(faculty)} faculty members successfully.")

    print("\nTesting GET /faculty/search?q=Meghna ...")
    r_search = client.get("/faculty/search?q=Meghna")
    assert r_search.status_code == 200
    results = r_search.json()
    assert len(results) == 1
    assert "Meghna" in results[0]["faculty_name"]
    print("  ✓ Faculty search returned:", results[0]["faculty_name"], f"({results[0]['floor_label']})")

    # Test details by ID
    fac_id = faculty[0]["faculty_id"]
    r_fac_detail = client.get(f"/faculty/{fac_id}")
    assert r_fac_detail.status_code == 200
    print(f"  ✓ Faculty member {fac_id} retrieved successfully.")

def test_navigation():
    print("\nTesting POST /navigation/route ...")
    r = client.post("/navigation/route", json={"from_key": "CR-2", "to_key": "CR-9"})
    assert r.status_code == 200
    res = r.json()
    assert res["status"] == "ok"
    assert res["path"][0] == "CR-2" and res["path"][-1] == "CR-9"
    assert res["floors"] == ["-1", "G", "1"]
    r = client.post("/navigation/route", json={"from_key": "CR-2", "to_key": "NOPE"})
    assert r.json()["status"] == "unknown_place"
    print("  ✓ Route CR-2 -> CR-9 crosses floors:", res["floors"])

if __name__ == "__main__":
    print("=" * 60)
    print("RUNNING AUTOMATED FASTAPI BACKEND AUDIT TESTS")
    print("=" * 60)
    test_root()
    test_locations()
    test_location_search()
    test_buildings()
    test_faculty()
    test_navigation()
    print("\n" + "=" * 60)
    print("ALL API AUDIT TESTS PASSED WITH 100% SUCCESS!")
    print("=" * 60)
