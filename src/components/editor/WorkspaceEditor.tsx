import { useState, useRef } from "react";
import { useTables } from "@/hooks/useTables";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import TableEditor from "./TableEditor";
import EditTableDialog from "./EditTableDialog";
import { Table } from "@/types";

interface WorkspaceEditorProps {
  areaId: string;
}

export default function WorkspaceEditor({ areaId }: WorkspaceEditorProps) {
  const { tables,  createTable, updateTable } = useTables(areaId);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const workspaceRef = useRef<HTMLDivElement>(null);

  const handleAddTable = async () => {
    if (!workspaceRef.current) return;

    const { width, height } = workspaceRef.current.getBoundingClientRect();

    await createTable({
      name: `Table ${tables.length + 1}`,
      capacity: 4,
      coordinates: {
        x: width / 2 - 50,
        y: height / 2 - 50,
        width: 100,
        height: 100,
        rotation: 0,
      },
    });
  };

  const handleTableUpdate = async (
    tableId: string,
    updates: Partial<Table>
  ) => {
    await updateTable(tableId, updates);
  };

  return (
    <div className="flex h-[calc(100vh-10rem)] flex-col gap-4">
      <div className="flex items-center justify-between">
        <Button onClick={handleAddTable} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Table
        </Button>
      </div>

      <div
        ref={workspaceRef}
        className="relative flex-1 overflow-hidden rounded-lg border bg-white"
      >
        {tables.map((table) => (
          <TableEditor
            key={table.id}
            table={table}
            selected={selectedTable === table.id}
            onSelect={() => setSelectedTable(table.id)}
            onUpdate={handleTableUpdate}
            onDoubleClick={() => {
              setSelectedTable(table.id);
              setShowEditDialog(true);
            }}
          />
        ))}
      </div>

      <EditTableDialog
        open={showEditDialog}
        onClose={() => {
          setShowEditDialog(false);
          setSelectedTable(null);
        }}
        table={tables.find((t) => t.id === selectedTable)}
        onUpdate={updateTable}
      />
    </div>
  );
}
