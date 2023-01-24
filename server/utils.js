const autocannon = require("autocannon");
const PORT = process.env.PORT || 3001;

const sendFakeTraffic = async ({
  connections = 100,
  duration = 10,
  pipelining = 1,
  method = "GET",
} = {}) => {
  const instance = autocannon({
    url: `http://localhost:${PORT}/fake-traffic`,
    connections,
    pipelining,
    duration,
    method,
    renderStatusCodes: true,
  });

  autocannon.track(instance);
  return instance;
};

module.exports = { sendFakeTraffic };
