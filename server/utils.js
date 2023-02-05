const autocannon = require("autocannon");
const PORT = process.env.PORT || 3001;

const sendFakeTraffic = async ({
  connections = 100,
  duration = 10,
  pipelining = 1,
  method = "GET",
  targetUrl,
} = {}) => {
  const instance = autocannon({
    workers: 4,
    url: targetUrl,
    connections,
    pipelining,
    duration,
    method,
    renderStatusCodes: true,
  });

  autocannon.track(instance);
  return instance;
};

const getRandomNumber = (rangeX, rangeY) => {
  return Math.floor(Math.random() * rangeY + rangeX);
};

module.exports = { sendFakeTraffic, getRandomNumber };
