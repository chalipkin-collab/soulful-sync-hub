import { useState, useRef, useMemo } from "react";
import { Plus, Trash2, Upload, Download, PlusCircle, Pencil } from "lucide-react";
import { useCustomTabData } from "@/lib/customTabsStore";
import { useEditMode } from "@/lib/EditModeContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";

interface CustomTabViewProps {
  tabId: string;
}

const TABLE_NAME_KEY = "__table_name__";

export default function CustomTabView({ tabId }: CustomTabViewProps) {
  const { columns, rows, setColumnsAndRows, addRow, updateRow, deleteRow, addColumn, deleteColumn, updateColumn, refetch } = useCustomTabData(tabId);
  const { isEditMode } = useEditMode();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newColName, setNewColName] = useState("");
  const [addRowOpen, setAddRowOpen] = useState(false);
  const [addRowTableName, setAddRowTableName] = useState("");
  const [newRowData, setNewRowData] = useState<Record<string, string>>({});
  const [editingCell, setEditingCell] = useState<{ rowId: string; colName: string } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editingColId, setEditingColId] = useState<string | null>(null);
  const [editColName, setEditColName] = useState("");

  // Group rows by table name
  const tableGroups = useMemo(() => {
    const groups: Record<string, typeof rows> = {};
    for (const row of rows) {
      const tableName = row.rowData[TABLE_NAME_KEY] || "default";
      if (!groups[tableName]) groups[tableName] = [];
      groups[tableName].push(row);
    }
    return groups;
  }, [rows]);

  const tableNames = Object.keys(tableGroups);

  // Get columns that aren't the internal table name key
  const visibleColumns = columns.filter(c => c.name !== TABLE_NAME_KEY);

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const tableName = file.name.replace(/\.(xlsx|xls|csv)$/i, "");
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const wb = XLSX.read(ev.target?.result, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: "" });
        if (jsonData.length === 0) {
          toast({ title: "הקובץ ריק", variant: "destructive" });
          return;
        }
        const newCols = Object.keys(jsonData[0]);

        // Merge with existing columns
        const existingColNames = columns.map(c => c.name);
        const allColNames = [...existingColNames];
        for (const col of newCols) {
          if (!allColNames.includes(col)) allColNames.push(col);
        }
        if (!allColNames.includes(TABLE_NAME_KEY)) allColNames.push(TABLE_NAME_KEY);

        // Build existing rows data + new rows
        const existingRows = rows.map(r => r.rowData);
        const newRows = jsonData.map(r => {
          const row: Record<string, string> = { [TABLE_NAME_KEY]: tableName };
          newCols.forEach(c => { row[c] = String(r[c] ?? ""); });
          return row;
        });

        await setColumnsAndRows(allColNames, [...existingRows, ...newRows]);
        toast({ title: `יובאו ${newRows.length} שורות מ-"${tableName}"` });
      } catch {
        toast({ title: "שגיאה בייבוא הקובץ", variant: "destructive" });
      }
    };
    reader.readAsArrayBuffer(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleExportExcel = (tableName?: string) => {
    if (visibleColumns.length === 0) {
      toast({ title: "אין נתונים לייצוא", variant: "destructive" });
      return;
    }
    const exportRows = tableName ? (tableGroups[tableName] || []) : rows;
    const data = exportRows.map(r => {
      const obj: Record<string, string> = {};
      visibleColumns.forEach(c => { obj[c.name] = r.rowData[c.name] ?? ""; });
      return obj;
    });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, `${tableName || "export"}.xlsx`);
  };

  const handleAddColumn = async () => {
    if (!newColName.trim()) return;
    await addColumn(newColName.trim());
    setNewColName("");
  };

  const handleAddRow = async () => {
    const data = { ...newRowData, [TABLE_NAME_KEY]: addRowTableName || "default" };
    await addRow(data);
    setNewRowData({});
    setAddRowOpen(false);
  };

  const startEditCell = (rowId: string, colName: string, currentValue: string) => {
    if (!isEditMode) return;
    setEditingCell({ rowId, colName });
    setEditValue(currentValue);
  };

  const commitEditCell = async () => {
    if (!editingCell) return;
    const row = rows.find(r => r.id === editingCell.rowId);
    if (row) {
      const newData = { ...row.rowData, [editingCell.colName]: editValue };
      await updateRow(editingCell.rowId, newData);
    }
    setEditingCell(null);
  };

  const startEditColumn = (colId: string, name: string) => {
    setEditingColId(colId);
    setEditColName(name);
  };

  const commitEditColumn = async () => {
    if (!editingColId) return;
    const col = columns.find(c => c.id === editingColId);
    if (col && editColName.trim() && editColName.trim() !== col.name) {
      const oldName = col.name;
      const newName = editColName.trim();
      await updateColumn(editingColId, newName);
      for (const row of rows) {
        if (oldName in row.rowData) {
          const newData = { ...row.rowData };
          newData[newName] = newData[oldName] ?? "";
          delete newData[oldName];
          await updateRow(row.id, newData);
        }
      }
      await refetch();
    }
    setEditingColId(null);
  };

  const handleDeleteColumn = async (colId: string, colName: string) => {
    await deleteColumn(colId);
    for (const row of rows) {
      if (colName in row.rowData) {
        const newData = { ...row.rowData };
        delete newData[colName];
        await updateRow(row.id, newData);
      }
    }
    await refetch();
  };

  const handleDeleteTable = async (tableName: string) => {
    const tableRows = tableGroups[tableName] || [];
    for (const row of tableRows) {
      await deleteRow(row.id);
    }
  };

  const renderTable = (tableName: string, tableRows: typeof rows) => (
    <div key={tableName} className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">
          {tableName === "default" ? "טבלה ראשית" : tableName}
        </h3>
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={() => handleExportExcel(tableName)}>
            <Download className="w-3.5 h-3.5" />
          </Button>
          {isEditMode && tableName !== "default" && (
            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDeleteTable(tableName)}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>
      <div className="rounded-lg border border-border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {visibleColumns.map(c => (
                <TableHead key={c.id} className="text-right">
                  {isEditMode && editingColId === c.id ? (
                    <Input
                      value={editColName}
                      onChange={e => setEditColName(e.target.value)}
                      onBlur={commitEditColumn}
                      onKeyDown={e => e.key === "Enter" && commitEditColumn()}
                      className="h-7 text-sm"
                      autoFocus
                    />
                  ) : (
                    <div className="flex items-center gap-1">
                      <span>{c.name}</span>
                      {isEditMode && (
                        <>
                          <button onClick={() => startEditColumn(c.id, c.name)} className="text-muted-foreground hover:text-foreground">
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button onClick={() => handleDeleteColumn(c.id, c.name)} className="text-destructive hover:text-destructive/80">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </TableHead>
              ))}
              {isEditMode && <TableHead className="w-10" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableRows.map(row => (
              <TableRow key={row.id}>
                {visibleColumns.map(c => {
                  const isEditing = editingCell?.rowId === row.id && editingCell?.colName === c.name;
                  return (
                    <TableCell
                      key={c.id}
                      className="text-right cursor-pointer"
                      onClick={() => !isEditing && startEditCell(row.id, c.name, row.rowData[c.name] ?? "")}
                    >
                      {isEditing ? (
                        <Input
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          onBlur={commitEditCell}
                          onKeyDown={e => e.key === "Enter" && commitEditCell()}
                          className="h-7 text-sm"
                          autoFocus
                        />
                      ) : (
                        row.rowData[c.name] ?? ""
                      )}
                    </TableCell>
                  );
                })}
                {isEditMode && (
                  <TableCell>
                    <button onClick={() => deleteRow(row.id)} className="text-destructive hover:text-destructive/80">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {tableRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={visibleColumns.length + (isEditMode ? 1 : 0)} className="text-center text-muted-foreground py-8">
                  אין שורות.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex gap-2 flex-wrap">
        {isEditMode && (
          <>
            <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>
              <Upload className="w-4 h-4 ml-1" />
              ייבוא Excel
            </Button>
            <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleImportExcel} />
          </>
        )}
        <Button size="sm" variant="outline" onClick={() => handleExportExcel()}>
          <Download className="w-4 h-4 ml-1" />
          ייצוא הכל
        </Button>
      </div>

      {/* Add column (edit mode) */}
      {isEditMode && (
        <div className="flex gap-2 items-center">
          <Input
            placeholder="שם עמודה חדשה"
            value={newColName}
            onChange={e => setNewColName(e.target.value)}
            className="max-w-[200px]"
            onKeyDown={e => e.key === "Enter" && handleAddColumn()}
          />
          <Button size="sm" onClick={handleAddColumn}>
            <PlusCircle className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Tables */}
      {visibleColumns.length > 0 ? (
        <div className="space-y-6">
          {tableNames.map(name => renderTable(name, tableGroups[name]))}
        </div>
      ) : (
        <div className="text-center text-muted-foreground py-12">
          {isEditMode ? "הוסף עמודות או ייבא קובץ Excel כדי להתחיל." : "אין נתונים בטאב זה."}
        </div>
      )}

      {/* Add row button */}
      {isEditMode && visibleColumns.length > 0 && (
        <Dialog open={addRowOpen} onOpenChange={setAddRowOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="w-full" onClick={() => setAddRowTableName(tableNames[0] || "default")}>
              <Plus className="w-4 h-4 ml-1" />
              הוסף שורה
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>הוספת שורה</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              {tableNames.length > 1 && (
                <div>
                  <label className="text-sm font-medium">טבלה</label>
                  <select
                    value={addRowTableName}
                    onChange={e => setAddRowTableName(e.target.value)}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    {tableNames.map(name => (
                      <option key={name} value={name}>{name === "default" ? "טבלה ראשית" : name}</option>
                    ))}
                  </select>
                </div>
              )}
              {visibleColumns.map(c => (
                <div key={c.id}>
                  <label className="text-sm font-medium">{c.name}</label>
                  <Input
                    value={newRowData[c.name] ?? ""}
                    onChange={e => setNewRowData(prev => ({ ...prev, [c.name]: e.target.value }))}
                  />
                </div>
              ))}
              <Button onClick={handleAddRow} className="w-full">הוסף</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
