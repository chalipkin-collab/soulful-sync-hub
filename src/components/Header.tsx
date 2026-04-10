import { Search, Eye } from "lucide-react";

interface HeaderProps {
  onSearchOpen?: () => void;
}

export default function Header({ onSearchOpen }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-lg border-b border-border/50">
      <div className="flex items-center justify-between px-4 h-14 max-w-lg mx-auto">
        <button onClick={onSearchOpen} className="text-muted-foreground hover:text-foreground transition-colors p-2">
          <Search className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium flex items-center gap-1">
            <Eye className="w-3 h-3" />
            צפייה
          </span>
          <h1 className="text-lg font-bold text-primary">לוז חיילים</h1>
        </div>
      </div>
    </header>
  );
}
