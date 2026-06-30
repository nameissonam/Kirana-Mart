import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { ShoppingBag, Store, AlertTriangle, TrendingUp, RefreshCw, BarChart3, Package, Users } from "../../components/Icons";
import { apiUrl } from "../../config/api";

const DASHBOARD_API = apiUrl("/api/reports/dashboard");
const SALES_API = apiUrl("/api/reports/sales");

function AdminDashboard() {
  const { token, isAdmin } = useAuth();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    lowStockAlerts: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [salesData, setSalesData] = useState({
    dailySales: [],
    monthlySales: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async (showRefresher = false) => {
    if (showRefresher) setRefreshing(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      
      // Fetch dashboard summaries
      const dashboardRes = await axios.get(DASHBOARD_API, { headers });
      if (dashboardRes.data.success) {
        setStats(dashboardRes.data.stats);
        setRecentOrders(dashboardRes.data.recentOrders || []);
      }

      // Fetch sales trend charts
      const salesRes = await axios.get(SALES_API, { headers });
      if (salesRes.data.success) {
        setSalesData({
          dailySales: salesRes.data.dailySales || [],
          monthlySales: salesRes.data.monthlySales || [],
        });
      }
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAdmin && token) {
      loadData();

      // Set up real-time polling every 15 seconds
      const timer = setInterval(() => {
        loadData(true);
      }, 15000);

      return () => clearInterval(timer);
    }
  }, [isAdmin, token]);

  const getStatusColor = (status) => {
    const colors = {
      PLACED: "bg-blue-50 text-blue-700 border-blue-100",
      ACCEPTED: "bg-green-50 text-green-700 border-green-100",
      PACKED: "bg-purple-50 text-purple-700 border-purple-100",
      OUT_FOR_DELIVERY: "bg-orange-50 text-orange-700 border-orange-100",
      DELIVERED: "bg-emerald-50 text-emerald-700 border-emerald-100",
      REJECTED: "bg-red-50 text-red-700 border-red-100",
    };
    return colors[status] || "bg-gray-50 text-gray-700 border-gray-100";
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-xs text-gray-400 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
        <span>Loading owner dashboard...</span>
      </div>
    );
  }

  // Find max sales amount to scale daily sales bar heights
  const maxDailySales = Math.max(...salesData.dailySales.map(d => d.totalAmount), 500);

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h2 className="text-xl font-extrabold text-gray-800 flex items-center gap-2">
            <Store className="w-6 h-6 text-brand-600" />
            <span>Store Performance Dashboard</span>
          </h2>
          <p className="text-xs text-gray-500 mt-1">Review store revenue, low stock triggers, and active queues.</p>
        </div>

        <button
          onClick={() => loadData(true)}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-4 py-2 bg-white border hover:bg-slate-50 text-gray-700 text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 text-gray-500 ${refreshing ? "animate-spin" : ""}`} />
          <span>{refreshing ? "Syncing..." : "Sync Stats"}</span>
        </button>
      </div>

      {/* Analytics KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Estimated Revenue</span>
              <h3 className="text-2xl font-black text-gray-800 mt-1.5">₹{stats.totalRevenue.toLocaleString()}</h3>
            </div>
            <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-brand-650" />
            </div>
          </div>
          <span className="text-[10px] text-brand-700 font-bold bg-brand-50 px-1.5 py-0.5 rounded mt-3 inline-block">Lifetime Sales</span>
        </div>

        {/* Card 2: Total Orders */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Orders</span>
              <h3 className="text-2xl font-black text-gray-800 mt-1.5">{stats.totalOrders}</h3>
            </div>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <span className="text-[10px] text-blue-650 font-bold bg-blue-50 px-1.5 py-0.5 rounded mt-3 inline-block">Inflow Count</span>
        </div>

        {/* Card 3: Total Products */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Listed Products</span>
              <h3 className="text-2xl font-black text-gray-800 mt-1.5">{stats.totalProducts}</h3>
            </div>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Package className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <span className="text-[10px] text-purple-650 font-bold bg-purple-50 px-1.5 py-0.5 rounded mt-3 inline-block">Active Catalog</span>
        </div>

        {/* Card 4: Low Stock Alerts */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Low Stock Warnings</span>
              <h3 className={`text-2xl font-black mt-1.5 ${stats.lowStockAlerts > 0 ? "text-red-650" : "text-gray-800"}`}>
                {stats.lowStockAlerts}
              </h3>
            </div>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${stats.lowStockAlerts > 0 ? "bg-red-50" : "bg-emerald-50"}`}>
              <AlertTriangle className={`w-5 h-5 ${stats.lowStockAlerts > 0 ? "text-red-500" : "text-emerald-500"}`} />
            </div>
          </div>
          {stats.lowStockAlerts > 0 ? (
            <Link
              to="/admin/inventory"
              className="text-[10px] text-red-650 font-bold bg-red-50 px-1.5 py-0.5 rounded mt-3 inline-block hover:underline"
            >
              Action Required &rarr;
            </Link>
          ) : (
            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded mt-3 inline-block">
              Inventory Healthy
            </span>
          )}
        </div>
      </div>

      {/* SVG Interactive Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weekly sales chart */}
        <div className="bg-white rounded-3xl border border-gray-100 p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="font-extrabold text-xs text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-brand-650" />
              <span>Daily Sales Performance</span>
            </h3>
            <span className="text-[10px] text-gray-450 font-bold">Last 7 Days</span>
          </div>

          {salesData.dailySales.length === 0 ? (
            <div className="h-44 flex items-center justify-center text-xs text-gray-400">No sales transactions logged.</div>
          ) : (
            <div className="w-full h-48 flex items-end justify-between px-2 pb-6 pt-4 border-b border-gray-150">
              {salesData.dailySales.map((day) => {
                const dateObj = new Date(day.date);
                const dayName = dateObj.toLocaleDateString("en-US", { weekday: "short" }).substring(0, 1);
                // Calculate percentage height
                const barHeight = Math.max(8, Math.round((day.totalAmount / maxDailySales) * 120)); // Max height 120px
                
                return (
                  <div key={day.date} className="flex flex-col items-center gap-2 flex-1 group relative">
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-[9px] px-1.5 py-0.5 rounded font-mono shadow-md z-10 pointer-events-none">
                      ₹{day.totalAmount} ({day.count} ord)
                    </div>
                    
                    <span className="text-[8px] font-bold text-gray-400 group-hover:text-gray-700 transition">
                      ₹{day.totalAmount > 1000 ? (day.totalAmount / 1000).toFixed(1) + "k" : day.totalAmount}
                    </span>
                    
                    <div
                      style={{ height: `${barHeight}px` }}
                      className="w-5 bg-gradient-to-t from-brand-650 to-brand-450 hover:from-brand-700 hover:to-brand-500 rounded-md transition-all duration-350 cursor-pointer shadow-xs"
                    />
                    
                    <span className="text-[10px] text-gray-450 font-bold">{dayName}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Monthly sales overview */}
        <div className="bg-white rounded-3xl border border-gray-100 p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="font-extrabold text-xs text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              <span>Annual Revenue Trend</span>
            </h3>
            <span className="text-[10px] text-gray-450 font-bold">This Year</span>
          </div>

          <div className="space-y-3 pt-1">
            {salesData.monthlySales.slice(0, 6).map((month) => {
              // Calculate percent share of a sensible limit
              const maxMonthAmt = Math.max(...salesData.monthlySales.map(m => m.totalAmount), 1000);
              const percentage = Math.max(1, Math.round((month.totalAmount / maxMonthAmt) * 100));

              return (
                <div key={month.month} className="space-y-1">
                  <div className="flex justify-between text-[11px] font-semibold text-gray-750">
                    <span>{month.month}</span>
                    <span className="font-bold text-gray-800">
                      ₹{month.totalAmount.toLocaleString()} ({month.count} orders)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${percentage}%` }}
                      className="bg-blue-650 h-full rounded-full transition-all duration-500"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Orders List */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h3 className="font-extrabold text-base text-gray-800">Recent Transactions</h3>
          <Link
            to="/admin/orders"
            className="text-brand-650 hover:text-brand-700 text-xs font-bold transition flex items-center gap-1"
          >
            <span>View All Orders</span>
            <span>&rarr;</span>
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="py-8 text-center text-xs text-gray-450">No recent transactions recorded.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-gray-650">
              <thead>
                <tr className="border-b border-gray-100 text-gray-450 font-bold text-xs uppercase tracking-wider">
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Delivery Type</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Placed Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-gray-800 text-xs">
                      #{order._id.substring(0, 10).toUpperCase()}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-semibold text-gray-700">
                      {order.customer?.name || "Anonymous Guest"}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-bold text-gray-600">{order.deliveryType}</td>
                    <td className="py-3.5 px-4 font-extrabold text-brand-650 text-sm">₹{order.totalAmount}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
