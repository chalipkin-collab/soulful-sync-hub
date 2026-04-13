import { useState } from "react";
import { CheckSquare, Plus, Trash2, Pencil, X } from "lucide-react";
import type { Task } from "@/lib/store";
import { useEditMode } from "@/lib/EditModeContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const PRIORITY_STYLES: Record<string, { dot: string; label: string }> = {
  "דחוף": { dot: "bg-destructive", label: "text-destructive" },
  "בינוני": { dot: "bg-secondary", label: "text-secondary" },
  "רגיל": { dot: "bg-primary", label: "text-primary" },
};

interface TasksViewProps {
  tasks: Task[];
  onToggle: (id: string) => void;
  onAdd: (task: Omit<Task, "id">) => void;
  onDelete: (id: string) => void;
  onUpdate?: (task: Task) => void;
}

export default function TasksView({ tasks, onToggle, onAdd, onDelete, onUpdate }: TasksViewProps) {
  const { isEditMode } = useEditMode();
  const [filter, setFilter] = useState<"all" | "open" | "urgent" | "done">("open");
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState<Task["priority"]>("רגיל");
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const filtered = tasks.filter(t => {
    if (filter === "open") return !t.completed;
    if (filter === "done") return t.completed;
    if (filter === "urgent") return t.priority === "דחוף" && !t.completed;
    return true;
  });

  const openCount = tasks.filter(t => !t.completed).length;

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    onAdd({
      title: newTitle.trim(),
      dueDate: new Date().toISOString().split("T")[0],
      priority: newPriority,
      completed: false,
    });
    setNewTitle("");
    setShowAdd(false);
  };

  const handleSaveEdit = () => {
    if (editingTask && editingTask.title.trim()) {
      onUpdate?.(editingTask);
      setEditingTask(null);
    }
  };

  return (
    <div className="flex flex-col gap-4 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{openCount} פתוחות</span>
        <div className="flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold">משימות</h2>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 justify-end flex-wrap">
        {(["open", "urgent", "all", "done"] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              filter === f
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            } ${f === "urgent" ? "flex items-center gap-1" : ""}`}
          >
            {f === "urgent" && <span className="w-1.5 h-1.5 rounded-full bg-destructive inline-block" />}
            {f === "open" ? "פתוחות" : f === "urgent" ? "דחופות" : f === "all" ? "הכל" : "הושלמו ✓"}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="flex flex-col gap-2">
        {filtered.map((task, i) => {
          const style = PRIORITY_STYLES[task.priority];
          return (
            <div
              key={task.id}
              className={`glass-card p-3 flex items-center gap-3 animate-fade-in-up ${
                task.completed ? "opacity-60" : ""
              }`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {isEditMode && (
                <button
                  onClick={() => setEditingTask({ ...task })}
                  className="text-muted-foreground hover:text-primary transition-colors p-1"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              )}
              <div className="flex-1 text-right">
                <p className={`text-sm font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                  {task.title}
                </p>
                <div className="flex items-center gap-2 mt-1 justify-end">
                  <span className="text-xs text-muted-foreground">
                    {task.dueDate.split("-").reverse().join("/")}
                  </span>
                  <span className={`text-xs font-medium flex items-center gap-1 ${style.label}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                    {task.priority}
                  </span>
                </div>
              </div>
              <button
                onClick={() => onToggle(task.id)}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                  task.completed
                    ? "bg-primary border-primary text-primary-foreground"
                    : "border-muted-foreground hover:border-primary"
                }`}
              >
                {task.completed && <span className="text-xs">✓</span>}
              </button>
            </div>
          );
        })}
      </div>

      {/* Add Task - only in edit mode */}
      {isEditMode && (
        showAdd ? (
          <div className="glass-card p-4 flex flex-col gap-3 animate-fade-in-up">
            <input
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="שם המשימה..."
              className="bg-muted rounded-lg px-3 py-2 text-sm text-right outline-none focus:ring-1 focus:ring-primary"
              autoFocus
              onKeyDown={e => e.key === "Enter" && handleAdd()}
            />
            <div className="flex gap-2 justify-end">
              {(["רגיל", "בינוני", "דחוף"] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setNewPriority(p)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    newPriority === p ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowAdd(false)} className="flex-1 py-2 rounded-lg bg-muted text-sm">
                ביטול
              </button>
              <button onClick={handleAdd} className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">
                הוספה
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAdd(true)}
            className="glass-card p-3 flex items-center justify-center gap-2 text-primary hover:bg-primary/10 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">הוסף משימה</span>
          </button>
        )
      )}

      {/* Edit Task Dialog */}
      <Dialog open={!!editingTask} onOpenChange={(open) => !open && setEditingTask(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-right">עריכת משימה</DialogTitle>
          </DialogHeader>
          {editingTask && (
            <div className="flex flex-col gap-3">
              <input
                value={editingTask.title}
                onChange={e => setEditingTask(p => p ? { ...p, title: e.target.value } : p)}
                placeholder="שם המשימה..."
                className="bg-muted rounded-lg px-3 py-2 text-sm text-right outline-none focus:ring-1 focus:ring-primary"
                autoFocus
              />
              <input
                type="date"
                value={editingTask.dueDate}
                onChange={e => setEditingTask(p => p ? { ...p, dueDate: e.target.value } : p)}
                className="bg-muted rounded-lg px-3 py-2 text-sm text-right outline-none focus:ring-1 focus:ring-primary"
              />
              <div className="flex gap-2 justify-end">
                {(["רגיל", "בינוני", "דחוף"] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setEditingTask(prev => prev ? { ...prev, priority: p } : prev)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      editingTask.priority === p ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { onDelete(editingTask.id); setEditingTask(null); }}
                  className="px-3 py-2 rounded-lg bg-destructive/10 text-destructive text-sm hover:bg-destructive/20 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm"
                >
                  שמור שינויים
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
