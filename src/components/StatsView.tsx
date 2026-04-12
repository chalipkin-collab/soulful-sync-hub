import { BarChart3, Users, CheckSquare, Calendar, TrendingUp } from "lucide-react";
import type { SoldierEvent, Task, Soldier } from "@/lib/store";
import WeeklyReport from "./WeeklyReport";

interface StatsViewProps {
  events: SoldierEvent[];
  tasks: Task[];
  soldiers: Soldier[];
}

export default function StatsView({ events, tasks, soldiers }: StatsViewProps) {
  const openTasks = tasks.filter(t => !t.completed).length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const activeSoldiers = soldiers.filter(s => s.status === "פעיל").length;
  const today = new Date().toISOString().split("T")[0];
  const upcomingEvents = events.filter(e => e.date >= today).length;

  const stats = [
    { label: "אירועים קרובים", value: upcomingEvents, icon: Calendar, color: "text-primary" },
    { label: "משימות פתוחות", value: openTasks, icon: CheckSquare, color: "text-secondary" },
    { label: "משימות שהושלמו", value: completedTasks, icon: TrendingUp, color: "text-primary" },
    { label: "חיילים פעילים", value: activeSoldiers, icon: Users, color: "text-blue-400" },
  ];

  const eventTypes = events.reduce((acc, e) => {
    acc[e.type] = (acc[e.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex flex-col gap-4 animate-fade-in-up">
      <div className="flex items-center gap-2 justify-end">
        <h2 className="text-xl font-bold">סיכום</h2>
        <BarChart3 className="w-5 h-5 text-primary" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className="glass-card p-4 flex flex-col items-end gap-2 animate-fade-in-up"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
            <span className="text-3xl font-bold">{stat.value}</span>
            <span className="text-xs text-muted-foreground">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Event Distribution */}
      <div className="glass-card p-4">
        <h3 className="text-sm font-semibold text-right mb-3">התפלגות אירועים</h3>
        <div className="flex flex-col gap-2">
          {Object.entries(eventTypes).map(([type, count], i) => (
            <div key={type} className="flex items-center gap-2 animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
              <span className="text-xs text-muted-foreground w-8">{count}</span>
              <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-700"
                  style={{ width: `${(count / events.length) * 100}%` }}
                />
              </div>
              <span className="text-xs font-medium w-12 text-right">{type}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Summary */}
      <div className="glass-card p-4 glow-green">
        <h3 className="text-sm font-semibold text-right mb-2">סיכום מהיר</h3>
        <p className="text-sm text-muted-foreground text-right leading-relaxed">
          יש לך {openTasks} משימות פתוחות, {upcomingEvents} אירועים קרובים, ו-{activeSoldiers} חיילים פעילים מתוך {soldiers.length}.
          {tasks.some(t => t.priority === "דחוף" && !t.completed) && " ⚠️ יש משימות דחופות שדורשות טיפול!"}
        </p>
      </div>

      {/* Weekly Report */}
      <WeeklyReport events={events} tasks={tasks} soldiers={soldiers} />
    </div>
  );
}
