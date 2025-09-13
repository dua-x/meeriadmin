'use client';
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/custom ui/DataTable";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Orders() {
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("authtoken");
        if (!token) throw new Error("Authentication token not found");

        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_IPHOST}/StoreAPI/orders/orderGET`,
          {
            query: `
              query {
                orderGET {
                  _id
                  firstname
                  lastname
                  idorder
                  orderitems {
                    _id
                    quantity
                    product {
                      _id
                      name 
                    }
                    color
                    size
                  }
                  adress
                  wilaya
                  commune
                  phonenumber
                  status
                  totalprice
                  quantityOrder
                  user {
                    _id
                    username
                    phonenumber
                  }
                  dateordered
                  createdAt
                }
              }
            `,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data?.data?.orderGET) {
          const formattedOrders = response.data.data.orderGET.map((order: OrderType) => ({
            ...order,
            idorder: order.idorder,
          }));
          setOrders(formattedOrders);
        } else {
          throw new Error("No orders found in response");
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        setError("Failed to load orders. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const renderOrderDetails = (order: OrderType) => {
    const fullName =
      order.firstname && order.lastname
        ? `${order.firstname} ${order.lastname}`
        : order.user?.username || "Guest Customer";

    return (
      <div className="p-4 bg-gray-50 rounded-md shadow-inner">
        <h3 className="text-lg font-semibold text-[#857B74] mb-2">Customer Info</h3>
        <div className="mb-4 text-sm">
          <p><strong>Name:</strong> {fullName}</p>
          <p><strong>Phone:</strong> {order.phonenumber || order.user?.phone|| "N/A"}</p>
          <p><strong>Address:</strong> {`${order.adress || ""}, ${order.commune || ""}, ${order.wilaya || ""}`}</p>
        </div>

        <h3 className="text-lg font-semibold text-[#857B74] mb-2">Order Items</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {order.orderitems.map((item) => (
            <div key={item._id} className="border p-4 rounded-md bg-white text-sm">
              <p>
                <strong>Product:</strong>{" "}
                {Array.isArray(item.product)
                  ? item.product.map((p) => p.name).join(", ")
                  : item.product?.name || "Unknown Product"}
              </p>
              <p><strong>Quantity:</strong> {item.quantity}</p>
              <p><strong>Color:</strong> {item.color}</p>
              <p><strong>Size:</strong> {item.size}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const validStatuses: OrderStatus[] = [
        "en cours de confirmation",
        "confirmé",
        "en livraison",
        "livré",
        "annulé"
      ];
      if (!validStatuses.includes(newStatus as OrderStatus)) {
        throw new Error("Invalid status value");
      }

      const token = localStorage.getItem("authtoken");
      if (!token) throw new Error("Authentication token not found");

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_IPHOST}/StoreAPI/orders/statuschange/${orderId}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        setOrders(prev =>
          prev.map(order =>
            order._id === orderId ? { ...order, status: newStatus as OrderStatus } : order
          )
        );
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Failed to update order status. Please try again.");
    }
  };

  const columns: ColumnDef<OrderType>[] = [
    {
      header: "Order ID",
      accessorKey: "idorder",
    },
    {
      header: "Total",
      accessorKey: "totalprice",
      cell: (info) => `${Number(info.getValue()).toFixed(2)}DZD`,
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (info) => {
        const status = info.getValue() as OrderStatus;
        const row = info.row.original;
        return (
          <select
            value={status}
            onChange={(e) => {
              e.stopPropagation();
              handleStatusChange(row._id, e.target.value);
            }}
            onClick={(e) => e.stopPropagation()}
            className={`px-2 py-1 rounded-full text-xs ${
              status === "livré" ? "bg-green-100 text-green-800" :
              status === "confirmé" ? "bg-blue-100 text-blue-800" :
              status === "en livraison" ? "bg-yellow-100 text-yellow-800" :
              status === "annulé" ? "bg-red-100 text-red-800" :
              "bg-gray-100 text-gray-800"
            }`}
          >
            <option value="en cours de confirmation">En cours de confirmation</option>
            <option value="confirmé">Confirmé</option>
            <option value="en livraison">En livraison</option>
            <option value="livré">Livré</option>
            <option value="annulé">Annulé</option>
          </select>
        );
      },
    },
    {
      header: "Date Ordered",
      accessorKey: "dateordered",
      cell: (info) => {
        const dateStr = info.getValue() as string;
        return new Date(dateStr).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      },
    },
  ];

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to delete this order?")) return;

    try {
      const token = localStorage.getItem("authtoken");
      if (!token) throw new Error("Authentication token not found");

      await axios.delete(
        `${process.env.NEXT_PUBLIC_IPHOST}/StoreAPI/orders/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setOrders(prev => prev.filter(order => order._id !== orderId));
    } catch (error) {
      console.error("Error deleting order:", error);
      alert("Failed to delete the order. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50">
        <div className="relative w-24 h-24 flex items-center justify-center">
          <div className="absolute w-24 h-24 border-4 border-[#C4A484] border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute w-16 h-16 border-4 border-[#857B74] border-t-transparent rounded-full animate-spin-slow"></div>
          <span className="text-[#C4A484] font-bold text-2xl tracking-wide">M</span>
        </div>
        <p className="mt-6 text-[#857B74] text-lg font-semibold tracking-wide">
          Elevating Your Style at
          <span className="text-[#C4A484] font-bold"> Merri Store</span>...
        </p>
        <p className="mt-2 text-sm text-gray-500 opacity-80 animate-fade-in">
          Just a moment, fashion takes time.
        </p>
      </div>
    );
  }

  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return (
    <div className="p-4 md:p-8">
      <div className=" items-center justify-between mb-8">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#857B74] drop-shadow-lg mb-2">
          Orders
        </h1>
         <p className="text-sm text-gray-500">
                    {orders.length} registered customers
         </p>
      </div>
      <DataTable<OrderType, unknown>
        columns={columns}
        data={orders}
        searchKey="status"
        onDeleteAction={handleDeleteOrder}
        onUpdateAction={(updatedOrder) => {
          setOrders(prev =>
            prev.map(order =>
              order._id === updatedOrder._id ? updatedOrder : order
            )
          );
        }}
        showActions={false}
        allowEdit={false}
        renderDetails={renderOrderDetails}
        detailsTitle="Order Details"
      />
    </div>
  );
}
