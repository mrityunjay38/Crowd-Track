const express = require("express");
const app = express();
const cors = require("cors");
const http = require("http");
const server = http.createServer(app);
const PORT = process.env.PORT || 3002;
const { sendFakeTraffic } = require("./utils.js");

/* Start-Enable cors */
app.use(cors());
/* End-Enable cors*/

app.get("/simulate-traffic", async (req, res) => {
  const { connections, duration, pipelining, targetUrl } = req.query;
  const result = await sendFakeTraffic({
    connections: Number(connections),
    duration: Number(duration),
    pipelining: Number(pipelining),
    targetUrl,
  });
  if (result) {
    res.status(200);
    res.send();
  }
});

server.listen(PORT, () => {
  console.clear();
  console.log(`listening on *:${PORT}`, process.pid);
});
