import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { RefreshCw, CheckCircle, AlertTriangle, ShoppingBag, X } from "../../components/Icons";
import { apiUrl } from "../../config/api";

const NOTIFICATIONS_API = apiUrl("/api/notifications");

function AdminNotifications() {
  const { token, isAdmin } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get(NOTIFICATIONS_API, { headers });
      if (res.data.success) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.error("Error loading notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin && token) {
      fetchNotifications();
    }
  }, [isAdmin, token]);

  const handleMarkAsRead = async (id) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.put(`${NOTIFICATIONS_API}/${id}/read`, {}, { headers });
      
      // Update local state directly to feel instant
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;
    setMarkingAll(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.put(`${NOTIFICATIONS_API}/read-all`, {}, { headers });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      alert("Failed to mark all as read: " + err.message);
    } finally {
      setMarkingAll(false);
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case "NEW_ORDER":
        return (
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center flex-shrink-0 border border-blue-100">
            <ShoppingBag className="w-5 h-5 text-blue-600" />
          </div>
        );
      case "LOW_STOCK":
        return (
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0 border border-amber-100 animate-pulse">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
        );
      case "ORDER_CANCELLED":
        return (
          <div className="w-9 h-9 rounded-xl bg-red-50 text-red-700 flex items-center justify-center flex-shrink-0 border border-red-100">
            <X className="w-5 h-5 text-red-500" />
          </div>
        );
      default:
        return (
          <div className="w-9 h-9 rounded-xl bg-gray-50 text-gray-700 flex items-center justify-center flex-shrink-0 border border-gray-100">
            <AlertTriangle className="w-5 h-5 text-gray-500" />
          </div>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h2 className="text-xl font-extrabold text-gray-800">System Alerts</h2>
          <p className="text-xs text-gray-500 mt-1">Review active store alerts for new sales, cancel requests, and low stock warnings.</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0 || markingAll}
            className="flex items-center gap-1.5 px-4 py-2 border bg-white text-gray-700 hover:bg-slate-50 disabled:bg-gray-100 disabled:text-gray-400 text-xs font-bold rounded-xl shadow-xs transition cursor-pointer disabled:cursor-not-allowed"
          >
            <CheckCircle className="w-4 h-4" />
            <span>{markingAll ? "Marking..." : "Mark All as Read"}</span>
          </button>

          <button
            onClick={fetchNotifications}
            className="flex items-center gap-1.5 px-4 py-2 bg-brand-50 border border-brand-200 hover:bg-brand-100 text-brand-700 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-brand-650" />
            <span>Sync Alerts</span>
          </button>
        </div>
      </div>

      {/* Notifications list */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden divide-y divide-gray-100">
        {loading ? (
          <div className="py-16 text-center text-xs text-gray-400 flex flex-col items-center justify-center gap-2">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
            <span>Loading notifications feed...</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-450 italic">No alerts logged in the system.</div>
        ) : (
          notifications.map((n) => (
            <div
              key={n._id}
              className={`p-5 flex items-start justify-between gap-4 transition duration-150 ${
                !n.read ? "bg-brand-50/15" : "hover:bg-slate-50/50"
              }`}
            >
              <div className="flex items-start gap-4">
                {getAlertIcon(n.type)}
                <div className="space-y-1">
                  <h4 className={`text-sm ${!n.read ? "font-bold text-gray-900" : "font-semibold text-gray-700"}`}>
                    {n.title}
                  </h4>
                  <p className="text-xs text-gray-500 leading-relaxed">{n.message}</p>
                  <span className="text-[10px] text-gray-400 font-semibold block pt-0.5">
                    {new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {!n.read && (
                <button
                  onClick={() => handleMarkAsRead(n._id)}
                  className="px-2.5 py-1 bg-brand-50 hover:bg-brand-100 text-brand-700 text-[10px] font-bold rounded-lg transition cursor-pointer flex-shrink-0"
                >
                  Mark Read
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AdminNotifications;
