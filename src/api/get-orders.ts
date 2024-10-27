import { api } from "@/lib/axios";

export interface GetOrdersQuery {
  pageIndex?: number | null;
  orderId?: string | null;
  customerName?: string | null;
  status?: string | null;
}

export interface GetOrdersResponse {
  orders: {
    orderId: string;
    createdAt: string;
    status: "pending" | "canceled" | "processing" | "delivering" | "delivered";
    customerName: string;
    total: number;
  }[];
  meta: {
    pageIndex: number;
    perPage: number;
    totalCount: number;
  };
}

export async function getOrders({
  pageIndex,
  orderId,
  customerName,
  status,
}: GetOrdersQuery) {
  // Convert pageIndex to number if it is a string
  const pageIndexNumber =
    pageIndex !== null && pageIndex !== undefined ? Number(pageIndex) : null;

  // Validate status to ensure it is one of the expected union values or null
  const validStatus =
    status &&
    ["pending", "canceled", "processing", "delivering", "delivered"].includes(
      status,
    )
      ? status
      : null;
  const response = await api.get<GetOrdersResponse>("/orders", {
    params: {
      pageIndex: pageIndexNumber,
      orderId,
      customerName,
      status: validStatus,
    },
  });

  return response.data;
}
