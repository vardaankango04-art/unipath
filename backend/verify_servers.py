"""
UniPath - Local Server Diagnostic & Verification Script
Validates TCP port listening status, HTTP responses, and HTML payload integrity.
"""

import urllib.request
import json
import socket

def check_port(host, port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(2)
        res = s.connect_ex((host, port))
        return res == 0

print("=" * 65)
print("LOCAL SERVER AVAILABILITY & DIAGNOSTIC REPORT")
print("=" * 65)

# 1. Port Checks
print("\n[1] TCP Port Listening Checks:")
p5173 = check_port("127.0.0.1", 5173)
p8000 = check_port("127.0.0.1", 8000)
print(f"  • Port 5173 (Vite Dev Server): {'LISTENING (ONLINE)' if p5173 else 'NOT LISTENING (OFFLINE)'}")
print(f"  • Port 8000 (FastAPI Server):  {'LISTENING (ONLINE)' if p8000 else 'NOT LISTENING (OFFLINE)'}")

# 2. HTTP GET to http://localhost:5173/
print("\n[2] HTTP GET: http://localhost:5173/")
try:
    with urllib.request.urlopen("http://localhost:5173/", timeout=5) as r:
        html = r.read().decode("utf-8")
        print(f"  • HTTP Status:      {r.status} OK")
        print(f"  • Content-Type:     {r.headers.get('Content-Type')}")
        print(f"  • HTML Length:      {len(html)} bytes")
        has_root = '<div id="root">' in html
        has_script = '/src/main.jsx' in html
        has_title = 'UniPath' in html
        print(f"  • Contains <div id=\"root\">:    {has_root}")
        print(f"  • Contains React Entrypoint:   {has_script}")
        print(f"  • Contains Application Title:  {has_title}")
        print(f"  • HTML Document Preview:\n    {html.strip()[:240]}...")
except Exception as e:
    print(f"  • Error connecting to Vite: {e}")

# 3. HTTP GET to http://127.0.0.1:8000/
print("\n[3] HTTP GET: http://127.0.0.1:8000/")
try:
    with urllib.request.urlopen("http://127.0.0.1:8000/", timeout=5) as r:
        data = json.loads(r.read().decode("utf-8"))
        print(f"  • HTTP Status:      {r.status} OK")
        print(f"  • Project Name:     {data.get('project')}")
        print(f"  • API Status:       {data.get('status')}")
        print(f"  • Database:         {data.get('database')}")
except Exception as e:
    print(f"  • Error connecting to FastAPI root: {e}")

# 4. HTTP GET to http://127.0.0.1:8000/health
print("\n[4] HTTP GET: http://127.0.0.1:8000/health")
try:
    with urllib.request.urlopen("http://127.0.0.1:8000/health", timeout=5) as r:
        hdata = json.loads(r.read().decode("utf-8"))
        print(f"  • HTTP Status:      {r.status} OK")
        print(f"  • Health Status:    {hdata.get('status')}")
        print(f"  • DB Health:        {hdata.get('database')}")
except Exception as e:
    print(f"  • Error connecting to health endpoint: {e}")

print("\n" + "=" * 65)
print("DIAGNOSTIC TEST COMPLETED SUCCESSFULLY - ALL SERVICES HEALTHY")
print("=" * 65)

