import { useEffect, useState } from "react";
import "./App.css";
import { io } from "socket.io-client";
import axios from "axios";
const BASE_API = import.meta.env.VITE_BASE_API;
const SIMULATOR_API = import.meta.env.VITE_SIMULATOR_API;
const BASE_SOCKET = import.meta.env.VITE_BASE_SOCKET;
import { Bar } from "@ant-design/plots";
import { Row, Col } from "antd";
const MAX_CONNECTION = 1000;
const MAX_DURATION = 60 * 1;
const MAX_PIPELINE = 5;
const TIME_FRAME = 1;
let MAX_SCALE = MAX_CONNECTION * MAX_PIPELINE;

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

function App() {
  const [trafficCount, setTrafficCount] = useState(0);
  const [barTimer, setBarTimer] = useState(0);
  const [barChartData, setBarChartData] = useState({});

  useEffect(() => {
    const socket = io(BASE_SOCKET);
    userEmitter(socket);
    subscribeListner(socket);

    /* Pre-define bar chart scale */
    setBarChartData(defineBarAxisScale());

    return () => unsubscribeListner(socket);
  }, []);

  useEffect(() => {
    if (barTimer) {
      const updatedChartData = { ...barChartData };
      updatedChartData[barTimer] = trafficCount;
      setBarChartData(updatedChartData);
    }
  }, [barTimer]);

  const userEmitter = (socket) => {
    socket.emit("new_user");
  };

  const subscribeListner = (socket) => {
    socket.on("online_user", ({ userCount }) => setTrafficCount(userCount));
  };

  const unsubscribeListner = (socket) => {
    socket.disconnect();
  };

  const startBarTimer = () => {
    const hook = setInterval(() => {
      setBarTimer((prev) => prev + TIME_FRAME);
    }, TIME_FRAME * 1000);
    return hook;
  };

  const endBarTimer = (hook) => {
    clearInterval(hook);
    setBarTimer(0);
  };

  const defineBarAxisScale = () => {
    const points = new Array(MAX_DURATION)
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
    const barHook = startBarTimer();
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
      .then(() => {
        endBarTimer(barHook);
      });
  };

  const plotBarChart = Object.entries(barChartData)
    .reverse()
    .map(([key, val]) => ({
      x: val,
      y: key,
    }));

  if (trafficCount > MAX_SCALE) {
    MAX_SCALE = trafficCount;
  }

  const barChartConfig = {
    ...baseConfig,
    xField: "x",
    yField: "y",
    slider: {
      start: 0,
      end: 1,
    },
    meta: {
      x: {
        max: MAX_SCALE,
      },
    },
  };

  return (
    <Row className="container">
      <Col span={8} className="panel flex col justify align center">
        <span className="label caption">Right Now</span>
        <div className="active-user">{trafficCount}</div>
        <span className="label text">simulated users on site</span>
        <button className="btn-simulate" onClick={simulateTraffic}>
          Simulate Traffic
        </button>
      </Col>
      <Col span={16} className="chart-plot flex col justify center">
        <span className="label chart-title">Pageviews / second</span>
        <div id="bar">
          <Bar {...barChartConfig} data={plotBarChart} />
        </div>
      </Col>
    </Row>
  );
}

export default App;
