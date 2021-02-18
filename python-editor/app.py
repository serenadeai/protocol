import asyncio
import json
import random
import traceback
import websockets

import editor

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
            await send("heartbeat", {"id": id})

        await asyncio.sleep(60)


async def handle(message):
    result = None
    data = json.loads(message)["data"]

    # if Serenade doesn't have anything for us to execute, then we're done
    if not data["response"]["execute"]:
        return

    for command in data["response"]["execute"]["commandsList"]:
        if command["type"] == "COMMAND_TYPE_GET_EDITOR_STATE":
            result = {
                "message": "editorState",
                "data": editor.get_editor_state(command.get("limited", False)),
            }
        elif command["type"] == "COMMAND_TYPE_DIFF":
            editor.set_source(command["source"])
            editor.set_cursor(command["cursor"])
        elif command["type"] == "COMMAND_TYPE_NEXT_TAB":
            editor.next_tab()
        elif command["type"] == "COMMAND_TYPE_PREVIOUS_TAB":
            editor.previous_tab()

    if result:
        await send("callback", {"callback": data["callback"], "data": result})
    else:
        await send("completed", {})


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
                    {"id": id, "app": "python-editor", "match": "term"},
                )

                while True:
                    try:
                        message = await websocket.recv()
                        await handle(message)
                    except websockets.exceptions.ConnectionClosedError:
                        print("Disconnected")
                        websocket = None
                        break
        except OSError:
            websocket = None
            await asyncio.sleep(1)


if __name__ == "__main__":
    print("python-editor is running")
    asyncio.get_event_loop().run_until_complete(handler())
