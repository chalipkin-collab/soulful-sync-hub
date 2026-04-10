import { useState, useCallback } from "react";

export interface SoldierEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  type: "מכינה" | "גיוס" | "חופשה" | "תפילה" | "אימון" | "כללי";
  description?: string;
  time?: string;
}

export interface Task {
  id: string;
  title: string;
  dueDate: string;
  priority: "דחוף" | "בינוני" | "רגיל";
  completed: boolean;
}

export interface Soldier {
  id: string;
  name: string;
  unit: string;
  status: "פעיל" | "חופשה" | "מילואים";
  phone?: string;
}

const INITIAL_EVENTS: SoldierEvent[] = [
  { id: "1", title: "מועד פתיחה 2 מכינות במעלות צור", date: "2026-04-22", type: "מכינה" },
  { id: "2", title: "תפילת שחרית משותפת", date: "2026-04-15", type: "תפילה", time: "06:30" },
  { id: "3", title: "אימון כושר קרבי", date: "2026-04-18", type: "אימון", time: "08:00" },
  { id: "4", title: "גיוס מחזור אפריל", date: "2026-04-28", type: "גיוס" },
  { id: "5", title: "חופשת פסח", date: "2026-04-12", type: "חופשה" },
  { id: "6", title: "הרצאה בנושא ביטחון", date: "2026-04-20", type: "כללי", time: "14:00" },
];

const INITIAL_TASKS: Task[] = [
  { id: "1", title: "לדבר עם לי״ן ושואן", dueDate: "2026-04-12", priority: "בינוני", completed: false },
  { id: "2", title: "לעדכן רשימת חיילים", dueDate: "2026-04-14", priority: "דחוף", completed: false },
  { id: "3", title: "להכין לוח זמנים לשבוע הבא", dueDate: "2026-04-13", priority: "רגיל", completed: false },
  { id: "4", title: "לאשר חופשות פסח", dueDate: "2026-04-11", priority: "דחוף", completed: true },
];

const INITIAL_SOLDIERS: Soldier[] = [
  { id: "1", name: "יוסף כהן", unit: "פלוגה א׳", status: "פעיל", phone: "050-1234567" },
  { id: "2", name: "דוד לוי", unit: "פלוגה א׳", status: "פעיל", phone: "050-2345678" },
  { id: "3", name: "משה ישראלי", unit: "פלוגה ב׳", status: "חופשה", phone: "050-3456789" },
  { id: "4", name: "אברהם פרידמן", unit: "פלוגה ב׳", status: "פעיל", phone: "050-4567890" },
  { id: "5", name: "יעקב גולדשטיין", unit: "פלוגה א׳", status: "מילואים", phone: "050-5678901" },
];

export function useEvents() {
  const [events, setEvents] = useState<SoldierEvent[]>(INITIAL_EVENTS);

  const addEvent = useCallback((event: Omit<SoldierEvent, "id">) => {
    setEvents(prev => [...prev, { ...event, id: Date.now().toString() }]);
  }, []);

  const deleteEvent = useCallback((id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  }, []);

  return { events, addEvent, deleteEvent };
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);

  const addTask = useCallback((task: Omit<Task, "id">) => {
    setTasks(prev => [...prev, { ...task, id: Date.now().toString() }]);
  }, []);

  const toggleTask = useCallback((id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  return { tasks, addTask, toggleTask, deleteTask };
}

export function useSoldiers() {
  const [soldiers] = useState<Soldier[]>(INITIAL_SOLDIERS);
  return { soldiers };
}
