import asyncio
import json
import subprocess
import time
import urllib.request
import websockets
import base64

async def take_screenshot():
    chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
    user_data_dir = r"C:\Users\varda\AppData\Local\Temp\chrome_debug_profile_new_ui"
    
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
            await ws.send(json.dumps({"id": 1, "method": "Page.enable"}))
            await asyncio.sleep(2.5)

            # Capture screenshot
            await ws.send(json.dumps({"id": 2, "method": "Page.captureScreenshot", "params": {"format": "png"}}))
            while True:
                res = json.loads(await ws.recv())
                if res.get("id") == 2:
                    data = res["result"]["data"]
                    with open("new_homepage.png", "wb") as f:
                        f.write(base64.b64decode(data))
                    print("Screenshot saved successfully as new_homepage.png!")
                    break
    finally:
        proc.terminate()
        proc.wait()

if __name__ == "__main__":
    asyncio.run(take_screenshot())
