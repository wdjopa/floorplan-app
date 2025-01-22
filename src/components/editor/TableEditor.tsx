import { useEffect, useState } from "react";
import Moveable, {
  OnDrag,
  OnDragEnd,
  OnResize,
  OnResizeEnd,
  OnRotate,
  OnRotateEnd,
} from "react-moveable";
import { Table } from "@/types";

interface TableEditorProps {
  table: Table;
  selected: boolean;
  onSelect: () => void;
  onUpdate: (tableId: string, updates: Partial<Table>) => Promise<void>;
  onDoubleClick: () => void;
}

export default function TableEditor({
  table,
  selected,
  onSelect,
  onUpdate,
  onDoubleClick,
}: TableEditorProps) {
  const [target, setTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setTarget(document.getElementById(`table-${table.id}`));
  }, [table.id]);

  const updateCoordinates = async (updates: Partial<Table["coordinates"]>) => {
    await onUpdate(table.id, {
      coordinates: {
        ...table.coordinates,
        ...updates,
      },
    });
  };

  return (
    <>
      <div
        id={`table-${table.id}`}
        className={`absolute cursor-pointer  bg-white transition-shadow hover:shadow-md border bg-green-100  rounded-lg ${
          selected ? "border-primary shadow-lg" : "border-green-400"
        }`}
        style={{
          left: `${table.coordinates.x}px`,
          top: `${table.coordinates.y}px`,
          width: `${table.coordinates.width}px`,
          height: `${table.coordinates.height}px`,
          transform: `rotate(${table.coordinates.rotation}deg)`,
        }}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        onDoubleClick={onDoubleClick}
      >
        <div className="flex h-full flex-col items-center justify-center">
          <span className="font-semibold">{table.name}</span>
          <span className="text-sm text-gray-500">{table.capacity} seats</span>
        </div>
      </div>

      {selected && target && (
        <Moveable
          target={target}
          draggable={true}
          resizable={true}
          rotatable={true}
          snappable={true}
          snapCenter={true}
          origin={false}
          onDrag={({ target, beforeTranslate }: OnDrag) => {
            const [dx, dy] = beforeTranslate;

            // Calculate new position relative to the initial position
            const newX = table.coordinates.x + dx;
            const newY = table.coordinates.y + dy;

            target.style.left = `${newX}px`;
            target.style.top = `${newY}px`;
          }}
          onDragEnd={({ isDrag, lastEvent }: OnDragEnd) => {
            if (!isDrag || !lastEvent) return;

            const [dx, dy] = lastEvent.beforeTranslate;

            updateCoordinates({
              x: table.coordinates.x + dx,
              y: table.coordinates.y + dy,
            });
          }}
          onResize={({ target, width, height, drag }: OnResize) => {
            const [dx, dy] = drag.beforeTranslate;

            // Calculate new size and position
            const newX = table.coordinates.x + dx;
            const newY = table.coordinates.y + dy;

            target.style.width = `${width}px`;
            target.style.height = `${height}px`;
            target.style.left = `${newX}px`;
            target.style.top = `${newY}px`;
          }}
          onResizeEnd={({ isDrag, lastEvent }: OnResizeEnd) => {
            if (!isDrag || !lastEvent) return;

            const { width, height } = lastEvent;
            const [dx, dy] = lastEvent.drag.beforeTranslate;

            updateCoordinates({
              width,
              height,
              x: table.coordinates.x + dx,
              y: table.coordinates.y + dy,
            });
          }}
          onRotate={({ target, rotate }: OnRotate) => {
            target.style.transform = `rotate(${rotate}deg)`;
          }}
          onRotateEnd={({ isDrag, lastEvent }: OnRotateEnd) => {
            if (!isDrag || !lastEvent) return;
            updateCoordinates({
              rotation: lastEvent.rotation,
            });
          }}
        />
      )}
    </>
  );
}
