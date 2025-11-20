import { useState } from "react";
import { API_URL } from "../constants";
import Timer from "./Timer";

const RevealModeComp = (props) => {
  const { customRef, revealedResponsesIds, isAdmin } = props;
  const [currentPhoto, setCurrentPhoto] = useState(null);
  const [allResponses, setAllResponses] = useState([
    { id: 1, caption: "Caption 1", created_by_username: "User1" },
  ]);

  const getAllResponses = async (imgId) => {
    const response = await fetch(`${API_URL}/photo/${imgId}/responses`);
    const data = await response.json();

    setAllResponses(data);
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

  const revealName = async ({ responseId }) => {
    await fetch(`${API_URL}/response/next`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        responseId: responseId,
      }),
    });
  };

  return (
    <div className="reveal-mode-container">
      {currentPhoto?.image_path ? (
        <img
          style={{
            width: "100%",
            maxWidth: "500px",
            objectFit: "contain",
            margin: "0 auto 20px",
          }}
          src={`${API_URL}/${currentPhoto?.image_path}`}
          alt="current"
        />
      ) : null}
      <h3>All responses</h3>
      <div className="responses-list-container">
        {allResponses.map((response) => (
          <div className="response-item" key={response.id}>
            <span>{response.caption}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {revealedResponsesIds.includes(response.id) ? (
                <span className="revealed-text">({response.created_by_username})</span>
              ) : null}
              
              {isAdmin ? (
                <button
                  onClick={() => {
                    revealName({
                      responseId: response.id,
                    });
                  }}
                >
                  Reveal
                </button>
              ) : null}
              <Timer
                isAdmin={isAdmin}
                duration={15}
                onComplete={() => {
                  revealName({ responseId: response.id });
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RevealModeComp;
