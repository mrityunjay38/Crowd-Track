import { useEffect, useState } from "react";
import "./App.css";
import { io } from "socket.io-client";
import axios from "axios";
const BASE_API = import.meta.env.VITE_BASE_API;
const BASE_SOCKET = import.meta.env.VITE_BASE_SOCKET;

function App() {
  const [activeUser, setActiveUser] = useState(0);

  useEffect(() => {
    const socket = io(BASE_SOCKET);
    socket.on("online_user", ({ type }) => {
      if (type === "increase") setActiveUser((prev) => prev + 1);
      else if (type === "decrease") setActiveUser((prev) => prev - 1);
    });
    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    return () => axios.post(BASE_API + "/close-connect").catch((err) => err);
  }, []);

  const sendFakeTraffic = () => {
    axios
      .get(BASE_API + "/start-fake-traffic", { params: { connections: 100 } })
      .catch((err) => err);
  };

  return (
    <>
      <div className="panel">
        <button onClick={sendFakeTraffic}>Send Fake Traffic</button>
      </div>
      <div className="active-user">{activeUser}</div>
    </>
  );
}

export default App;
