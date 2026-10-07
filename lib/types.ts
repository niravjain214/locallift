export type SellerStatus = "active" | "paused";

export interface Seller {
  seller_id: string;
  phone: string;
  name: string;
  shop_name: string;
  address: string;
  service_areas: string;
  upi_id: string;
  whatsapp_phone?: string;
  status: SellerStatus;
  joined_at: string;
  total_earnings: number;
  last_payout_at: string;
}

export type ApplianceStatus = "live" | "rented" | "paused" | "deleted";

export interface Appliance {
  appliance_id: string;
  seller_phone: string;
  name: string;
  category: string;
  photos: string[];
  daily_price: number;
  deposit: number;
  description: string;
  condition: string;
  service_areas: string;
  status: ApplianceStatus;
  available_from: string;
  available_to: string;
  created_at: string;
  total_rentals: number;
  total_earnings: number;
}

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "out_for_delivery"
  | "active"
  | "return_due"
  | "completed"
  | "cancelled";

export type PaymentStatus = "pending" | "paid" | "refunded";

export interface Booking {
  booking_id: string;
  appliance_id: string;
  seller_phone: string;
  customer_name: string;
  customer_phone: string;
  customer_whatsapp: boolean;
  customer_address: string;
  landmark: string;
  start_date: string;
  end_date: string;
  total_days: number;
  rental_amount: number;
  deposit_amount: number;
  total_amount: number;
  special_requests: string;
  status: BookingStatus;
  payment_status: PaymentStatus;
  created_at: string;
  confirmed_at: string;
  delivered_at: string;
  returned_at: string;
  deposit_returned: boolean;
  notes: string;
}

export interface AreaRow {
  area_name: string;
  display_order: number;
  active: boolean;
}
