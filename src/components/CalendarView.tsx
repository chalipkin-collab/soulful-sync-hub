import { useState, useMemo } from "react";
import { ChevronRight, ChevronLeft, Clock, Plus, Trash2, CalendarPlus } from "lucide-react";
import { downloadICS } from "@/lib/calendarExport";
import type { SoldierEvent } from "@/lib/store";
import { useEditMode } from "@/lib/EditModeContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const HEBREW_MONTHS = [
  "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
  "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"
];

const HEBREW_DAYS = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"];

const TYPE_COLORS: Record<string, string> = {
  "מכינה": "bg-primary",
  "גיוס": "bg-blue-500",
  "טירונות": "bg-orange-500",
  "חופשה": "bg-secondary",
  "תפילה": "bg-purple-500",
  "אימון": "bg-red-500",
  "כללי": "bg-muted-foreground",
};

const EVENT_TYPES: SoldierEvent["type"][] = ["מכינה", "גיוס", "טירונות", "חופשה", "תפילה", "אימון", "כללי"];

interface CalendarViewProps {
  events: SoldierEvent[];
  onAddEvent?: (event: Omit<SoldierEvent, "id">) => void;
  onDeleteEvent?: (id: string) => void;
}

export default function CalendarView({ events, onAddEvent, onDeleteEvent }: CalendarViewProps) {
  const { isEditMode } = useEditMode();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [view, setView] = useState<"month" | "week">("month");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: "", type: "כללי" as SoldierEvent["type"], time: "", endTime: "", location: "", description: "" });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const eventsByDate = useMemo(() => {
    const map: Record<string, SoldierEvent[]> = {};
    events.forEach(e => {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    });
    return map;
  }, [events]);

  const upcomingEvents = useMemo(() => {
    return events
      .filter(e => e.date >= todayStr)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 5);
  }, [events, todayStr]);

  const selectedEvents = selectedDate ? (eventsByDate[selectedDate] || []) : upcomingEvents;

  const navigate = (dir: number) => {
    setCurrentDate(new Date(year, month + dir, 1));
    setSelectedDate(null);
  };

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const handleAddEvent = () => {
    if (!newEvent.title.trim() || !selectedDate) return;
    onAddEvent?.({
      title: newEvent.title.trim(),
      date: selectedDate,
      type: newEvent.type,
      time: newEvent.time || undefined,
      endTime: newEvent.endTime || undefined,
      location: newEvent.location.trim() || undefined,
      description: newEvent.description.trim() || undefined,
    });
    setNewEvent({ title: "", type: "כללי", time: "", endTime: "", location: "", description: "" });
    setShowAddDialog(false);
  };

  return (
    <div className="flex flex-col gap-4 animate-fade-in-up">
      {/* View Toggle */}
      <div className="flex rounded-xl overflow-hidden border border-border">
        <button
          onClick={() => setView("week")}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${view === "week" ? "bg-muted text-foreground" : "text-muted-foreground"}`}
        >
          שבוע
        </button>
        <button
          onClick={() => setView("month")}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${view === "month" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
        >
          חודש
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="glass-card p-4 glow-green">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold">{HEBREW_MONTHS[month]} {year}</h2>
          <button onClick={() => navigate(1)} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {HEBREW_DAYS.map(day => (
            <div key={day} className="text-center text-xs text-muted-foreground font-medium py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, i) => {
            if (day === null) return <div key={`empty-${i}`} />;
            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedDate;
            const hasEvents = eventsByDate[dateStr]?.length > 0;

            return (
              <button
                key={day}
                onClick={() => setSelectedDate(dateStr === selectedDate ? null : dateStr)}
                className={`aspect-square flex flex-col items-center justify-center rounded-lg text-sm transition-all duration-200 relative ${
                  isToday
                    ? "bg-primary text-primary-foreground font-bold shadow-lg"
                    : isSelected
                    ? "bg-primary/20 text-primary font-semibold ring-1 ring-primary"
                    : "hover:bg-muted"
                }`}
              >
                {day}
                {hasEvents && !isToday && (
                  <div className="absolute bottom-1 flex gap-0.5">
                    {eventsByDate[dateStr].slice(0, 3).map((e, j) => (
                      <div key={j} className={`w-1 h-1 rounded-full ${TYPE_COLORS[e.type] || "bg-primary"}`} />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Events List */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-3">
          {isEditMode && selectedDate && (
            <button
              onClick={() => setShowAddDialog(true)}
              className="flex items-center gap-1 text-primary text-xs hover:text-primary/80 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              הוסף
            </button>
          )}
          <h3 className="text-sm font-semibold text-muted-foreground text-right flex-1">
            {selectedDate ? `אירועים ב-${selectedDate.split("-").reverse().join("/")}` : "אירועים קרובים"}
          </h3>
        </div>
        {selectedEvents.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">אין אירועים</p>
        ) : (
          <div className="flex flex-col gap-2">
            {selectedEvents.map((event, i) => (
              <div
                key={event.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors animate-fade-in-up"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                {isEditMode && (
                  <button
                    onClick={() => onDeleteEvent?.(event.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors p-1 mt-0.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <div className="flex-shrink-0 mt-1">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1 text-right">
                  <p className="font-medium text-sm">{event.title}</p>
                  <div className="flex items-center gap-2 mt-1 justify-end">
                    <span className="text-xs text-muted-foreground">
                      {event.date.split("-").reverse().join("/")}
                    </span>
                    {event.time && (
                      <span className="text-xs text-muted-foreground">{event.time}</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full text-primary-foreground font-medium ${TYPE_COLORS[event.type]}`}>
                    {event.type}
                  </span>
                  <button
                    onClick={() => downloadICS(event)}
                    className="text-muted-foreground hover:text-primary transition-colors p-0.5"
                    title="הוסף ללוח שנה עם תזכורת"
                  >
                    <CalendarPlus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Event Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle className="text-right">הוסף אירוע</DialogTitle>
            <DialogDescription className="text-right">
              {selectedDate?.split("-").reverse().join("/")}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <input
              value={newEvent.title}
              onChange={e => setNewEvent(p => ({ ...p, title: e.target.value }))}
              placeholder="שם האירוע..."
              className="bg-muted rounded-lg px-3 py-2 text-sm text-right outline-none focus:ring-1 focus:ring-primary"
              autoFocus
              onKeyDown={e => e.key === "Enter" && handleAddEvent()}
            />
            <input
              type="time"
              value={newEvent.time}
              onChange={e => setNewEvent(p => ({ ...p, time: e.target.value }))}
              className="bg-muted rounded-lg px-3 py-2 text-sm text-right outline-none focus:ring-1 focus:ring-primary"
              placeholder="שעת התחלה"
            />
            <input
              type="time"
              value={newEvent.endTime}
              onChange={e => setNewEvent(p => ({ ...p, endTime: e.target.value }))}
              className="bg-muted rounded-lg px-3 py-2 text-sm text-right outline-none focus:ring-1 focus:ring-primary"
              placeholder="שעת סיום"
            />
            <input
              value={newEvent.location}
              onChange={e => setNewEvent(p => ({ ...p, location: e.target.value }))}
              placeholder="מיקום (אופציונלי)"
              className="bg-muted rounded-lg px-3 py-2 text-sm text-right outline-none focus:ring-1 focus:ring-primary"
            />
            <textarea
              value={newEvent.description}
              onChange={e => setNewEvent(p => ({ ...p, description: e.target.value }))}
              placeholder="תיאור מפורט (אופציונלי)"
              rows={2}
              className="bg-muted rounded-lg px-3 py-2 text-sm text-right outline-none focus:ring-1 focus:ring-primary resize-none"
            />
            <div className="flex gap-1.5 flex-wrap justify-end">
              {EVENT_TYPES.map(t => (
                <button
                  key={t}
                  onClick={() => setNewEvent(p => ({ ...p, type: t }))}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                    newEvent.type === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <button
              onClick={handleAddEvent}
              className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm"
            >
              הוספה
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
