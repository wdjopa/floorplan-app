import { useTables } from "@/hooks/useTables";
import { Table } from "@/types";
import { Loader2 } from "lucide-react";

interface TableGridProps {
  areaId: string;
  onTableSelect: (tableId: string) => void;
}

export default function TableGrid({ areaId, onTableSelect }: TableGridProps) {
  const { tables, loading } = useTables(areaId);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative h-[600px] w-full border bg-white">
      {tables.map((table) => (
        <TableItem
          key={table.id}
          table={table}
          onClick={() => onTableSelect(table.id)}
        />
      ))}
    </div>
  );
}

interface TableItemProps {
  table: Table;
  onClick: () => void;
}

function TableItem({ table, onClick }: TableItemProps) {
  return (
    <div
      onClick={onClick}
      className="absolute cursor-pointer border bg-white hover:bg-gray-50"
      style={{
        left: `${table.coordinates.x}px`,
        top: `${table.coordinates.y}px`,
        width: `${table.coordinates.width}px`,
        height: `${table.coordinates.height}px`,
        transform: `rotate(${table.coordinates.rotation}deg)`,
      }}
    >
      <div className="flex h-full flex-col items-center justify-center">
        <span className="font-semibold">{table.name}</span>
        <span className="text-sm text-gray-500">{table.capacity} seats</span>
      </div>
    </div>
  );
}
