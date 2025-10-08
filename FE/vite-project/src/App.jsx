import { useEffect, useRef, useState } from "react";
import "./App.css";
import { API_URL, WEB_SOCKET_URL } from "./constants.js";
import AskModeComp from "./Comps/AskModeComp.jsx";
import RevealModeComp from "./Comps/RevealModeComp.jsx";

function App() {
  const [name, setName] = useState("");
  const [mode, setMode] = useState("ASK");
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [revealedResponsesIds, setRevealedResponsesIds] = useState([]);
  const [userInfo, setUserInfo] = useState(() => {
    const userInfoFromStorage = localStorage.getItem("userInfo");
    return userInfoFromStorage ? JSON.parse(userInfoFromStorage) : null;
  });
  const webSocketRef = useRef(null);
  const askModeRef = useRef(null);
  const revealModeRef = useRef(null);

  useEffect(() => {
    const ws = new WebSocket(WEB_SOCKET_URL);
    ws.onopen = () => {
      console.log("WebSocket connection established");
      setIsSocketConnected(true);
      ws.send("Hi from client");
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log("Message from server socket ", message);

      if (message.type === "REFETCH") {
        if (mode == "ASK") askModeRef.current.getCurrentPhoto();
        if (mode == "REVEAL") revealModeRef.current.getCurrentPhoto();
      }

      // if (message.type === "NEXT_RESPONSE") {
      //   setFetchCurrentPhoto(true);
      // }

      if (message.type === "MODE_UPDATE") {
        setMode(message.value);
      }
      if (message.type === "REVEAL_RESPONSE") {
        setRevealedResponsesIds((prev) => [...prev, message.value]);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
      setIsSocketConnected(false);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setIsSocketConnected(false);
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
      body: JSON.stringify({ username: name }),
    });
    const data = await response.json();
    setUserInfo(data);
    localStorage.setItem("userInfo", JSON.stringify(data));
  };

  const onClickNext = async () => {
    await fetch(`${API_URL}/photo/next`, {
      method: "POST",
    });
  };

  const onClickPrevious = async () => {
    await fetch(`${API_URL}/photo/previous`, {
      method: "POST",
    });
  };

  const onClickAskMode = async () => {
    await fetch(`${API_URL}/mode/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ mode: "ASK" }),
    });
  };

  const onClickRevealMode = async () => {
    await fetch(`${API_URL}/mode/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ mode: "REVEAL" }),
    });
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
      <div className="header">Hii... {userInfo.username}!</div>
      {isAdmin ? (
        <div className="admin-controls">
          <button onClick={onClickAskMode}>Set Ask Mode</button>
          <button onClick={onClickRevealMode}>Set Reveal Mode</button>
          <button onClick={onClickPrevious}>Previous</button>
          <button onClick={onClickNext}>Next</button>
        </div>
      ) : null}
      {mode == "ASK" ? (
        <AskModeComp
          customRef={askModeRef}
          userInfo={userInfo}
          isAdmin={isAdmin}
          isSocketConnected={isSocketConnected}
        />
      ) : null}
      {mode == "REVEAL" ? (
        <RevealModeComp
          customRef={revealModeRef}
          isSocketConnected={isSocketConnected}
          revealedResponsesIds={revealedResponsesIds}
        />
      ) : null}
    </div>
  );
}

export default App;
