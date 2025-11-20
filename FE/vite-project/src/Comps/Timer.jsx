import { useState, useRef, useEffect } from "react";

const Timer = ({ duration = 10, onComplete, isAdmin }) => {
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef(null);
  
  // Calculate circle properties
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const progress = (seconds / duration) * circumference;
  const dashoffset = circumference - progress;

  const startTimer = () => {
    if (intervalRef.current) return;
    setSeconds(0);
    intervalRef.current = setInterval(() => {
      setSeconds((prev) => {
        if (prev + 1 >= duration) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          if (onComplete) onComplete();
          return duration;
        }
        return prev + 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <div className="timer-container">
      <div className="timer-circle-wrapper">
        <svg className="timer-svg" width="50" height="50" viewBox="0 0 50 50">
          <circle
            className="timer-bg-ring"
            cx="25"
            cy="25"
            r={radius}
          />
          <circle
            className="timer-progress-ring"
            cx="25"
            cy="25"
            r={radius}
            strokeDasharray={circumference}
            strokeDashoffset={-dashoffset}
          />
        </svg>
        <span className="timer-text-centered">{duration - seconds}</span>
      </div>
      {isAdmin && <button className="timer-start-btn" onClick={startTimer}>Start</button>}
    </div>
  );
};

export default Timer;
