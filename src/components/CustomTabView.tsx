import { useState, useRef } from "react";
import { Plus, Trash2, Upload, Download, PlusCircle } from "lucide-react";
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

export default function CustomTabView({ tabId }: CustomTabViewProps) {
  const { columns, rows, setColumnsAndRows, addRow, deleteRow, addColumn } = useCustomTabData(tabId);
  const { isEditMode } = useEditMode();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newColName, setNewColName] = useState("");
  const [addRowOpen, setAddRowOpen] = useState(false);
  const [newRowData, setNewRowData] = useState<Record<string, string>>({});

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
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
        const cols = Object.keys(jsonData[0]);
        const rowsData = jsonData.map(r => {
          const row: Record<string, string> = {};
          cols.forEach(c => { row[c] = String(r[c] ?? ""); });
          return row;
        });
        await setColumnsAndRows(cols, rowsData);
        toast({ title: `יובאו ${rowsData.length} שורות בהצלחה` });
      } catch {
        toast({ title: "שגיאה בייבוא הקובץ", variant: "destructive" });
      }
    };
    reader.readAsArrayBuffer(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleExportExcel = () => {
    if (columns.length === 0) {
      toast({ title: "אין נתונים לייצוא", variant: "destructive" });
      return;
    }
    const data = rows.map(r => {
      const obj: Record<string, string> = {};
      columns.forEach(c => { obj[c.name] = r.rowData[c.name] ?? ""; });
      return obj;
    });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, "export.xlsx");
  };

  const handleAddColumn = async () => {
    if (!newColName.trim()) return;
    await addColumn(newColName.trim());
    setNewColName("");
  };

  const handleAddRow = async () => {
    await addRow(newRowData);
    setNewRowData({});
    setAddRowOpen(false);
  };

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
        <Button size="sm" variant="outline" onClick={handleExportExcel}>
          <Download className="w-4 h-4 ml-1" />
          ייצוא Excel
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

      {/* Table */}
      {columns.length > 0 ? (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map(c => (
                  <TableHead key={c.id} className="text-right">{c.name}</TableHead>
                ))}
                {isEditMode && <TableHead className="w-10" />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(row => (
                <TableRow key={row.id}>
                  {columns.map(c => (
                    <TableCell key={c.id} className="text-right">{row.rowData[c.name] ?? ""}</TableCell>
                  ))}
                  {isEditMode && (
                    <TableCell>
                      <button onClick={() => deleteRow(row.id)} className="text-destructive hover:text-destructive/80">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={columns.length + (isEditMode ? 1 : 0)} className="text-center text-muted-foreground py-8">
                    אין שורות. {isEditMode ? "הוסף שורה או ייבא קובץ Excel." : ""}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center text-muted-foreground py-12">
          {isEditMode ? "הוסף עמודות או ייבא קובץ Excel כדי להתחיל." : "אין נתונים בטאב זה."}
        </div>
      )}

      {/* Add row button */}
      {isEditMode && columns.length > 0 && (
        <Dialog open={addRowOpen} onOpenChange={setAddRowOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="w-full">
              <Plus className="w-4 h-4 ml-1" />
              הוסף שורה
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>הוספת שורה</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              {columns.map(c => (
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
