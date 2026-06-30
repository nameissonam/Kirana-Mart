import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { PlusCircle, Trash, ShoppingCart, User, MapPin } from "../../components/Icons";
import { apiUrl } from "../../config/api";

const CUSTOMERS_API = apiUrl("/api/customers");
const PRODUCTS_API = apiUrl("/api/products");
const MANUAL_ORDER_API = apiUrl("/api/orders/manual");
const SETTINGS_API = apiUrl("/api/settings");

function AdminManualOrder() {
  const { token, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [deliveryCharge, setDeliveryCharge] = useState(30);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form selections
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [cartItems, setCartItems] = useState([]); // Array of { productObj, quantity }
  const [deliveryType, setDeliveryType] = useState("Home Delivery"); // 'Home Delivery' | 'Store Pickup'
  const [paymentMethod, setPaymentMethod] = useState("COD"); // 'COD' | 'Pay at Store' | 'Online'
  const [deliveryAddress, setDeliveryAddress] = useState({
    fullName: "",
    phone: "",
    flat: "",
    street: "",
    pincode: "",
    city: "Bengaluru",
  });

  // Temp selector states
  const [tempProductId, setTempProductId] = useState("");
  const [tempQuantity, setTempQuantity] = useState(1);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      
      // Fetch customers, products, settings
      const [custRes, prodRes, setRes] = await Promise.all([
        axios.get(CUSTOMERS_API, { headers }),
        axios.get(PRODUCTS_API),
        axios.get(SETTINGS_API),
      ]);

      if (custRes.data.success) {
        setCustomers(custRes.data.customers || []);
      }
      setProducts(prodRes.data || []);
      if (setRes.data.success && setRes.data.settings) {
        setDeliveryCharge(setRes.data.settings.deliveryCharge || 30);
      }
    } catch (err) {
      console.error("Error loading manual order catalog:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin && token) {
      fetchInitialData();
    }
  }, [isAdmin, token]);

  // Autofill customer address if selected
  const handleCustomerChange = (e) => {
    const custId = e.target.value;
    setSelectedCustomerId(custId);

    const customerObj = customers.find((c) => c._id === custId);
    if (customerObj && customerObj.addresses && customerObj.addresses.length > 0) {
      const addr = customerObj.addresses[0];
      setDeliveryAddress({
        fullName: addr.fullName || customerObj.name,
        phone: addr.phone || "",
        flat: addr.flat || "",
        street: addr.street || "",
        pincode: addr.pincode || "",
        city: addr.city || "Bengaluru",
      });
    } else if (customerObj) {
      setDeliveryAddress({
        fullName: customerObj.name,
        phone: "",
        flat: "",
        street: "",
        pincode: "",
        city: "Bengaluru",
      });
    }
  };

  const handleAddItem = () => {
    if (!tempProductId) return;

    const productObj = products.find((p) => p._id === tempProductId);
    if (!productObj) return;

    // Check if product is already in manual cart
    const exists = cartItems.find((item) => item.productObj._id === tempProductId);
    if (exists) {
      const updatedQty = exists.quantity + Number(tempQuantity);
      if (updatedQty > productObj.stock) {
        alert(`Warning: Requested quantity (${updatedQty}) exceeds available stock (${productObj.stock}).`);
      }
      setCartItems((prev) =>
        prev.map((item) =>
          item.productObj._id === tempProductId ? { ...item, quantity: updatedQty } : item
        )
      );
    } else {
      if (Number(tempQuantity) > productObj.stock) {
        alert(`Warning: Requested quantity (${tempQuantity}) exceeds available stock (${productObj.stock}).`);
      }
      setCartItems((prev) => [...prev, { productObj, quantity: Number(tempQuantity) }]);
    }

    setTempProductId("");
    setTempQuantity(1);
  };

  const handleRemoveItem = (index) => {
    setCartItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Computations
  const subTotal = cartItems.reduce((sum, item) => sum + item.productObj.price * item.quantity, 0);
  const finalTotal = subTotal + (deliveryType === "Home Delivery" ? deliveryCharge : 0);

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      alert("Please select a customer.");
      return;
    }
    if (cartItems.length === 0) {
      alert("Please add at least one product to the basket.");
      return;
    }

    setSubmitting(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const body = {
        customerId: selectedCustomerId,
        items: cartItems.map((item) => ({
          product: item.productObj._id,
          name: item.productObj.name,
          price: item.productObj.price,
          quantity: item.quantity,
        })),
        deliveryType,
        paymentMethod,
        totalAmount: finalTotal,
        deliveryAddress: deliveryType === "Home Delivery" ? deliveryAddress : undefined,
      };

      const res = await axios.post(MANUAL_ORDER_API, body, { headers });
      if (res.data.success) {
        alert("✓ Manual order registered successfully.");
        navigate("/admin/orders");
      }
    } catch (err) {
      alert("Failed to submit manual order: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-xs text-gray-400 flex flex-col items-center justify-center gap-2">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        <span>Syncing customer & product catalogs...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="border-b border-gray-200 pb-5">
        <h2 className="text-xl font-extrabold text-gray-800 flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-brand-650" />
          <span>Manual Order Entry</span>
        </h2>
        <p className="text-xs text-gray-500 mt-1">Book orders manually for walk-in clients, phone calls, or guest buyers.</p>
      </div>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form Settings (2/3 width) */}
        <div className="lg:col-span-2 space-y-5">
          {/* Customer Selection */}
          <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-xs space-y-3.5">
            <h3 className="font-bold text-sm text-gray-800 flex items-center gap-2">
              <User className="w-4 h-4 text-brand-650" />
              <span>Customer Identification</span>
            </h3>
            
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Select Customer</label>
              <select
                required
                value={selectedCustomerId}
                onChange={handleCustomerChange}
                className="w-full bg-slate-50 border border-gray-250 rounded-xl px-3 py-2.5 text-xs text-gray-850 focus:outline-none cursor-pointer font-bold"
              >
                <option value="">-- Choose from Directory --</option>
                {customers.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} ({c.email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Add Products to Order */}
          <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-gray-800 flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-brand-650" />
              <span>Select Products</span>
            </h3>

            {/* Select product controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Product</label>
                <select
                  value={tempProductId}
                  onChange={(e) => setTempProductId(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-205 rounded-xl px-3 py-2.5 text-xs text-gray-850 focus:outline-none cursor-pointer"
                >
                  <option value="">-- Select Catalog Item --</option>
                  {products.map((p) => (
                    <option key={p._id} value={p._id} disabled={p.stock === 0}>
                      {p.name} - ₹{p.price} ({p.stock > 0 ? `${p.stock} in stock` : "Out of stock"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                <div className="w-20">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Qty</label>
                  <input
                    type="number"
                    min="1"
                    value={tempQuantity}
                    onChange={(e) => setTempQuantity(e.target.value)}
                    className="w-full bg-slate-50 border border-gray-205 rounded-xl px-3 py-2 text-xs text-center text-gray-850 focus:outline-none font-bold"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddItem}
                  className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer h-9.5"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Selected items table list */}
            {cartItems.length > 0 && (
              <div className="border border-gray-100 rounded-2xl overflow-hidden divide-y divide-gray-50">
                {cartItems.map((item, index) => (
                  <div key={item.productObj._id} className="p-3 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-gray-800">{item.productObj.name}</p>
                      <p className="text-gray-400 mt-0.5">₹{item.productObj.price} x {item.quantity}</p>
                    </div>
                    <div className="flex items-center gap-3.5">
                      <span className="font-extrabold text-gray-850 text-sm">₹{item.productObj.price * item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="text-gray-400 hover:text-red-650 transition cursor-pointer"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Delivery & Payment Details */}
          <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-gray-800 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-650" />
              <span>Fulfilment & Payments</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Delivery Type */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Delivery Option</label>
                <select
                  value={deliveryType}
                  onChange={(e) => setDeliveryType(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-205 rounded-xl px-3 py-2.5 text-xs text-gray-850 focus:outline-none cursor-pointer"
                >
                  <option value="Home Delivery">Home Delivery</option>
                  <option value="Store Pickup">Store Pickup</option>
                </select>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-205 rounded-xl px-3 py-2.5 text-xs text-gray-850 focus:outline-none cursor-pointer"
                >
                  <option value="COD">Cash on Delivery (COD)</option>
                  <option value="Pay at Store">Pay at Store</option>
                  <option value="Online">Online Payment</option>
                </select>
              </div>
            </div>

            {/* Address fields - Only show if Home Delivery */}
            {deliveryType === "Home Delivery" && (
              <div className="border-t pt-4 space-y-3.5">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Delivery Address details</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[9px] font-bold text-gray-450 uppercase mb-0.5">Recipient Name</label>
                    <input
                      type="text"
                      required
                      value={deliveryAddress.fullName}
                      onChange={(e) => setDeliveryAddress({ ...deliveryAddress, fullName: e.target.value })}
                      placeholder="Full Name"
                      className="w-full bg-slate-50 border border-gray-205 rounded-xl px-3 py-2 text-xs text-gray-850 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-gray-450 uppercase mb-0.5">Contact Phone</label>
                    <input
                      type="text"
                      required
                      value={deliveryAddress.phone}
                      onChange={(e) => setDeliveryAddress({ ...deliveryAddress, phone: e.target.value })}
                      placeholder="Phone number"
                      className="w-full bg-slate-50 border border-gray-205 rounded-xl px-3 py-2 text-xs text-gray-850 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[9px] font-bold text-gray-450 uppercase mb-0.5">Flat / House / Suite</label>
                    <input
                      type="text"
                      required
                      value={deliveryAddress.flat}
                      onChange={(e) => setDeliveryAddress({ ...deliveryAddress, flat: e.target.value })}
                      placeholder="Flat No, Apartment, Floor"
                      className="w-full bg-slate-50 border border-gray-205 rounded-xl px-3 py-2 text-xs text-gray-850 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[9px] font-bold text-gray-450 uppercase mb-0.5">Street Address</label>
                    <input
                      type="text"
                      required
                      value={deliveryAddress.street}
                      onChange={(e) => setDeliveryAddress({ ...deliveryAddress, street: e.target.value })}
                      placeholder="Street, Locality"
                      className="w-full bg-slate-50 border border-gray-205 rounded-xl px-3 py-2 text-xs text-gray-850 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-gray-450 uppercase mb-0.5">Pincode</label>
                    <input
                      type="text"
                      required
                      value={deliveryAddress.pincode}
                      onChange={(e) => setDeliveryAddress({ ...deliveryAddress, pincode: e.target.value })}
                      placeholder="6-digit ZIP code"
                      className="w-full bg-slate-50 border border-gray-205 rounded-xl px-3 py-2 text-xs text-gray-850 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-gray-450 uppercase mb-0.5">City</label>
                    <input
                      type="text"
                      required
                      value={deliveryAddress.city}
                      onChange={(e) => setDeliveryAddress({ ...deliveryAddress, city: e.target.value })}
                      placeholder="City"
                      className="w-full bg-slate-50 border border-gray-205 rounded-xl px-3 py-2 text-xs text-gray-850 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Cost Summary Card (1/3 width) */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-md h-fit space-y-5 sticky top-20">
          <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-300">Order Summary</h3>

          <div className="space-y-3.5 text-xs">
            {cartItems.map((item) => (
              <div key={item.productObj._id} className="flex justify-between items-baseline">
                <span className="text-slate-400 font-medium truncate max-w-[120px]">{item.productObj.name}</span>
                <span className="text-slate-400 font-mono">x{item.quantity}</span>
                <span className="font-bold">₹{item.productObj.price * item.quantity}</span>
              </div>
            ))}

            {cartItems.length === 0 && (
              <p className="text-slate-500 italic py-2">No items selected.</p>
            )}

            <div className="border-t border-slate-800 my-4 pt-4 space-y-2.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Items Total:</span>
                <span className="font-bold">₹{subTotal}</span>
              </div>
              
              {deliveryType === "Home Delivery" && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Delivery Charge:</span>
                  <span className="font-bold">₹{deliveryCharge}</span>
                </div>
              )}
            </div>

            <div className="border-t border-dashed border-slate-700 pt-4 flex justify-between items-baseline">
              <span className="text-sm font-bold">Total Invoice:</span>
              <span className="text-2xl font-black text-brand-400">₹{finalTotal}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || !selectedCustomerId || cartItems.length === 0}
            className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-black text-xs rounded-xl shadow-md transition disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none cursor-pointer disabled:cursor-not-allowed"
          >
            {submitting ? "Booking Order..." : "Confirm & Place Order"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AdminManualOrder;
