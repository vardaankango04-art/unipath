import asyncio
import json
import subprocess
import time
import urllib.request
import websockets
import base64

async def test_full_navigation():
    chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
    user_data_dir = r"C:\Users\varda\AppData\Local\Temp\chrome_debug_profile_nav_test"
    
    cmd = [
        chrome_path,
        "--remote-debugging-port=9333",
        f"--user-data-dir={user_data_dir}",
        "--headless=new",
        "--disable-gpu",
        "--window-size=1440,900",
        "http://localhost:5173/"
    ]
    proc = subprocess.Popen(cmd)
    time.sleep(2.5)

    try:
        req = urllib.request.urlopen("http://127.0.0.1:9333/json")
        targets = json.loads(req.read().decode())
        page_target = next(t for t in targets if t["type"] == "page")
        ws_url = page_target["webSocketDebuggerUrl"]

        async with websockets.connect(ws_url) as ws:
            # Enable domains
            await ws.send(json.dumps({"id": 1, "method": "Page.enable"}))
            await ws.send(json.dumps({"id": 2, "method": "Runtime.enable"}))

            exceptions = []
            
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
                    elif m.get("method") == "Runtime.exceptionThrown":
                        exceptions.append(m["params"])

            # Wait 3.5s for initial animation and data load
            await asyncio.sleep(3.5)

            # 1. Verify URL is /map
            url = await send_eval("window.location.pathname")
            print("Current pathname:", url)
            assert url == "/map", f"Expected /map, got {url}"

            # 2. Check room elements in Ground Floor
            ground_rooms = await send_eval("document.querySelectorAll('#rooms-group-floor-G .interactive-room').length")
            print("Ground Floor interactive rooms count:", ground_rooms)
            assert ground_rooms > 0, "No rooms found on Ground Floor"

            # 3. Test floor switching to First Floor
            print("\nSwitching to First Floor (Clicking 'First')...")
            await send_eval("""
                (() => {
                    const btns = Array.from(document.querySelectorAll('button'));
                    const firstBtn = btns.find(b => b.textContent.trim() === 'First');
                    if (firstBtn) firstBtn.click();
                    return !!firstBtn;
                })()
            """)
            await asyncio.sleep(1.0)
            first_rooms = await send_eval("document.querySelectorAll('#rooms-group-floor-1 .interactive-room').length")
            badge_text = await send_eval("document.querySelector('.font-heading.font-bold').textContent")
            print("First Floor badge:", badge_text)
            print("First Floor interactive rooms count:", first_rooms)

            # 4. Test floor switching to Second Floor
            print("\nSwitching to Second Floor (Clicking 'Second')...")
            await send_eval("""
                (() => {
                    const btns = Array.from(document.querySelectorAll('button'));
                    const btn = btns.find(b => b.textContent.trim() === 'Second');
                    if (btn) btn.click();
                    return !!btn;
                })()
            """)
            await asyncio.sleep(1.0)
            second_rooms = await send_eval("document.querySelectorAll('#rooms-group-floor-2 .interactive-room').length")
            badge_text2 = await send_eval("document.querySelector('.font-heading.font-bold').textContent")
            print("Second Floor badge:", badge_text2)
            print("Second Floor interactive rooms count:", second_rooms)

            # 5. Test floor switching to Third Floor
            print("\nSwitching to Third Floor (Clicking 'Third')...")
            await send_eval("""
                (() => {
                    const btns = Array.from(document.querySelectorAll('button'));
                    const btn = btns.find(b => b.textContent.trim() === 'Third');
                    if (btn) btn.click();
                    return !!btn;
                })()
            """)
            await asyncio.sleep(1.0)
            third_rooms = await send_eval("document.querySelectorAll('#rooms-group-floor-3 .interactive-room').length")
            badge_text3 = await send_eval("document.querySelector('.font-heading.font-bold').textContent")
            print("Third Floor badge:", badge_text3)
            print("Third Floor interactive rooms count:", third_rooms)

            # 6. Switch back to Ground Floor and click a room
            print("\nSwitching back to Ground Floor and selecting 'Placement Cell'...")
            await send_eval("""
                (() => {
                    const btns = Array.from(document.querySelectorAll('button'));
                    const btn = btns.find(b => b.textContent.trim() === 'Ground');
                    if (btn) btn.click();
                    return !!btn;
                })()
            """)
            await asyncio.sleep(1.0)
            await send_eval("""
                (() => {
                    const room = document.getElementById('G_PLACEMENT_CELL');
                    if (room) { room.dispatchEvent(new MouseEvent('click', { bubbles: true })); return true; }
                    return false;
                })()
            """)
            await asyncio.sleep(1.5)

            selected_dest = await send_eval("document.querySelector('.font-heading.text-sm.sm\\\\:text-\\\\[16px\\\\].font-extrabold')?.textContent")
            print("Selected destination in top bar:", selected_dest)

            # Check if route polyline is rendered
            route_polyline = await send_eval("document.querySelector('#route-path-group polyline')?.getAttribute('points')")
            print("Route polyline rendered:", route_polyline is not None)
            if route_polyline:
                print("Polyline points sample:", route_polyline[:60] + "...")

            # 7. Test Explore and Saved pages
            print("\nTesting /explore route...")
            await send_eval("window.history.pushState({}, '', '/explore'); window.dispatchEvent(new PopStateEvent('popstate'));")
            await asyncio.sleep(1.5)
            explore_title = await send_eval("document.querySelector('h1')?.textContent")
            print("Explore page title:", explore_title)

            print("\nTesting /saved route...")
            await send_eval("window.history.pushState({}, '', '/saved'); window.dispatchEvent(new PopStateEvent('popstate'));")
            await asyncio.sleep(1.5)
            saved_title = await send_eval("document.querySelector('h1')?.textContent")
            print("Saved page title:", saved_title)

            # Return to /map
            await send_eval("window.history.pushState({}, '', '/map'); window.dispatchEvent(new PopStateEvent('popstate'));")
            await asyncio.sleep(1.5)

            # Capture screenshot
            await ws.send(json.dumps({"id": 200, "method": "Page.captureScreenshot", "params": {"format": "png"}}))
            while True:
                m = json.loads(await ws.recv())
                if m.get("id") == 200:
                    data = m["result"]["data"]
                    with open("unipath_ground_verified.png", "wb") as f:
                        f.write(base64.b64decode(data))
                    print("Saved unipath_ground_verified.png")
                    break

            print("\nTotal runtime exceptions caught:", len(exceptions))
            if exceptions:
                for ex in exceptions:
                    print("Exception:", ex)
            else:
                print("All tests passed with ZERO exceptions!")

    finally:
        proc.terminate()
        proc.wait()

if __name__ == "__main__":
    asyncio.run(test_full_navigation())

