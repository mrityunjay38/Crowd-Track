const express = require("express");
const app = express();
const cors = require("cors");
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

let userCount = 0;

/* For parsing application/json */
app.use(express.json());
/* End-For parsing application/json */

/* Start-Enable cors */
app.use(cors());
/* End-Enable cors*/

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

io.on("connection", (socket) => {
  socket.on("new_user", (arg) => {
    socket.broadcast.emit("online_user", { userCount: userCount + 1 });
    userCount += 1;
  });

  socket.on("disconnecting", () => {
    if (userCount) {
      socket.broadcast.emit("online_user", { userCount: userCount - 1 });
      userCount -= 1;
    } else {
      socket.broadcast.emit("online_user", { userCount: 0 });
      userCount = 0;
    }
  });
});

server.listen(PORT, () => {
  console.log("listening on *:3001");
});
