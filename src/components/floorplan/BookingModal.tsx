import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useOrders } from "@/hooks/useOrders";
import { Loader2 } from "lucide-react";

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
  tableId: string | null;
}

export default function BookingModal({
  open,
  onClose,
  tableId,
}: BookingModalProps) {
  const { orders, loading } = useOrders(tableId || undefined);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Table Bookings</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="grid gap-4">
            {orders.map((order) => (
              <div key={order.id} className="rounded-lg border p-4">
                <div className="font-semibold">{order.customer_name}</div>
                <div className="text-sm text-gray-500">
                  {new Date(order.meal_starts_at).toLocaleTimeString()} -
                  {new Date(order.meal_ends_at).toLocaleTimeString()}
                </div>
                <div className="text-sm text-gray-500">
                  {order.pax} people • {order.status}
                </div>
              </div>
            ))}
            {orders.length === 0 && (
              <div className="text-center text-gray-500">
                No bookings for this table
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
