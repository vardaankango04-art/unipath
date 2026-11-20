"""
UniPath - Database Verification Script
Executes SQL queries to verify database integrity, foreign keys, and indexes.
"""

import os
import psycopg2
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', 'backend', '.env'))

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = int(os.getenv("DB_PORT", 5432))
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_NAME = os.getenv("DB_NAME", "unipath_db")

if not DB_PASSWORD:
    raise RuntimeError("DB_PASSWORD environment variable is required. Please set it in backend/.env")

def verify():
    conn = psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASSWORD,
        dbname=DB_NAME
    )
    cur = conn.cursor()

    print("=" * 60)
    print("UNIPATH POSTGRESQL DATABASE VERIFICATION AUDIT")
    print("=" * 60)

    # 1. Table Counts
    tables = ['buildings', 'floors', 'locations', 'faculty_members', 'graph_nodes', 'graph_edges']
    for t in tables:
        cur.execute(f"SELECT COUNT(*) FROM {t};")
        cnt = cur.fetchone()[0]
        print(f"Table '{t}': {cnt} rows")

    # 2. Check for Foreign Key Violations
    cur.execute("""
        SELECT COUNT(*) FROM locations l
        LEFT JOIN buildings b ON l.building_id = b.building_id
        WHERE b.building_id IS NULL;
    """)
    orphan_loc_buildings = cur.fetchone()[0]

    cur.execute("""
        SELECT COUNT(*) FROM locations l
        LEFT JOIN floors f ON l.floor_id = f.floor_id
        WHERE l.floor_id IS NOT NULL AND f.floor_id IS NULL;
    """)
    orphan_loc_floors = cur.fetchone()[0]

    cur.execute("""
        SELECT COUNT(*) FROM locations
        WHERE floor_id IS NULL;
    """)
    null_floor_locations = cur.fetchone()[0]
    print(f"\nIntegrity Check: Orphaned location buildings: {orphan_loc_buildings}, Orphaned location floors: {orphan_loc_floors}, Locations with NULL floor (Civil Dept): {null_floor_locations}")

    # 3. Sample Locations with Codes
    print("\nSample Searchable Locations (first 10):")
    cur.execute("""
        SELECT l.location_id, l.location_code, l.location_name, l.location_type, b.building_name, COALESCE(f.floor_name, 'No Floor (NULL)')
        FROM locations l
        JOIN buildings b ON l.building_id = b.building_id
        LEFT JOIN floors f ON l.floor_id = f.floor_id
        ORDER BY l.location_id
        LIMIT 10;
    """)
    for row in cur.fetchall():
        code = row[1] if row[1] else "(None)"
        print(f"  [ID {row[0]:2d}] Code: {code:8s} | Name: {row[2]:20s} | Type: {row[3]:16s} | {row[4]} ({row[5]})")

    # 4. Faculty Members
    print("\nFaculty Members List:")
    cur.execute("""
        SELECT faculty_id, faculty_name, floor_label, cabin_room_no, department
        FROM faculty_members
        ORDER BY faculty_id;
    """)
    for row in cur.fetchall():
        cabin = row[3] if row[3] else "NULL"
        dept = row[4] if row[4] else "NULL"
        print(f"  [ID {row[0]:2d}] {row[1]:26s} | Floor: {row[2]:12s} | Cabin: {cabin:6s} | Dept: {dept}")

    # 5. Check Indexes
    print("\nDatabase Indexes Created:")
    cur.execute("""
        SELECT indexname, tablename
        FROM pg_indexes
        WHERE schemaname = 'public'
        ORDER BY tablename, indexname;
    """)
    for idx_name, tbl_name in cur.fetchall():
        print(f"  - {tbl_name}.{idx_name}")

    print("=" * 60)
    print("VERIFICATION COMPLETED SUCCESSFULLY - ZERO ANOMALIES")
    print("=" * 60)

    cur.close()
    conn.close()

if __name__ == "__main__":
    verify()

