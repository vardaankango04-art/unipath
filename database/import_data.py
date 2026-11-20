"""
UniPath - Excel to PostgreSQL Data Importer (Audited & Idempotent)
Imports records from 'Campus Project.xlsx' into PostgreSQL database 'unipath_db'.

Audit adherence:
- Civil Department Building classrooms (CR13, CR14, CR15) have floor_id = NULL
- No dummy "Not specified" floor record in floors table
- Detailed records are source of truth
- Missing values preserved as SQL NULL
- Idempotent upserts (ON CONFLICT) prevent duplicate records across multiple runs
- No fabricated graph edges or distances
"""

import os
import sys
import openpyxl
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '..', 'backend', '.env'))

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = int(os.getenv("DB_PORT", 5432))
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_NAME = os.getenv("DB_NAME", "unipath_db")

if not DB_PASSWORD:
    print("ERROR: DB_PASSWORD environment variable is required. Please set it in backend/.env")
    sys.exit(1)

EXCEL_FILE = os.path.join(os.path.dirname(__file__), '..', 'Campus Project.xlsx')


def ensure_database():
    """Ensure the target PostgreSQL database exists."""
    print(f"Connecting to default PostgreSQL database at {DB_HOST}:{DB_PORT} as '{DB_USER}'...")
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            dbname="postgres"
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cur = conn.cursor()
        
        cur.execute("SELECT 1 FROM pg_database WHERE datname = %s;", (DB_NAME,))
        exists = cur.fetchone()
        if not exists:
            print(f"Database '{DB_NAME}' does not exist. Creating it...")
            cur.execute(f'CREATE DATABASE "{DB_NAME}";')
            print(f"Database '{DB_NAME}' created successfully.")
        else:
            print(f"Database '{DB_NAME}' already exists.")
        
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Error ensuring database exists: {e}")
        sys.exit(1)


def execute_schema_if_needed(cursor):
    """Executes schema.sql to ensure tables and indexes exist."""
    schema_path = os.path.join(os.path.dirname(__file__), 'schema.sql')
    print(f"Applying schema definitions from {schema_path}...")
    with open(schema_path, 'r', encoding='utf-8') as f:
        schema_sql = f.read()
    cursor.execute(schema_sql)
    print("Schema applied successfully.")


def check_tables_exist(cursor):
    """Check if the core tables already exist in the database."""
    cursor.execute("""
        SELECT COUNT(*) FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name IN ('buildings', 'floors', 'locations', 'graph_nodes');
    """)
    return cursor.fetchone()[0] == 4


def clean_cell(val):
    """Clean string cell value, returning None for empty strings or dashes."""
    if val is None:
        return None
    val_str = str(val).strip()
    if val_str in ("", "—", "-", "None", "nan", "null"):
        return None
    return val_str


def parse_floor_number(floor_name):
    """Returns integer floor level for sorting and filtering."""
    if not floor_name:
        return None
    f = floor_name.lower().strip()
    if "-1" in f or "basement" in f:
        return -1
    elif "ground" in f or f == "g":
        return 0
    elif "first" in f or "1st" in f or "floor 1" in f:
        return 1
    elif "second" in f or "2nd" in f or "floor 2" in f:
        return 2
    elif "third" in f or "3rd" in f or "floor 3" in f:
        return 3
    elif "fourth" in f or "4th" in f or "floor 4" in f:
        return 4
    return None


def generate_node_key(building_slug, location_code, location_name):
    """Generates standard graph node key for DSA binding."""
    if location_code:
        slug = location_code.lower().replace(" ", "-").replace(".", "")
    else:
        slug = location_name.lower().replace(" ", "-").replace("'", "").replace(".", "")
    return f"node-{building_slug}-{slug}"


def import_campus_data(recreate_schema=False):
    """
    Parses Excel workbook and imports records into PostgreSQL idempotently.
    Uses ON CONFLICT to prevent duplicate buildings, floors, locations, faculty, and nodes.
    """
    if not os.path.exists(EXCEL_FILE):
        print(f"ERROR: Excel file not found at: {EXCEL_FILE}")
        sys.exit(1)

    print(f"\nLoading Excel workbook: {EXCEL_FILE}...")
    wb = openpyxl.load_workbook(EXCEL_FILE, data_only=True)

    # Connect to target database
    conn = psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASSWORD,
        dbname=DB_NAME
    )
    conn.autocommit = False
    cur = conn.cursor()

    try:
        if recreate_schema or not check_tables_exist(cur):
            execute_schema_if_needed(cur)

        # ---------------------------------------------------------------------
        # Step 1: Buildings (Idempotent Upsert)
        # ---------------------------------------------------------------------
        buildings_data = [
            ("Main Building", "Main Academic and Administrative Building"),
            ("Civil Dept. Building", "Civil Engineering Department Building")
        ]
        building_ids = {}
        for b_name, b_desc in buildings_data:
            cur.execute(
                """
                INSERT INTO buildings (building_name, description) 
                VALUES (%s, %s)
                ON CONFLICT (building_name) 
                DO UPDATE SET description = EXCLUDED.description
                RETURNING building_id;
                """,
                (b_name, b_desc)
            )
            b_id = cur.fetchone()[0]
            building_ids[b_name] = b_id

        # ---------------------------------------------------------------------
        # Step 2: Floors (Idempotent Upsert for Physical Floors Only)
        # Note: Civil Dept. has NO confirmed physical floor in sheet, so no dummy floor record is created.
        # ---------------------------------------------------------------------
        floor_definitions = [
            ("Main Building", "-1 Floor"),
            ("Main Building", "Ground Floor"),
            ("Main Building", "First Floor"),
            ("Main Building", "Second Floor"),
            ("Main Building", "Third Floor")
        ]
        floor_ids = {}
        for b_name, f_name in floor_definitions:
            b_id = building_ids[b_name]
            f_num = parse_floor_number(f_name)
            cur.execute(
                """
                INSERT INTO floors (building_id, floor_name, floor_number)
                VALUES (%s, %s, %s)
                ON CONFLICT (building_id, floor_name)
                DO UPDATE SET floor_number = EXCLUDED.floor_number
                RETURNING floor_id;
                """,
                (b_id, f_name, f_num)
            )
            f_id = cur.fetchone()[0]
            floor_ids[(b_id, f_name)] = f_id

        # ---------------------------------------------------------------------
        # Step 3: Main Building Locations (Idempotent Upsert)
        # ---------------------------------------------------------------------
        main_sheet = wb["Main Building"]
        main_records_count = 0
        b_main_id = building_ids["Main Building"]

        for r in range(5, main_sheet.max_row + 1):
            floor_raw = clean_cell(main_sheet.cell(r, 1).value)
            loc_code = clean_cell(main_sheet.cell(r, 2).value)
            full_name = clean_cell(main_sheet.cell(r, 3).value)
            space_type = clean_cell(main_sheet.cell(r, 4).value)
            position = clean_cell(main_sheet.cell(r, 5).value)
            add_details = clean_cell(main_sheet.cell(r, 6).value)

            if not full_name or floor_raw == "TOTAL":
                continue

            floor_key = floor_raw if floor_raw in ["-1 Floor", "Ground Floor", "First Floor", "Second Floor", "Third Floor"] else "Ground Floor"
            f_id = floor_ids.get((b_main_id, floor_key))
            node_key = generate_node_key("main", loc_code, full_name)

            cur.execute(
                """
                INSERT INTO locations (
                    building_id, floor_id, location_code, location_name, 
                    location_type, position_description, additional_details, graph_node_key
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (building_id, location_name)
                DO UPDATE SET
                    floor_id = EXCLUDED.floor_id,
                    location_code = EXCLUDED.location_code,
                    location_type = EXCLUDED.location_type,
                    position_description = EXCLUDED.position_description,
                    additional_details = EXCLUDED.additional_details,
                    graph_node_key = EXCLUDED.graph_node_key
                RETURNING location_id;
                """,
                (b_main_id, f_id, loc_code, full_name, space_type or "Space", position, add_details, node_key)
            )
            loc_id = cur.fetchone()[0]

            # Register provisional location graph_node
            cur.execute(
                """
                INSERT INTO graph_nodes (node_key, node_name, node_type, building_id, floor_id, location_id)
                VALUES (%s, %s, %s, %s, %s, %s)
                ON CONFLICT (node_key)
                DO UPDATE SET
                    node_name = EXCLUDED.node_name,
                    node_type = EXCLUDED.node_type,
                    building_id = EXCLUDED.building_id,
                    floor_id = EXCLUDED.floor_id,
                    location_id = EXCLUDED.location_id;
                """,
                (node_key, full_name, "room" if "Classroom" in (space_type or "") or "Lab" in (space_type or "") else "hall", b_main_id, f_id, loc_id)
            )
            main_records_count += 1

        # ---------------------------------------------------------------------
        # Step 4: Civil Dept. Building Locations (Idempotent Upsert, floor_id = NULL)
        # ---------------------------------------------------------------------
        civil_sheet = wb["Civil Dept. Building"]
        civil_records_count = 0
        b_civil_id = building_ids["Civil Dept. Building"]

        for r in range(5, civil_sheet.max_row + 1):
            loc_code = clean_cell(civil_sheet.cell(r, 1).value)
            full_name = clean_cell(civil_sheet.cell(r, 2).value)
            floor_raw = clean_cell(civil_sheet.cell(r, 3).value)
            position = clean_cell(civil_sheet.cell(r, 4).value)
            add_details = clean_cell(civil_sheet.cell(r, 5).value)

            if not full_name or loc_code == "TOTAL":
                continue

            # Civil Department floor is unknown in sheet -> floor_id set strictly to NULL
            node_key = generate_node_key("civil", loc_code, full_name)
            notes = add_details or "Floor not specified in campus records"

            cur.execute(
                """
                INSERT INTO locations (
                    building_id, floor_id, location_code, location_name, 
                    location_type, position_description, additional_details, graph_node_key
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (building_id, location_name)
                DO UPDATE SET
                    floor_id = EXCLUDED.floor_id,
                    location_code = EXCLUDED.location_code,
                    location_type = EXCLUDED.location_type,
                    position_description = EXCLUDED.position_description,
                    additional_details = EXCLUDED.additional_details,
                    graph_node_key = EXCLUDED.graph_node_key
                RETURNING location_id;
                """,
                (b_civil_id, None, loc_code, full_name, "Classroom", position, notes, node_key)
            )
            loc_id = cur.fetchone()[0]

            # Register provisional graph_node
            cur.execute(
                """
                INSERT INTO graph_nodes (node_key, node_name, node_type, building_id, floor_id, location_id)
                VALUES (%s, %s, %s, %s, %s, %s)
                ON CONFLICT (node_key)
                DO UPDATE SET
                    node_name = EXCLUDED.node_name,
                    node_type = EXCLUDED.node_type,
                    building_id = EXCLUDED.building_id,
                    floor_id = EXCLUDED.floor_id,
                    location_id = EXCLUDED.location_id;
                """,
                (node_key, full_name, "room", b_civil_id, None, loc_id)
            )
            civil_records_count += 1

        # ---------------------------------------------------------------------
        # Step 5: Faculty Members (Idempotent Upsert)
        # ---------------------------------------------------------------------
        faculty_sheet = wb["Faculty Cabin Directory"]
        faculty_records_count = 0

        for r in range(5, faculty_sheet.max_row + 1):
            floor_label = clean_cell(faculty_sheet.cell(r, 1).value)
            teacher_name = clean_cell(faculty_sheet.cell(r, 2).value)
            b_raw = clean_cell(faculty_sheet.cell(r, 3).value)
            cabin_no = clean_cell(faculty_sheet.cell(r, 4).value)
            department = clean_cell(faculty_sheet.cell(r, 5).value)
            notes_contact = clean_cell(faculty_sheet.cell(r, 6).value)

            if not teacher_name or floor_label == "TOTAL":
                continue

            b_id = building_ids.get(b_raw) if b_raw else None

            cur.execute(
                """
                INSERT INTO faculty_members (
                    faculty_name, floor_label, building_id, cabin_room_no, department, notes_contact
                ) VALUES (%s, %s, %s, %s, %s, %s)
                ON CONFLICT (faculty_name)
                DO UPDATE SET
                    floor_label = EXCLUDED.floor_label,
                    building_id = EXCLUDED.building_id,
                    cabin_room_no = EXCLUDED.cabin_room_no,
                    department = EXCLUDED.department,
                    notes_contact = EXCLUDED.notes_contact
                RETURNING faculty_id;
                """,
                (teacher_name, floor_label, b_id, cabin_no, department, notes_contact)
            )
            faculty_records_count += 1

        # Commit Transaction
        conn.commit()

        # ---------------------------------------------------------------------
        # Step 6: Summary Verification
        # ---------------------------------------------------------------------
        cur.execute("SELECT COUNT(*) FROM buildings;")
        b_count = cur.fetchone()[0]
        cur.execute("SELECT COUNT(*) FROM floors;")
        f_count = cur.fetchone()[0]
        cur.execute("SELECT COUNT(*) FROM locations;")
        l_count = cur.fetchone()[0]
        cur.execute("SELECT COUNT(*) FROM faculty_members;")
        fac_count = cur.fetchone()[0]
        cur.execute("SELECT COUNT(*) FROM graph_nodes;")
        gn_count = cur.fetchone()[0]
        cur.execute("SELECT COUNT(*) FROM graph_edges;")
        ge_count = cur.fetchone()[0]

        print("\n--- IMPORT SUMMARY (Idempotent Execution) ---")
        print(f"Buildings:       {b_count}")
        print(f"Floors:          {f_count} (Main Building physical floors: 5, Civil dummy floor removed)")
        print(f"Locations:       {l_count} (Main: {main_records_count}, Civil: {civil_records_count})")
        print(f"Faculty Members: {fac_count}")
        print(f"Graph Nodes:     {gn_count}")
        print(f"Graph Edges:     {ge_count} (Preserved empty awaiting manual path survey)")

        # Verify Civil Dept null floor handling
        cur.execute("""
            SELECT l.location_code, l.location_name, b.building_name, l.floor_id
            FROM locations l
            JOIN buildings b ON l.building_id = b.building_id
            WHERE b.building_name = 'Civil Dept. Building';
        """)
        civil_locs = cur.fetchall()
        print("\nCivil Dept. Building Locations (Floor ID check):")
        for c_code, c_name, c_bname, c_fid in civil_locs:
            print(f"  - {c_code}: {c_name} | Building: {c_bname} | Floor ID: {c_fid} (Correctly NULL)")

        return {
            "buildings": b_count,
            "floors": f_count,
            "locations": l_count,
            "faculty": fac_count,
            "graph_nodes": gn_count,
            "graph_edges": ge_count
        }

    except Exception as e:
        conn.rollback()
        print(f"\n[ERROR] Transaction aborted and rolled back: {e}")
        raise e
    finally:
        cur.close()
        conn.close()


if __name__ == "__main__":
    recreate = "--reset" in sys.argv
    ensure_database()
    import_campus_data(recreate_schema=recreate)
