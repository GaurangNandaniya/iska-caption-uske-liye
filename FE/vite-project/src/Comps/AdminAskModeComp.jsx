import { useState } from "react";
import { API_URL } from "../constants";

const AdminAskModeComp = (props) => {
  const { userInfo } = props;
  const [currentPhoto, setCurrentPhoto] = useState(null);
  const [responseText, setResponseText] = useState("");

  const getCurrentPhoto = async () => {
    const response = await fetch(`${API_URL}/photo/current`);
    const data = await response.json();
    setCurrentPhoto(data);
  };

  const createResponse = async () => {
    const response = await fetch(`${API_URL}/photo/response/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: userInfo.id, message: responseText }),
    });
    const data = await response.json();
    // setCurrentPhoto(data);
    setResponseText("");
  };

  return (
    <div className="ask-mode-container">
      <image src={currentPhoto?.url} alt="current" />
      <h3>Add your responses</h3>
      <div className="response-input-container">
        <input
          placeholder="Type your response here..."
          type="password"
          value={responseText}
          onChange={(e) => {
            setResponseText(e.target.value);
            console.log(e.target.value);
          }}
        />
        <button onClick={createResponse}>Submit</button>
      </div>
    </div>
  );
};

export default AdminAskModeComp;
