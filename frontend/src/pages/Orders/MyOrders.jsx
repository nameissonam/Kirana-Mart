import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { ChevronRight, Calendar, MapPin, ShoppingBag } from "../../components/Icons";
import LocationMap from "../../components/LocationMap";
import { DEFAULT_STORE_SETTINGS, getStoreSettings } from "../../services/settingsService";
import { apiUrl } from "../../config/api";

const API_URL = apiUrl("/api/orders");

function MyOrders() {
  const { user, token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [settings, setSettings] = useState(DEFAULT_STORE_SETTINGS);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    fetchOrders();
    getStoreSettings()
      .then(setSettings)
      .catch(() => {});
  }, [isAuthenticated, navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/my-orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setOrders(response.data.orders || []);
      setError("");
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PLACED: "bg-blue-50 text-blue-700 border-blue-200",
      CONFIRMED: "bg-green-50 text-green-700 border-green-200",
      ACCEPTED: "bg-green-50 text-green-700 border-green-200",
      PACKED: "bg-purple-50 text-purple-700 border-purple-200",
      OUT_FOR_DELIVERY: "bg-orange-50 text-orange-700 border-orange-200",
      DELIVERED: "bg-emerald-50 text-emerald-700 border-emerald-200",
      REJECTED: "bg-red-50 text-red-700 border-red-200",
    };
    return colors[status] || "bg-gray-50 text-gray-700 border-gray-200";
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const trackingSteps = ["PLACED", "ACCEPTED", "PACKED", "OUT_FOR_DELIVERY", "DELIVERED"];

  const getStepState = (orderStatus, step) => {
    if (orderStatus === "REJECTED") return "cancelled";
    const normalizedStatus = orderStatus === "CONFIRMED" ? "ACCEPTED" : orderStatus;
    const currentIndex = trackingSteps.indexOf(normalizedStatus);
    const stepIndex = trackingSteps.indexOf(step);
    if (stepIndex < currentIndex) return "done";
    if (stepIndex === currentIndex) return "active";
    return "upcoming";
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="w-12 h-12 bg-brand-100 rounded-full mx-auto mb-4 animate-spin"></div>
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
            📦
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Orders Yet</h2>
          <p className="text-gray-600 mb-6">
            You haven't placed any orders. Start shopping now!
          </p>
          <button
            onClick={() => navigate("/products")}
            className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
        <p className="text-gray-600 text-sm mt-1">
          {orders.length} {orders.length === 1 ? "order" : "orders"} in your account
        </p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order._id}
            className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition overflow-hidden"
          >
            <div className="p-6 space-y-4">
              {/* Order Header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Order ID</p>
                  <p className="font-mono font-bold text-sm text-gray-800">
                    {order._id.substring(0, 12).toUpperCase()}
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-lg border text-xs font-bold ${getStatusColor(order.status)}`}>
                  {order.status.replace(/_/g, " ")}
                </div>
              </div>

              {/* Order Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                    <Calendar className="w-4 h-4" /> Date
                  </p>
                  <p className="text-sm font-semibold text-gray-800">
                    {formatDate(order.createdAt)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                    <ShoppingBag className="w-4 h-4" /> Items
                  </p>
                  <p className="text-sm font-semibold text-gray-800">
                    {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">Total Amount</p>
                  <p className="text-sm font-bold text-brand-600">
                    ₹{order.totalAmount}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                    <MapPin className="w-4 h-4" /> Type
                  </p>
                  <p className="text-sm font-semibold text-gray-800">
                    {order.deliveryType}
                  </p>
                </div>
              </div>

              {/* Items Preview */}
              <div className="pt-4 border-t border-gray-100 space-y-2">
                <p className="text-xs text-gray-500 font-bold">Items:</p>
                <div className="space-y-1">
                  {order.items.slice(0, 2).map((item, idx) => (
                    <p key={idx} className="text-sm text-gray-700">
                      • {item.name} × {item.quantity}
                    </p>
                  ))}
                  {order.items.length > 2 && (
                    <p className="text-xs text-gray-500">
                      +{order.items.length - 2} more item
                      {order.items.length - 2 !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              </div>

              {/* Delivery Address */}
              {order.deliveryAddress && (
                <div className="pt-4 border-t border-gray-100 space-y-2">
                  <p className="text-xs text-gray-500 font-bold">Delivery To:</p>
                  <p className="text-sm text-gray-700">
                    {order.deliveryAddress.fullName}
                    <br />
                    {order.deliveryAddress.flat}, {order.deliveryAddress.street}
                    <br />
                    {order.deliveryAddress.city} - {order.deliveryAddress.pincode}
                  </p>
                </div>
              )}

              <div className="pt-4 border-t border-gray-100 space-y-4">
                <p className="text-xs text-gray-500 font-bold">Order Tracking:</p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-5">
                  {trackingSteps.map((step) => {
                    const state = getStepState(order.status, step);
                    return (
                      <div
                        key={step}
                        className={`rounded-xl border px-3 py-2 text-[10px] font-bold ${
                          state === "done"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : state === "active"
                              ? "border-orange-200 bg-orange-50 text-orange-700"
                              : state === "cancelled"
                                ? "border-red-200 bg-red-50 text-red-700"
                                : "border-gray-200 bg-slate-50 text-gray-400"
                        }`}
                      >
                        {state === "done" ? "✓ " : state === "active" ? "● " : ""}
                        {step.replace(/_/g, " ")}
                      </div>
                    );
                  })}
                </div>
                {order.status === "REJECTED" && (
                  <p className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
                    This order was cancelled or rejected by the store.
                  </p>
                )}
                {order.deliveryAddress?.location && (
                  <LocationMap location={order.deliveryAddress.location} origin={settings.address} title="Delivery location" compact />
                )}
              </div>

              {/* View Details Button */}
              <button className="w-full mt-4 flex items-center justify-center gap-2 py-2 text-brand-600 font-semibold hover:bg-brand-50 rounded-lg transition">
                View Details
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyOrders;
