import urllib.request
import urllib.error
import re
import sys

visited = set()
queue = ['/src/main.jsx']
errors = []

print("Auditing Vite module loading pipeline from http://localhost:5173/ ...")

while queue:
    path = queue.pop(0)
    if path in visited or not path.startswith('/'):
        continue
    visited.add(path)
    
    url = f"http://localhost:5173{path}"
    try:
        req = urllib.request.Request(url, headers={'Accept': '*/*'})
        with urllib.request.urlopen(req, timeout=5) as resp:
            content = resp.read().decode('utf-8', errors='replace')
            # Extract imported paths
            for match in re.finditer(r'from\s+["\'](/[^"\']+)["\']|import\s+["\'](/[^"\']+)["\']', content):
                imp = match.group(1) or match.group(2)
                if imp and imp not in visited and not imp.endswith(('.png', '.svg', '.jpg', '.css')):
                    queue.append(imp)
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8', errors='replace')[:400]
        errors.append((path, e.code, body))
        print(f"  [x] HTTP {e.code} for {path}")
    except Exception as e:
        errors.append((path, "Exception", str(e)))
        print(f"  [x] Error for {path}: {e}")

print(f"\nTotal modules checked: {len(visited)}")
if errors:
    print(f"Found {len(errors)} module resolution/compilation error(s):")
    for p, c, err in errors:
        print(f"\nPath: {p}\nCode: {c}\nDetails:\n{err}")
    sys.exit(1)
else:
    print("All modules compiled and returned HTTP 200 without syntax or transform errors.")

