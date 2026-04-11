import { useState } from "react";
import { Plus, Trash2, Eye, EyeOff, Pencil } from "lucide-react";
import { CustomTab } from "@/lib/customTabsStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface TabManagerProps {
  tabs: CustomTab[];
  onAddTab: (name: string) => Promise<string | null>;
  onUpdateTab: (id: string, updates: Partial<Pick<CustomTab, "name" | "visibleInView">>) => void;
  onDeleteTab: (id: string) => void;
}

export default function TabManager({ tabs, onAddTab, onUpdateTab, onDeleteTab }: TabManagerProps) {
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const handleAdd = async () => {
    if (!newName.trim()) return;
    await onAddTab(newName.trim());
    setNewName("");
  };

  const handleRename = (tab: CustomTab) => {
    if (editingId === tab.id) {
      if (editName.trim() && editName.trim() !== tab.name) {
        onUpdateTab(tab.id, { name: editName.trim() });
      }
      setEditingId(null);
    } else {
      setEditingId(tab.id);
      setEditName(tab.name);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1">
          <Plus className="w-4 h-4" />
          ניהול טאבים
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ניהול טאבים מותאמים</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {/* Add new tab */}
          <div className="flex gap-2">
            <Input
              placeholder="שם טאב חדש"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAdd()}
            />
            <Button onClick={handleAdd} size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Existing tabs */}
          {tabs.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">אין טאבים מותאמים עדיין</p>
          )}
          {tabs.map(tab => (
            <div key={tab.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
              {editingId === tab.id ? (
                <Input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleRename(tab)}
                  className="h-8 text-sm"
                  autoFocus
                />
              ) : (
                <span className="flex-1 text-sm font-medium">{tab.name}</span>
              )}
              <button onClick={() => handleRename(tab)} className="text-muted-foreground hover:text-foreground p-1">
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <div className="flex items-center gap-1">
                {tab.visibleInView ? <Eye className="w-3.5 h-3.5 text-muted-foreground" /> : <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />}
                <Switch
                  checked={tab.visibleInView}
                  onCheckedChange={v => onUpdateTab(tab.id, { visibleInView: v })}
                  className="scale-75"
                />
              </div>
              <button onClick={() => onDeleteTab(tab.id)} className="text-destructive hover:text-destructive/80 p-1">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
