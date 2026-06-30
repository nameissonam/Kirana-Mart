import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { RefreshCw, BarChart3, TrendingUp, Package } from "../../components/Icons";
import { apiUrl } from "../../config/api";

const SALES_API = apiUrl("/api/reports/sales");
const TOP_PRODUCTS_API = apiUrl("/api/reports/top-products");

function AdminReports() {
  const { token, isAdmin } = useAuth();
  const [salesData, setSalesData] = useState({
    dailySales: [],
    monthlySales: [],
  });
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadReportData = async (showRefresher = false) => {
    if (showRefresher) setRefreshing(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      // Get sales history
      const salesRes = await axios.get(SALES_API, { headers });
      if (salesRes.data.success) {
        setSalesData({
          dailySales: salesRes.data.dailySales || [],
          monthlySales: salesRes.data.monthlySales || [],
        });
      }

      // Get top selling items
      const topProductsRes = await axios.get(TOP_PRODUCTS_API, { headers });
      if (topProductsRes.data.success) {
        setTopProducts(topProductsRes.data.topProducts || []);
      }
    } catch (err) {
      console.error("Error loading reports:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAdmin && token) {
      loadReportData();
    }
  }, [isAdmin, token]);

  if (loading) {
    return (
      <div className="py-16 text-center text-xs text-gray-400 flex flex-col items-center justify-center gap-2">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        <span>Compiling statistics report...</span>
      </div>
    );
  }

  // Scaling calculations
  const maxDailySales = Math.max(...salesData.dailySales.map(d => d.totalAmount), 500);
  const maxMonthlySales = Math.max(...salesData.monthlySales.map(m => m.totalAmount), 1000);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h2 className="text-xl font-extrabold text-gray-800">Business Analytics</h2>
          <p className="text-xs text-gray-500 mt-1">Analyze daily sales, monthly revenue curves, and top product performances.</p>
        </div>

        <button
          onClick={() => loadReportData(true)}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-4 py-2 bg-white border hover:bg-slate-50 text-gray-700 text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 text-gray-500 ${refreshing ? "animate-spin" : ""}`} />
          <span>{refreshing ? "Re-Analyzing..." : "Analyze Records"}</span>
        </button>
      </div>

      {/* SVG Daily & Monthly Sales Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Daily Sales Bar Chart */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-extrabold text-xs text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-brand-650" />
              <span>Daily Revenue (Last 7 Days)</span>
            </h3>
            <span className="text-[10px] text-gray-400 font-bold bg-brand-50 text-brand-700 px-2 py-0.5 rounded">
              Trend View
            </span>
          </div>

          {salesData.dailySales.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-xs text-gray-400">No daily data compiled.</div>
          ) : (
            <div className="pt-6 pb-2">
              <div className="w-full h-52 flex items-end justify-between px-2 pb-6 pt-4 border-b border-gray-150">
                {salesData.dailySales.map((day) => {
                  const dateObj = new Date(day.date);
                  const dateLabel = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                  const barHeight = Math.max(12, Math.round((day.totalAmount / maxDailySales) * 140)); // Max height 140px

                  return (
                    <div key={day.date} className="flex flex-col items-center gap-2 flex-1 group relative">
                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[9px] px-2 py-0.5 rounded font-mono shadow-md z-10 pointer-events-none whitespace-nowrap">
                        ₹{day.totalAmount.toLocaleString()} ({day.count} orders)
                      </div>

                      <span className="text-[8px] font-bold text-gray-450 group-hover:text-gray-800 transition">
                        ₹{day.totalAmount > 1000 ? (day.totalAmount / 1000).toFixed(1) + "k" : day.totalAmount}
                      </span>

                      <div
                        style={{ height: `${barHeight}px` }}
                        className="w-6 bg-gradient-to-t from-brand-650 to-brand-450 hover:from-brand-750 hover:to-brand-500 rounded-md transition-all duration-300 cursor-pointer shadow-xs"
                      />

                      <span className="text-[9px] text-gray-400 font-bold rotate-12 mt-1 whitespace-nowrap">{dateLabel}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Monthly Revenue Curve */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-extrabold text-xs text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span>Monthly Revenue curve</span>
            </h3>
            <span className="text-[10px] text-gray-450 font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
              Current Year
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {salesData.monthlySales.map((month) => {
              const percentage = Math.max(1, Math.round((month.totalAmount / maxMonthlySales) * 100));

              return (
                <div key={month.month} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-gray-750">
                    <span>{month.month}</span>
                    <span className="font-bold text-gray-850">
                      ₹{month.totalAmount.toLocaleString()}{" "}
                      <span className="text-[10px] text-gray-400 font-normal">({month.count} orders)</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${percentage}%` }}
                      className="bg-blue-600 h-full rounded-full transition-all duration-500 shadow-xs"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Selling Products List */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h3 className="font-extrabold text-base text-gray-800 flex items-center gap-2">
            <Package className="w-5 h-5 text-purple-650" />
            <span>Top Performing Catalog Items</span>
          </h3>
          <span className="text-xs text-gray-400 font-semibold">Ordered by Volume</span>
        </div>

        {topProducts.length === 0 ? (
          <div className="py-8 text-center text-xs text-gray-450">No transaction data compiled yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-gray-650">
              <thead>
                <tr className="border-b border-gray-100 text-gray-450 font-bold text-xs uppercase tracking-wider">
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Base MRP</th>
                  <th className="py-3 px-4 text-center">Quantity Sold</th>
                  <th className="py-3 px-4 text-right">Revenue Generated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {topProducts.map((p, index) => (
                  <tr key={p._id || index} className="hover:bg-slate-50/50 transition">
                    {/* Rank */}
                    <td className="py-3.5 px-4 font-extrabold text-xs">
                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${
                        index === 0
                          ? "bg-amber-100 text-amber-800"
                          : index === 1
                          ? "bg-slate-105 text-slate-700"
                          : index === 2
                          ? "bg-orange-100 text-orange-850"
                          : "bg-slate-100 text-gray-500"
                      }`}>
                        {index + 1}
                      </span>
                    </td>

                    {/* Product Name */}
                    <td className="py-3.5 px-4 font-bold text-gray-800 text-sm">{p.name || "Unknown Product"}</td>

                    {/* Base Price */}
                    <td className="py-3.5 px-4 text-xs font-semibold text-gray-500">₹{p.price}</td>

                    {/* Quantity Sold */}
                    <td className="py-3.5 px-4 text-center font-bold text-gray-700">{p.quantitySold} units</td>

                    {/* Total Spend */}
                    <td className="py-3.5 px-4 font-extrabold text-brand-650 text-right text-sm">
                      ₹{p.revenue.toLocaleString()}
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

export default AdminReports;
