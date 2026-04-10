import { Search, Eye, Pencil } from "lucide-react";
import { useEditMode } from "@/lib/EditModeContext";
import PasswordDialog from "@/components/PasswordDialog";

interface HeaderProps {
  onSearchOpen?: () => void;
}

export default function Header({ onSearchOpen }: HeaderProps) {
  const { isEditMode } = useEditMode();

  return (
    <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-lg border-b border-border/50">
      <div className="flex items-center justify-between px-4 h-14 max-w-lg mx-auto">
        <div className="flex items-center gap-2">
          <button onClick={onSearchOpen} className="text-muted-foreground hover:text-foreground transition-colors p-2">
            <Search className="w-5 h-5" />
          </button>
          <PasswordDialog />
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
            isEditMode
              ? "bg-primary/20 text-primary"
              : "bg-muted text-muted-foreground"
          }`}>
            {isEditMode ? <Pencil className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            {isEditMode ? "עריכה" : "צפייה"}
          </span>
          <h1 className="text-lg font-bold text-primary">לוז חיילים</h1>
        </div>
      </div>
    </header>
  );
}
