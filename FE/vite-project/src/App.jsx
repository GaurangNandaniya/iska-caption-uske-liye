import { useEffect, useRef, useState } from "react";
import "./App.css";
import { API_URL } from "./constants.js";
import AskModeComp from "./Comps/AskModeComp.jsx";
import AdminAskModeComp from "./Comps/AdminAskModeComp.jsx";
import RevealModeComp from "./Comps/RevealModeComp.jsx";

function App() {
  const [name, setName] = useState("");
  const [mode, setMode] = useState("ASK");
  const [userInfo, setUserInfo] = useState(() => {
    const userInfoFromStorage = localStorage.getItem("userInfo");
    return userInfoFromStorage ? JSON.parse(userInfoFromStorage) : null;
  });
  const webSocketRef = useRef(null);

  useEffect(() => {
    const ws = new WebSocket("ws://10.107.89.79:3000/ws");
    ws.onopen = () => {
      console.log("WebSocket connection established");
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "MODE_UPDATE") {
        setMode(message.mode);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    webSocketRef.current = ws;

    return () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    //fetch mode
    const fetchMode = async () => {
      const response = await fetch(`${API_URL}/mode/get`);
      const data = await response.json();
      setMode(data.mode);
    };
    fetchMode();
  }, []);

  const isAdmin = (() => {
    const userInfoFromStorage = localStorage.getItem("userInfo");
    return userInfoFromStorage
      ? JSON.parse(userInfoFromStorage).isAdmin &&
          JSON.parse(userInfoFromStorage).code == "icu1"
      : false;
  })();

  const createUser = async () => {
    const response = await fetch(`${API_URL}/user/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    });
    const data = await response.json();
    setUserInfo(data);
    localStorage.setItem("userInfo", JSON.stringify(data));
  };

  const onClickNext = async () => {
    const response = await fetch(`${API_URL}/photo/next`, {
      method: "POST",
    });
    const data = await response.json();
  };

  const onClickPrevious = async () => {
    const response = await fetch(`${API_URL}/photo/previous`, {
      method: "POST",
    });
    const data = await response.json();
  };

  const onClickAskMode = async () => {
    const response = await fetch(`${API_URL}/mode/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ mode: "ASK" }),
    });
    const data = await response.json();
    setMode("ASK");
  };

  const onClickRevealMode = async () => {
    const response = await fetch(`${API_URL}/mode/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ mode: "REVEAL" }),
    });
    const data = await response.json();
    setMode("REVEAL");
  };

  return !userInfo ? (
    <div className="get-info-container">
      <div className="get-info-box">
        <input
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button onClick={createUser}>Enter</button>
      </div>
    </div>
  ) : (
    <div className="main-container">
      <div className="header">Hii... {userInfo.name}!</div>
      {isAdmin ? (
        <div className="admin-controls">
          <button onClick={onClickAskMode}>Set Ask Mode</button>
          <button onClick={onClickRevealMode}>Set Reveal Mode</button>
          <button onClick={onClickNext}>Next</button>
          <button onClick={onClickPrevious}>Previous</button>
        </div>
      ) : null}
      {mode == "ASK" ? (
        isAdmin ? (
          <AdminAskModeComp userInfo={userInfo} />
        ) : (
          <AskModeComp userInfo={userInfo} />
        )
      ) : null}
      {mode == "REVEAL" ? <RevealModeComp userInfo={userInfo} /> : null}
    </div>
  );
}

export default App;
