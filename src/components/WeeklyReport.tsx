import { useState } from "react";
import { FileText, Copy, Check, X } from "lucide-react";
import type { SoldierEvent, Task, Soldier } from "@/lib/store";

interface WeeklyReportProps {
  events: SoldierEvent[];
  tasks: Task[];
  soldiers: Soldier[];
}

type ReportType = "weekly" | "monthly";

export default function WeeklyReport({ events, tasks, soldiers }: WeeklyReportProps) {
  const [showReport, setShowReport] = useState(false);
  const [copied, setCopied] = useState(false);
  const [reportType, setReportType] = useState<ReportType>("weekly");

  const today = new Date();
  const fmtHeb = (d: string) => d.split("-").reverse().join("/");
  const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  const generateReport = () => {
    const lines: string[] = [];
    const activeSoldiers = soldiers.filter(s => s.status === "פעיל");
    const urgentOpen = tasks.filter(t => !t.completed && t.priority === "דחוף");
    const completedTasks = tasks.filter(t => t.completed);

    if (reportType === "weekly") {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      const startOfNextWeek = new Date(endOfWeek);
      startOfNextWeek.setDate(endOfWeek.getDate() + 1);
      const endOfNextWeek = new Date(startOfNextWeek);
      endOfNextWeek.setDate(startOfNextWeek.getDate() + 6);

      const thisWeekStr = fmt(startOfWeek);
      const endWeekStr = fmt(endOfWeek);
      const nextWeekStartStr = fmt(startOfNextWeek);
      const nextWeekEndStr = fmt(endOfNextWeek);

      const thisWeekEvents = events.filter(e => e.date >= thisWeekStr && e.date <= endWeekStr);
      const nextWeekEvents = events.filter(e => e.date >= nextWeekStartStr && e.date <= nextWeekEndStr);

      lines.push(`📋 *דוח שבועי - ${fmtHeb(thisWeekStr)} עד ${fmtHeb(endWeekStr)}*`);
      lines.push("");
      lines.push("📅 *אירועים שהתקיימו השבוע:*");
      if (thisWeekEvents.length === 0) lines.push("  אין אירועים השבוע");
      else thisWeekEvents.forEach(e => {
        const time = e.time ? ` (${e.time})` : "";
        const loc = e.location ? ` | ${e.location}` : "";
        lines.push(`  • ${e.title} - ${fmtHeb(e.date)}${time}${loc} [${e.type}]`);
      });
      lines.push("");
      lines.push("🔜 *אירועים קרובים לשבוע הבא:*");
      if (nextWeekEvents.length === 0) lines.push("  אין אירועים לשבוע הבא");
      else nextWeekEvents.forEach(e => {
        const time = e.time ? ` (${e.time})` : "";
        lines.push(`  • ${e.title} - ${fmtHeb(e.date)}${time} [${e.type}]`);
      });
    } else {
      const monthStart = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-01`;
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      const monthEnd = fmt(nextMonth);
      const HEBREW_MONTHS = ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"];

      const monthEvents = events.filter(e => e.date >= monthStart && e.date <= monthEnd);

      lines.push(`📋 *דוח חודשי - ${HEBREW_MONTHS[today.getMonth()]} ${today.getFullYear()}*`);
      lines.push("");
      lines.push("📅 *אירועי החודש:*");
      if (monthEvents.length === 0) lines.push("  אין אירועים החודש");
      else monthEvents.sort((a, b) => a.date.localeCompare(b.date)).forEach(e => {
        const time = e.time ? ` (${e.time})` : "";
        const loc = e.location ? ` | ${e.location}` : "";
        lines.push(`  • ${e.title} - ${fmtHeb(e.date)}${time}${loc} [${e.type}]`);
      });
    }

    lines.push("");
    lines.push("✅ *משימות שהושלמו:*");
    if (completedTasks.length === 0) lines.push("  אין משימות שהושלמו");
    else completedTasks.forEach(t => lines.push(`  • ${t.title}`));
    lines.push("");
    lines.push("⚠️ *משימות פתוחות דחופות:*");
    if (urgentOpen.length === 0) lines.push("  אין משימות דחופות פתוחות 🎉");
    else urgentOpen.forEach(t => lines.push(`  • ${t.title} - עד ${fmtHeb(t.dueDate)}`));
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
      <div className="flex gap-2">
        <button
          onClick={() => { setReportType("weekly"); setShowReport(true); }}
          className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
        >
          <FileText className="w-4 h-4" />
          דוח שבועי
        </button>
        <button
          onClick={() => { setReportType("monthly"); setShowReport(true); }}
          className="flex-1 py-3 rounded-xl bg-secondary text-secondary-foreground font-medium text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
        >
          <FileText className="w-4 h-4" />
          דוח חודשי
        </button>
      </div>
    );
  }

  return (
    <div className="glass-card p-4 animate-fade-in-up">
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setShowReport(false)} className="p-1 hover:bg-muted rounded-lg transition-colors">
          <X className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setReportType("weekly")}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${reportType === "weekly" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
          >
            שבועי
          </button>
          <button
            onClick={() => setReportType("monthly")}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${reportType === "monthly" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
          >
            חודשי
          </button>
        </div>
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
