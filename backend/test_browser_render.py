import asyncio
import json
import subprocess
import time
import urllib.request
import websockets

async def run_audit():
    chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
    user_data_dir = r"C:\Users\varda\AppData\Local\Temp\chrome_debug_profile_9333"
    
    # Launch Chrome on port 9333
    cmd = [
        chrome_path,
        "--remote-debugging-port=9333",
        f"--user-data-dir={user_data_dir}",
        "--headless=new",
        "--disable-gpu",
        "--no-first-run",
        "--no-default-browser-check",
        "http://localhost:5173/"
    ]
    proc = subprocess.Popen(cmd)
    time.sleep(2)

    try:
        req = urllib.request.urlopen("http://127.0.0.1:9333/json")
        targets = json.loads(req.read().decode())
        page_target = next(t for t in targets if t["type"] == "page")
        ws_url = page_target["webSocketDebuggerUrl"]
        print("Connected to Chrome WS:", ws_url)

        async with websockets.connect(ws_url) as ws:
            # Enable domains
            await ws.send(json.dumps({"id": 1, "method": "Page.enable"}))
            await ws.send(json.dumps({"id": 2, "method": "Runtime.enable"}))
            await ws.send(json.dumps({"id": 3, "method": "Log.enable"}))
            await ws.send(json.dumps({"id": 4, "method": "Network.enable"}))

            logs = []
            exceptions = []
            
            # Listen for 5 seconds to capture all events
            start = time.time()
            while time.time() - start < 5.0:
                try:
                    msg = await asyncio.wait_for(ws.recv(), timeout=0.5)
                    data = json.loads(msg)
                    method = data.get("method")
                    if method == "Runtime.consoleAPICalled":
                        logs.append(data["params"])
                        print(f"[CONSOLE {data['params']['type']}]", [a.get('value', a) for a in data['params']['args']])
                    elif method == "Runtime.exceptionThrown":
                        exceptions.append(data["params"])
                        print(f"[EXCEPTION]", json.dumps(data['params'], indent=2))
                    elif method == "Log.entryAdded":
                        print(f"[LOG]", data["params"]["entry"])
                except asyncio.TimeoutError:
                    pass

            # Evaluate document.location.href
            await ws.send(json.dumps({
                "id": 10,
                "method": "Runtime.evaluate",
                "params": {"expression": "window.location.href"}
            }))
            res_url = json.loads(await ws.recv())
            print("\nCurrent URL:", res_url.get("result", {}).get("result", {}).get("value"))

            # Evaluate document.body.innerHTML
            await ws.send(json.dumps({
                "id": 11,
                "method": "Runtime.evaluate",
                "params": {"expression": "document.body.innerHTML"}
            }))
            res_body = json.loads(await ws.recv())
            html = res_body.get("result", {}).get("result", {}).get("value", "")
            print("\nBody HTML length after 5 seconds:", len(html))
            print("Contains 'Main Building'?", "Main Building" in html)
            print("Contains 'Auditorium'?", "Auditorium" in html)
            print("Contains 'corridors-group'?", "corridors-group" in html)
            print("Contains 'unipath_session_loaded'?", "unipath_session_loaded" in html)
            print("Exceptions count:", len(exceptions))

            open("backend/real_page_dom.html", "w", encoding="utf-8").write(html)
            print("Saved backend/real_page_dom.html")

    finally:
        proc.terminate()
        proc.wait()

if __name__ == "__main__":
    asyncio.run(run_audit())
