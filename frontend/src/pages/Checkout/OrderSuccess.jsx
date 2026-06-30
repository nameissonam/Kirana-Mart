import React, { useEffect, useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getOrderById } from "../../services/orderService";

function OrderSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const orderData = location.state;
  const { token } = useAuth();

  const [liveOrder, setLiveOrder] = useState(null);
  const [trackerError, setTrackerError] = useState("");

  // Redirect if no order details (direct navigation prevention)
  useEffect(() => {
    if (!orderData) {
      navigate("/");
    }
  }, [orderData, navigate]);

  useEffect(() => {
    if (!orderData?.orderRef || !token) return;

    let isMounted = true;
    const fetchLiveOrder = async () => {
      try {
        const response = await getOrderById(orderData.orderRef, token);
        if (!isMounted) return;
        setLiveOrder(response.order);
        setTrackerError("");
      } catch (error) {
        if (!isMounted) return;
        setTrackerError("Tracker will update when the order status is available.");
      }
    };

    fetchLiveOrder();
    const interval = setInterval(fetchLiveOrder, 10000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [orderData?.orderRef, token]);

  if (!orderData) return null;
  const { orderRef, address, summary, paymentMethod } = orderData;
  const status = liveOrder?.status || "PLACED";
  const isRejected = status === "REJECTED";

  const steps = [
    { status: "PLACED", title: "Order Placed", desc: "Waiting for owner approval", icon: "1" },
    { status: "ACCEPTED", title: "Order Accepted", desc: "Owner confirmed your order", icon: "2" },
    { status: "PACKED", title: "Basket Packed", desc: "Items checked and packed", icon: "3" },
    { status: "OUT_FOR_DELIVERY", title: "Out for Delivery", desc: "Order is on the way", icon: "4" },
    { status: "DELIVERED", title: "Delivered", desc: "Arrived at your door", icon: "5" },
  ];
  const statusRank = {
    PLACED: 0,
    CONFIRMED: 1,
    ACCEPTED: 1,
    PACKED: 2,
    OUT_FOR_DELIVERY: 3,
    DELIVERED: 4,
    REJECTED: 0,
  };
  const activeStep = statusRank[status] ?? 0;
  const trackerLabel = {
    PLACED: "Waiting for owner",
    CONFIRMED: "Accepted",
    ACCEPTED: "Accepted",
    PACKED: "Packed",
    OUT_FOR_DELIVERY: "Out for delivery",
    DELIVERED: "Delivered",
    REJECTED: "Rejected",
  }[status] || status.replace(/_/g, " ");

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-6 animate-fade-in relative">
      
      {/* 1. Success Confetti & Heading */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-100 text-brand-600 text-3xl animate-bounce">
          🎉
        </div>
        <h1 className="text-3xl font-extrabold text-gray-800">Order Placed Successfully!</h1>
        <p className="text-gray-500 text-sm">
          Your order reference is <span className="font-extrabold text-brand-600 uppercase">{orderRef}</span>
        </p>
      </div>

      {/* 2. Live Delivery Tracker */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h2 className="font-extrabold text-sm text-gray-850 uppercase tracking-wider">
            Live Delivery Tracker
          </h2>
          <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${isRejected ? "bg-red-50 text-red-600" : "bg-brand-50 text-brand-600 animate-pulse-subtle"}`}>
            {trackerLabel}
          </span>
        </div>

        {/* Stepper Grid */}
        {trackerError && <p className="text-xs font-semibold text-amber-600">{trackerError}</p>}
        {isRejected && <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">This order was rejected by the owner. Please contact the store or place a new order.</p>}
        <div className="grid grid-cols-1 gap-6 relative sm:grid-cols-5">
          {steps.map((step, idx) => {
            const isCompleted = !isRejected && idx <= activeStep;
            const isCurrent = !isRejected && idx === activeStep;

            return (
              <div key={step.status} className="flex flex-row sm:flex-col items-center gap-4 sm:text-center relative z-10">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg transition-all duration-300 border ${
                    isCompleted
                      ? "bg-brand-600 text-white border-brand-600 scale-105 shadow-md shadow-brand-500/25"
                      : "bg-slate-100 text-gray-400 border-gray-200"
                  } ${isCurrent ? "ring-4 ring-brand-100 animate-pulse-subtle" : ""}`}
                >
                  {isCompleted ? "✓" : step.icon}
                </div>
                
                <div className="flex-1 sm:flex-initial">
                  <h4 className={`text-xs font-bold ${isCompleted ? "text-gray-800" : "text-gray-400"}`}>
                    {step.title}
                  </h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Invoice Receipt Details */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="font-bold text-xs text-gray-400 uppercase tracking-wider border-b border-gray-50 pb-1.5">
            Delivery Address
          </h3>
          <p className="text-sm font-semibold text-gray-800">
            {address.fullName}
          </p>
          <p className="text-xs text-gray-500 leading-relaxed">
            {address.flat}, {address.street}<br />
            {address.city} - {address.pincode}
          </p>
          <p className="text-xs text-gray-500">
            <strong>Contact:</strong> +91 {address.phone}
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="font-bold text-xs text-gray-400 uppercase tracking-wider border-b border-gray-50 pb-1.5">
            Billing Summary
          </h3>
          <div className="space-y-1.5 text-xs text-gray-500">
            <div className="flex justify-between">
              <span>Basket Price</span>
              <span className="font-semibold text-gray-800">₹{summary.subtotal}</span>
            </div>
            {summary.discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Coupon Applied</span>
                <span className="font-bold">-₹{summary.discount}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span className="font-semibold text-gray-800">
                {summary.delivery === 0 ? "Free" : `₹${summary.delivery}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span>GST Taxes (5%)</span>
              <span className="font-semibold text-gray-800">₹{summary.tax}</span>
            </div>
            <div className="flex justify-between border-t border-gray-100 pt-2 text-sm font-medium text-gray-900">
              <span className="text-gray-800 font-bold">Total Paid</span>
              <span className="text-brand-600 font-extrabold">₹{summary.total}</span>
            </div>
          </div>
          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mt-1.5">
            <strong>Payment Mode:</strong> {paymentMethod.toUpperCase()}
          </p>
        </div>
      </div>

      {/* Action CTA */}
      <div className="flex justify-center gap-4">
        <Link
          to="/"
          className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md transition text-sm cursor-pointer"
        >
          Return to Home
        </Link>
        <Link
          to="/products"
          className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-gray-600 font-bold rounded-xl border border-gray-150 transition text-sm cursor-pointer"
        >
          Shop More Items
        </Link>
      </div>

    </div>
  );
}

export default OrderSuccess;
