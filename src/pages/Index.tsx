import { useState, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import CalendarView from "@/components/CalendarView";
import TasksView from "@/components/TasksView";
import SoldiersView from "@/components/SoldiersView";
import AIView from "@/components/AIView";
import StatsView from "@/components/StatsView";
import ThemeSettings from "@/components/ThemeSettings";
import CustomTabView from "@/components/CustomTabView";
import TabManager from "@/components/TabManager";
import { useEvents, useTasks, useSoldiers } from "@/lib/store";
import { useCustomTabs } from "@/lib/customTabsStore";
import { useEditMode } from "@/lib/EditModeContext";

type BuiltinTab = "calendar" | "tasks" | "soldiers" | "ai" | "stats";

export default function Index() {
  const [activeTab, setActiveTab] = useState<string>("calendar");
  const { events, addEvent, deleteEvent, refetch: refetchEvents } = useEvents();
  const { tasks, addTask, toggleTask, deleteTask, refetch: refetchTasks } = useTasks();
  const { soldiers, addSoldier, deleteSoldier, refetch: refetchSoldiers } = useSoldiers();
  const { tabs: customTabs, addTab, updateTab, deleteTab } = useCustomTabs();
  const { isEditMode } = useEditMode();

  const handleAIDataChanged = useCallback(() => {
    refetchEvents();
    refetchTasks();
    refetchSoldiers();
  }, [refetchEvents, refetchTasks, refetchSoldiers]);

  // Filter custom tabs based on mode
  const visibleCustomTabs = isEditMode ? customTabs : customTabs.filter(t => t.visibleInView);

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      if (activeTab !== "calendar") {
        setActiveTab("calendar");
        window.history.pushState({ tab: "calendar" }, "");
      }
    };
    window.history.pushState({ tab: activeTab }, "");
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [activeTab]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    window.history.pushState({ tab }, "");
  };

  const isBuiltin = (tab: string): tab is BuiltinTab =>
    ["calendar", "tasks", "soldiers", "ai", "stats"].includes(tab);

  const activeCustomTab = !isBuiltin(activeTab) ? activeTab : null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 px-4 py-4 pb-24 max-w-lg mx-auto w-full">
        {isEditMode && (
          <div className="flex gap-2 mb-4 flex-wrap">
            <ThemeSettings />
            <TabManager
              tabs={customTabs}
              onAddTab={addTab}
              onUpdateTab={updateTab}
              onDeleteTab={deleteTab}
            />
          </div>
        )}
        {activeTab === "calendar" && (
          <CalendarView events={events} onAddEvent={addEvent} onDeleteEvent={deleteEvent} />
        )}
        {activeTab === "tasks" && (
          <TasksView tasks={tasks} onToggle={toggleTask} onAdd={addTask} onDelete={deleteTask} />
        )}
        {activeTab === "soldiers" && (
          <SoldiersView soldiers={soldiers} events={events} onAddSoldier={addSoldier} onDeleteSoldier={deleteSoldier} />
        )}
        {activeTab === "ai" && <AIView context={{ events, tasks, soldiers }} onDataChanged={handleAIDataChanged} />}
        {activeTab === "stats" && <StatsView events={events} tasks={tasks} soldiers={soldiers} />}
        {activeCustomTab && <CustomTabView tabId={activeCustomTab} />}
      </main>
      <BottomNav
        active={activeTab}
        onTabChange={handleTabChange}
        customTabs={visibleCustomTabs}
        onRenameTab={(id, name) => updateTab(id, { name })}
      />
    </div>
  );
}
