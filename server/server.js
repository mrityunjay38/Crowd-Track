const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
const http = require("http");
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;
const { sendFakeTraffic } = require("./utils.js");
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
  },
});

/* For parsing application/json */
app.use(express.json());

/* Start-Enable cors + set static frontend */
app.use(cors());
app.use(express.static(path.join(__dirname, "../app/build")));
/* End-Enable cors + set static frontend */

app.get("/start-fake-traffic", async (req, res) => {
  const { connections, duration, pipelining } = req.query;
  const result = await sendFakeTraffic({
    connections: Number(connections),
    duration: Number(duration),
    pipelining: Number(pipelining),
  });
  if (result) {
    res.status(200);
    res.send();
  }
});

app.get("/fake-traffic", (req, res) => {
  io.volatile.emit("online_user", { type: "increase" }, (ack) => {
    res.status(200);
    res.send();
  });
  setTimeout(() => {
    io.volatile.emit("online_user", { type: "decrease" }, (ack) => {
      res.status(200);
      res.send();
    });
  }, 200);
});

app.post("/close-connect", (req, res) => {
  res.status(200);
  res.send();
  io.disconnectSockets();
});

server.listen(PORT, () => {
  console.log("listening on *:3001");
});
