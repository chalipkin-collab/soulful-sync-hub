import { useState } from "react";
import { CalendarPlus, ListTodo, Users, Trash2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ExtractedEvent {
  title: string;
  date: string;
  type: string;
  description?: string;
  time?: string;
  endTime?: string;
  location?: string;
}

export interface ExtractedTask {
  title: string;
  dueDate: string;
  priority: string;
}

export interface ExtractedSoldier {
  name: string;
  unit: string;
  status: string;
  phone?: string;
}

export interface ExtractionResult {
  events: ExtractedEvent[];
  tasks: ExtractedTask[];
  soldiers: ExtractedSoldier[];
  summary: string;
}

interface Props {
  data: ExtractionResult;
  onConfirm: (data: ExtractionResult) => void;
  onCancel: () => void;
}

const EVENT_TYPES = ["מכינה", "גיוס", "טירונות", "חופשה", "תפילה", "אימון", "כללי"];
const PRIORITIES = ["רגיל", "בינוני", "דחוף"];
const STATUSES = ["פעיל", "חופשה", "מילואים"];

export default function ExtractionConfirmDialog({ data, onConfirm, onCancel }: Props) {
  const [events, setEvents] = useState(data.events);
  const [tasks, setTasks] = useState(data.tasks);
  const [soldiers, setSoldiers] = useState(data.soldiers);

  const hasItems = events.length > 0 || tasks.length > 0 || soldiers.length > 0;

  const updateEvent = (i: number, field: string, value: string) => {
    setEvents(prev => prev.map((e, idx) => idx === i ? { ...e, [field]: value || undefined } : e));
  };

  const updateTask = (i: number, field: string, value: string) => {
    setTasks(prev => prev.map((t, idx) => idx === i ? { ...t, [field]: value } : t));
  };

  const updateSoldier = (i: number, field: string, value: string) => {
    setSoldiers(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: value || undefined } : s));
  };

  return (
    <div className="glass-card rounded-2xl p-4 space-y-4 text-right [direction:rtl] animate-fade-in-up">
      <h3 className="font-bold text-base">📋 ניתוח תוכן — אישור לפני שמירה</h3>
      
      {data.summary && (
        <p className="text-sm text-muted-foreground">{data.summary}</p>
      )}

      {events.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            <CalendarPlus className="w-4 h-4" />
            <span>אירועים ({events.length})</span>
          </div>
          {events.map((e, i) => (
            <div key={i} className="bg-muted/50 rounded-lg p-2.5 space-y-1.5 text-xs">
              <div className="flex items-center gap-2">
                <button onClick={() => setEvents(prev => prev.filter((_, idx) => idx !== i))} className="text-destructive hover:text-destructive/80 flex-shrink-0">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <input value={e.title} onChange={ev => updateEvent(i, "title", ev.target.value)} className="flex-1 bg-background/50 rounded px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-primary" placeholder="כותרת" />
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <input type="date" value={e.date} onChange={ev => updateEvent(i, "date", ev.target.value)} className="bg-background/50 rounded px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-primary" />
                <input type="time" value={e.time || ""} onChange={ev => updateEvent(i, "time", ev.target.value)} className="bg-background/50 rounded px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-primary" placeholder="שעה" />
                <input type="time" value={e.endTime || ""} onChange={ev => updateEvent(i, "endTime", ev.target.value)} className="bg-background/50 rounded px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-primary" placeholder="סיום" />
              </div>
              <input value={e.location || ""} onChange={ev => updateEvent(i, "location", ev.target.value)} className="w-full bg-background/50 rounded px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-primary" placeholder="מיקום" />
              <textarea value={e.description || ""} onChange={ev => updateEvent(i, "description", ev.target.value)} className="w-full bg-background/50 rounded px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-primary resize-none" rows={2} placeholder="תוכן / פרטים" />
              <div className="flex gap-1 flex-wrap">
                {EVENT_TYPES.map(t => (
                  <button key={t} onClick={() => updateEvent(i, "type", t)} className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition-all ${e.type === t ? "bg-primary text-primary-foreground" : "bg-background/50 text-muted-foreground"}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {tasks.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            <ListTodo className="w-4 h-4" />
            <span>משימות ({tasks.length})</span>
          </div>
          {tasks.map((t, i) => (
            <div key={i} className="bg-muted/50 rounded-lg p-2.5 space-y-1.5 text-xs">
              <div className="flex items-center gap-2">
                <button onClick={() => setTasks(prev => prev.filter((_, idx) => idx !== i))} className="text-destructive hover:text-destructive/80 flex-shrink-0">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <input value={t.title} onChange={ev => updateTask(i, "title", ev.target.value)} className="flex-1 bg-background/50 rounded px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-primary" placeholder="כותרת" />
              </div>
              <div className="flex gap-1.5 items-center">
                <input type="date" value={t.dueDate} onChange={ev => updateTask(i, "dueDate", ev.target.value)} className="bg-background/50 rounded px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-primary" />
                <div className="flex gap-1">
                  {PRIORITIES.map(p => (
                    <button key={p} onClick={() => updateTask(i, "priority", p)} className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition-all ${t.priority === p ? "bg-primary text-primary-foreground" : "bg-background/50 text-muted-foreground"}`}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {soldiers.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            <Users className="w-4 h-4" />
            <span>חיילים ({soldiers.length})</span>
          </div>
          {soldiers.map((s, i) => (
            <div key={i} className="bg-muted/50 rounded-lg p-2.5 space-y-1.5 text-xs">
              <div className="flex items-center gap-2">
                <button onClick={() => setSoldiers(prev => prev.filter((_, idx) => idx !== i))} className="text-destructive hover:text-destructive/80 flex-shrink-0">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <input value={s.name} onChange={ev => updateSoldier(i, "name", ev.target.value)} className="flex-1 bg-background/50 rounded px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-primary" placeholder="שם" />
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <input value={s.unit} onChange={ev => updateSoldier(i, "unit", ev.target.value)} className="bg-background/50 rounded px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-primary" placeholder="יחידה" />
                <input value={s.phone || ""} onChange={ev => updateSoldier(i, "phone", ev.target.value)} className="bg-background/50 rounded px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-primary" placeholder="טלפון" />
              </div>
              <div className="flex gap-1">
                {STATUSES.map(st => (
                  <button key={st} onClick={() => updateSoldier(i, "status", st)} className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition-all ${s.status === st ? "bg-primary text-primary-foreground" : "bg-background/50 text-muted-foreground"}`}>
                    {st}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {!hasItems && (
        <p className="text-sm text-muted-foreground text-center py-2">לא נמצאו פריטים רלוונטיים בתוכן.</p>
      )}

      <div className="flex gap-2 justify-end">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="w-4 h-4 ml-1" />
          ביטול
        </Button>
        {hasItems && (
          <Button size="sm" onClick={() => onConfirm({ events, tasks, soldiers, summary: data.summary })}>
            <Check className="w-4 h-4 ml-1" />
            אשר ושמור ({events.length + tasks.length + soldiers.length})
          </Button>
        )}
      </div>
    </div>
  );
}
