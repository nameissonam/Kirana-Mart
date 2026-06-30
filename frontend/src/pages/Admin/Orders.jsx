import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { RefreshCw, X } from "../../components/Icons";
import PaymentStatusBadge from "../../components/PaymentStatusBadge";
import BackButton from "../../components/BackButton";
import LocationMap, { getDirectionsUrl } from "../../components/LocationMap";
import { DEFAULT_STORE_SETTINGS, getStoreSettings } from "../../services/settingsService";
import { apiUrl } from "../../config/api";

const ORDERS_API = apiUrl("/api/orders");

function Orders() {
  const { token, isAdmin } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All"); // 'All' | 'PLACED' | 'ACCEPTED' | 'PACKED' | 'OUT_FOR_DELIVERY' | 'DELIVERED'
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [settings, setSettings] = useState(DEFAULT_STORE_SETTINGS);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      // Retrieve orders (the backend now supports status filtering in req.query.status)
      const url = activeTab === "All" ? ORDERS_API : `${ORDERS_API}?status=${activeTab}`;
      const res = await axios.get(url, { headers });
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, token]);

  useEffect(() => {
    if (isAdmin && token) {
      const timeout = setTimeout(fetchOrders, 0);
      return () => clearTimeout(timeout);
    }
  }, [fetchOrders, isAdmin, token]);

  useEffect(() => {
    if (!isAdmin) return;
    getStoreSettings()
      .then(setSettings)
      .catch(() => {});
  }, [isAdmin]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    setActionLoadingId(orderId);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.put(`${ORDERS_API}/${orderId}/status`, { status: newStatus }, { headers });
      fetchOrders();
      if (selectedOrder && selectedOrder._id === orderId) {
        // Refresh detail view
        setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      alert("Failed to update status: " + (err.response?.data?.message || err.message));
    } finally {
      setActionLoadingId(null);
    }
  };

  const canMarkPaymentPaid = (order) => {
    if (!order || order.paymentStatus === "Paid") return false;
    const offlineMethods = ["Cash on Delivery", "COD", "Pay at Store"];
    return order.paymentGateway === "Offline" || offlineMethods.includes(order.paymentMethod);
  };

  const handleUpdatePaymentStatus = async (orderId, paymentStatus) => {
    setActionLoadingId(orderId);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.put(`${ORDERS_API}/${orderId}/payment-status`, { paymentStatus }, { headers });
      const updatedOrder = res.data.order;
      setOrders((currentOrders) =>
        currentOrders.map((order) => (order._id === orderId ? { ...order, ...updatedOrder } : order))
      );
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, ...updatedOrder }));
      }
    } catch (err) {
      alert("Failed to update payment: " + (err.response?.data?.message || err.message));
    } finally {
      setActionLoadingId(null);
    }
  };

  const getStatusStyle = (status) => {
    const styles = {
      PLACED: "bg-blue-50 text-blue-700 border-blue-150",
      ACCEPTED: "bg-green-50 text-green-700 border-green-150",
      PACKED: "bg-purple-50 text-purple-700 border-purple-150",
      OUT_FOR_DELIVERY: "bg-orange-50 text-orange-700 border-orange-150",
      DELIVERED: "bg-emerald-50 text-emerald-700 border-emerald-150",
      REJECTED: "bg-red-50 text-red-700 border-red-150",
    };
    return styles[status] || "bg-gray-50 text-gray-700 border-gray-150";
  };

  const getTabLabel = (tab) => {
    const labels = {
      All: "All Orders",
      PLACED: "Pending",
      ACCEPTED: "Accepted",
      PACKED: "Packed",
      OUT_FOR_DELIVERY: "Shipped",
      DELIVERED: "Delivered",
      REJECTED: "Cancelled",
    };
    return labels[tab] || tab;
  };

  const getDeliveryAddressText = (order) => {
    const address = order?.deliveryAddress;
    if (!address?.flat) return "";
    return [
      address.flat,
      address.street,
      address.city,
      address.pincode,
    ].filter(Boolean).join(", ");
  };

  const getCustomerLocation = (order) => {
    if (order?.deliveryAddress?.location) return order.deliveryAddress.location;
    const addressText = getDeliveryAddressText(order);
    return addressText ? { query: addressText, label: addressText, source: "address" } : null;
  };

  return (
    <div className="space-y-6">
      <BackButton />
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h2 className="text-xl font-extrabold text-gray-800">Customer Orders</h2>
          <p className="text-xs text-gray-500 mt-1">Review active transactions, accept requests, and manage shipping queues.</p>
        </div>

        <button
          onClick={fetchOrders}
          className="flex items-center gap-1.5 px-4 py-2 bg-white border hover:bg-slate-50 text-gray-700 text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
        >
          <RefreshCw className="w-4 h-4 text-gray-500" />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Tabs list */}
      <div className="flex bg-slate-100 p-1 rounded-xl w-fit flex-wrap gap-1">
        {["All", "PLACED", "ACCEPTED", "PACKED", "OUT_FOR_DELIVERY", "DELIVERED", "REJECTED"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === tab
                ? "bg-white text-gray-800 shadow-xs"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {getTabLabel(tab)}
          </button>
        ))}
      </div>

      {/* Orders List Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-gray-400 flex flex-col items-center justify-center gap-2">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
            <span>Loading orders queue...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400">No orders found in this queue.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-gray-650">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-100 text-gray-400 font-bold text-[10px] uppercase tracking-wider">
                  <th className="py-4 px-6">Order ID</th>
                  <th className="py-4 px-6">Customer</th>
                  <th className="py-4 px-6">Method / Type</th>
                  <th className="py-4 px-6">Location</th>
                  <th className="py-4 px-6">Payment</th>
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6">Amount</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-center">Workflow Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => {
                  const isProcessing = actionLoadingId === order._id;
                  const customerLocation = getCustomerLocation(order);
                  return (
                    <tr key={order._id} className="hover:bg-slate-50/50 transition">
                      {/* Order ID */}
                      <td className="py-4 px-6">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="font-mono font-bold text-xs text-brand-650 hover:underline cursor-pointer"
                        >
                          #{order._id.substring(0, 10).toUpperCase()}
                        </button>
                      </td>

                      {/* Customer Info */}
                      <td className="py-4 px-6">
                        <div className="text-xs">
                          <p className="font-bold text-gray-800">{order.customer?.name || "Unknown Customer"}</p>
                          <p className="text-gray-400 mt-0.5">{order.customer?.email || ""}</p>
                        </div>
                      </td>

                      {/* Delivery/Payment Method */}
                      <td className="py-4 px-6">
                        <div className="text-xs">
                          <p className="font-semibold text-gray-750">{order.deliveryType}</p>
                          <p className="text-gray-400 mt-0.5">{order.paymentMethod}</p>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        {customerLocation ? (
                          <div className="max-w-48 text-xs">
                            <p className="line-clamp-2 font-semibold text-gray-700">{customerLocation.label || customerLocation.query || getDeliveryAddressText(order)}</p>
                            <a
                              href={getDirectionsUrl(customerLocation, settings.address)}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-2 inline-flex rounded-lg bg-lime-600 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-lime-700"
                            >
                              Route
                            </a>
                          </div>
                        ) : (
                          <span className="text-xs font-semibold text-gray-400">Store pickup</span>
                        )}
                      </td>

                      <td className="py-4 px-6">
                        <PaymentStatusBadge status={order.paymentStatus} />
                        <p className="mt-1 text-[10px] font-semibold text-slate-500">{order.paymentGateway === "Razorpay" ? "Online / Razorpay" : order.paymentMethod}</p>
                        <p className="mt-1 text-[10px] text-slate-400">Txn: {order.transactionId || order.transactionReference || "Not available"}</p>
                        {order.paidAt && <p className="mt-1 text-[10px] text-slate-400">Paid: {new Date(order.paidAt).toLocaleString("en-IN")}</p>}
                        {canMarkPaymentPaid(order) && (
                          <button
                            type="button"
                            onClick={() => handleUpdatePaymentStatus(order._id, "Paid")}
                            disabled={isProcessing}
                            className="mt-2 rounded-lg bg-emerald-600 px-2.5 py-1 text-[10px] font-bold text-white transition hover:bg-emerald-700 disabled:bg-gray-205"
                          >
                            Mark Paid
                          </button>
                        )}
                      </td>

                      {/* Created Date */}
                      <td className="py-4 px-6 text-xs text-gray-500 font-medium">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>

                      {/* Amount */}
                      <td className="py-4 px-6 font-extrabold text-gray-850 text-sm">₹{order.totalAmount}</td>

                      {/* Status Tag */}
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${getStatusStyle(order.status)}`}>
                          {order.status}
                        </span>
                      </td>

                      {/* Workflow Action Buttons */}
                      <td className="py-4 px-6 text-center">
                        <div className="flex gap-2 justify-center items-center">
                          {order.status === "PLACED" && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(order._id, "ACCEPTED")}
                                disabled={isProcessing}
                                className="px-2.5 py-1.5 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer disabled:bg-gray-205"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(order._id, "REJECTED")}
                                disabled={isProcessing}
                                className="px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer disabled:bg-gray-205"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {order.status === "ACCEPTED" && (
                            <button
                              onClick={() => handleUpdateStatus(order._id, "PACKED")}
                              disabled={isProcessing}
                              className="px-3 py-1.5 bg-purple-650 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer disabled:bg-gray-205"
                            >
                              Mark Packed
                            </button>
                          )}
                          {order.status === "PACKED" && (
                            <button
                              onClick={() => handleUpdateStatus(order._id, "OUT_FOR_DELIVERY")}
                              disabled={isProcessing}
                              className="px-3 py-1.5 bg-orange-500 hover:bg-orange-650 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer disabled:bg-gray-205"
                            >
                              Ship Order
                            </button>
                          )}
                          {order.status === "OUT_FOR_DELIVERY" && (
                            <button
                              onClick={() => handleUpdateStatus(order._id, "DELIVERED")}
                              disabled={isProcessing}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer disabled:bg-gray-205"
                            >
                              Deliver
                            </button>
                          )}
                          {["DELIVERED", "REJECTED"].includes(order.status) && (
                            <span className="text-gray-400 text-xs font-semibold">Archived</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoice Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setSelectedOrder(null)} />
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 max-w-xl w-full relative z-10 animate-slide-up space-y-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3.5">
              <div>
                <h3 className="text-base font-black text-gray-800">
                  Order Invoice Details
                </h3>
                <span className="font-mono font-bold text-xs text-gray-400 mt-1 block">
                  ID: {selectedOrder._id.toUpperCase()}
                </span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-xl text-gray-400 hover:bg-slate-50 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer & Address Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-gray-100">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Customer Details</span>
                <p className="text-sm font-bold text-gray-800">{selectedOrder.customer?.name || "Anonymous Guest"}</p>
                <p className="text-xs text-gray-500">{selectedOrder.customer?.email || ""}</p>
              </div>

              <div className="space-y-1 text-xs">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Delivery Destination</span>
                {selectedOrder.deliveryAddress?.flat ? (
                  <div className="text-gray-700">
                    <p className="font-semibold">{selectedOrder.deliveryAddress.fullName} ({selectedOrder.deliveryAddress.phone})</p>
                    <p className="mt-0.5">{selectedOrder.deliveryAddress.flat}, {selectedOrder.deliveryAddress.street}</p>
                    <p>{selectedOrder.deliveryAddress.city} - {selectedOrder.deliveryAddress.pincode}</p>
                  </div>
                ) : (
                  <p className="text-gray-400 italic">No home address provided (Store Pickup).</p>
                )}
              </div>
            </div>

            {getCustomerLocation(selectedOrder) && (
              <LocationMap
                location={getCustomerLocation(selectedOrder)}
                origin={settings.address}
                title="Customer delivery location"
              />
            )}

            {/* Items Summary */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Ordered Items</span>
              <div className="border border-gray-100 rounded-2xl overflow-hidden divide-y divide-gray-50">
                {selectedOrder.items?.map((item) => (
                  <div key={item._id} className="p-3.5 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-gray-800">{item.name}</p>
                      <p className="text-gray-450 mt-0.5">₹{item.price} per unit</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800">x{item.quantity}</p>
                      <p className="font-extrabold text-brand-650 mt-0.5">₹{item.price * item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment / Type / Charges */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t pt-4 text-xs text-gray-600">
              <div>
                <span className="text-[9px] font-bold text-gray-400 uppercase">Payment Method</span>
                <p className="font-bold text-gray-800 mt-0.5">{selectedOrder.paymentMethod}</p>
                <div className="mt-2"><PaymentStatusBadge status={selectedOrder.paymentStatus} /></div>
                <p className="mt-1 text-[9px] text-slate-400">Gateway: {selectedOrder.paymentGateway || "Offline"}</p>
                <p className="mt-1 text-[9px] text-slate-400">Payment ID: {selectedOrder.paymentId || "Not available"}</p>
                <p className="mt-1 text-[9px] text-slate-400">Transaction ID: {selectedOrder.transactionId || selectedOrder.transactionReference || "Not available"}</p>
                {selectedOrder.paidAt && <p className="mt-1 text-[9px] text-slate-400">Paid: {new Date(selectedOrder.paidAt).toLocaleString("en-IN")}</p>}
                {canMarkPaymentPaid(selectedOrder) && (
                  <button
                    type="button"
                    onClick={() => handleUpdatePaymentStatus(selectedOrder._id, "Paid")}
                    disabled={actionLoadingId === selectedOrder._id}
                    className="mt-2 rounded-lg bg-emerald-600 px-3 py-1.5 text-[10px] font-bold text-white transition hover:bg-emerald-700 disabled:bg-gray-205"
                  >
                    Mark Payment Paid
                  </button>
                )}
              </div>
              <div>
                <span className="text-[9px] font-bold text-gray-400 uppercase">Delivery Type</span>
                <p className="font-bold text-gray-800 mt-0.5">{selectedOrder.deliveryType}</p>
              </div>
              <div>
                <span className="text-[9px] font-bold text-gray-400 uppercase">Order Date</span>
                <p className="font-bold text-gray-800 mt-0.5">{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-[9px] font-bold text-gray-400 uppercase">Order Status</span>
                <p className="font-bold text-gray-800 mt-0.5">{selectedOrder.status}</p>
              </div>
            </div>

            {/* Total Invoice */}
            <div className="flex items-center justify-between border-t border-dashed pt-4">
              <span className="text-sm font-bold text-gray-700">Total Invoice Amount:</span>
              <span className="text-xl font-black text-brand-650">₹{selectedOrder.totalAmount}</span>
            </div>

            {/* Workflow Action in Modal */}
            <div className="flex justify-end gap-3.5 pt-2">
              {selectedOrder.status === "PLACED" && (
                <>
                  <button
                    onClick={() => handleUpdateStatus(selectedOrder._id, "REJECTED")}
                    className="px-4 py-2 border border-red-200 hover:bg-red-50 text-red-600 text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Reject Order
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedOrder._id, "ACCEPTED")}
                    className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
                  >
                    Accept Order
                  </button>
                </>
              )}
              {selectedOrder.status === "ACCEPTED" && (
                <button
                  onClick={() => handleUpdateStatus(selectedOrder._id, "PACKED")}
                  className="px-5 py-2 bg-purple-650 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Mark Packed
                </button>
              )}
              {selectedOrder.status === "PACKED" && (
                <button
                  onClick={() => handleUpdateStatus(selectedOrder._id, "OUT_FOR_DELIVERY")}
                  className="px-5 py-2 bg-orange-500 hover:bg-orange-650 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Ship / Out for Delivery
                </button>
              )}
              {selectedOrder.status === "OUT_FOR_DELIVERY" && (
                <button
                  onClick={() => handleUpdateStatus(selectedOrder._id, "DELIVERED")}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Mark Delivered
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
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

export default Orders;
