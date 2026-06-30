import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { RefreshCw, Search, Users, X, ShoppingBag } from "../../components/Icons";
import { apiUrl } from "../../config/api";

const CUSTOMERS_API = apiUrl("/api/customers");

function AdminCustomers() {
  const { token, isAdmin } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get(CUSTOMERS_API, { headers });
      if (res.data.success) {
        setCustomers(res.data.customers || []);
      }
    } catch (err) {
      console.error("Error loading customers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin && token) {
      fetchCustomers();
    }
  }, [isAdmin, token]);

  const handleViewHistory = async (customer) => {
    setSelectedCustomer(customer);
    setLoadingOrders(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get(`${CUSTOMERS_API}/${customer._id}/orders`, { headers });
      if (res.data.success) {
        setCustomerOrders(res.data.orders || []);
      }
    } catch (err) {
      console.error("Error loading customer orders:", err);
      setCustomerOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  // Filter list
  const filteredCustomers = customers.filter((c) =>
    (c.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.email || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h2 className="text-xl font-extrabold text-gray-800">Customer Directory</h2>
          <p className="text-xs text-gray-500 mt-1">View customer profiles, total transaction values, and purchase history.</p>
        </div>

        <button
          onClick={fetchCustomers}
          className="flex items-center gap-1.5 px-4 py-2 bg-white border hover:bg-slate-50 text-gray-700 text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
        >
          <RefreshCw className="w-4 h-4 text-gray-500" />
          <span>Sync Profiles</span>
        </button>
      </div>

      {/* Customer search bar */}
      <div className="relative w-full md:max-w-md bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
        <input
          type="text"
          placeholder="Search by customer name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/25"
        />
        <Search className="absolute left-7 top-7 w-4 h-4 text-gray-400" />
      </div>

      {/* Customers List Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-gray-400 flex flex-col items-center justify-center gap-2">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
            <span>Fetching directory...</span>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400">No customers found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-gray-650">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-100 text-gray-400 font-bold text-[10px] uppercase tracking-wider">
                  <th className="py-4 px-6">Customer Name</th>
                  <th className="py-4 px-6">Contact Info</th>
                  <th className="py-4 px-6">Registered Date</th>
                  <th className="py-4 px-6">Orders Count</th>
                  <th className="py-4 px-6">Total Spend</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCustomers.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/50 transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-650 font-bold text-xs flex items-center justify-center">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-gray-800 text-sm">{c.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-xs">
                        <p className="text-gray-750 font-medium">{c.email}</p>
                        <p className="text-gray-400 mt-0.5">{c.addresses?.[0]?.phone || "No phone listed"}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-xs text-gray-400">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-xs font-bold text-gray-700">{c.totalOrders} order(s)</td>
                    <td className="py-4 px-6 font-extrabold text-brand-650 text-sm">₹{c.totalSpend.toLocaleString()}</td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleViewHistory(c)}
                        className="text-brand-650 hover:text-brand-700 text-xs font-bold transition hover:underline cursor-pointer"
                      >
                        Order History
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* History Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setSelectedCustomer(null)} />
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 max-w-2xl w-full relative z-10 animate-slide-up space-y-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3.5">
              <div>
                <h3 className="text-base font-black text-gray-800">
                  Transaction History: {selectedCustomer.name}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">{selectedCustomer.email}</p>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1 rounded-xl text-gray-400 hover:bg-slate-50 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Total cards inside modal */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-gray-100 text-xs">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Spend</span>
                <p className="text-base font-black text-brand-650 mt-1">₹{selectedCustomer.totalSpend.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Orders</span>
                <p className="text-base font-black text-gray-800 mt-1">{selectedCustomer.totalOrders} order(s)</p>
              </div>
            </div>

            {/* Orders list */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Completed & Active Orders</span>
              
              {loadingOrders ? (
                <div className="py-8 text-center text-xs text-gray-400 flex flex-col items-center justify-center gap-1.5">
                  <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                  <span>Fetching historical records...</span>
                </div>
              ) : customerOrders.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-400 italic">This customer has not placed any orders yet.</div>
              ) : (
                <div className="border border-gray-100 rounded-2xl overflow-hidden divide-y divide-gray-100 max-h-[40vh] overflow-y-auto">
                  {customerOrders.map((order) => (
                    <div key={order._id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition">
                      <div className="space-y-0.5">
                        <p className="font-mono font-bold text-xs text-gray-800">
                          #{order._id.substring(0, 10).toUpperCase()}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-[10px] text-gray-500 font-semibold mt-0.5">
                          {order.items?.length || 0} items ({order.deliveryType})
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="font-black text-brand-650 text-sm">₹{order.totalAmount}</p>
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-extrabold border ${
                          order.status === "DELIVERED"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-150"
                            : order.status === "REJECTED"
                            ? "bg-red-50 text-red-700 border-red-150"
                            : "bg-blue-50 text-blue-700 border-blue-150"
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 border border-gray-250 hover:bg-slate-50 text-gray-500 text-xs font-bold rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminCustomers;
