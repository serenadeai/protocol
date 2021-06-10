const WebSocket = require("ws");
const editor = require("./editor");

const id = Math.random().toString();
let websocket = null;

const connect = () => {
  if (websocket) {
    return;
  }
  websocket = new WebSocket("ws://localhost:17373");

  websocket.on("error", (e) => {
    // ignore errors caused by the Serenade client not running
    if (e.code != "ECONNREFUSED") {
      console.error(e);
    }
  });

  websocket.on("open", () => {
    console.log("Connected");

    // send an active message to tell Serenade we're running. since this is running from a terminal, use
    // "term" as the match regex, which will match iTerm, terminal, etc.
    send("active", {
      id,
      app: "javascript-editor",
      match: "term",
    });
  });

  websocket.on("close", () => {
    console.log("Disconnected");
    websocket = null;
  });

  websocket.on("message", (message) => {
    handle(message);
  });
};

const handle = (message) => {
  // if Serenade doesn't have anything for us to execute, then we're done
  const data = JSON.parse(message).data;
  if (!data.response || !data.response.execute) {
    return;
  }

  let result = {
    message: "completed";
  }

  for (const command of data.response.execute.commandsList) {
    // handle a small subset of commands for this example
    switch (command.type) {
      case "COMMAND_TYPE_GET_EDITOR_STATE":
        result = {
          message: "editorState",
          data: editor.getEditorState(command.limited),
        };
        break;
      case "COMMAND_TYPE_DIFF":
        editor.setSource(command.source);
        editor.setCursor(command.cursor);
        break;
      case "COMMAND_TYPE_NEXT_TAB":
        editor.nextTab();
        break;
      case "COMMAND_TYPE_PREVIOUS_TAB":
        editor.previousTab();
        break;
    }
  }

  send("callback", {
    callback: data.callback,
    data: result
  });
};

const send = (message, data) => {
  if (!websocket || websocket.readyState != 1) {
    return;
  }

  try {
    websocket.send(JSON.stringify({ message, data }));
  } catch (e) {
    websocket = null;
  }
};

const start = () => {
  console.log("javascript-editor is running");

  connect();
  setInterval(() => {
    connect();
  }, 1000);

  setInterval(() => {
    send("heartbeat", {
      id,
    });
  }, 60 * 1000);
};

start();
