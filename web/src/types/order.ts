export interface OrderItem {
  id?: number;
  order_id?: number;
  menu_item_id: number;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  tenant_id: number;
  branch_id: number;
  customer_name: string;
  customer_phone: string;
  total_amount: number;
  status: string;
  payment_status: string;
  items?: OrderItem[];
}

export interface OrderCreatePayload {
  tenant_id: number;
  branch_id: number;
  customer_name: string;
  customer_phone: string;
  total_amount: number;
  payment_status: string;
  items: OrderItem[];
}

export interface OrderStatusUpdatePayload {
  status: string;
}
