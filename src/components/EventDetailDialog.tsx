import { useState, useEffect } from "react";
import { Clock, MapPin, Tag, FileText, CalendarPlus, Pencil, Trash2, Users, Target, StickyNote, Link, ArrowLeftRight, Route } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { SoldierEvent, RouteType } from "@/lib/store";

const ROUTES: RouteType[] = ["יואב", "מעלות צור", "קודקוד"];

const ROUTE_COLORS: Record<RouteType, string> = {
  "יואב": "bg-blue-500/20 text-blue-400",
  "מעלות צור": "bg-green-500/20 text-green-400",
  "קודקוד": "bg-purple-500/20 text-purple-400",
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

const EVENT_TYPES: SoldierEvent["type"][] = ["מכינה", "גיוס", "טירונות", "חופשה", "תפילה", "אימון", "כללי"];
const EVENT_KINDS: SoldierEvent["eventKind"][] = ["חד פעמי", "פתיחה", "סיום"];

interface EventDetailDialogProps {
  event: SoldierEvent | null;
  open: boolean;
  onClose: () => void;
  isEditMode: boolean;
  onDelete?: (id: string) => void;
  onUpdate?: (event: SoldierEvent) => void;
  allEvents?: SoldierEvent[];
  onNavigateToEvent?: (event: SoldierEvent) => void;
}

export default function EventDetailDialog({ event, open, onClose, isEditMode, onDelete, onUpdate, allEvents = [], onNavigateToEvent }: EventDetailDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<SoldierEvent | null>(null);

  // Reset edit state when event changes
  useEffect(() => {
    setIsEditing(false);
    setEditData(null);
  }, [event?.id]);

  if (!event) return null;

  const linkedEvent = event.linkedEventId ? allEvents.find(e => e.id === event.linkedEventId) : null;

  const handleEdit = () => {
    setEditData({ ...event });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!editData) return;
    // Clear time fields if they are empty strings
    const cleaned: SoldierEvent = {
      ...editData,
      time: editData.time || undefined,
      endTime: editData.endTime || undefined,
    };
    onUpdate?.(cleaned);
    setIsEditing(false);
    setEditData(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData(null);
  };

  const handleDelete = () => {
    onDelete?.(event.id);
    onClose();
  };

  const handleNavigateLinked = () => {
    if (linkedEvent && onNavigateToEvent) {
      onNavigateToEvent(linkedEvent);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xs max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-right text-base">
            {isEditing ? (
              <input
                value={editData?.title || ""}
                onChange={e => setEditData(p => p ? { ...p, title: e.target.value } : p)}
                className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary text-right"
              />
            ) : event.title}
          </DialogTitle>
        </DialogHeader>

        {isEditing && editData ? (
          <div className="flex flex-col gap-3 text-right">
            {/* Type */}
            <div>
              <label className="text-xs text-muted-foreground block text-right mb-1">סוג</label>
              <div className="flex gap-1.5 flex-wrap justify-end">
                {EVENT_TYPES.map(t => (
                  <button key={t} onClick={() => setEditData(p => p ? { ...p, type: t } : p)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${editData.type === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="text-xs text-muted-foreground block text-right mb-1">תאריך</label>
              <input type="date" value={editData.date}
                onChange={e => setEditData(p => p ? { ...p, date: e.target.value } : p)}
                className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary" />
            </div>

            {/* Times */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground block text-right mb-1">שעת התחלה</label>
                <div className="flex gap-1">
                  <input
                    type="time"
                    value={editData.time || ""}
                    onChange={e => setEditData(p => p ? { ...p, time: e.target.value || undefined } : p)}
                    className="flex-1 bg-muted rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                  />
                  {editData.time && (
                    <button onClick={() => setEditData(p => p ? { ...p, time: undefined } : p)} className="px-2 text-muted-foreground hover:text-destructive text-xs">✕</button>
                  )}
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground block text-right mb-1">שעת סיום</label>
                <div className="flex gap-1">
                  <input
                    type="time"
                    value={editData.endTime || ""}
                    onChange={e => setEditData(p => p ? { ...p, endTime: e.target.value || undefined } : p)}
                    className="flex-1 bg-muted rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                  />
                  {editData.endTime && (
                    <button onClick={() => setEditData(p => p ? { ...p, endTime: undefined } : p)} className="px-2 text-muted-foreground hover:text-destructive text-xs">✕</button>
                  )}
                </div>
              </div>
            </div>

            {/* Route */}
            <div>
              <label className="text-xs text-muted-foreground block text-right mb-1">מסלול</label>
              <div className="flex gap-1.5 flex-wrap justify-end">
                <button
                  onClick={() => setEditData(p => p ? { ...p, route: undefined } : p)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${!editData.route ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                >
                  ללא
                </button>
                {ROUTES.map(r => (
                  <button
                    key={r}
                    onClick={() => setEditData(p => p ? { ...p, route: r } : p)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${editData.route === r ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Location */}
            <input value={editData.location || ""}
              onChange={e => setEditData(p => p ? { ...p, location: e.target.value || undefined } : p)}
              placeholder="מיקום" className="bg-muted rounded-lg px-3 py-2 text-sm text-right outline-none focus:ring-1 focus:ring-primary" />

            {/* Event Kind */}
            <div>
              <label className="text-xs text-muted-foreground block text-right mb-1">סוג אירוע</label>
              <div className="flex gap-1.5 flex-wrap justify-end">
                {EVENT_KINDS.map(k => (
                  <button key={k} onClick={() => setEditData(p => p ? { ...p, eventKind: k } : p)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${editData.eventKind === k ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground"}`}>
                    {k}
                  </button>
                ))}
              </div>
            </div>

            {/* End Date */}
            {(editData.eventKind === "פתיחה" || editData.eventKind === "סיום") && (
              <div>
                <label className="text-xs text-muted-foreground block text-right mb-1">
                  {editData.eventKind === "פתיחה" ? "תאריך אירוע סיום" : "תאריך אירוע פתיחה"}
                </label>
                <input type="date" value={editData.endDate || ""}
                  onChange={e => setEditData(p => p ? { ...p, endDate: e.target.value || undefined } : p)}
                  className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary" />
              </div>
            )}

            {/* Soldiers */}
            <div className="grid grid-cols-2 gap-2">
              <input type="number" value={editData.plannedSoldiers || ""}
                onChange={e => setEditData(p => p ? { ...p, plannedSoldiers: e.target.value ? Number(e.target.value) : undefined } : p)}
                placeholder="מתוכנן" className="bg-muted rounded-lg px-3 py-2 text-sm text-right outline-none focus:ring-1 focus:ring-primary" />
              <input type="number" value={editData.actualSoldiers || ""}
                onChange={e => setEditData(p => p ? { ...p, actualSoldiers: e.target.value ? Number(e.target.value) : undefined } : p)}
                placeholder="מעודכן" className="bg-muted rounded-lg px-3 py-2 text-sm text-right outline-none focus:ring-1 focus:ring-primary" />
            </div>

            <input value={editData.placementTargets || ""}
              onChange={e => setEditData(p => p ? { ...p, placementTargets: e.target.value || undefined } : p)}
              placeholder="יעדי שיבוץ" className="bg-muted rounded-lg px-3 py-2 text-sm text-right outline-none focus:ring-1 focus:ring-primary" />

            <textarea value={editData.description || ""}
              onChange={e => setEditData(p => p ? { ...p, description: e.target.value || undefined } : p)}
              placeholder="פרטים" rows={2}
              className="bg-muted rounded-lg px-3 py-2 text-sm text-right outline-none focus:ring-1 focus:ring-primary resize-none" />

            <textarea value={editData.notes || ""}
              onChange={e => setEditData(p => p ? { ...p, notes: e.target.value || undefined } : p)}
              placeholder="הערות" rows={2}
              className="bg-muted rounded-lg px-3 py-2 text-sm text-right outline-none focus:ring-1 focus:ring-primary resize-none" />

            <div className="flex gap-2">
              <button onClick={handleSave} className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">שמור</button>
              <button onClick={handleCancel} className="flex-1 py-2 rounded-lg bg-muted text-muted-foreground text-sm">ביטול</button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3 text-right">
            {/* Type + Date */}
            <div className="flex items-center gap-2 text-sm flex-wrap">
              <span className={`text-xs px-2 py-0.5 rounded-full text-primary-foreground font-medium ${TYPE_COLORS[event.type]}`}>
                {event.type}
              </span>
              <span className="text-muted-foreground">{event.date.split("-").reverse().join("/")}</span>
              {event.time && (
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  {event.time}{event.endTime ? `–${event.endTime}` : ""}
                </span>
              )}
              {event.eventKind && event.eventKind !== "חד פעמי" && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/20 text-secondary">{event.eventKind}</span>
              )}
              {event.route && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROUTE_COLORS[event.route]}`}>
                  {event.route}
                </span>
              )}
            </div>

            {event.location && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span>{event.location}</span>
              </div>
            )}

            {event.endDate && (
              <div className="flex items-center gap-2 text-sm">
                <CalendarPlus className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span>{event.eventKind === "פתיחה" ? "אירוע סיום:" : "אירוע פתיחה:"} {event.endDate.split("-").reverse().join("/")}</span>
              </div>
            )}
            {linkedEvent && (
              <button
                onClick={handleNavigateLinked}
                className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                <ArrowLeftRight className="w-4 h-4" />
                <span>עבור לאירוע {linkedEvent.eventKind}: {linkedEvent.title} ({linkedEvent.date.split("-").reverse().join("/")})</span>
              </button>
            )}

            {(event.plannedSoldiers || event.actualSoldiers) && (
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span>
                  {event.plannedSoldiers ? `מתוכנן: ${event.plannedSoldiers}` : ""}
                  {event.plannedSoldiers && event.actualSoldiers ? " | " : ""}
                  {event.actualSoldiers ? `מעודכן: ${event.actualSoldiers}` : ""}
                </span>
              </div>
            )}

            {event.placementTargets && (
              <div className="flex items-center gap-2 text-sm">
                <Target className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span>{event.placementTargets}</span>
              </div>
            )}

            {event.description && (
              <div className="flex items-start gap-2 text-sm">
                <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <span className="whitespace-pre-wrap">{event.description}</span>
              </div>
            )}

            {event.notes && (
              <div className="flex items-start gap-2 text-sm">
                <StickyNote className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <span className="whitespace-pre-wrap">{event.notes}</span>
              </div>
            )}

            {isEditMode && (
              <div className="flex gap-2 mt-2">
                <button onClick={handleEdit}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-muted hover:bg-muted/80 text-sm transition-colors">
                  <Pencil className="w-3.5 h-3.5" />
                  עריכה
                </button>
                <button onClick={handleDelete}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive text-sm transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                  מחיקה
                </button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
