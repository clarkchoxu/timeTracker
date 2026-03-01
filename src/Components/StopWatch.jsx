import { useState, useEffect, useRef } from "react";
import "./Stopwatch.css";

const getRandomColor = () => {
  const colors = [
    "#FF6B6B", "#FF9F43", "#FECA57", "#48DBFB",
    "#FF9FF3", "#54A0FF", "#5F27CD", "#00D2D3",
    "#1DD1A1", "#C8D6E5", "#EE5A24", "#009432",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

function Stopwatch({ onAddTask }) {
  const [taskName, setTaskName] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [error, setError] = useState("");
  const intervalRef = useRef(null);

  // ✅ Restore state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("stopwatch-state");
    if (!saved) return;
    const { taskName, startTimeISO } = JSON.parse(saved);

    const savedStart = new Date(startTimeISO);
    const elapsed = Math.floor((Date.now() - savedStart.getTime()) / 1000);

    setTaskName(taskName);
    setStartTime(savedStart);
    setSeconds(elapsed);
    setIsRunning(true);
  }, []);

  // ✅ Save state to localStorage whenever the stopwatch is running
  useEffect(() => {
    if (isRunning && startTime) {
      localStorage.setItem("stopwatch-state", JSON.stringify({
        taskName,
        startTimeISO: startTime.toISOString(),
      }));
    } else {
      localStorage.removeItem("stopwatch-state");
    }
  }, [isRunning, startTime, taskName]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  const formatElapsed = (s) => {
    const hrs = Math.floor(s / 3600).toString().padStart(2, "0");
    const mins = Math.floor((s % 3600) / 60).toString().padStart(2, "0");
    const secs = (s % 60).toString().padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  };

  const toTimeString = (date) => {
    const hrs = date.getHours().toString().padStart(2, "0");
    const mins = date.getMinutes().toString().padStart(2, "0");
    return `${hrs}:${mins}`;
  };

  const handleStart = () => {
    if (!taskName.trim()) {
      setError("Please enter a task name before starting.");
      return;
    }
    setError("");
    setStartTime(new Date());
    setSeconds(0);
    setIsRunning(true);
  };

  const handleStop = () => {
    if (!isRunning) return;
    setIsRunning(false);
    const endTime = new Date();
    onAddTask({
      id: Date.now(),
      name: taskName.trim(),
      startTime: toTimeString(startTime),
      endTime: toTimeString(endTime),
      color: getRandomColor(),
    });
    setTaskName("");
    setSeconds(0);
    setStartTime(null);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSeconds(0);
    setStartTime(null);
    setError("");
  };

  return (
    <div className="stopwatch">
      <h2 className="stopwatch__title">Stopwatch</h2>

      {error && <p className="stopwatch__error">{error}</p>}

      <div className="stopwatch__input-row">
        <input
          className="stopwatch__input"
          type="text"
          placeholder="What are you working on?"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          disabled={isRunning}
        />
      </div>

<div className={`stopwatch__display ${isRunning ? "stopwatch__display--running" : ""}`}>
  {formatElapsed(seconds)}
</div>

      {startTime && (
        <p className="stopwatch__started-at">
          Started at {toTimeString(startTime)}
        </p>
      )}

      <div className="stopwatch__controls">
        <button className="btn btn--start" onClick={handleStart} disabled={isRunning}>Start</button>
        <button className="btn btn--stop" onClick={handleStop} disabled={!isRunning}>Stop & Save</button>
        <button className="btn btn--reset" onClick={handleReset}>Reset</button>
      </div>
    </div>
  );
}

export default Stopwatch;