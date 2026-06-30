import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { PlusCircle, Edit, Trash, RefreshCw } from "../../components/Icons";
import { sortByCategory } from "../../data/categories";
import { apiUrl } from "../../config/api";

const CATEGORIES_API = apiUrl("/api/categories");

function AdminCategories() {
  const { token, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal control states
  const [isModalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // 'add' | 'edit'
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await axios.get(CATEGORIES_API);
      setCategories(sortByCategory(res.data));
    } catch (err) {
      console.error("Error loading categories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      const timeout = setTimeout(fetchCategories, 0);
      return () => clearTimeout(timeout);
    }
  }, [isAdmin]);

  const handleOpenAddModal = () => {
    setModalMode("add");
    setFormData({ name: "", description: "" });
    setModalOpen(true);
  };

  const handleOpenEditModal = (category) => {
    setModalMode("edit");
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
    });
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const headers = { Authorization: `Bearer ${token}` };
      if (modalMode === "add") {
        await axios.post(CATEGORIES_API, formData, { headers });
      } else {
        await axios.put(`${CATEGORIES_API}/${selectedCategory._id}`, formData, { headers });
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
        navigate("/login", { replace: true });
        return;
      }
      alert("Error saving category: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await axios.delete(`${CATEGORIES_API}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchCategories();
      } catch (err) {
        if (err.response?.status === 401) {
          logout();
          navigate("/login", { replace: true });
          return;
        }
        alert("Error deleting category: " + (err.response?.data?.message || err.message));
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h2 className="text-xl font-extrabold text-gray-800">Product Categories</h2>
          <p className="text-xs text-gray-500 mt-1">Manage grocery categories, organize filters, and customize catalogs.</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={fetchCategories}
            className="flex items-center gap-1.5 px-4 py-2 bg-white border hover:bg-slate-50 text-gray-700 text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-gray-500" />
            <span>Sync Categories</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* Category List Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-gray-400 flex flex-col items-center justify-center gap-2">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
            <span>Fetching categories...</span>
          </div>
        ) : categories.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400 space-y-2">
            <p>No categories found in registry.</p>
            <button
              onClick={handleOpenAddModal}
              className="text-brand-650 font-bold text-xs hover:underline cursor-pointer"
            >
              Add a category now &rarr;
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-gray-650">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-100 text-gray-400 font-bold text-[10px] uppercase tracking-wider">
                  <th className="py-4 px-6 w-1/3">Category Name</th>
                  <th className="py-4 px-6 w-1/2">Description</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {categories.map((cat) => (
                  <tr key={cat._id} className="hover:bg-slate-50/50 transition">
                    <td className="py-4 px-6">
                      <span className="font-bold text-gray-800 text-sm">{cat.name}</span>
                    </td>
                    <td className="py-4 px-6 text-xs text-gray-500 font-medium leading-relaxed">
                      {cat.description}
                    </td>
                    <td className="py-4 px-6 text-right space-x-3">
                      <button
                        onClick={() => handleOpenEditModal(cat)}
                        className="text-gray-400 hover:text-brand-600 transition cursor-pointer inline-block"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat._id)}
                        className="text-gray-400 hover:text-red-650 transition cursor-pointer inline-block"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CRUD Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setModalOpen(false)} />
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 max-w-md w-full relative z-10 animate-slide-up space-y-4">
            <h3 className="text-base font-extrabold text-gray-800">
              {modalMode === "add" ? "Add New Category" : "Edit Category Item"}
            </h3>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Staples & Spices"
                  className="w-full bg-slate-50 border border-gray-250 rounded-xl px-3.5 py-2.5 text-xs text-gray-850 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Description</label>
                <textarea
                  rows="3"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Flour, rice, lentils, spices, oils, and other essential items."
                  className="w-full bg-slate-50 border border-gray-250 rounded-xl px-3.5 py-2.5 text-xs text-gray-850 focus:outline-none focus:ring-2 focus:ring-brand-500/20 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 hover:bg-slate-50 text-gray-500 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-650 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminCategories;
