import { useState } from "react";
import { API_URL } from "../constants";

const RevealModeComp = (props) => {
  const { isSocketConnected, customRef, revealedResponsesIds } = props;
  const [currentPhoto, setCurrentPhoto] = useState(null);
  const [allResponses, setAllResponses] = useState([
    { id: 1, responseText: "Test response", username: "Test user" },
  ]);

  const getAllResponses = async (imgId) => {
    const response = await fetch(`${API_URL}/photo/${imgId}/responses`);
    const data = await response.json();
    setAllResponses(data);
  };

  const getCurrentPhoto = async () => {
    if (isSocketConnected) {
      const response = await fetch(`${API_URL}/photo/current`);
      const data = await response.json();
      setCurrentPhoto(data);
      if (data?.id != null && data?.id != undefined) getAllResponses(data?.id);
      return data;
    }
  };
  customRef.current = {
    getCurrentPhoto: getCurrentPhoto,
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
      <h3>All responses</h3>
      <div className="responses-list-container">
        {allResponses.map((response) => (
          <div className="response-item" key={response.id}>
            {response.responseText}{" "}
            {revealedResponsesIds.includes(response.id) ? (
              <span className="revealed">({response.username})</span>
            ) : (
              ""
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RevealModeComp;
