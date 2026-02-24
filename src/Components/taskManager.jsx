import { useState } from "react";
import "./TaskManager.css";

const getRandomColor = () => {
  const colors = [
    "#FF6B6B", "#FF9F43", "#FECA57", "#48DBFB",
    "#FF9FF3", "#54A0FF", "#5F27CD", "#00D2D3",
    "#1DD1A1", "#C8D6E5", "#EE5A24", "#009432",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

function TaskManager({ onAddTask }) {
  const [taskName, setTaskName] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [error, setError] = useState("");

  const handleSave = () => {
    if (!taskName.trim()) return setError("Please enter a task name.");
    if (!startTime) return setError("Please enter a start time.");
    if (!endTime) return setError("Please enter an end time.");
    if (startTime >= endTime) return setError("End time must be after start time.");

    onAddTask({
      id: Date.now(),
      name: taskName.trim(),
      startTime,
      endTime,
      color: getRandomColor(),
    });

    setTaskName("");
    setStartTime("");
    setEndTime("");
    setError("");
  };

  return (
    <div className="task-manager">
      <h2 className="task-manager__title">Add Task Manually</h2>

      {error && <p className="task-manager__error">{error}</p>}

      <div className="task-manager__form">
        <div className="task-manager__field">
          <label className="task-manager__label">Task Name</label>
          <input
            className="task-manager__input"
            type="text"
            placeholder="e.g. Studying"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
          />
        </div>

        <div className="task-manager__field">
          <label className="task-manager__label">Start Time</label>
          <input
            className="task-manager__input"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            onClick={(e) => e.target.showPicker()} 
          />
        </div>

        <div className="task-manager__field">
          <label className="task-manager__label">End Time</label>
          <input
            className="task-manager__input"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
                     onClick={(e) => e.target.showPicker()} 
          />
        </div>

        <button className="btn btn--primary" onClick={handleSave}>Save Task</button>
      </div>
    </div>
  );
}

export default TaskManager;