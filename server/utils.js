const autocannon = require("autocannon");

const sendFakeTraffic = async ({
  connections = 100,
  duration = 10,
  pipelining = 1,
  method = "GET",
  targetUrl,
} = {}) => {
  const instance = autocannon({
    url: targetUrl,
    connections,
    pipelining,
    duration,
    method,
  });

  autocannon.track(instance, {
    renderStatusCodes: true,
    renderLatencyTable: true,
  });
  return instance;
};

const getRandomNumber = (rangeX, rangeY) => {
  return Math.floor(Math.random() * rangeY + rangeX);
};

module.exports = { sendFakeTraffic, getRandomNumber };
