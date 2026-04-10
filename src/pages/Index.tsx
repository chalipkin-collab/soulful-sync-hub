import { useState, useEffect } from "react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import CalendarView from "@/components/CalendarView";
import TasksView from "@/components/TasksView";
import SoldiersView from "@/components/SoldiersView";
import AIView from "@/components/AIView";
import StatsView from "@/components/StatsView";
import { useEvents, useTasks, useSoldiers } from "@/lib/store";

type Tab = "calendar" | "tasks" | "soldiers" | "ai" | "stats";

export default function Index() {
  const [activeTab, setActiveTab] = useState<Tab>("calendar");
  const { events, addEvent, deleteEvent } = useEvents();
  const { tasks, addTask, toggleTask, deleteTask } = useTasks();
  const { soldiers, addSoldier, deleteSoldier } = useSoldiers();

  // Handle back button: if not on calendar tab, go to calendar first
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      if (activeTab !== "calendar") {
        setActiveTab("calendar");
        window.history.pushState({ tab: "calendar" }, "");
      }
      // If already on calendar, allow default back (exit app)
    };

    // Push initial state
    window.history.pushState({ tab: activeTab }, "");

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [activeTab]);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    window.history.pushState({ tab }, "");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 px-4 py-4 pb-24 max-w-lg mx-auto w-full">
        {activeTab === "calendar" && (
          <CalendarView events={events} onAddEvent={addEvent} onDeleteEvent={deleteEvent} />
        )}
        {activeTab === "tasks" && (
          <TasksView tasks={tasks} onToggle={toggleTask} onAdd={addTask} onDelete={deleteTask} />
        )}
        {activeTab === "soldiers" && (
          <SoldiersView soldiers={soldiers} events={events} onAddSoldier={addSoldier} onDeleteSoldier={deleteSoldier} />
        )}
        {activeTab === "ai" && <AIView />}
        {activeTab === "stats" && <StatsView events={events} tasks={tasks} soldiers={soldiers} />}
      </main>
      <BottomNav active={activeTab} onTabChange={handleTabChange} />
    </div>
  );
}
