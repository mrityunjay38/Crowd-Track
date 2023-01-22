const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
const http = require("http");
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;

/* Start-Enable cors + set static frontend */
app.use(cors());
app.use(express.static(path.join(__dirname, "../app/build")));
/* End-Enable cors + set static frontend */

app.post("/", (req, res) => {
  res.status(200);
  res.send();
});

server.listen(PORT, () => {
  console.log("listening on *:3001");
});
