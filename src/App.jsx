import { useState, useEffect, useRef } from "react";
import Stopwatch from "./Components/StopWatch";
import TaskManager from "./Components/taskManager";
import TimeBar from "./Components/timeBar";
import NowPanel from "./Components/NowPanel";
import Statistics from "./Components/statistics";
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

const playAlarmSound = () => {
  const audio = new Audio(`${import.meta.env.BASE_URL}alarm.mp3`);
  audio.play().catch(() => {});
};
// ✨ Flash page title
const flashTitle = () => {
  const originalTitle = document.title;
  let visible = false;

  const interval = setInterval(() => {
    document.title = visible ? "⏰ TASK STARTED!" : originalTitle;
    visible = !visible;
  }, 1000);

  const stopFlashing = () => {
    clearInterval(interval);
    document.title = originalTitle;
    window.removeEventListener("focus", stopFlashing);
  };

  window.addEventListener("focus", stopFlashing);
};

// 🚀 Unified alarm trigger
const triggerAlarm = (task) => {
  playAlarmSound();

  // If user is on another tab → system notification
  if (document.hidden && "Notification" in window && Notification.permission === "granted") {
    new Notification(`⏰ Time to start: ${task.name}`, {
      body: `Scheduled ${task.startTime} → ${task.endTime}`,
    });
  } else {
    // If user is on this tab → in-page alert
    alert(`⏰ Time to start: ${task.name}!`);
  }

  flashTitle();
};

  useEffect(() => {
  const hours = currentTime.getHours().toString().padStart(2, "0");
  const mins = currentTime.getMinutes().toString().padStart(2, "0");
  const timeNow = `${hours}:${mins}`;

  console.log("⏰ Alarm check at:", timeNow);

  tasks.forEach((task) => {
    const alarmKey = `${task.id}-${timeNow}`;

    // 🔔 Trigger alarm
    if (task.startTime === timeNow && !alreadyAlarmed.current.has(alarmKey)) {
      alreadyAlarmed.current.add(alarmKey);

      console.log("🔔 Firing alarm for:", task.name);
      triggerAlarm(task);
    }

    // 🗑 Clear old alarm memory after task ends
    if (timeNow > task.endTime) {
      alreadyAlarmed.current.forEach((key) => {
        if (key.startsWith(`${task.id}-`)) {
          alreadyAlarmed.current.delete(key);
          console.log("🗑️ Clearing alarms for:", task.name);
        }
      });
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

    {/* LEFT COLUMN */}
    <div className="app-section">
      <div className="tab-switcher">
        <button
          className={`btn tab-btn ${activeTab === "stopwatch" ? "tab-btn--active" : ""}`}
          onClick={() => setActiveTab("stopwatch")}
        >
          ⏱ Stopwatch
        </button>

        <button
          className={`btn tab-btn ${activeTab === "manual" ? "tab-btn--active" : ""}`}
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

    {/* RIGHT COLUMN — NEW NowPanel */}
   <div className="app-section">
  <NowPanel 
    tasks={tasks} 
    currentTime={currentTime} 
  />

  <Statistics />
</div>
    {/* FULL WIDTH TIMELINE */}
    <section className="app-section app-section--wide">
      <TimeBar 
        tasks={tasks} 
        onDeleteTask={handleDelete} 
      />
    </section>


  </main>

</div>

    
  );
}

export default App;