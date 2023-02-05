import { useEffect, useState } from "react";
import "./App.css";
import { io } from "socket.io-client";
import axios from "axios";
const BASE_API = import.meta.env.VITE_BASE_API;
const SIMULATOR_API = import.meta.env.VITE_SIMULATOR_API;
const BASE_SOCKET = import.meta.env.VITE_BASE_SOCKET;
import { Line, Bar } from "@ant-design/plots";
import { Empty, Row, Col } from "antd";
const MAX_CONNECTION = 100;
const MAX_DURATION = 60 * 1;
const MAX_PIPELINE = 2;
let MAX_Y_SCALE = MAX_CONNECTION;

const baseConfig = {
  data: [],
  autoFit: true,
  legend: {
    position: "top",
  },
  smooth: true,
  animation: {
    appear: {
      animation: "path-in",
      duration: 100,
    },
  },
  slider: {
    start: 0,
    end: 1,
  },
};

const lineChartConfig = {
  ...baseConfig,
  xField: "x",
  yField: "y",
};

const barChartConfig = {
  ...baseConfig,
};

function App() {
  const [trafficCount, setTrafficCount] = useState(0);

  useEffect(() => {
    const socket = io(BASE_SOCKET);
    userEmitter(socket);
    subscribeListner(socket);
    return () => unsubscribeListner(socket);
  }, []);

  const userEmitter = (socket) => {
    socket.emit("new_user");
  };

  const subscribeListner = (socket) => {
    socket.on("online_user", ({ userCount }) => setTrafficCount(userCount));
  };

  const unsubscribeListner = (socket) => {
    socket.disconnect();
  };

  const simulateTraffic = () => {
    axios
      .get(SIMULATOR_API + "/simulate-traffic", {
        params: {
          connections: MAX_CONNECTION,
          duration: MAX_DURATION,
          pipelining: MAX_PIPELINE,
          targetUrl: "http://127.0.0.1:3001",
        },
      })
      .catch((err) => err);
  };

  return (
    <Row className="container">
      <Col span={6} className="panel flex col justify align center">
        <div className="active-user">{trafficCount}</div>
        <button onClick={simulateTraffic}>Simulate Traffic</button>
      </Col>
      <Col span={18} className="chart-plot flex col justify center">
        <div id="line">
          <Line {...lineChartConfig} data={[]} />
        </div>
        <div id="bar">
          <Bar {...barChartConfig} data={[]} />
        </div>
      </Col>
    </Row>
  );
}

export default App;
