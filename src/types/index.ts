export interface Company {
  id: string;
  name: string;
  authorization_code: string;
  access_token: string;
  created_at: Date;
  updated_at: Date;
  metadata: unknown;
}

export interface Area {
  id: string;
  company_id: string;
  name: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
  metadata: unknown;
}

export interface Table {
  id: string;
  company_id: string;
  area_id: string;
  name: string;
  coordinates: {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
  };
  capacity: number;
  created_at: Date;
  updated_at: Date;
  metadata: unknown;
}

export interface Order {
  id: string;
  company_id: string;
  genuka_order_id: string;
  table_id: string;
  customer_name: string;
  pax: number;
  meal_starts_at: Date;
  meal_ends_at: Date;
  status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
  notes?: string;
  created_at: Date;
  updated_at: Date;
  metadata: unknown;
}
