import { useState, useEffect, useRef } from "react";
import Stopwatch from "./Components/StopWatch";
import TaskManager from "./Components/taskManager";
import TimeBar from "./Components/timeBar";
import "./App.css";

function App() {
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem("timetracker-tasks");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [activeTab, setActiveTab] = useState("stopwatch");
  const [currentTime, setCurrentTime] = useState(new Date());
  const alreadyAlarmed = useRef(new Set());

  // Align the interval to the real clock minute boundary
  // e.g. if it's 2:30:45, wait 15 seconds first, then tick every 60s exactly
  useEffect(() => {
    let intervalId;

    const startAlignedInterval = () => {
      setCurrentTime(new Date()); // fire immediately on alignment
      intervalId = setInterval(() => {
        setCurrentTime(new Date());
      }, 60000);
    };

    const now = new Date();
    const msUntilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();

    // Wait until the next exact minute, then start the 60s interval
    const timeoutId = setTimeout(startAlignedInterval, msUntilNextMinute);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, []);

  // Save to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem("timetracker-tasks", JSON.stringify(tasks));
  }, [tasks]);

  // Request notification permission once on load
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Alarm check — runs every minute when currentTime updates
  useEffect(() => {
    const hours = currentTime.getHours().toString().padStart(2, "0");
    const mins = currentTime.getMinutes().toString().padStart(2, "0");
    const timeNow = `${hours}:${mins}`;

    console.log("⏰ Alarm check at:", timeNow); // helpful for debugging

    tasks.forEach((task) => {
      const alarmKey = `${task.id}-${timeNow}`;

      if (task.startTime === timeNow && !alreadyAlarmed.current.has(alarmKey)) {
        alreadyAlarmed.current.add(alarmKey);

        console.log("🔔 Firing alarm for:", task.name);

        if ("Notification" in window && Notification.permission === "granted") {
          new Notification(`⏰ Time to start: ${task.name}`, {
            body: `Scheduled ${task.startTime} → ${task.endTime}`,
          
          });
        } else {
          // Fallback — always works regardless of notification permission
          alert(`⏰ Time to start: ${task.name}!`);
        }
      }
    });
  }, [currentTime, tasks]);

  const handleAddTask = (newTask) => {
    setTasks((prev) => [...prev, newTask]);
  };

  const handleDelete = (id) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Time Tracker</h1>
        <p className="app-subtitle">Track your day, block by block</p>
      </header>

      <main className="app-main">
        <div className="app-section">
          <div className="tab-switcher">
            <button
              className={`tab-btn ${activeTab === "stopwatch" ? "tab-btn--active" : ""}`}
              onClick={() => setActiveTab("stopwatch")}
            >
              ⏱ Stopwatch
            </button>
            <button
              className={`tab-btn ${activeTab === "manual" ? "tab-btn--active" : ""}`}
              onClick={() => setActiveTab("manual")}
            >
              ✏️ Add Manually
            </button>
          </div>

          <div className="tab-content">
            {activeTab === "stopwatch" && (
              <Stopwatch onAddTask={handleAddTask} />
            )}
            {activeTab === "manual" && (
              <TaskManager onAddTask={handleAddTask} />
            )}
          </div>
        </div>

        <section className="app-section app-section--wide">
          <TimeBar tasks={tasks} onDeleteTask={handleDelete} />
        </section>
      </main>
    </div>
  );
}

export default App;