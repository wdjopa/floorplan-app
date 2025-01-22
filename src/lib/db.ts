import { Area, Order, Table } from "@/types";
import {
    addDoc,
    collection,
    doc,
    getDocs,
    query,
    serverTimestamp,
    updateDoc,
    where
} from "firebase/firestore";
import { db } from "./firebase";

// Company operations
export const storeCompanyAuth = async (
  companyId: string,
  authCode: string,
  accessToken: string
) => {
  const companyRef = doc(db, "companies", companyId);
  await updateDoc(companyRef, {
    authorization_code: authCode,
    access_token: accessToken,
    updated_at: serverTimestamp(),
  });
};

// Area operations
export const createArea = async (companyId: string, data: Partial<Area>) => {
  const areaRef = collection(db, `companies/${companyId}/areas`);
  return addDoc(areaRef, {
    ...data,
    company_id: companyId,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  });
};

export const getAreas = async (companyId: string) => {
  const areasRef = collection(db, `companies/${companyId}/areas`);
  const snapshot = await getDocs(areasRef);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Area[];
};

// Table operations
export const createTable = async (companyId: string, data: Partial<Table>) => {
  const tableRef = collection(db, `companies/${companyId}/tables`);
  return addDoc(tableRef, {
    ...data,
    company_id: companyId,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  });
};

export const getTables = async (companyId: string, areaId?: string) => {
  const tablesRef = collection(db, `companies/${companyId}/tables`);
  const q = areaId
    ? query(tablesRef, where("area_id", "==", areaId))
    : tablesRef;
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Table[];
};

// Order operations
export const createOrder = async (companyId: string, data: Partial<Order>) => {
  const orderRef = collection(db, `companies/${companyId}/orders`);
  return addDoc(orderRef, {
    ...data,
    company_id: companyId,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  });
};

export const getOrders = async (companyId: string, tableId?: string) => {
  const ordersRef = collection(db, `companies/${companyId}/orders`);
  const q = tableId
    ? query(ordersRef, where("table_id", "==", tableId))
    : ordersRef;
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Order[];
};
