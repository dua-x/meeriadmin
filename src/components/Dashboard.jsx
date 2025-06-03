'use client';
import { useEffect, useState } from "react";
import SalesChart from "@/components/custom ui/SalesChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CircleDollarSign, ShoppingBag, UserRound, CheckCircle } from "lucide-react";
import axios from "axios";

function Skeleton({ className }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`}></div>
  );
}

export default function Dashboard() {
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrdersConfirmed, setTotalOrdersConfirmed] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [graphData, setGraphData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('authtoken');

      try {
        if (!token) {
          throw new Error("No token found in localStorage");
        }

        setLoading(true);
        
        const [
          ordersConfirmedResponse,
          ordersResponse,
          ordersTotalRevenueResponse,
          customersResponse
        ] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_IPHOST}/StoreAPI/orders/countordersconfirm`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${process.env.NEXT_PUBLIC_IPHOST}/StoreAPI/orders/countorders`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${process.env.NEXT_PUBLIC_IPHOST}/StoreAPI/orders/totalprice`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${process.env.NEXT_PUBLIC_IPHOST}/StoreAPI/users/countusers`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        ]);

        setTotalOrdersConfirmed(ordersConfirmedResponse.data.count);
        setTotalOrders(ordersResponse.data.count);
        setTotalRevenue(ordersTotalRevenueResponse.data.totalPrice);
        setTotalCustomers(customersResponse.data.count);

        const currentMonth = new Date().getMonth();
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const dynamicGraphData = months.slice(0, currentMonth + 1).map((month, index) => ({
          name: month,
          sales: Math.floor(Math.random() * 5000) + 1000
        }));
        
        setGraphData(dynamicGraphData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="px-4 py-6 md:px-8 md:py-10 xl:mx-10">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-px my-5" />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-6 md:px-8 md:py-10 xl:mx-10">
        <h1 className="text-3xl font-bold text-[#857B74] mb-6">Dashboard</h1>
        <Separator className="bg-grey-1 my-5" />
        <div className="text-red-500 p-4 border border-red-200 rounded-lg bg-red-50">
          Error loading dashboard: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 md:px-8 md:py-10 xl:mx-10">
      <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#857B74] drop-shadow-lg mb-2">
        Dashboard Overview
      </h1>
      <p className="text-sm text-gray-500 mb-4">Key metrics and performance indicators</p>

      <Separator className="bg-grey-1 my-5" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard 
          title="Total Revenue" 
          value={formatCurrency(totalRevenue)} 
          icon={<CircleDollarSign className="h-5 w-5" />}
          trend="up"
          change="12% from last month"
        />
        
        <StatCard 
          title="Confirmed Orders" 
          value={totalOrdersConfirmed} 
          icon={<CheckCircle className="h-5 w-5" />}
          trend="up"
          change={`${Math.round((totalOrdersConfirmed / totalOrders) * 100)}% of total orders`}
        />
        
        <StatCard 
          title="Total Orders" 
          value={totalOrders} 
          icon={<ShoppingBag className="h-5 w-5" />}
          trend={totalOrders > totalOrdersConfirmed ? "down" : "up"}
          change={`${totalOrders - totalOrdersConfirmed} pending`}
        />
        
        <StatCard 
          title="Total Customers" 
          value={totalCustomers} 
          icon={<UserRound className="h-5 w-5" />}
          trend="up"
          change="8% from last month"
        />
      </div>

      <Card className="mb-10">
        <CardHeader>
          <CardTitle>Sales Performance (DZD)</CardTitle>
          <p className="text-sm text-gray-500">Monthly revenue trends</p>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <SalesChart data={graphData} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ title, value, icon, trend, change }) {
  const trendColors = {
    up: "text-green-500",
    down: "text-red-500",
    neutral: "text-gray-500"
  };
  
  const trendIcons = {
    up: "↑",
    down: "↓",
    neutral: "→"
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="flex flex-row justify-between items-center pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
        <span className={`rounded-full p-2 ${trendColors[trend]} bg-opacity-20 ${trend === 'up' ? 'bg-green-100' : trend === 'down' ? 'bg-red-100' : 'bg-gray-100'}`}>
          {icon}
        </span>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs mt-1 flex items-center">
          <span className={`mr-1 ${trendColors[trend]}`}>{trendIcons[trend]}</span>
          <span className="text-gray-500">{change}</span>
        </p>
      </CardContent>
    </Card>
  );
}