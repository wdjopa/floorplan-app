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
  containerRef: React.RefObject<HTMLDivElement>;
  zoom: number;
}

export default function TableEditor({
  table,
  selected,
  onSelect,
  onUpdate,
  onDoubleClick,
  containerRef,
  zoom,
}: TableEditorProps) {
  const [target, setTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setTarget(document.getElementById(`table-${table.id}`));
  }, [table.id]);

  const isWithinBounds = (
    x: number,
    y: number,
    width: number,
    height: number
  ): boolean => {
    if (!containerRef.current) return true;
    const bounds = containerRef.current.getBoundingClientRect();
    return (
      x >= 0 &&
      y >= 0 &&
      x + width <= bounds.width / zoom &&
      y + height <= bounds.height / zoom
    );
  };

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
        className={`absolute cursor-move bg-white transition-shadow hover:shadow-md border rounded-lg ${
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

      {target && (
        <Moveable
          target={target}
          draggable={true}
          resizable={selected}
          rotatable={selected}
          snappable={true}
          snapCenter={true}
          origin={false}
          hideDefaultLines={true}
          bounds={{
            left: 0,
            top: 0,
            right: containerRef.current?.clientWidth || 0,
            bottom: containerRef.current?.clientHeight || 0,
          }}
          onDrag={({ target, beforeTranslate }: OnDrag) => {
            const [dx, dy] = beforeTranslate;
            const newX = table.coordinates.x + dx;
            const newY = table.coordinates.y + dy;

            if (
              isWithinBounds(
                newX,
                newY,
                table.coordinates.width,
                table.coordinates.height
              )
            ) {
              target.style.left = `${newX}px`;
              target.style.top = `${newY}px`;
            }
          }}
          onDragEnd={({ isDrag, lastEvent }: OnDragEnd) => {
            if (!isDrag || !lastEvent) return;
            const [dx, dy] = lastEvent.beforeTranslate;
            updateCoordinates({
              x: table.coordinates.x + dx,
              y: table.coordinates.y + dy,
            });
            onSelect();
          }}
          onResize={({ target, width, height, drag }: OnResize) => {
            const [dx, dy] = drag.beforeTranslate;
            const newX = table.coordinates.x + dx;
            const newY = table.coordinates.y + dy;

            if (isWithinBounds(newX, newY, width, height)) {
              target.style.width = `${width}px`;
              target.style.height = `${height}px`;
              target.style.left = `${newX}px`;
              target.style.top = `${newY}px`;
            }
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
