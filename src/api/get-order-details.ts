import { api } from "@/lib/axios";

export interface GetOrderDetailsParams {
  orderId: string;
}

export interface GerOrderDetailsResponse {
  id: string;
  createdAt: string;
  status: "pending" | "canceled" | "processing" | "delivering" | "delivered";
  totalInCents: number;
  customer: {
    name: string;
    email: string;
    phone: string | null;
  };

  orderItems: {
    id: string;
    name: string;
    priceInCents: number;
    quantity: number;
    product: {
      name: string;
    };
  }[];
}

export async function GetOrdersDetails({ orderId }: GetOrderDetailsParams) {
  const response = await api.get<GerOrderDetailsResponse>(`/orders/${orderId}`);

  return response.data;
}
