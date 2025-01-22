import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { useGenukaContext } from "@/providers/genuka";
import { Area } from "@/types";

interface CreateAreaInput {
  name: string;
  description?: string;
  metadata?: unknown;
}

interface UpdateAreaInput {
  name?: string;
  description?: string;
  metadata?: unknown;
}

export function useAreas() {
  const { genuka } = useGenukaContext();
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Reset state when companyId changes
    setAreas([]);
    setLoading(true);
    setError(null);

    if (!genuka?.companyId) {
      setLoading(false);
      return;
    }

    try {
      const areasRef = collection(db, `companies/${genuka.companyId}/areas`);
      const q = query(areasRef);

      console.log("Setting up areas listener for company:", genuka.companyId);

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          console.log("Areas snapshot received:", snapshot.size, "documents");
          const areasData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            // Convert Firestore Timestamps to Dates
            created_at: doc.data().created_at?.toDate(),
            updated_at: doc.data().updated_at?.toDate(),
          })) as Area[];

          setAreas(areasData);
          setLoading(false);
        },
        (err) => {
          console.error("Areas snapshot error:", err);
          setError(err as Error);
          setLoading(false);
        }
      );

      return () => {
        console.log("Cleaning up areas listener");
        unsubscribe();
      };
    } catch (err) {
      console.error("Error setting up areas listener:", err);
      setError(err as Error);
      setLoading(false);
    }
  }, [genuka?.companyId]);

  const createArea = async (input: CreateAreaInput) => {
    if (!genuka?.companyId) {
      throw new Error("Company ID not available");
    }

    try {
      const areasRef = collection(db, `companies/${genuka.companyId}/areas`);
      const newArea = await addDoc(areasRef, {
        ...input,
        company_id: genuka.companyId,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });

      console.log("Area created:", newArea.id);
      return newArea.id;
    } catch (err) {
      console.error("Error creating area:", err);
      throw err;
    }
  };

  const updateArea = async (areaId: string, input: UpdateAreaInput) => {
    if (!genuka?.companyId) {
      throw new Error("Company ID not available");
    }

    try {
      const areaRef = doc(db, `companies/${genuka.companyId}/areas/${areaId}`);
      await updateDoc(areaRef, {
        ...input,
        updated_at: serverTimestamp(),
      });

      console.log("Area updated:", areaId);
    } catch (err) {
      console.error("Error updating area:", err);
      throw err;
    }
  };

  const deleteArea = async (areaId: string) => {
    if (!genuka?.companyId) {
      throw new Error("Company ID not available");
    }

    try {
      const areaRef = doc(db, `companies/${genuka.companyId}/areas/${areaId}`);
      await deleteDoc(areaRef);
      console.log("Area deleted:", areaId);
    } catch (err) {
      console.error("Error deleting area:", err);
      throw err;
    }
  };

  return {
    areas,
    loading,
    error,
    createArea,
    updateArea,
    deleteArea,
  };
}
