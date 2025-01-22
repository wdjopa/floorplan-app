import { useEffect, useState } from "react";
import Moveable from "react-moveable";
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
        className={`absolute cursor-pointer border bg-white transition-shadow hover:shadow-md ${
          selected ? "border-primary shadow-lg" : "border-gray-200"
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
          container={null}
          draggable={true}
          resizable={true}
          rotatable={true}
          snappable={true}
          snapCenter={true}
          elementSnapDirections={{
            top: true,
            left: true,
            bottom: true,
            right: true,
          }}
          verticalGuidelines={[0, 100, 200, 300, 400, 500]} // Add more as needed
          horizontalGuidelines={[0, 100, 200, 300, 400, 500]} // Add more as needed
          onDrag={({ target, transform }) => {
            target.style.transform = transform;
          }}
          onDragEnd={({ target, transform }) => {
            const matrix = new DOMMatrix(transform);
            updateCoordinates({
              x: matrix.e,
              y: matrix.f,
            });
          }}
          onResize={({ target, width, height, drag }) => {
            target.style.width = `${width}px`;
            target.style.height = `${height}px`;
            target.style.transform = drag.transform;
          }}
          onResizeEnd={({ target, width, height, drag }) => {
            const matrix = new DOMMatrix(drag.transform);
            updateCoordinates({
              width,
              height,
              x: matrix.e,
              y: matrix.f,
            });
          }}
          onRotate={({ target, transform }) => {
            target.style.transform = transform;
          }}
          onRotateEnd={({ target, rotate }) => {
            updateCoordinates({
              rotation: rotate,
            });
          }}
          padding={{ left: 0, top: 0, right: 0, bottom: 0 }}
          origin={false}
          guides={true}
          keepRatio={false}
        />
      )}
    </>
  );
}
