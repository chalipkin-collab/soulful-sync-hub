import { Users, Phone, Shield } from "lucide-react";
import type { Soldier, SoldierEvent } from "@/lib/store";

const STATUS_STYLES: Record<string, string> = {
  "פעיל": "bg-primary/20 text-primary",
  "חופשה": "bg-secondary/20 text-secondary",
  "מילואים": "bg-purple-500/20 text-purple-400",
};

interface SoldiersViewProps {
  soldiers: Soldier[];
  events: SoldierEvent[];
}

export default function SoldiersView({ soldiers, events }: SoldiersViewProps) {
  const today = new Date().toISOString().split("T")[0];
  const upcoming = events
    .filter(e => e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3);

  return (
    <div className="flex flex-col gap-4 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-2 justify-end">
        <h2 className="text-xl font-bold">חיילים</h2>
        <span className="text-2xl">🪖</span>
      </div>

      {/* Upcoming Schedule */}
      <div className="glass-card p-4">
        <h3 className="text-sm font-semibold text-muted-foreground mb-3 text-right">לוח זמנים קרוב</h3>
        {upcoming.map((event, i) => (
          <div
            key={event.id}
            className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 mb-2 last:mb-0 animate-fade-in-up"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex-shrink-0 mt-1">
              <Shield className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex-1 text-right">
              <p className="font-medium text-sm">{event.title}</p>
              <span className="text-xs text-muted-foreground">
                {event.date.split("-").reverse().join("/")}
              </span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary font-medium">
              {event.type}
            </span>
          </div>
        ))}
      </div>

      {/* Soldiers List */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-muted-foreground">{soldiers.length} חיילים</span>
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
    </div>
  );
}
