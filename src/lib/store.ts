import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SoldierEvent {
  id: string;
  title: string;
  date: string;
  type: "מכינה" | "גיוס" | "חופשה" | "תפילה" | "אימון" | "כללי" | "טירונות";
  description?: string;
  time?: string;
  endTime?: string;
  location?: string;
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

export function useEvents() {
  const [events, setEvents] = useState<SoldierEvent[]>([]);

  const fetchEvents = useCallback(async () => {
    const { data } = await supabase.from("events").select("*");
    if (data) {
      setEvents(data.map((e: any) => ({
        id: e.id,
        title: e.title,
        date: e.date,
        type: e.type as SoldierEvent["type"],
        description: e.description ?? undefined,
        time: e.time ?? undefined,
        endTime: e.end_time ?? undefined,
        location: e.location ?? undefined,
      })));
    }
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const addEvent = useCallback(async (event: Omit<SoldierEvent, "id">) => {
    const { data } = await supabase.from("events").insert({
      title: event.title,
      date: event.date,
      type: event.type,
      description: event.description ?? null,
      time: event.time ?? null,
      end_time: event.endTime ?? null,
      location: event.location ?? null,
    } as any).select().single();
    if (data) {
      setEvents(prev => [...prev, {
        id: data.id, title: data.title, date: data.date,
        type: data.type as SoldierEvent["type"],
        description: data.description ?? undefined,
        time: data.time ?? undefined,
        endTime: (data as any).end_time ?? undefined,
        location: (data as any).location ?? undefined,
      }]);
    }
  }, []);

  const updateEvent = useCallback(async (event: SoldierEvent) => {
    await supabase.from("events").update({
      title: event.title,
      date: event.date,
      type: event.type,
      description: event.description ?? null,
      time: event.time ?? null,
      end_time: event.endTime ?? null,
      location: event.location ?? null,
    } as any).eq("id", event.id);
    setEvents(prev => prev.map(e => e.id === event.id ? event : e));
  }, []);

  const deleteEvent = useCallback(async (id: string) => {
    await supabase.from("events").delete().eq("id", id);
    setEvents(prev => prev.filter(e => e.id !== id));
  }, []);

  return { events, addEvent, updateEvent, deleteEvent, refetch: fetchEvents };
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);

  const fetchTasks = useCallback(async () => {
    const { data } = await supabase.from("tasks").select("*");
    if (data) {
      setTasks(data.map(t => ({
        id: t.id,
        title: t.title,
        dueDate: t.due_date,
        priority: t.priority as Task["priority"],
        completed: t.completed,
      })));
    }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const addTask = useCallback(async (task: Omit<Task, "id">) => {
    const { data } = await supabase.from("tasks").insert({
      title: task.title,
      due_date: task.dueDate,
      priority: task.priority,
      completed: task.completed,
    }).select().single();
    if (data) {
      setTasks(prev => [...prev, {
        id: data.id, title: data.title, dueDate: data.due_date,
        priority: data.priority as Task["priority"], completed: data.completed,
      }]);
    }
  }, []);

  const toggleTask = useCallback(async (id: string) => {
    const task = (await supabase.from("tasks").select("completed").eq("id", id).single()).data;
    if (task) {
      await supabase.from("tasks").update({ completed: !task.completed }).eq("id", id);
      setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    }
  }, []);

  const updateTask = useCallback(async (task: Task) => {
    await supabase.from("tasks").update({
      title: task.title,
      due_date: task.dueDate,
      priority: task.priority,
      completed: task.completed,
    }).eq("id", task.id);
    setTasks(prev => prev.map(t => t.id === task.id ? task : t));
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    await supabase.from("tasks").delete().eq("id", id);
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  return { tasks, addTask, toggleTask, updateTask, deleteTask, refetch: fetchTasks };
}

export function useSoldiers() {
  const [soldiers, setSoldiers] = useState<Soldier[]>([]);

  const fetchSoldiers = useCallback(async () => {
    const { data } = await supabase.from("soldiers").select("*");
    if (data) {
      setSoldiers(data.map(s => ({
        id: s.id,
        name: s.name,
        unit: s.unit,
        status: s.status as Soldier["status"],
        phone: s.phone ?? undefined,
      })));
    }
  }, []);

  useEffect(() => { fetchSoldiers(); }, [fetchSoldiers]);

  const addSoldier = useCallback(async (soldier: Omit<Soldier, "id">) => {
    const { data } = await supabase.from("soldiers").insert({
      name: soldier.name,
      unit: soldier.unit,
      status: soldier.status,
      phone: soldier.phone ?? null,
    }).select().single();
    if (data) {
      setSoldiers(prev => [...prev, {
        id: data.id, name: data.name, unit: data.unit,
        status: data.status as Soldier["status"],
        phone: data.phone ?? undefined,
      }]);
    }
  }, []);

  const deleteSoldier = useCallback(async (id: string) => {
    await supabase.from("soldiers").delete().eq("id", id);
    setSoldiers(prev => prev.filter(s => s.id !== id));
  }, []);

  return { soldiers, addSoldier, deleteSoldier, refetch: fetchSoldiers };
}
