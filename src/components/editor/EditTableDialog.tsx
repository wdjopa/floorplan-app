import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Table } from "@/types";

interface EditTableDialogProps {
  open: boolean;
  onClose: () => void;
  table: Table | undefined;
  onUpdate: (tableId: string, data: Partial<Table>) => Promise<void>;
}

export default function EditTableDialog({
  open,
  onClose,
  table,
  onUpdate,
}: EditTableDialogProps) {
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState(4);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (table) {
      setName(table.name);
      setCapacity(table.capacity);
    }
  }, [table]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!table) return;

    setLoading(true);

    try {
      await onUpdate(table.id, {
        name,
        capacity,
      });
      onClose();
    } catch (error) {
      console.error("Failed to update table:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!table) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Table</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="capacity">Capacity</Label>
            <Input
              id="capacity"
              type="number"
              min={1}
              value={capacity}
              onChange={(e) => setCapacity(parseInt(e.target.value))}
              required
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
