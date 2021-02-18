const WebSocket = require("ws");

const id = Math.random().toString();
let websocket = null;

const connect = () => {
  if (websocket) {
    return;
  }

  // connect to the Serenade, which runs a websocket server on localhost, port 17373
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
      app: "javascript-echo",
      match: "term",
    });
  });

  websocket.on("close", () => {
    console.log("Disconnected");
    websocket = null;
  });

  websocket.on("message", (message) => {
    // simply log all messages received from Serenade to the console. this can be useful for debugging.
    console.log(`Received ${message}`);
  });
};

const send = (message, data) => {
  // don't send messages if the websocket is not connected
  if (!websocket || websocket.readyState != 1) {
    return;
  }

  try {
    console.log(`Sending ${message}: ${JSON.stringify(data)}`);
    websocket.send(JSON.stringify({ message, data }));
  } catch (e) {
    websocket = null;
  }
};

const start = () => {
  console.log("javascript-echo is running");

  // continuously make sure that we're connected to the running Serenade app
  connect();
  setInterval(() => {
    connect();
  }, 1000);

  // send a heartbeat every minute so that Serenade keeps the connection alive
  setInterval(() => {
    console.log("Sending heartbeat");
    send("heartbeat", {
      id,
    });
  }, 60 * 1000);
};

start();
