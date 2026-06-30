import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { RefreshCw, Settings, CheckCircle } from "../../components/Icons";
import { apiUrl } from "../../config/api";

const SETTINGS_API = apiUrl("/api/settings");

function AdminSettings() {
  const { token, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    shopName: "",
    contactPhone: "",
    contactEmail: "",
    deliveryCharge: "",
    minOrderValue: "",
    homeDeliveryMinValue: "",
    address: "",
  });

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await axios.get(SETTINGS_API);
      if (res.data.success && res.data.settings) {
        const s = res.data.settings;
        setFormData({
          shopName: s.shopName || "",
          contactPhone: s.contactPhone || "",
          contactEmail: s.contactEmail || "",
          deliveryCharge: s.deliveryCharge !== undefined ? s.deliveryCharge.toString() : "30",
          minOrderValue: s.minOrderValue !== undefined ? s.minOrderValue.toString() : "100",
          homeDeliveryMinValue: s.homeDeliveryMinValue !== undefined ? s.homeDeliveryMinValue.toString() : "750",
          address: s.address || "",
        });
      }
    } catch (err) {
      console.error("Error loading settings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchSettings();
    }
  }, [isAdmin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const body = {
        ...formData,
        deliveryCharge: Number(formData.deliveryCharge),
        minOrderValue: Number(formData.minOrderValue),
        homeDeliveryMinValue: Number(formData.homeDeliveryMinValue),
      };
      const res = await axios.put(SETTINGS_API, body, { headers });
      if (res.data.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 4000);
      }
    } catch (err) {
      alert("Failed to save settings: " + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-xs text-gray-400 flex flex-col items-center justify-center gap-2">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        <span>Syncing configuration panel...</span>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h2 className="text-xl font-extrabold text-gray-800 flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-700" />
            <span>Store Configuration</span>
          </h2>
          <p className="text-xs text-gray-500 mt-1">Manage public storefront name, order values, delivery fee, and contacts.</p>
        </div>

        <button
          onClick={fetchSettings}
          className="flex items-center gap-1.5 px-4 py-2 bg-white border hover:bg-slate-50 text-gray-700 text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
        >
          <RefreshCw className="w-4 h-4 text-gray-500" />
          <span>Reload Config</span>
        </button>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-4 text-xs font-semibold flex items-center gap-2.5 animate-slide-up">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          <span>✓ Settings saved successfully. Changes are now live on storefront.</span>
        </div>
      )}

      {/* Form Card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Shop Name */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Shop/Store Name</label>
              <input
                type="text"
                required
                value={formData.shopName}
                onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                className="w-full bg-slate-50 border border-gray-250 rounded-xl px-3.5 py-2.5 text-xs text-gray-850 focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-bold"
              />
            </div>

            {/* Shop Contact Phone */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Support Contact Phone</label>
              <input
                type="text"
                required
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                className="w-full bg-slate-50 border border-gray-250 rounded-xl px-3.5 py-2.5 text-xs text-gray-850 focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-medium"
              />
            </div>

            {/* Shop Contact Email */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Support Email Address</label>
              <input
                type="email"
                required
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                className="w-full bg-slate-50 border border-gray-250 rounded-xl px-3.5 py-2.5 text-xs text-gray-850 focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-medium"
              />
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Store Address</label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-slate-50 border border-gray-250 rounded-xl px-3.5 py-2.5 text-xs text-gray-850 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            {/* Delivery charge */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Delivery Charge (₹)</label>
              <input
                type="number"
                required
                min="0"
                value={formData.deliveryCharge}
                onChange={(e) => setFormData({ ...formData, deliveryCharge: e.target.value })}
                className="w-full bg-slate-50 border border-gray-250 rounded-xl px-3.5 py-2.5 text-xs text-gray-850 focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-bold"
              />
            </div>

            {/* Minimum order value */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Minimum Order Value (₹)</label>
              <input
                type="number"
                required
                min="0"
                value={formData.minOrderValue}
                onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                className="w-full bg-slate-50 border border-gray-250 rounded-xl px-3.5 py-2.5 text-xs text-gray-850 focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-bold"
              />
            </div>

            {/* Home delivery minimum */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Home Delivery Minimum (₹)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.homeDeliveryMinValue}
                  onChange={(e) => setFormData({ ...formData, homeDeliveryMinValue: e.target.value })}
                  className="w-full bg-slate-50 border border-gray-250 rounded-xl px-3.5 py-2.5 text-xs text-gray-850 focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-bold"
                />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, homeDeliveryMinValue: "750" })}
                  className="shrink-0 rounded-xl bg-lime-100 px-3 text-xs font-bold text-lime-800 hover:bg-lime-200"
                >
                  ₹750
                </button>
              </div>
              <p className="mt-1 text-[10px] font-semibold text-gray-400">Home delivery is available only when cart value reaches this amount.</p>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition disabled:bg-gray-305"
            >
              {saving ? "Saving Changes..." : "Save Configuration"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminSettings;
