import "./timeBar.css";
import { useState } from "react";

function TimeBar({ tasks, onDeleteTask, deleteAllTasks }) {
    const [showConfirm, setShowConfirm] = useState(false)


  const toMinutes = (timeStr) => {
    const [hours, mins] = timeStr.split(":").map(Number);
    return hours * 60 + mins;
  };

  const getDuration = (startTime, endTime) => {
    const diff = toMinutes(endTime) - toMinutes(startTime);
    const hours = Math.floor(diff / 60);
    const mins = diff % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  const TOTAL_MINUTES = 24 * 60;
  const hourLabels = Array.from({ length: 24 }, (_, i) => i);

  const assignLanes = (tasks) => {
    const lanes = [];
    return tasks.map((task) => {
      const startMin = toMinutes(task.startTime);
      const endMin = toMinutes(task.endTime);
      let assignedLane = lanes.findIndex((laneEnd) => laneEnd <= startMin);
      if (assignedLane === -1) assignedLane = lanes.length;
      lanes[assignedLane] = endMin;
      return { ...task, lane: assignedLane };
    });
  };

  const tasksWithLanes = assignLanes(tasks);
  const laneCount = Math.max(1, ...tasksWithLanes.map((t) => t.lane + 1));
  const LANE_HEIGHT = 44;
  const LANE_GAP = 6;
  const totalBarHeight = laneCount * LANE_HEIGHT + (laneCount - 1) * LANE_GAP;

  return (
    <div className="timebar">
      <h2 className="timebar__title">Today's Timeline</h2>

      <div className="timebar__container">

        {/* Hour labels */}
        <div className="timebar__hour-labels">
          {hourLabels.map((hour) => (
            <div key={hour} className="timebar__hour-label">
              {hour === 0 ? "12am" : hour < 12 ? `${hour}am` : hour === 12 ? "12pm" : `${hour - 12}pm`}
            </div>
          ))}
        </div>

        {/* Track */}
        <div className="timebar__track" style={{ height: `${totalBarHeight}px` }}>

          {/* Grid lines */}
          {hourLabels.map((hour) => (
            <div
              key={hour}
              className="timebar__grid-line"
              style={{ left: `${(hour / 24) * 100}%` }}
            />
          ))}

          {/* Task blocks */}
          {tasksWithLanes.map((task) => {
            const startMin = toMinutes(task.startTime);
            const endMin = toMinutes(task.endTime);
            const leftPercent = (startMin / TOTAL_MINUTES) * 100;
            const widthPercent = ((endMin - startMin) / TOTAL_MINUTES) * 100;
            const topOffset = task.lane * (LANE_HEIGHT + LANE_GAP);

            return (
              <div
                key={task.id}
                className="timebar__block"
                title={`${task.name}: ${task.startTime} – ${task.endTime} (${getDuration(task.startTime, task.endTime)})`}
                style={{
                  left: `${leftPercent}%`,
                  width: `${widthPercent}%`,
                  top: `${topOffset}px`,
                  height: `${LANE_HEIGHT}px`,
                  backgroundColor: task.color,
                }}
              >
                {widthPercent > 4 && (
                  <span className="timebar__block-label">
                    {task.name} · {getDuration(task.startTime, task.endTime)}
                  </span>
                )}
              </div>
            );
          })}
        </div>

             <button 
        className="timebar__delete-all-btn" 
        onClick={() => setShowConfirm(true)}
      >
          
          Clear All Tasks
        </button>

         {showConfirm && (
        <div className="confirm-overlay">
          <div className="confirm-modal">
            <h3 className="confirm-title">Clear All Tasks?</h3>
            <p className="confirm-message">This will permanently delete all tasks from today.</p>
            <div className="confirm-actions">
              <button 
                className="btn btn--reset" 
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn--stop" 
                onClick={() => { deleteAllTasks(); setShowConfirm(false); }}
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}


        {/* Legend */}
        {tasks.length > 0 && (
          <div className="timebar__legend">
            {tasks.map((task) => (
              <div key={task.id} className="timebar__legend-item">
                <div
                  className="timebar__legend-dot"
                  style={{ backgroundColor: task.color }}
                />
                <span className="timebar__legend-name">
                  {task.name}: {getDuration(task.startTime, task.endTime)}
                </span>
                <button
                  className="timebar__delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteTask(task.id);
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {tasks.length === 0 && (
          <p className="timebar__empty">No tasks yet — add one above to see it here.</p>
        )}
      </div>
    </div>
  );
}

export default TimeBar;