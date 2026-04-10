import { useState } from "react";
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
  const { soldiers } = useSoldiers();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 px-4 py-4 pb-24 max-w-lg mx-auto w-full">
        {activeTab === "calendar" && <CalendarView events={events} />}
        {activeTab === "tasks" && (
          <TasksView tasks={tasks} onToggle={toggleTask} onAdd={addTask} onDelete={deleteTask} />
        )}
        {activeTab === "soldiers" && <SoldiersView soldiers={soldiers} events={events} />}
        {activeTab === "ai" && <AIView />}
        {activeTab === "stats" && <StatsView events={events} tasks={tasks} soldiers={soldiers} />}
      </main>
      <BottomNav active={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
