import { useState, useRef, useEffect } from "react";

const Timer = ({ duration = 10, onComplete, isAdmin }) => {
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef(null);

  const startTimer = () => {
    if (intervalRef.current) return; // prevent multiple intervals
    setSeconds(0);
    intervalRef.current = setInterval(() => {
      setSeconds((prev) => {
        if (prev + 1 >= duration) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          if (onComplete) onComplete(); // 🔔 callback when done
          return duration;
        }
        return prev + 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => clearInterval(intervalRef.current); // cleanup on unmount
  }, []);

  return (
    <div style={styles.container}>
      <span style={styles.timer}>{seconds}s</span>
      {isAdmin && <button onClick={startTimer}>Start</button>}
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    alignItems: "center",
    columnGap: "16px",
    fontFamily: "Poppins, sans-serif",
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "4px",
  },
  timer: {
    fontSize: "1rem",
  },
  button: {
    padding: "8px 16px",
    fontSize: "1rem",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "#007bff",
    color: "white",
    cursor: "pointer",
  },
};

export default Timer;
