// hooks/useOrders.ts
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc,
} from "firebase/firestore";
import { useGenukaContext } from "@/providers/genuka";

interface Order {
  id: string;
  genuka_order_id?: string;
  table_id: string;
  customer_name: string;
  pax: number;
  meal_starts_at: Date;
  meal_ends_at: Date;
  status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
  notes?: string;
  metadata?: unknown;
  created_at: Date;
  updated_at: Date;
}

interface CreateOrderInput {
  table_id: string;
  customer_name: string;
  pax: number;
  meal_starts_at: Date;
  meal_ends_at: Date;
  notes?: string;
}

export function useOrders(tableId?: string) {
  const { genuka } = useGenukaContext();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!genuka?.companyId) return;

    try {
      // Create query for Firebase orders
      const ordersRef = collection(db, `companies/${genuka.companyId}/orders`);
      const q = tableId
        ? query(ordersRef, where("table_id", "==", tableId))
        : ordersRef;

      // Listen to Firebase orders
      const unsubscribe = onSnapshot(
        q,
        async (snapshot) => {
          const ordersData: Order[] = [];

          for (const doc of snapshot.docs) {
            const data = doc.data();

            // If order has a Genuka ID, fetch additional details
            if (data.genuka_order_id) {
              try {
                const genukaOrder = await genuka.orders.retrieve(
                  data.genuka_order_id
                );
                ordersData.push({
                  id: doc.id,
                  genuka_order_id: data.genuka_order_id,
                  table_id: data.table_id,
                  customer_name:
                    genukaOrder.customer?.name || data.customer_name,
                  pax: data.pax,
                  meal_starts_at: data.meal_starts_at.toDate(),
                  meal_ends_at: data.meal_ends_at.toDate(),
                  status: data.status,
                  notes: data.notes,
                  metadata: data.metadata,
                  created_at: data.created_at.toDate(),
                  updated_at: data.updated_at.toDate(),
                });
              } catch (err) {
                console.error(
                  `Error fetching Genuka order ${data.genuka_order_id}:`,
                  err
                );
                // Still add the order with local data if Genuka fetch fails
                ordersData.push({
                  id: doc.id,
                  ...data,
                  table_id: data.table_id,
                  customer_name: data.customer_name,
                  pax: data.pax,
                  status: data.status,
                  meal_starts_at: data.meal_starts_at.toDate(),
                  meal_ends_at: data.meal_ends_at.toDate(),
                  created_at: data.created_at.toDate(),
                  updated_at: data.updated_at.toDate(),
                });
              }
            } else {
              // Local-only order
              ordersData.push({
                id: doc.id,
                ...data,
                table_id: data.table_id,
                customer_name: data.customer_name,
                pax: data.pax,
                status: data.status,
                meal_starts_at: data.meal_starts_at.toDate(),
                meal_ends_at: data.meal_ends_at.toDate(),
                created_at: data.created_at.toDate(),
                updated_at: data.updated_at.toDate(),
              });
            }
          }

          setOrders(ordersData);
          setLoading(false);
        },
        (err) => {
          setError(err as Error);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      setError(err as Error);
      setLoading(false);
    }
  }, [genuka?.companyId, tableId]);

  const createOrder = async (input: CreateOrderInput) => {
    if (!genuka?.companyId) {
      throw new Error("Company ID not available");
    }

    try {
      // First create the order in Genuka if needed
      let genukaOrderId: string | undefined;
      try {
        const genukaOrder = await genuka.orders.create({
          customer_name: input.customer_name,
          metadata: {
            table_id: input.table_id,
            pax: input.pax,
            meal_starts_at: input.meal_starts_at,
            meal_ends_at: input.meal_ends_at,
          },
        });
        genukaOrderId = genukaOrder.id;
      } catch (err) {
        console.error("Failed to create Genuka order:", err);
        // Continue without Genuka order
      }

      // Create the order in Firebase
      const orderRef = collection(db, `companies/${genuka.companyId}/orders`);
      await addDoc(orderRef, {
        genuka_order_id: genukaOrderId,
        table_id: input.table_id,
        customer_name: input.customer_name,
        pax: input.pax,
        meal_starts_at: input.meal_starts_at,
        meal_ends_at: input.meal_ends_at,
        status: "pending",
        notes: input.notes,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });
    } catch (err) {
      console.error("Error creating order:", err);
      throw err;
    }
  };

  const updateOrderStatus = async (
    orderId: string,
    status: Order["status"]
  ) => {
    if (!genuka?.companyId) {
      throw new Error("Company ID not available");
    }

    const orderRef = doc(db, `companies/${genuka.companyId}/orders/${orderId}`);
    await updateDoc(orderRef, {
      status,
      updated_at: serverTimestamp(),
    });
  };

  return {
    orders,
    loading,
    error,
    createOrder,
    updateOrderStatus,
  };
}
