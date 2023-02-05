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
const MAX_PIPELINE = 1;
const TIME_FRAME = 5;
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
};

const lineChartConfig = {
  ...baseConfig,
  xField: "x",
  yField: "y",
  slider: {
    start: 0,
    end: 1,
  },
};

const barChartConfig = {
  ...baseConfig,
  xField: "y",
  yField: "x",
  scrollbar: {
    type: "vertical",
  },
};

function App() {
  const [trafficCount, setTrafficCount] = useState(0);
  const [timer, setTimer] = useState(0);
  const [chartData, setChartData] = useState({});

  useEffect(() => {
    const socket = io(BASE_SOCKET);
    userEmitter(socket);
    subscribeListner(socket);

    /* Pre-define line chart scale */
    setChartData(defineAxisScale());

    return () => unsubscribeListner(socket);
  }, []);

  useEffect(() => {}, [timer]);

  const userEmitter = (socket) => {
    socket.emit("new_user");
  };

  const subscribeListner = (socket) => {
    socket.on("online_user", ({ userCount }) => setTrafficCount(userCount));
  };

  const unsubscribeListner = (socket) => {
    socket.disconnect();
  };

  const startTimer = () => {
    const hook = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 5000);
    return hook;
  };

  const endTimer = (hook) => clearInterval(hook);

  const defineAxisScale = () => {
    const points = new Array(MAX_DURATION / TIME_FRAME)
      .fill(TIME_FRAME)
      .reduce((acc, point, index) => {
        if (index !== 0) acc.push(acc[index - 1] + point);
        else acc.push(point);
        return acc;
      }, [])
      .reduce((acc, point) => {
        acc[point] = 0;
        return acc;
      }, {});
    return points;
  };

  const simulateTraffic = () => {
    const hook = startTimer();
    axios
      .get(SIMULATOR_API + "/simulate-traffic", {
        params: {
          connections: MAX_CONNECTION,
          duration: MAX_DURATION,
          pipelining: MAX_PIPELINE,
          targetUrl: "http://127.0.0.1:3001",
        },
      })
      .catch((err) => err)
      .then(() => endTimer(hook));
  };

  const plotChartData = Object.entries(chartData).map(([key, val]) => ({
    x: key,
    y: val,
  }));

  return (
    <Row className="container">
      <Col span={6} className="panel flex col justify align center">
        <div className="active-user">{trafficCount}</div>
        <button onClick={simulateTraffic}>Simulate Traffic</button>
      </Col>
      <Col span={18} className="chart-plot flex col justify center">
        <div id="line">
          <Line {...lineChartConfig} data={plotChartData} />
        </div>
        <div id="bar">
          <Bar {...barChartConfig} data={plotChartData} />
        </div>
      </Col>
    </Row>
  );
}

export default App;
