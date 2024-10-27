import { useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowRight, Search, X } from "lucide-react";
import { useState } from "react";

import { cancelOrder } from "@/api/cancel-order";
import { GetOrdersResponse } from "@/api/get-orders";
import OrderStatus from "@/components/order-status";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { TableCell, TableRow } from "@/components/ui/table";

import OrderDetail from "./order-detail";

export interface OrderTableRowProps {
  order: {
    orderId: string;
    createdAt: string;
    status: "pending" | "canceled" | "processing" | "delivering" | "delivered";
    customerName: string;
    total: number;
  };
}

export default function OrderTableRow({ order }: OrderTableRowProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const queryClient = useQueryClient();

  /**
   * Custom hook to handle order cancellation using a mutation.
   *
   * This hook utilizes the `useMutation` hook from React Query to perform the order cancellation.
   * Upon successful mutation, it invalidates the query and updates the cached data to reflect the
   * canceled order status.
   *
   * @param {Function} cancelOrder - The function to call for canceling the order.
   *
   * @returns {Object} - An object containing the `mutateAsync` function to trigger the mutation.
   *
   * @example
   * ```tsx
   * const { mutateAsync: cancelOrderFn } = useCancelOrderMutation(cancelOrder);
   *
   * // To cancel an order
   * await cancelOrderFn({ orderId: '12345' });
   * ```
   *
   * @remarks
   * - The `onSuccess` callback is used to update the cached orders list in the query client.
   * - It ensures that the order with the specified `orderId` is marked as "canceled" in the cache.
   * - The query key used for fetching orders is assumed to be `["orders"]`.
   */
  const { mutateAsync: cancelOrderFn } = useMutation({
    mutationFn: cancelOrder,
    onSuccess: (_, { orderId }) => {
      // Invalidate the query to refetch the data
      // after the mutation is successful

      const ordersListCached = queryClient.getQueriesData<GetOrdersResponse>({
        queryKey: ["orders"],
      });
      ordersListCached.forEach(([cachedKey, cacheData]) => {
        if (!cacheData) {
          return;
        }

        queryClient.setQueryData<GetOrdersResponse>(cachedKey, {
          ...cacheData,
          orders: cacheData.orders.map((order) => {
            if (order.orderId === orderId) {
              return { ...order, status: "canceled" };
            }
            return order;
          }),
        });
      });
    },
  });

  return (
    <TableRow>
      <TableCell>
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="xs">
              <Search className="h-3 w-3" />
              <span className="sr-only">Detalhes do pedido</span>
            </Button>
          </DialogTrigger>
          <OrderDetail open={isDetailsOpen} orderId={order.orderId} />
        </Dialog>
      </TableCell>
      <TableCell className="font-mono text-xs font-medium">
        {order.orderId}
      </TableCell>
      <TableCell className="text-muted-foreground">
        {formatDistanceToNow(order.createdAt, {
          locale: ptBR,
          addSuffix: true,
        })}
      </TableCell>
      <TableCell>
        <OrderStatus status={order.status} />
      </TableCell>
      <TableCell className="font-medium">{order.customerName}</TableCell>
      <TableCell className="font-medium">
        {(order.total / 100).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })}
      </TableCell>
      <TableCell>
        <Button variant="outline" size="xs">
          <ArrowRight className="mr-2 h-4 w-4" />
          Aprovar
        </Button>
      </TableCell>
      <TableCell>
        <Button
          disabled={!["pending", "processing"].includes(order.status)}
          onClick={() => cancelOrderFn({ orderId: order.orderId })}
          variant="ghost"
          size="xs"
        >
          <X className="mr-2 h-4 w-4" />
          Cancelar
        </Button>
      </TableCell>
    </TableRow>
  );
}
