import { useState, useMemo } from "react";
import { Users, Phone, Shield, Plus, Trash2, Clock, Calendar } from "lucide-react";
import type { Soldier, SoldierEvent } from "@/lib/store";
import { useEditMode } from "@/lib/EditModeContext";
import EventDetailDialog from "./EventDetailDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const STATUS_STYLES: Record<string, string> = {
  "פעיל": "bg-primary/20 text-primary",
  "חופשה": "bg-secondary/20 text-secondary",
  "מילואים": "bg-purple-500/20 text-purple-400",
};

const TYPE_COLORS: Record<string, string> = {
  "מכינה": "bg-primary",
  "גיוס": "bg-blue-500",
  "טירונות": "bg-orange-500",
  "חופשה": "bg-secondary",
  "תפילה": "bg-purple-500",
  "אימון": "bg-red-500",
  "כללי": "bg-muted-foreground",
};

interface SoldiersViewProps {
  soldiers: Soldier[];
  events: SoldierEvent[];
  onAddSoldier?: (soldier: Omit<Soldier, "id">) => void;
  onDeleteSoldier?: (id: string) => void;
  onDeleteEvent?: (id: string) => void;
  onUpdateEvent?: (event: SoldierEvent) => void;
}

export default function SoldiersView({ soldiers, events, onAddSoldier, onDeleteSoldier, onDeleteEvent, onUpdateEvent }: SoldiersViewProps) {
  const { isEditMode } = useEditMode();
  const today = new Date().toISOString().split("T")[0];
  const [detailEvent, setDetailEvent] = useState<SoldierEvent | null>(null);

  const upcoming = useMemo(() => {
    return events
      .filter(e => e.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [events, today]);

  const [showAdd, setShowAdd] = useState(false);
  const [newSoldier, setNewSoldier] = useState({ name: "", unit: "", status: "פעיל" as Soldier["status"], phone: "" });

  const handleAdd = () => {
    if (!newSoldier.name.trim()) return;
    onAddSoldier?.({
      name: newSoldier.name.trim(),
      unit: newSoldier.unit.trim(),
      status: newSoldier.status,
      phone: newSoldier.phone.trim() || undefined,
    });
    setNewSoldier({ name: "", unit: "", status: "פעיל", phone: "" });
    setShowAdd(false);
  };

  return (
    <div className="flex flex-col gap-4 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-2 justify-end">
        <h2 className="text-xl font-bold">לוז</h2>
        <Calendar className="w-5 h-5 text-primary" />
      </div>

      {/* Upcoming Events - Full list */}
      <div className="glass-card p-4">
        <h3 className="text-sm font-semibold text-muted-foreground mb-3 text-right">אירועים קרובים</h3>
        {upcoming.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">אין אירועים קרובים</p>
        ) : (
          <div className="flex flex-col gap-2">
            {upcoming.map((event, i) => (
              <button
                key={event.id}
                onClick={() => setDetailEvent(event)}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors animate-fade-in-up text-right w-full"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex-shrink-0 mt-1">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1 text-right">
                  <p className="font-medium text-sm">{event.title}</p>
                  <div className="flex items-center gap-2 mt-1 justify-end">
                    <span className="text-xs text-muted-foreground">
                      {event.date.split("-").reverse().join("/")}
                    </span>
                    {event.time && <span className="text-xs text-muted-foreground">{event.time}</span>}
                  </div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full text-primary-foreground font-medium ${TYPE_COLORS[event.type]}`}>
                  {event.type}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Soldiers List */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{soldiers.length} חיילים</span>
            {isEditMode && (
              <button
                onClick={() => setShowAdd(true)}
                className="flex items-center gap-1 text-primary text-xs hover:text-primary/80 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                הוסף
              </button>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold">רשימת חיילים</h3>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {soldiers.map((soldier, i) => (
            <div
              key={soldier.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors animate-fade-in-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {isEditMode && (
                <button
                  onClick={() => onDeleteSoldier?.(soldier.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
              {soldier.phone && (
                <a href={`tel:${soldier.phone}`} className="text-primary hover:text-primary/80 transition-colors">
                  <Phone className="w-4 h-4" />
                </a>
              )}
              <div className="flex-1 text-right">
                <p className="font-medium text-sm">{soldier.name}</p>
                <span className="text-xs text-muted-foreground">{soldier.unit}</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[soldier.status]}`}>
                {soldier.status}
              </span>
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold">
                {soldier.name.charAt(0)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Soldier Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle className="text-right">הוסף חייל</DialogTitle>
            <DialogDescription className="text-right">הזן פרטי החייל החדש</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <input
              value={newSoldier.name}
              onChange={e => setNewSoldier(p => ({ ...p, name: e.target.value }))}
              placeholder="שם מלא..."
              className="bg-muted rounded-lg px-3 py-2 text-sm text-right outline-none focus:ring-1 focus:ring-primary"
              autoFocus
            />
            <input
              value={newSoldier.unit}
              onChange={e => setNewSoldier(p => ({ ...p, unit: e.target.value }))}
              placeholder="יחידה..."
              className="bg-muted rounded-lg px-3 py-2 text-sm text-right outline-none focus:ring-1 focus:ring-primary"
            />
            <input
              value={newSoldier.phone}
              onChange={e => setNewSoldier(p => ({ ...p, phone: e.target.value }))}
              placeholder="טלפון..."
              className="bg-muted rounded-lg px-3 py-2 text-sm text-right outline-none focus:ring-1 focus:ring-primary"
            />
            <div className="flex gap-2 justify-end">
              {(["פעיל", "חופשה", "מילואים"] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setNewSoldier(p => ({ ...p, status: s }))}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    newSoldier.status === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <button
              onClick={handleAdd}
              className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm"
            >
              הוספה
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Event Detail Dialog */}
      <EventDetailDialog
        event={detailEvent}
        open={!!detailEvent}
        onClose={() => setDetailEvent(null)}
        isEditMode={isEditMode}
        onDelete={onDeleteEvent}
        onUpdate={onUpdateEvent}
      />
    </div>
  );
}
