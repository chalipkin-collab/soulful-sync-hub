import { useState, useRef, useEffect } from "react";
import { Clock, MapPin, Tag, FileText, CalendarPlus, Pencil, Trash2, Users, Target, StickyNote, Link } from "lucide-react";
import { downloadICS } from "@/lib/calendarExport";
import type { SoldierEvent } from "@/lib/store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const EVENT_TYPES: SoldierEvent["type"][] = ["מכינה", "גיוס", "טירונות", "חופשה", "תפילה", "אימון", "כללי"];
const EVENT_KINDS: SoldierEvent["eventKind"][] = ["חד פעמי", "פתיחה", "סיום"];

function AutoTextarea({ value, onChange, placeholder, className }: { value: string; onChange: (v: string) => void; placeholder?: string; className?: string }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = ref.current.scrollHeight + "px";
    }
  }, [value]);
  return (
    <textarea
      ref={ref}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={`bg-muted rounded-lg px-3 py-2 text-sm text-right outline-none focus:ring-1 focus:ring-primary resize-none overflow-hidden ${className || ""}`}
      rows={2}
    />
  );
}

interface EventDetailDialogProps {
  event: SoldierEvent | null;
  open: boolean;
  onClose: () => void;
  isEditMode: boolean;
  onDelete?: (id: string) => void;
  onUpdate?: (event: SoldierEvent) => void;
}

export default function EventDetailDialog({ event, open, onClose, isEditMode, onDelete, onUpdate }: EventDetailDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<SoldierEvent | null>(null);

  if (!event) return null;

  const handleStartEdit = () => {
    setEditData({ ...event });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editData && editData.title.trim()) {
      onUpdate?.(editData);
      setIsEditing(false);
      onClose();
    }
  };

  const handleDelete = () => {
    onDelete?.(event.id);
    onClose();
  };

  const handleClose = () => {
    setIsEditing(false);
    setEditData(null);
    onClose();
  };

  if (isEditMode && isEditing && editData) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-sm max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-right">עריכת אירוע</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <input
              value={editData.title}
              onChange={e => setEditData(p => p ? { ...p, title: e.target.value } : p)}
              placeholder="שם האירוע..."
              className="bg-muted rounded-lg px-3 py-2 text-sm text-right outline-none focus:ring-1 focus:ring-primary"
              autoFocus
            />
            <input
              type="date"
              value={editData.date}
              onChange={e => setEditData(p => p ? { ...p, date: e.target.value } : p)}
              className="bg-muted rounded-lg px-3 py-2 text-sm text-right outline-none focus:ring-1 focus:ring-primary"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="time"
                value={editData.time || ""}
                onChange={e => setEditData(p => p ? { ...p, time: e.target.value || undefined } : p)}
                className="bg-muted rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                placeholder="שעת התחלה"
              />
              <input
                type="time"
                value={editData.endTime || ""}
                onChange={e => setEditData(p => p ? { ...p, endTime: e.target.value || undefined } : p)}
                className="bg-muted rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                placeholder="שעת סיום"
              />
            </div>
            <input
              value={editData.location || ""}
              onChange={e => setEditData(p => p ? { ...p, location: e.target.value || undefined } : p)}
              placeholder="מיקום (אופציונלי)"
              className="bg-muted rounded-lg px-3 py-2 text-sm text-right outline-none focus:ring-1 focus:ring-primary"
            />

            {/* Event Kind */}
            <div>
              <label className="text-xs text-muted-foreground block text-right mb-1">סוג אירוע</label>
              <div className="flex gap-1.5 flex-wrap justify-end">
                {EVENT_KINDS.map(k => (
                  <button
                    key={k}
                    onClick={() => setEditData(p => p ? { ...p, eventKind: k } : p)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                      (editData.eventKind || "חד פעמי") === k ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {k}
                  </button>
                ))}
              </div>
            </div>

            {/* End Date - show for opening/closing events */}
            {(editData.eventKind === "פתיחה" || editData.eventKind === "סיום") && (
              <div>
                <label className="text-xs text-muted-foreground block text-right mb-1">
                  {editData.eventKind === "פתיחה" ? "תאריך סיום" : "תאריך פתיחה"}
                </label>
                <input
                  type="date"
                  value={editData.endDate || ""}
                  onChange={e => setEditData(p => p ? { ...p, endDate: e.target.value || undefined } : p)}
                  className="w-full bg-muted rounded-lg px-3 py-2 text-sm text-right outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            )}

            {/* Soldier counts */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground block text-right mb-1">חיילים מתוכנן</label>
                <input
                  type="number"
                  value={editData.plannedSoldiers ?? ""}
                  onChange={e => setEditData(p => p ? { ...p, plannedSoldiers: e.target.value ? Number(e.target.value) : undefined } : p)}
                  className="w-full bg-muted rounded-lg px-3 py-2 text-sm text-right outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block text-right mb-1">חיילים מעודכן</label>
                <input
                  type="number"
                  value={editData.actualSoldiers ?? ""}
                  onChange={e => setEditData(p => p ? { ...p, actualSoldiers: e.target.value ? Number(e.target.value) : undefined } : p)}
                  className="w-full bg-muted rounded-lg px-3 py-2 text-sm text-right outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <input
              value={editData.placementTargets || ""}
              onChange={e => setEditData(p => p ? { ...p, placementTargets: e.target.value || undefined } : p)}
              placeholder="יעדי שיבוץ מתוכננים (אופציונלי)"
              className="bg-muted rounded-lg px-3 py-2 text-sm text-right outline-none focus:ring-1 focus:ring-primary"
            />

            <AutoTextarea
              value={editData.description || ""}
              onChange={v => setEditData(p => p ? { ...p, description: v || undefined } : p)}
              placeholder="תוכן / פרטים (אופציונלי)"
            />

            <AutoTextarea
              value={editData.notes || ""}
              onChange={v => setEditData(p => p ? { ...p, notes: v || undefined } : p)}
              placeholder="הערות (אופציונלי)"
            />

            <div className="flex gap-1.5 flex-wrap justify-end">
              {EVENT_TYPES.map(t => (
                <button
                  key={t}
                  onClick={() => setEditData(p => p ? { ...p, type: t } : p)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                    editData.type === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                className="px-3 py-2 rounded-lg bg-destructive/10 text-destructive text-sm hover:bg-destructive/20 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm"
              >
                שמור שינויים
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-right">{event.title}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 text-right [direction:rtl]">
          <div className="flex items-center gap-2 text-sm">
            <Tag className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">{event.type}</span>
            {event.eventKind && event.eventKind !== "חד פעמי" && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/20 text-secondary">{event.eventKind}</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span>{event.date.split("-").reverse().join("/")}</span>
            {event.time && <span>{event.time}</span>}
            {event.endTime && <span>- {event.endTime}</span>}
          </div>
          {event.endDate && (
            <div className="flex items-center gap-2 text-sm">
              <Link className="w-4 h-4 text-muted-foreground" />
              <span>{event.eventKind === "פתיחה" ? "תאריך סיום:" : "תאריך פתיחה:"} {event.endDate.split("-").reverse().join("/")}</span>
            </div>
          )}
          {event.location && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span>{event.location}</span>
            </div>
          )}
          {(event.plannedSoldiers || event.actualSoldiers) && (
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span>
                {event.plannedSoldiers && `מתוכנן: ${event.plannedSoldiers}`}
                {event.plannedSoldiers && event.actualSoldiers && " | "}
                {event.actualSoldiers && `מעודכן: ${event.actualSoldiers}`}
              </span>
            </div>
          )}
          {event.placementTargets && (
            <div className="flex items-center gap-2 text-sm">
              <Target className="w-4 h-4 text-muted-foreground" />
              <span>{event.placementTargets}</span>
            </div>
          )}
          {event.description && (
            <div className="flex gap-2 text-sm">
              <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <p className="text-muted-foreground whitespace-pre-line">{event.description}</p>
            </div>
          )}
          {event.notes && (
            <div className="flex gap-2 text-sm">
              <StickyNote className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <p className="text-muted-foreground whitespace-pre-line">{event.notes}</p>
            </div>
          )}
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => downloadICS(event)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-muted text-sm hover:bg-muted/80 transition-colors"
            >
              <CalendarPlus className="w-4 h-4" />
              הוסף ללוח שנה
            </button>
            {isEditMode && (
              <button
                onClick={handleStartEdit}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm"
              >
                <Pencil className="w-4 h-4" />
                ערוך
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
