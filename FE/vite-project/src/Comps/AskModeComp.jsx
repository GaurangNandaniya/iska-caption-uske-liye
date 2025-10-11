import { useState } from "react";
import { API_URL } from "../constants";

const AskModeComp = (props) => {
  const { userInfo, isAdmin, customRef } = props;

  const [currentPhoto, setCurrentPhoto] = useState(null);
  const [responseText, setResponseText] = useState("");
  const [responsesCount, setResponsesCount] = useState(0);

  const getAllResponses = async (imgId) => {
    const response = await fetch(`${API_URL}/photo/${imgId}/responses`);
    const data = await response.json();
    console.log({ allResponses: data });
    setResponsesCount(data.length);
  };

  const getCurrentPhoto = async () => {
    const response = await fetch(`${API_URL}/photo/current`);
    const data = await response.json();
    setCurrentPhoto(data);

    if (data?.id != null && data?.id != undefined) getAllResponses(data?.id);
    return data;
  };
  customRef.current = {
    getCurrentPhoto: getCurrentPhoto,
  };

  const createResponse = async () => {
    await fetch(`${API_URL}/photo/response/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: userInfo.username,
        caption: responseText,
        imageId: currentPhoto?.id,
      }),
    });
    setResponseText("");
  };

  return (
    <div className="ask-mode-container">
      {currentPhoto?.image_path ? (
        <img
          style={{
            width: "300px",
            //   height: "300px",
            objectFit: "contain",
            borderRadius: "8px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            margin: "0 auto 20px",
          }}
          src={`${API_URL}/${currentPhoto?.image_path}`}
          //   src={`http://10.107.89.79:3001/${currentPhoto?.image_path}`}
          alt="current"
        />
      ) : null}

      <p>Total responses: {responsesCount}</p>
      <h3>Add your responses</h3>
      <div className="response-input-container">
        <input
          placeholder="Type your response here..."
          value={responseText}
          onChange={(e) => {
            setResponseText(e.target.value);
            if (isAdmin) console.log(e.target.value);
          }}
          type={"text"}
        />
        <button onClick={createResponse}>Submit</button>
      </div>
    </div>
  );
};

export default AskModeComp;
