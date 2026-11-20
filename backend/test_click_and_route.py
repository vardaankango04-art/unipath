import asyncio
import json
import subprocess
import time
import urllib.request
import websockets
import base64

async def test_click_and_screenshot():
    chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
    user_data_dir = r"C:\Users\varda\AppData\Local\Temp\chrome_debug_profile_route_test"
    
    cmd = [
        chrome_path,
        "--remote-debugging-port=9333",
        f"--user-data-dir={user_data_dir}",
        "--headless=new",
        "--disable-gpu",
        "--window-size=1440,900",
        "http://localhost:5173/map"
    ]
    proc = subprocess.Popen(cmd)
    time.sleep(2.5)

    try:
        req = urllib.request.urlopen("http://127.0.0.1:9333/json")
        targets = json.loads(req.read().decode())
        page_target = next(t for t in targets if t["type"] == "page")
        ws_url = page_target["webSocketDebuggerUrl"]

        async with websockets.connect(ws_url) as ws:
            await ws.send(json.dumps({"id": 1, "method": "Page.enable"}))
            await ws.send(json.dumps({"id": 2, "method": "Runtime.enable"}))

            async def send_eval(expr):
                await ws.send(json.dumps({
                    "id": 100,
                    "method": "Runtime.evaluate",
                    "params": {"expression": expr, "returnByValue": True}
                }))
                while True:
                    m = json.loads(await ws.recv())
                    if m.get("id") == 100:
                        return m.get("result", {}).get("result", {}).get("value")

            # Wait for data load
            await asyncio.sleep(3.0)

            # Click Placement Cell
            clicked = await send_eval("""
                (() => {
                    const el = document.getElementById('Placement Cell');
                    if (el) {
                        el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
                        return true;
                    }
                    return false;
                })()
            """)
            print("Placement Cell clicked:", clicked)

            # Wait 1.5s for Dijkstra API call
            await asyncio.sleep(2.0)

            dest_name = await send_eval("document.querySelector('.font-heading.text-sm.sm\\\\:text-\\\\[16px\\\\].font-extrabold')?.textContent")
            print("Destination Name in Top Bar:", dest_name)

            has_polyline = await send_eval("document.querySelector('#route-path-group polyline') !== null")
            print("Polyline element present in DOM:", has_polyline)

            polyline_points = await send_eval("document.querySelector('#route-path-group polyline')?.getAttribute('points')")
            print("Polyline points:", polyline_points)

            # Capture screenshot
            await ws.send(json.dumps({"id": 200, "method": "Page.captureScreenshot", "params": {"format": "png"}}))
            while True:
                m = json.loads(await ws.recv())
                if m.get("id") == 200:
                    data = m["result"]["data"]
                    with open("unipath_route_active.png", "wb") as f:
                        f.write(base64.b64decode(data))
                    print("Saved unipath_route_active.png")
                    break

    finally:
        proc.terminate()
        proc.wait()

if __name__ == "__main__":
    asyncio.run(test_click_and_screenshot())

