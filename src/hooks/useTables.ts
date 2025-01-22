// hooks/useTables.ts
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { useGenukaContext } from "@/providers/genuka";
import { Table } from "@/types";

interface CreateTableInput {
  name: string;
  area_id: string;
  capacity: number;
  coordinates: {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
  };
  metadata?: unknown;
}

interface UpdateTableInput {
  name?: string;
  capacity?: number;
  coordinates?: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    rotation?: number;
  };
  metadata?: unknown;
}

export function useTables(areaId: string) {
  const { genuka } = useGenukaContext();
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setTables([]);
    setLoading(true);
    setError(null);

    if (!genuka?.companyId || !areaId) {
      setLoading(false);
      return;
    }

    try {
      const tablesRef = collection(db, `companies/${genuka.companyId}/tables`);
      const q = query(tablesRef, where("area_id", "==", areaId));

      console.log("Setting up tables listener for area:", areaId);

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          console.log("Tables snapshot received:", snapshot.size, "documents");
          const tablesData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            created_at: doc.data().created_at?.toDate(),
            updated_at: doc.data().updated_at?.toDate(),
          })) as Table[];

          setTables(tablesData);
          setLoading(false);
        },
        (err) => {
          console.error("Tables snapshot error:", err);
          setError(err as Error);
          setLoading(false);
        }
      );

      return () => {
        console.log("Cleaning up tables listener");
        unsubscribe();
      };
    } catch (err) {
      console.error("Error setting up tables listener:", err);
      setError(err as Error);
      setLoading(false);
    }
  }, [genuka?.companyId, areaId]);

  const createTable = async (input: Omit<CreateTableInput, "area_id">) => {
    if (!genuka?.companyId) {
      throw new Error("Company ID not available");
    }

    try {
      const tablesRef = collection(db, `companies/${genuka.companyId}/tables`);
      const newTable = await addDoc(tablesRef, {
        ...input,
        area_id: areaId,
        company_id: genuka.companyId,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });

      console.log("Table created:", newTable.id);
      return newTable.id;
    } catch (err) {
      console.error("Error creating table:", err);
      throw err;
    }
  };

  const updateTable = async (tableId: string, input: UpdateTableInput) => {
    if (!genuka?.companyId) {
      throw new Error("Company ID not available");
    }

    try {
      const updates = { ...input, updated_at: serverTimestamp() };

      // If coordinates are being updated, merge them with existing coordinates
      if (input.coordinates) {
        const table = tables.find((t) => t.id === tableId);
        if (table) {
          updates.coordinates = {
            ...table.coordinates,
            ...input.coordinates,
          };
        }
      }

      const tableRef = doc(
        db,
        `companies/${genuka.companyId}/tables/${tableId}`
      );
      await updateDoc(tableRef, updates);
      console.log("Table updated:", tableId);
    } catch (err) {
      console.error("Error updating table:", err);
      throw err;
    }
  };

  const deleteTable = async (tableId: string) => {
    if (!genuka?.companyId) {
      throw new Error("Company ID not available");
    }

    try {
      const tableRef = doc(
        db,
        `companies/${genuka.companyId}/tables/${tableId}`
      );
      await deleteDoc(tableRef);
      console.log("Table deleted:", tableId);
    } catch (err) {
      console.error("Error deleting table:", err);
      throw err;
    }
  };

  const duplicateTable = async (tableId: string) => {
    const table: Table | undefined = tables.find((t) => t.id === tableId);
    if (!table) {
      throw new Error("Table not found");
    }

    // Offset the new table position slightly
    const newCoordinates = {
      ...table.coordinates,
      x: table.coordinates.x + 20,
      y: table.coordinates.y + 20,
    };

    return createTable({
      ...table,
      name: `${table.name} (Copy)`,
      coordinates: newCoordinates,
    });
  };

  return {
    tables,
    loading,
    error,
    createTable,
    updateTable,
    deleteTable,
    duplicateTable,
  };
}
