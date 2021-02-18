import asyncio
import json
import random
import websockets

id = str(random.random())
websocket = None


async def send(message, data):
    if not websocket:
        return

    await websocket.send(json.dumps({"message": message, "data": data}))


async def send_heartbeat():
    # send a heartbeat every minute so that Serenade keeps the connection alive
    while True:
        if websocket:
            print("Sending heartbeat")
            await send("heartbeat", {"id": id})

        await asyncio.sleep(60)


async def handler():
    global websocket

    asyncio.create_task(send_heartbeat())
    while True:
        try:
            async with websockets.connect("ws://localhost:17373") as ws:
                websocket = ws
                print("Connected")

                # send an active message to tell Serenade we're running. since this is running from a terminal,
                # use "term" as the match regex, which will match iTerm, terminal, etc.
                await send(
                    "active",
                    {"id": id, "app": "python-echo", "match": "term"},
                )

                while True:
                    try:
                        message = await websocket.recv()
                        print(message)
                    except:
                        print("Disconnected")
                        websocket = None
                        break
        except OSError:
            websocket = None
            await asyncio.sleep(1)


if __name__ == "__main__":
    print("python-echo is running")
    asyncio.get_event_loop().run_until_complete(handler())
