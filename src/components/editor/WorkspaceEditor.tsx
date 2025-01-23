import { useState, useRef } from "react";
import { useGesture } from "@use-gesture/react";
import { Plus, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTables } from "@/hooks/useTables";
import TableEditor from "./TableEditor";
import EditTableDialog from "./EditTableDialog";
import { Table } from "@/types";

interface WorkspaceEditorProps {
  areaId: string;
}

export default function WorkspaceEditor({ areaId }: WorkspaceEditorProps) {
  const { tables, createTable, updateTable } = useTables(areaId);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [zoom, setZoom] = useState(1);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const bind = useGesture({
    onWheel: ({
      delta: [, dy],
      event,
    }: {
      delta: [number, number];
      event: WheelEvent;
    }) => {
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault();
        setZoom((z) => Math.min(Math.max(0.1, z - dy * 0.01), 3));
      }
    },
  });

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
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setZoom((z) => Math.max(0.1, z - 0.1))}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={() => setZoom((z) => Math.min(3, z + 0.1))}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <span className="flex items-center">{Math.round(zoom * 100)}%</span>
        </div>
      </div>

      <div
        ref={containerRef}
        {...bind()}
        className="relative flex-1 overflow-hidden"
      >
        <div
          ref={workspaceRef}
          className="relative h-full w-full rounded-lg border bg-white"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: "0 0",
            height: `${100 / zoom}%`,
            width: `${100 / zoom}%`,
          }}
          onClick={() => setSelectedTable(null)}
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
              containerRef={workspaceRef}
              zoom={zoom}
            />
          ))}
        </div>
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
