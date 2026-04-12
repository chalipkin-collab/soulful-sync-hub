import { useState } from "react";
import { FileText, Copy, Check, X } from "lucide-react";
import type { SoldierEvent, Task, Soldier } from "@/lib/store";

interface WeeklyReportProps {
  events: SoldierEvent[];
  tasks: Task[];
  soldiers: Soldier[];
}

export default function WeeklyReport({ events, tasks, soldiers }: WeeklyReportProps) {
  const [showReport, setShowReport] = useState(false);
  const [copied, setCopied] = useState(false);

  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  const startOfNextWeek = new Date(endOfWeek);
  startOfNextWeek.setDate(endOfWeek.getDate() + 1);
  const endOfNextWeek = new Date(startOfNextWeek);
  endOfNextWeek.setDate(startOfNextWeek.getDate() + 6);

  const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const fmtHeb = (d: string) => d.split("-").reverse().join("/");

  const thisWeekStr = fmt(startOfWeek);
  const endWeekStr = fmt(endOfWeek);
  const nextWeekStartStr = fmt(startOfNextWeek);
  const nextWeekEndStr = fmt(endOfNextWeek);

  const thisWeekEvents = events.filter(e => e.date >= thisWeekStr && e.date <= endWeekStr);
  const nextWeekEvents = events.filter(e => e.date >= nextWeekStartStr && e.date <= nextWeekEndStr);
  const completedThisWeek = tasks.filter(t => t.completed);
  const urgentOpen = tasks.filter(t => !t.completed && t.priority === "דחוף");
  const activeSoldiers = soldiers.filter(s => s.status === "פעיל");

  const generateReport = () => {
    const lines: string[] = [];
    lines.push(`📋 *דוח שבועי - ${fmtHeb(thisWeekStr)} עד ${fmtHeb(endWeekStr)}*`);
    lines.push("");

    lines.push("📅 *אירועים שהתקיימו השבוע:*");
    if (thisWeekEvents.length === 0) {
      lines.push("  אין אירועים השבוע");
    } else {
      thisWeekEvents.forEach(e => {
        const time = e.time ? ` (${e.time})` : "";
        const loc = e.location ? ` | ${e.location}` : "";
        lines.push(`  • ${e.title} - ${fmtHeb(e.date)}${time}${loc} [${e.type}]`);
      });
    }
    lines.push("");

    lines.push("🔜 *אירועים קרובים לשבוע הבא:*");
    if (nextWeekEvents.length === 0) {
      lines.push("  אין אירועים לשבוע הבא");
    } else {
      nextWeekEvents.forEach(e => {
        const time = e.time ? ` (${e.time})` : "";
        lines.push(`  • ${e.title} - ${fmtHeb(e.date)}${time} [${e.type}]`);
      });
    }
    lines.push("");

    lines.push("✅ *משימות שהושלמו:*");
    if (completedThisWeek.length === 0) {
      lines.push("  אין משימות שהושלמו");
    } else {
      completedThisWeek.forEach(t => {
        lines.push(`  • ${t.title}`);
      });
    }
    lines.push("");

    lines.push("⚠️ *משימות פתוחות דחופות:*");
    if (urgentOpen.length === 0) {
      lines.push("  אין משימות דחופות פתוחות 🎉");
    } else {
      urgentOpen.forEach(t => {
        lines.push(`  • ${t.title} - עד ${fmtHeb(t.dueDate)}`);
      });
    }
    lines.push("");

    lines.push(`👥 *חיילים פעילים:* ${activeSoldiers.length} מתוך ${soldiers.length}`);

    return lines.join("\n");
  };

  const report = generateReport();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!showReport) {
    return (
      <button
        onClick={() => setShowReport(true)}
        className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
      >
        <FileText className="w-4 h-4" />
        צור דוח שבועי
      </button>
    );
  }

  return (
    <div className="glass-card p-4 animate-fade-in-up">
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setShowReport(false)} className="p-1 hover:bg-muted rounded-lg transition-colors">
          <X className="w-4 h-4" />
        </button>
        <h3 className="text-sm font-semibold">דוח שבועי</h3>
      </div>
      <pre className="text-sm text-right whitespace-pre-wrap leading-relaxed bg-muted/50 rounded-lg p-3 max-h-80 overflow-y-auto" dir="rtl">
        {report}
      </pre>
      <button
        onClick={handleCopy}
        className="w-full mt-3 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm flex items-center justify-center gap-2"
      >
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        {copied ? "הועתק!" : "העתק דוח"}
      </button>
    </div>
  );
}
