import { useState } from "react";
import { CalendarPlus, ListTodo, Users, Trash2, Check, X, Edit2 } from "lucide-react";
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

export default function ExtractionConfirmDialog({ data, onConfirm, onCancel }: Props) {
  const [events, setEvents] = useState(data.events);
  const [tasks, setTasks] = useState(data.tasks);
  const [soldiers, setSoldiers] = useState(data.soldiers);

  const hasItems = events.length > 0 || tasks.length > 0 || soldiers.length > 0;

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
            <div key={i} className="flex items-start gap-2 bg-muted/50 rounded-lg p-2 text-xs">
              <button onClick={() => setEvents(prev => prev.filter((_, idx) => idx !== i))} className="text-destructive hover:text-destructive/80 mt-0.5 flex-shrink-0">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <div className="flex-1">
                <div className="font-medium">{e.title}</div>
                <div className="text-muted-foreground">
                  {e.date}{e.time ? ` • ${e.time}` : ""}{e.endTime ? `-${e.endTime}` : ""} • {e.type}
                  {e.location ? ` • ${e.location}` : ""}
                </div>
                {e.description && <div className="text-muted-foreground mt-0.5">{e.description}</div>}
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
            <div key={i} className="flex items-start gap-2 bg-muted/50 rounded-lg p-2 text-xs">
              <button onClick={() => setTasks(prev => prev.filter((_, idx) => idx !== i))} className="text-destructive hover:text-destructive/80 mt-0.5 flex-shrink-0">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <div className="flex-1">
                <div className="font-medium">{t.title}</div>
                <div className="text-muted-foreground">יעד: {t.dueDate} • עדיפות: {t.priority}</div>
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
            <div key={i} className="flex items-start gap-2 bg-muted/50 rounded-lg p-2 text-xs">
              <button onClick={() => setSoldiers(prev => prev.filter((_, idx) => idx !== i))} className="text-destructive hover:text-destructive/80 mt-0.5 flex-shrink-0">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <div className="flex-1">
                <div className="font-medium">{s.name}</div>
                <div className="text-muted-foreground">יחידה: {s.unit} • סטטוס: {s.status}{s.phone ? ` • ${s.phone}` : ""}</div>
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
