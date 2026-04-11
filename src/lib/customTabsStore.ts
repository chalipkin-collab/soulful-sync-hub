import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface CustomTab {
  id: string;
  name: string;
  icon: string;
  visibleInView: boolean;
  sortOrder: number;
}

export interface CustomTabColumn {
  id: string;
  tabId: string;
  name: string;
  sortOrder: number;
}

export interface CustomTabRow {
  id: string;
  tabId: string;
  rowData: Record<string, string>;
  sortOrder: number;
}

export function useCustomTabs() {
  const [tabs, setTabs] = useState<CustomTab[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTabs = useCallback(async () => {
    const { data } = await supabase
      .from("custom_tabs")
      .select("*")
      .order("sort_order");
    if (data) {
      setTabs(
        data.map((t: any) => ({
          id: t.id,
          name: t.name,
          icon: t.icon,
          visibleInView: t.visible_in_view,
          sortOrder: t.sort_order,
        }))
      );
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchTabs(); }, [fetchTabs]);

  const addTab = useCallback(async (name: string) => {
    const maxOrder = tabs.length > 0 ? Math.max(...tabs.map(t => t.sortOrder)) + 1 : 0;
    const { data } = await supabase
      .from("custom_tabs")
      .insert({ name, icon: "table", visible_in_view: true, sort_order: maxOrder })
      .select()
      .single();
    if (data) {
      await fetchTabs();
      return data.id as string;
    }
    return null;
  }, [tabs, fetchTabs]);

  const updateTab = useCallback(async (id: string, updates: Partial<Pick<CustomTab, "name" | "visibleInView" | "icon">>) => {
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.visibleInView !== undefined) dbUpdates.visible_in_view = updates.visibleInView;
    if (updates.icon !== undefined) dbUpdates.icon = updates.icon;
    await supabase.from("custom_tabs").update(dbUpdates).eq("id", id);
    setTabs(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, []);

  const deleteTab = useCallback(async (id: string) => {
    await supabase.from("custom_tabs").delete().eq("id", id);
    setTabs(prev => prev.filter(t => t.id !== id));
  }, []);

  return { tabs, loading, addTab, updateTab, deleteTab, refetch: fetchTabs };
}

export function useCustomTabData(tabId: string | null) {
  const [columns, setColumns] = useState<CustomTabColumn[]>([]);
  const [rows, setRows] = useState<CustomTabRow[]>([]);

  const fetchData = useCallback(async () => {
    if (!tabId) return;
    const [colRes, rowRes] = await Promise.all([
      supabase.from("custom_tab_columns").select("*").eq("tab_id", tabId).order("sort_order"),
      supabase.from("custom_tab_rows").select("*").eq("tab_id", tabId).order("sort_order"),
    ]);
    if (colRes.data) {
      setColumns(colRes.data.map((c: any) => ({ id: c.id, tabId: c.tab_id, name: c.name, sortOrder: c.sort_order })));
    }
    if (rowRes.data) {
      setRows(rowRes.data.map((r: any) => ({ id: r.id, tabId: r.tab_id, rowData: r.row_data as Record<string, string>, sortOrder: r.sort_order })));
    }
  }, [tabId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const setColumnsAndRows = useCallback(async (newCols: string[], newRows: Record<string, string>[]) => {
    if (!tabId) return;
    // Clear existing
    await supabase.from("custom_tab_rows").delete().eq("tab_id", tabId);
    await supabase.from("custom_tab_columns").delete().eq("tab_id", tabId);
    // Insert columns
    if (newCols.length > 0) {
      await supabase.from("custom_tab_columns").insert(
        newCols.map((name, i) => ({ tab_id: tabId, name, sort_order: i }))
      );
    }
    // Insert rows
    if (newRows.length > 0) {
      await supabase.from("custom_tab_rows").insert(
        newRows.map((row, i) => ({ tab_id: tabId, row_data: row, sort_order: i }))
      );
    }
    await fetchData();
  }, [tabId, fetchData]);

  const addRow = useCallback(async (rowData: Record<string, string>) => {
    if (!tabId) return;
    const maxOrder = rows.length > 0 ? Math.max(...rows.map(r => r.sortOrder)) + 1 : 0;
    await supabase.from("custom_tab_rows").insert({ tab_id: tabId, row_data: rowData, sort_order: maxOrder });
    await fetchData();
  }, [tabId, rows, fetchData]);

  const updateRow = useCallback(async (id: string, rowData: Record<string, string>) => {
    await supabase.from("custom_tab_rows").update({ row_data: rowData }).eq("id", id);
    setRows(prev => prev.map(r => r.id === id ? { ...r, rowData } : r));
  }, []);

  const deleteRow = useCallback(async (id: string) => {
    await supabase.from("custom_tab_rows").delete().eq("id", id);
    setRows(prev => prev.filter(r => r.id !== id));
  }, []);

  const addColumn = useCallback(async (name: string) => {
    if (!tabId) return;
    const maxOrder = columns.length > 0 ? Math.max(...columns.map(c => c.sortOrder)) + 1 : 0;
    await supabase.from("custom_tab_columns").insert({ tab_id: tabId, name, sort_order: maxOrder });
    await fetchData();
  }, [tabId, columns, fetchData]);

  return { columns, rows, setColumnsAndRows, addRow, updateRow, deleteRow, addColumn, refetch: fetchData };
}
