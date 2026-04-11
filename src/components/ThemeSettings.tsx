import { Sun, Moon, Palette } from "lucide-react";
import { useTheme, ThemeColor } from "@/lib/ThemeContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const COLORS: { id: ThemeColor; label: string; class: string }[] = [
  { id: "green", label: "ירוק", class: "bg-[hsl(145,63%,42%)]" },
  { id: "blue", label: "כחול", class: "bg-[hsl(217,91%,60%)]" },
  { id: "purple", label: "סגול", class: "bg-[hsl(271,76%,53%)]" },
  { id: "orange", label: "כתום", class: "bg-[hsl(25,95%,53%)]" },
  { id: "red", label: "אדום", class: "bg-[hsl(0,72%,51%)]" },
];

export default function ThemeSettings() {
  const { mode, color, setMode, setColor } = useTheme();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1">
          <Palette className="w-4 h-4" />
          תצוגה
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>הגדרות תצוגה</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setMode("light")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                mode === "light" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              בהיר
            </button>
            <button
              onClick={() => setMode("dark")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                mode === "dark" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              כהה
            </button>
          </div>
          <div className="flex gap-2 justify-end">
            {COLORS.map(c => (
              <button
                key={c.id}
                onClick={() => setColor(c.id)}
                className={`w-8 h-8 rounded-full ${c.class} transition-all ${
                  color === c.id ? "ring-2 ring-offset-2 ring-offset-background ring-primary scale-110" : "opacity-70 hover:opacity-100"
                }`}
                title={c.label}
              />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
