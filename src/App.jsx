import { useState, useEffect } from "react";
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

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("timetracker-tasks", JSON.stringify(tasks));
  }, [tasks]);

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
        {/* Toggle tabs */}
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

          {/* Render only the active view */}
          <div className="tab-content">
            {activeTab === "stopwatch" && (
              <Stopwatch onAddTask={handleAddTask} />
            )}
            {activeTab === "manual" && (
              <TaskManager onAddTask={handleAddTask} />
            )}
          </div>
        </div>

        {/* Timeline always visible */}
        <section className="app-section app-section--wide">
          <TimeBar tasks={tasks} onDeleteTask={handleDelete} />
        </section>
      </main>
    </div>
  );
}

export default App;