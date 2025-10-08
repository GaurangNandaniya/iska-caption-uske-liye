import { useState } from "react";
import { API_URL } from "../constants";

const RevealModeComp = (props) => {
  const { userInfo } = props;
  const [currentPhoto, setCurrentPhoto] = useState(null);
  const [allResponses, setAllResponses] = useState([]);

  const getCurrentPhoto = async () => {
    const response = await fetch(`${API_URL}/photo/current`);
    const data = await response.json();
    setCurrentPhoto(data);
  };

  const getAllResponses = async () => {
    const response = await fetch(`${API_URL}/photo/responses`);
    const data = await response.json();
    setAllResponses(data);
    // setCurrentPhoto(data);
  };

  return (
    <div className="ask-mode-container">
      <image src={currentPhoto?.url} alt="current" />
      <h3>All responses</h3>
      <div className="responses-list-container">
        {allResponses.map((response) => (
          <div className="response-item" key={response.id}>
            {response.message}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RevealModeComp;
