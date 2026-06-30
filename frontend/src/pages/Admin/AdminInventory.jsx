import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { Edit, RefreshCw, AlertTriangle } from "../../components/Icons";
import { getProductImage } from "../../utils/productImages";
import { sortByCategory } from "../../data/categories";
import { apiUrl } from "../../config/api";

const PRODUCTS_API = apiUrl("/api/products");

function AdminInventory() {
  const { token, isAdmin } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All"); // 'All' | 'Low' | 'Out'
  const [editingStockId, setEditingStockId] = useState(null);
  const [tempStockValue, setTempStockValue] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(PRODUCTS_API);
      setProducts(sortByCategory(res.data));
    } catch (err) {
      console.error("Error loading inventory:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchProducts();
    }
  }, [isAdmin]);

  const handleStartEditing = (product) => {
    setEditingStockId(product._id);
    setTempStockValue(product.stock.toString());
  };

  const handleCancelEditing = () => {
    setEditingStockId(null);
    setTempStockValue("");
  };

  const handleSaveStock = async (product) => {
    const newStock = Number(tempStockValue);
    if (isNaN(newStock) || newStock < 0) {
      alert("Please enter a valid non-negative number.");
      return;
    }

    setUpdatingId(product._id);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      // Send PUT request to update product stock
      const updatedProduct = {
        ...product,
        stock: newStock,
      };
      await axios.put(`${PRODUCTS_API}/${product._id}`, updatedProduct, { headers });
      setEditingStockId(null);
      fetchProducts();
    } catch (err) {
      alert("Failed to update stock: " + (err.response?.data?.message || err.message));
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter logic
  const filteredProducts = products.filter((p) => {
    if (filter === "Out") return p.stock === 0;
    if (filter === "Low") return p.stock > 0 && p.stock <= p.lowStockThreshold;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h2 className="text-xl font-extrabold text-gray-800">Inventory Status</h2>
          <p className="text-xs text-gray-500 mt-1">Audit warehouse reserves, adjust quantities inline, and handle alerts.</p>
        </div>

        <button
          onClick={fetchProducts}
          className="flex items-center gap-1.5 px-4 py-2 bg-white border hover:bg-slate-50 text-gray-700 text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
        >
          <RefreshCw className="w-4 h-4 text-gray-500" />
          <span>Refresh Stock</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setFilter("All")}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            filter === "All" ? "bg-white text-gray-800 shadow-xs" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          All Items ({products.length})
        </button>
        <button
          onClick={() => setFilter("Low")}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            filter === "Low"
              ? "bg-amber-500 text-white shadow-xs"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Low Stock ({products.filter((p) => p.stock > 0 && p.stock <= p.lowStockThreshold).length})
        </button>
        <button
          onClick={() => setFilter("Out")}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            filter === "Out"
              ? "bg-red-500 text-white shadow-xs"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Out of Stock ({products.filter((p) => p.stock === 0).length})
        </button>
      </div>

      {/* Inventory List */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-gray-400 flex flex-col items-center justify-center gap-2">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
            <span>Syncing warehouse...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400">No items found matching the selected stock status.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-gray-650">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-100 text-gray-400 font-bold text-[10px] uppercase tracking-wider">
                  <th className="py-4 px-6">Product</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Type & Unit</th>
                  <th className="py-4 px-6">Alert Limit</th>
                  <th className="py-4 px-6">Stock Status</th>
                  <th className="py-4 px-6">Current Stock</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((p) => {
                  const isLow = p.stock > 0 && p.stock <= p.lowStockThreshold;
                  const isOut = p.stock === 0;
                  const isEditing = editingStockId === p._id;

                  return (
                    <tr key={p._id} className={`hover:bg-slate-50/30 transition ${isOut ? "bg-red-50/10" : isLow ? "bg-amber-50/10" : ""}`}>
                      {/* Product Name */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3"><img src={getProductImage(p)} alt="" className="h-10 w-10 rounded-lg object-cover" /><span className="font-bold text-gray-800 text-sm">{p.name}</span></div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-6 text-xs font-semibold text-gray-500">{p.category}</td>

                      {/* Unit / Type */}
                      <td className="py-4 px-6">
                        <div className="text-xs">
                          <span className="font-bold text-gray-750">{p.unit}</span>
                          <span className="text-gray-400 ml-1.5 font-medium">({p.type})</span>
                        </div>
                      </td>

                      {/* Low Stock Limit */}
                      <td className="py-4 px-6 text-xs text-gray-500 font-semibold">{p.lowStockThreshold} units</td>

                      {/* Status Indicator */}
                      <td className="py-4 px-6">
                        {isOut ? (
                          <span className="px-2 py-0.5 rounded-md bg-red-50 text-red-600 text-[10px] font-bold border border-red-100 flex items-center gap-1 w-fit">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-650"></span>
                            <span>Out of Stock</span>
                          </span>
                        ) : isLow ? (
                          <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-600 text-[10px] font-bold border border-amber-100 flex items-center gap-1 w-fit animate-pulse">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                            <span>Low Stock Alert</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-green-50 text-green-700 text-[10px] font-bold border border-green-150 flex items-center gap-1 w-fit">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
                            <span>Sufficient</span>
                          </span>
                        )}
                      </td>

                      {/* Current Stock */}
                      <td className="py-4 px-6">
                        {isEditing ? (
                          <input
                            type="number"
                            min="0"
                            value={tempStockValue}
                            onChange={(e) => setTempStockValue(e.target.value)}
                            disabled={updatingId === p._id}
                            className="bg-slate-50 border border-gray-300 rounded-lg px-2 py-1 text-xs w-20 focus:outline-none focus:ring-1 focus:ring-brand-500 font-bold"
                          />
                        ) : (
                          <span className="font-extrabold text-gray-800 text-sm">{p.stock}</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        {isEditing ? (
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={handleCancelEditing}
                              disabled={updatingId === p._id}
                              className="px-2.5 py-1 border border-gray-200 hover:bg-slate-50 text-gray-500 text-xs font-bold rounded-lg transition cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSaveStock(p)}
                              disabled={updatingId === p._id}
                              className="px-2.5 py-1 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg transition cursor-pointer shadow-xs disabled:bg-gray-300"
                            >
                              {updatingId === p._id ? "Saving..." : "Save"}
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleStartEditing(p)}
                            className="text-gray-400 hover:text-brand-600 transition cursor-pointer inline-flex items-center gap-1 text-xs font-bold"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>Edit Stock</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminInventory;
