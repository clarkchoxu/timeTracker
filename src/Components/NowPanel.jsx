import { useMemo } from "react";

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Convert "HH:MM" → minutes since midnight
function toMinutes(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

export default function NowPanel({ tasks, currentTime }) {
  const nowMinutes =
    currentTime.getHours() * 60 + currentTime.getMinutes();

  const { currentTask, nextTask, minutesLeft } = useMemo(() => {
    const sorted = [...tasks].sort(
      (a, b) => toMinutes(a.startTime) - toMinutes(b.startTime)
    );

    let active = null;
    let upcoming = null;

    for (let task of sorted) {
      const start = toMinutes(task.startTime);
      const end = toMinutes(task.endTime);

      // ✅ ACTIVE TASK FIXED
      if (nowMinutes >= start && nowMinutes < end) {
        active = task;
      }

      // ✅ NEXT TASK FIXED
      if (!upcoming && start > nowMinutes) {
        upcoming = task;
      }
    }

    let remaining = 0;

    if (active) {
      const end = toMinutes(active.endTime);
      remaining = end - nowMinutes;
    }

    return {
      currentTask: active,
      nextTask: upcoming,
      minutesLeft: remaining,
    };
  }, [tasks, nowMinutes]);

  return (
    <div className="now-panel">
      <div className="now-panel__time">
        {formatTime(currentTime)}
      </div>

      {currentTask ? (
        <>
          <div className="now-panel__task">
            {currentTask.name}
          </div>
          <div className="now-panel__remaining">
            {minutesLeft} min left
          </div>
        </>
      ) : (
        <div className="now-panel__idle">
          No active task
        </div>
      )}

      {nextTask && (
        <div className="now-panel__next">
          Next: {nextTask.name} ({nextTask.startTime})
        </div>
      )}

      
    </div>
  );
}