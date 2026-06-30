import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useDeliveryLocation } from "../../context/DeliveryLocationContext";
import { ArrowRight, CheckCircle } from "../../components/Icons";
import { createOrder } from "../../services/orderService";
import {
  cancelPayment,
  createPaymentOrder,
  getPaymentConfig,
  getPaymentStatus,
  loadRazorpayCheckout,
  verifyPayment,
} from "../../services/paymentService";
import { DEFAULT_STORE_SETTINGS, getStoreSettings } from "../../services/settingsService";
import BackButton from "../../components/BackButton";
import DeliveryMapPicker from "../../components/DeliveryMapPicker";

function Checkout() {
  const { cart, cartTotal, clearCart } = useCart();
  const { user, token, isAuthenticated } = useAuth();
  const {
    deliveryLocation,
    setDeliveryLocation: saveDeliveryLocation,
    detectCurrentLocation,
  } = useDeliveryLocation();
  const navigate = useNavigate();

  // Checkout Stages: 'address' | 'payment'
  const [stage, setStage] = useState("address");
  const [fulfillmentMethod, setFulfillmentMethod] = useState("home");

  // Form states
  const [address, setAddress] = useState({
    fullName: user?.name || "",
    phone: "",
    flat: "",
    street: "",
    pincode: "",
    city: "Bengaluru",
  });

  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [couponApplied, setCouponApplied] = useState("");
  const [paymentState, setPaymentState] = useState("Pending");
  const [paymentError, setPaymentError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [lastAttemptId, setLastAttemptId] = useState("");
  const [onlinePaymentAvailable, setOnlinePaymentAvailable] = useState(null);
  const [settings, setSettings] = useState(DEFAULT_STORE_SETTINGS);
  const [locationStatus, setLocationStatus] = useState("idle");
  const [locationError, setLocationError] = useState("");

  useEffect(() => {
    let active = true;
    getStoreSettings()
      .then((storeSettings) => { if (active) setSettings(storeSettings); })
      .catch(() => {});
    getPaymentConfig()
      .then((config) => { if (active) setOnlinePaymentAvailable(Boolean(config.configured)); })
      .catch(() => { if (active) setOnlinePaymentAvailable(false); });
    return () => { active = false; };
  }, []);

  const homeDeliveryMinValue = Number(settings.homeDeliveryMinValue || 750);
  const homeDeliveryAvailable = cartTotal >= homeDeliveryMinValue;
  const remainingForHomeDelivery = Math.max(0, homeDeliveryMinValue - cartTotal);

  useEffect(() => {
    if (!homeDeliveryAvailable) {
      setFulfillmentMethod("pickup");
      setPaymentMethod("Pay at Store");
      setStage("payment");
    }
  }, [homeDeliveryAvailable]);

  useEffect(() => {
    if (!deliveryLocation) return;
    setAddress((currentAddress) => (
      currentAddress.location ? currentAddress : { ...currentAddress, location: deliveryLocation }
    ));
  }, [deliveryLocation]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-4 space-y-6">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-600 mx-auto text-3xl">&#128274;</div>
        <h2 className="text-2xl font-extrabold text-gray-800">Authentication Required</h2>
        <p className="text-gray-500 text-sm">You must be logged in to proceed with checkout.</p>
        <Link to="/login" className="inline-block px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md transition">Go to Login</Link>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-4 space-y-6">
        <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center text-brand-600 mx-auto text-3xl">
          🛒
        </div>
        <h2 className="text-2xl font-extrabold text-gray-800">Your Basket is Empty</h2>
        <p className="text-gray-500 text-sm">
          You need to add products to your basket before you can proceed to the checkout screen.
        </p>
        <Link
          to="/products"
          className="inline-block px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md transition"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  // Address validation
  const handleAddressNext = (e) => {
    e.preventDefault();
    if (fulfillmentMethod === "pickup" || !homeDeliveryAvailable) {
      setPaymentMethod("Pay at Store");
      setStage("payment");
      return;
    }
    if (!address.fullName || !address.phone || !address.flat || !address.street || !address.pincode) {
      alert("Please fill in all address details before proceeding.");
      return;
    }
    if (address.phone.length < 10) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!address.location) {
      alert("Please confirm your delivery location before proceeding.");
      return;
    }
    setStage("payment");
  };

  const chooseStorePickup = () => {
    setFulfillmentMethod("pickup");
    setPaymentMethod("Pay at Store");
    setStage("payment");
    setLocationError("");
  };

  const chooseHomeDelivery = () => {
    if (!homeDeliveryAvailable) return;
    setFulfillmentMethod("home");
    setPaymentMethod("Cash on Delivery");
    setStage("address");
  };

  const setAddressLocation = (location) => {
    const nextLocation = saveDeliveryLocation(location);
    setAddress((currentAddress) => ({
      ...currentAddress,
      location: nextLocation,
    }));
    setLocationStatus("captured");
    return nextLocation;
  };

  const setDeliveryLocation = (coords, source = "browser") => {
    const lat = Number(coords.lat);
    const lng = Number(coords.lng);
    setAddressLocation({
      lat,
      lng,
      accuracy: coords.accuracy ? Number(coords.accuracy) : undefined,
      label: "Detected delivery location",
      capturedAt: new Date().toISOString(),
      source,
    });
  };

  const handleUseCurrentLocation = async () => {
    setLocationError("");
    setLocationStatus("loading");
    try {
      const detectedLocation = await detectCurrentLocation();
      setAddressLocation(detectedLocation);
    } catch (error) {
      setLocationStatus("idle");
      setLocationError(error.message || "Unable to capture your location. Enter your location name below.");
    }
  };

  const handleConfirmPinnedLocation = (pin) => {
    setAddressLocation({
      lat: pin.lat,
      lng: pin.lng,
      label: "Pinned delivery point",
      capturedAt: new Date().toISOString(),
      source: "map-pin",
    });
    setLocationError("");
  };

  // Coupon application
  const applyCoupon = () => {
    setCouponError("");
    const code = couponCode.trim().toUpperCase();
    if (code === "KIRANAFRESH") {
      const discountAmt = Math.round(cartTotal * 0.15); // 15% off
      setDiscount(discountAmt);
      setCouponApplied("KIRANAFRESH (15% OFF)");
      setCouponError("");
    } else if (code === "FREEDEL") {
      setCouponApplied("FREEDEL (Free Delivery)");
      setCouponError("");
    } else {
      setCouponError("Invalid coupon code. Try KIRANAFRESH");
      setDiscount(0);
      setCouponApplied("");
    }
  };

  const orderPayload = {
      items: cart.map((item) => ({
        product: item._id,
        quantity: item.quantity,
      })),
      couponCode: couponApplied ? couponCode.trim().toUpperCase() : "",
      deliveryAddress: fulfillmentMethod === "pickup" ? undefined : {
        fullName: address.fullName,
        phone: address.phone,
        flat: address.flat,
        street: address.street,
        pincode: address.pincode,
        city: address.city,
        location: address.location,
      },
  };

  const goToSuccess = (order, pricing, selectedMethod) => {
    clearCart();
    navigate("/checkout/success", {
      state: {
        orderRef: order._id,
        address,
        summary: {
          subtotal: pricing?.subtotal ?? cartTotal,
          discount: pricing?.discountAmount ?? discount,
          delivery: pricing?.deliveryAmount ?? deliveryFee,
          tax: pricing?.taxAmount ?? gstTax,
          total: order.totalAmount,
        },
        paymentMethod: selectedMethod,
      },
    });
  };

  const waitForWebhookConfirmation = async (attemptId) => {
    for (let count = 0; count < 10; count += 1) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const result = await getPaymentStatus(attemptId, token);
      setPaymentState(result.status);
      if (result.status === "Paid" && result.order) return result.order;
      if (["Failed", "Cancelled"].includes(result.status)) {
        throw new Error(result.failureReason || `Payment ${result.status.toLowerCase()}`);
      }
    }
    throw new Error("Payment is still processing. Check My Orders shortly before retrying.");
  };

  const handleOnlinePayment = async () => {
    setPaymentState("Processing");
    const paymentOrder = await createPaymentOrder(orderPayload, token);
    setLastAttemptId(paymentOrder.attemptId);
    await loadRazorpayCheckout();

    return new Promise((resolve, reject) => {
      let paymentSubmitted = false;
      const checkout = new window.Razorpay({
        key: paymentOrder.keyId,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency,
        name: "KiranaMart",
        description: "Secure UPI payment",
        order_id: paymentOrder.gatewayOrderId,
        prefill: { name: address.fullName, contact: address.phone, email: user?.email || "" },
        notes: { paymentAttemptId: paymentOrder.attemptId },
        theme: { color: "#16a34a" },
        config: {
          display: {
            blocks: { upi: { name: "Pay using UPI", instruments: [{ method: "upi" }] } },
            sequence: ["block.upi"],
            preferences: { show_default_blocks: false },
          },
        },
        handler: async (response) => {
          paymentSubmitted = true;
          try {
            const result = await verifyPayment({ attemptId: paymentOrder.attemptId, ...response }, token);
            const order = result.status === "Paid" ? result.order : await waitForWebhookConfirmation(paymentOrder.attemptId);
            setPaymentState("Paid");
            resolve({ order, pricing: paymentOrder.pricing });
          } catch (error) {
            reject(error);
          }
        },
        modal: {
          ondismiss: async () => {
            if (paymentSubmitted) return;
            await cancelPayment(paymentOrder.attemptId, token).catch(() => {});
            setPaymentState("Cancelled");
            reject(new Error("Payment was cancelled. You can retry when ready."));
          },
        },
      });
      checkout.on("payment.failed", (response) => {
        paymentSubmitted = true;
        setPaymentState("Failed");
        reject(new Error(response.error?.description || "Payment failed. Please retry."));
      });
      checkout.open();
    });
  };

  const handlePlaceOrder = async () => {
    setSubmitting(true);
    setPaymentError("");
    try {
      if (fulfillmentMethod === "pickup" && paymentMethod !== "Pay at Store") {
        throw new Error("Store pickup orders must be paid at the store counter.");
      }
      if (fulfillmentMethod === "home" && !homeDeliveryAvailable && paymentMethod !== "Pay at Store") {
        throw new Error(`Home delivery is available only for cart value of ₹${homeDeliveryMinValue} or more.`);
      }
      if (paymentMethod === "UPI") {
        if (!onlinePaymentAvailable) {
          setPaymentState("Failed");
          throw new Error("Online payment is temporarily unavailable. Please choose Cash on Delivery or Pay at Store.");
        }
        const result = await handleOnlinePayment();
        goToSuccess(result.order, result.pricing, "UPI via Razorpay");
        return;
      }

      const response = await createOrder({ ...orderPayload, paymentMethod }, token);
      goToSuccess(response.order, null, paymentMethod);
    } catch (error) {
      const message = error.response?.data?.message || error.message || "Unable to complete checkout";
      setPaymentError(message);
      if (paymentMethod === "UPI") setPaymentState("Failed");
    } finally {
      setSubmitting(false);
    }
  };

  // Detailed billing values
  const isDeliveryFree = fulfillmentMethod === "pickup" || paymentMethod === "Pay at Store" || couponApplied.includes("FREEDEL");
  const deliveryFee = isDeliveryFree ? 0 : Number(settings.deliveryCharge || 30);
  const gstTax = Math.round((cartTotal - discount) * 0.05); // 5% GST
  const grandTotal = cartTotal - discount + deliveryFee + gstTax;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4"><BackButton /><h1 className="text-2xl font-extrabold text-gray-800">Checkout</h1></div>

      {!homeDeliveryAvailable && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
          Home delivery starts from ₹{homeDeliveryMinValue}. Add ₹{remainingForHomeDelivery} more to unlock Cash on Delivery or UPI home delivery. Pay at Store is available now.
        </div>
      )}

      <div className="grid gap-3 rounded-2xl border border-lime-100 bg-white p-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={chooseHomeDelivery}
          disabled={!homeDeliveryAvailable}
          className={`rounded-xl border px-4 py-3 text-left transition ${
            fulfillmentMethod === "home"
              ? "border-lime-500 bg-lime-50"
              : "border-slate-200 hover:bg-slate-50"
          } disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-60`}
        >
          <span className="block text-sm font-extrabold text-slate-850">Home Delivery</span>
          <span className="mt-1 block text-xs font-semibold text-slate-500">
            Requires address and delivery location.
          </span>
        </button>
        <button
          type="button"
          onClick={chooseStorePickup}
          className={`rounded-xl border px-4 py-3 text-left transition ${
            fulfillmentMethod === "pickup"
              ? "border-lime-500 bg-lime-50"
              : "border-slate-200 hover:bg-slate-50"
          }`}
        >
          <span className="block text-sm font-extrabold text-slate-850">Store Pickup</span>
          <span className="mt-1 block text-xs font-semibold text-slate-500">
            No location needed. Pay at store when collecting.
          </span>
        </button>
      </div>

      {/* Progress steppers */}
      <div className="flex items-center gap-2 max-w-md">
        <div className="flex-1 flex items-center gap-2">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${stage === "address" ? "bg-brand-600 text-white" : "bg-brand-100 text-brand-700"}`}>
            1
          </div>
          <span className={`text-xs font-bold ${stage === "address" ? "text-gray-800" : "text-gray-400"}`}>Delivery Address</span>
        </div>
        <div className="w-10 h-0.5 bg-gray-250" />
        <div className="flex-1 flex items-center gap-2">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${stage === "payment" ? "bg-brand-600 text-white" : "bg-gray-200 text-gray-400"}`}>
            2
          </div>
          <span className={`text-xs font-bold ${stage === "payment" ? "text-gray-800" : "text-gray-400"}`}>Payment & Place</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Form panel */}
        <div className="md:col-span-2 space-y-6">
          {stage === "address" && fulfillmentMethod === "home" && homeDeliveryAvailable && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
              <h2 className="text-lg font-bold text-gray-800">Delivery Address Details</h2>
              <form onSubmit={handleAddressNext} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={address.fullName}
                      onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                      placeholder="e.g. Amit Kumar"
                      className="w-full bg-slate-50 border border-gray-150 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Mobile Number</label>
                    <input
                      type="tel"
                      maxLength="10"
                      required
                      value={address.phone}
                      onChange={(e) => setAddress({ ...address, phone: e.target.value.replace(/\D/g, "") })}
                      placeholder="10-digit number"
                      className="w-full bg-slate-50 border border-gray-150 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Flat / House No. / Building Name</label>
                    <input
                      type="text"
                      required
                      value={address.flat}
                      onChange={(e) => setAddress({ ...address, flat: e.target.value })}
                      placeholder="Flat 304, Tower B"
                      className="w-full bg-slate-50 border border-gray-150 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Pincode</label>
                    <input
                      type="text"
                      maxLength="6"
                      required
                      value={address.pincode}
                      onChange={(e) => setAddress({ ...address, pincode: e.target.value.replace(/\D/g, "") })}
                      placeholder="e.g. 560001"
                      className="w-full bg-slate-50 border border-gray-150 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Area / Street / Locality</label>
                  <input
                    type="text"
                    required
                    value={address.street}
                    onChange={(e) => setAddress({ ...address, street: e.target.value })}
                    placeholder="Vasanth Nagar, Outer Ring Road"
                    className="w-full bg-slate-50 border border-gray-150 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
                  />
                </div>

                <div className="space-y-3 rounded-2xl border border-lime-100 bg-lime-50/50 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase text-lime-800">Confirm Delivery Location</p>
                      <p className="mt-1 text-xs text-lime-900/75">
                        Use the selected location, detect again, or search manually before placing the order.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {deliveryLocation && (
                        <button
                          type="button"
                          onClick={() => setAddressLocation(deliveryLocation)}
                          className="rounded-xl border border-lime-300 bg-white px-4 py-2 text-xs font-bold text-lime-800 transition hover:bg-lime-100"
                        >
                          Use selected
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={handleUseCurrentLocation}
                        disabled={locationStatus === "loading"}
                        className="rounded-xl bg-lime-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-lime-700 disabled:bg-slate-300"
                      >
                        {locationStatus === "loading" ? "Detecting..." : "Detect again"}
                      </button>
                    </div>
                  </div>
                  {locationError && (
                    <p className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
                      {locationError}
                    </p>
                  )}
                  <DeliveryMapPicker
                    initialLocation={address.location}
                    onConfirm={handleConfirmPinnedLocation}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-1.5 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md transition cursor-pointer"
                >
                  <span>Select Payment Method</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {stage === "payment" && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <h2 className="text-lg font-bold text-gray-800">Select Payment Option</h2>
                <button
                  onClick={() => {
                    if (fulfillmentMethod === "pickup") {
                      chooseHomeDelivery();
                      return;
                    }
                    setStage("address");
                  }}
                  disabled={fulfillmentMethod === "pickup" && !homeDeliveryAvailable}
                  className="text-xs font-bold text-brand-600 hover:underline cursor-pointer"
                >
                  {fulfillmentMethod === "pickup" ? "Choose Delivery" : "Edit Address"}
                </button>
              </div>

              <div className="space-y-4">
                {["Cash on Delivery", "UPI", "Pay at Store"].map((method) => {
                  const requiresHomeDelivery = method !== "Pay at Store";
                  const unavailable = (fulfillmentMethod === "pickup" && method !== "Pay at Store") || (requiresHomeDelivery && !homeDeliveryAvailable) || (method === "UPI" && onlinePaymentAvailable === false);
                  return (
                  <label key={method} className={`flex items-center gap-4 rounded-xl border p-4 transition ${unavailable ? "cursor-not-allowed bg-slate-50 opacity-60" : paymentMethod === method ? "border-green-600 bg-green-50" : "border-slate-200 hover:bg-slate-50"}`}>
                    <input type="radio" disabled={unavailable} checked={paymentMethod === method} onChange={() => { setPaymentMethod(method); setPaymentState("Pending"); setPaymentError(""); }} className="accent-green-600" />
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">{method === "UPI" ? `UPI Payment${unavailable ? " - Unavailable" : ""}` : method}</h3>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {method === "Cash on Delivery" && (homeDeliveryAvailable ? "Pay when your order arrives." : `Available from ₹${homeDeliveryMinValue} cart value.`)}
                        {method === "UPI" && (homeDeliveryAvailable ? "Pay securely through Razorpay using GPay, PhonePe, Paytm, BHIM, or any UPI app." : `Available from ₹${homeDeliveryMinValue} cart value.`)}
                        {method === "Pay at Store" && "Pay at the KiranaMart counter when collecting your order."}
                      </p>
                    </div>
                  </label>
                  );
                })}
              </div>

              {paymentMethod === "UPI" && (
                <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-xs leading-5 text-blue-800">
                  {onlinePaymentAvailable === false
                    ? "Online payment has not been activated by the store owner. Please use Cash on Delivery or Pay at Store."
                    : "KiranaMart never asks for your UPI PIN, card number, CVV, or bank password. Payment opens in Razorpay's secure hosted checkout."}
                </div>
              )}

              {paymentState !== "Pending" && (
                <div className={`rounded-xl border px-4 py-3 text-xs font-bold ${paymentState === "Paid" ? "border-green-200 bg-green-50 text-green-700" : paymentState === "Processing" ? "border-blue-200 bg-blue-50 text-blue-700" : "border-red-200 bg-red-50 text-red-700"}`}>
                  Payment status: {paymentState}
                  {lastAttemptId && <span className="ml-2 font-normal opacity-70">Reference: {lastAttemptId.slice(-8).toUpperCase()}</span>}
                </div>
              )}

              {paymentError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  <p className="font-bold">{paymentError}</p>
                  {paymentMethod === "UPI" && <p className="mt-1 text-xs">Your cart is unchanged. Use Retry Payment below to try again.</p>}
                </div>
              )}

              <button
                onClick={handlePlaceOrder}
                disabled={submitting || (paymentMethod === "UPI" && onlinePaymentAvailable !== true) || (!homeDeliveryAvailable && paymentMethod !== "Pay at Store")}
                className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-brand-500/15 transition cursor-pointer disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {submitting
                  ? paymentMethod === "UPI" ? "Opening Secure Payment..." : "Placing Order..."
                  : paymentMethod === "UPI" && ["Failed", "Cancelled"].includes(paymentState)
                    ? `Retry Payment (₹${grandTotal})`
                    : paymentMethod === "UPI"
                      ? `Pay Now (₹${grandTotal})`
                      : `Place Order (₹${grandTotal})`}
              </button>
            </div>
          )}
        </div>

        {/* Pricing Summary Sidepanel */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
            <h2 className="font-extrabold text-sm text-gray-850 uppercase tracking-wider border-b border-gray-100 pb-2">
              Order Basket
            </h2>

            {/* List of items */}
            <div className="max-h-56 overflow-y-auto pr-1 space-y-3.5">
              {cart.map((item) => (
                <div key={`${item._id}-${item.unit || "piece"}`} className="flex justify-between items-center text-sm gap-2">
                  <div className="min-w-0">
                    <h4 className="font-semibold text-gray-800 text-xs truncate">
                      {item.name}
                    </h4>
                    <span className="text-[10px] text-gray-400">
                      ₹{item.price} x {item.quantity} · {item.unit || "piece"}
                    </span>
                  </div>
                  <span className="font-bold text-gray-800 text-xs flex-shrink-0">
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            {/* Promo coupon form */}
            <div className="border-t border-gray-100 pt-4 space-y-2">
              <label className="block text-[10px] font-bold text-gray-400 uppercase">
                Apply Promo Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. KIRANAFRESH"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 bg-slate-50 border border-gray-150 rounded-xl px-3 py-1.5 text-xs text-gray-800 uppercase focus:outline-none"
                />
                <button
                  onClick={applyCoupon}
                  className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Apply
                </button>
              </div>
              {couponError && <p className="text-[10px] text-red-500 font-semibold">{couponError}</p>}
              {couponApplied && (
                <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Coupon Applied: {couponApplied}</span>
                </p>
              )}
            </div>

            {/* Detailed pricing subtotal breakdown */}
            <div className="border-t border-gray-100 pt-4 space-y-2.5 text-sm">
              <div className="flex justify-between text-gray-500 text-xs">
                <span>Basket Subtotal</span>
                <span className="font-semibold text-gray-850">₹{cartTotal}</span>
              </div>
              
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 text-xs">
                  <span>Coupon Discount</span>
                  <span className="font-bold">-₹{discount}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-500 text-xs">
                <span>Delivery Charge</span>
                <span className="font-semibold text-gray-850">
                  {deliveryFee === 0 ? <span className="text-brand-600 font-bold text-[10px] uppercase">Free</span> : `₹${deliveryFee}`}
                </span>
              </div>

              <div className="flex justify-between text-gray-500 text-xs">
                <span>GST Tax (5%)</span>
                <span className="font-semibold text-gray-850">₹{gstTax}</span>
              </div>

              <div className="flex justify-between items-center border-t border-gray-100 pt-3 text-base font-medium text-gray-900">
                <span className="text-gray-800 font-bold text-sm">Total Payable</span>
                <span className="text-xl font-extrabold text-brand-600">₹{grandTotal}</span>
              </div>
            </div>
          </div>
          
          {/* Coupon Note */}
          <div className="rounded-2xl border border-brand-100 bg-brand-50/50 p-4">
            <span className="text-[10px] font-bold text-brand-700 uppercase tracking-wider block">Available Coupon Codes:</span>
            <p className="text-xs text-brand-800/90 mt-1 leading-relaxed">
              Use code <strong className="font-bold text-brand-900">KIRANAFRESH</strong> to get 15% discount on checkout basket.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
