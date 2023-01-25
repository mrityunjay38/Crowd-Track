import { useEffect, useState } from "react";
import "./App.css";
import { io } from "socket.io-client";
import axios from "axios";
const BASE_API = import.meta.env.VITE_BASE_API;
const BASE_SOCKET = import.meta.env.VITE_BASE_SOCKET;
import { Line } from "@ant-design/plots";
import { Empty } from "antd";
const MAX_CONNECTION = 5000;
const MAX_DURATION = 10;
const MAX_PIPELINE = 1;
let MAX_Y_SCALE = MAX_CONNECTION;

function App() {
  const [activeUser, setActiveUser] = useState(0);
  const [timer, startTimer] = useState(false);
  const [counter, setCounter] = useState(0);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const socket = io(BASE_SOCKET);
    socket.on("online_user", ({ type }) => {
      if (type === "increase") setActiveUser((prev) => prev + 1);
      else if (type === "decrease") setActiveUser((prev) => prev - 1);
    });
    return () => {
      socket.disconnect();
      axios.post(BASE_API + "/close-connect").catch((err) => err);
    };
  }, []);

  useEffect(() => {
    let interval;
    if (timer) {
      interval = setInterval(() => {
        setCounter((prev) => prev + 1);
      }, 1000);
    } else {
      setCounter(0);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    if (counter > 0)
      setChartData((prev) => [...prev, { x: counter, y: activeUser }]);
  }, [counter]);

  const sendFakeTraffic = () => {
    startTimer(true);
    setChartData([]);
    axios
      .get(BASE_API + "/start-fake-traffic", {
        params: {
          connections: MAX_CONNECTION,
          duration: MAX_DURATION,
          pipelining: MAX_PIPELINE,
        },
      })
      .then((res) => startTimer(false))
      .catch((err) => err);
  };

  let yScale = MAX_Y_SCALE;
  if (activeUser > MAX_Y_SCALE) {
    yScale = activeUser;
    MAX_Y_SCALE = activeUser;
  }

  const chartConfig = {
    data: [],
    autoFit: true,
    xField: "x",
    yField: "y",
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
    meta: {
      y: {
        max: yScale,
      },
    },
  };

  return (
    <>
      <div className="panel">
        <button onClick={sendFakeTraffic} disabled={timer}>
          Send Fake Traffic
        </button>
      </div>
      <div className="active-user">{activeUser}</div>
      <div className="chart">
        {(() => {
          if (chartData?.length) {
            return <Line {...chartConfig} data={chartData} />;
          } else {
            return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />;
          }
        })()}
      </div>
    </>
  );
}

export default App;
