const express = require("express");
const app = express();
const cors = require("cors");
const http = require("http");
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;
const { getRandomNumber } = require("./utils");
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

app.get("/", (req, res) => {
  io.emit("online_user", { userCount: userCount + 1 }, () => {
    userCount += 1;
    res.status(200);
    res.send();

    setTimeout(() => {
      io.emit("online_user", { userCount: userCount - 1 }, () => {
        userCount -= 1;
      });
    }, getRandomNumber(0, 10) * 1000);
  });
});

const onUserConnect = (socket, arg) => {
  socket.broadcast.emit("online_user", { userCount: userCount + 1 });
  userCount += 1;
};

const onUserDisconnect = (socket, arg) => {
  if (userCount) {
    socket.broadcast.emit("online_user", { userCount: userCount - 1 });
    userCount -= 1;
  } else {
    socket.broadcast.emit("online_user", { userCount: 0 });
    userCount = 0;
  }
};

io.on("connection", (socket) => {
  socket.on("new_user", (arg) => {
    onUserConnect(socket, arg);
  });

  socket.on("disconnecting", (arg) => {
    onUserDisconnect(socket, arg);
  });
});

server.listen(PORT, () => {
  console.clear();
  console.log(`listening on *:${PORT}`, process.pid);
});
