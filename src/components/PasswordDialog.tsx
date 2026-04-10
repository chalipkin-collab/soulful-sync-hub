import { useState } from "react";
import { Lock, LogOut, KeyRound } from "lucide-react";
import { useEditMode } from "@/lib/EditModeContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function PasswordDialog() {
  const { isEditMode, login, logout } = useEditMode();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = () => {
    if (login(password)) {
      setOpen(false);
      setPassword("");
      setError(false);
    } else {
      setError(true);
    }
  };

  if (isEditMode) {
    return (
      <button
        onClick={logout}
        className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium hover:bg-primary/30 transition-colors"
      >
        <LogOut className="w-3 h-3" />
        יציאה מעריכה
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium hover:bg-muted/80 transition-colors"
      >
        <Lock className="w-3 h-3" />
        כניסה לעריכה
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle className="text-right flex items-center gap-2 justify-end">
              כניסה למצב עריכה
              <KeyRound className="w-5 h-5 text-primary" />
            </DialogTitle>
            <DialogDescription className="text-right">
              הכנס סיסמה כדי לערוך, להוסיף ולמחוק תוכן
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <input
              type="password"
              value={password}
              onChange={e => {
                setPassword(e.target.value);
                setError(false);
              }}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              placeholder="סיסמה..."
              className="bg-muted rounded-lg px-4 py-3 text-center text-lg tracking-widest outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
            {error && (
              <p className="text-destructive text-xs text-center">סיסמה שגויה, נסה שנית</p>
            )}
            <button
              onClick={handleSubmit}
              className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
            >
              כניסה
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
