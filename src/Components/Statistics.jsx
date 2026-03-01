function toMinutes(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

export default function Statistics({ tasks = [] }) {
  if (tasks.length === 0) {
    return (
      <div className="now-panel">
        <div className="now-panel__time">Statistics</div>
        <div className="now-panel__idle">No statistics yet</div>
      </div>
    );
  }

  const totalMinutes = tasks.reduce((sum, t) => {
    return sum + (toMinutes(t.endTime) - toMinutes(t.startTime));
  }, 0);

  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  const longest = tasks.reduce((best, t) => {
    const dur = toMinutes(t.endTime) - toMinutes(t.startTime);
    return dur > (toMinutes(best.endTime) - toMinutes(best.startTime)) ? t : best;
  }, tasks[0]);

  return (
    <div className="now-panel">
      <div className="now-panel__time">Statistics</div>

      <div className="now-panel__task">
        {hours > 0 ? `${hours}h ${mins}m` : `${mins}m`} tracked today
      </div>

      <div className="now-panel__remaining">
        {tasks.length} task{tasks.length !== 1 ? "s" : ""}
      </div>

      <div className="now-panel__next">
        Longest: {longest.name}
      </div>
    </div>
  );
}