import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { defaultProductImage, getProductImage, handleProductImageError } from "../../utils/productImages";
import { optimizeProductImage, validateProductImage } from "../../utils/imageUpload";
import { groupCategories, sortByCategory } from "../../data/categories";
import { PACK_UNIT_OPTIONS, WEIGHT_UNIT_OPTIONS, getUnitOptions } from "../../data/unitOptions";
import { PlusCircle, Edit, Trash, RefreshCw, Filter, Search } from "../../components/Icons";
import { apiUrl, assetUrl } from "../../config/api";

const PRODUCTS_API = apiUrl("/api/products");

function AdminProducts() {
  const { token, isAdmin } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Modal states
  const [isModalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // 'add' | 'edit'
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [imageError, setImageError] = useState("");

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    description: "",
    price: "",
    discountPercentage: 0,
    category: "",
    stock: "",
    image: "",
    unit: "piece",
    variants: ["piece"],
    type: "Veg",
    lowStockThreshold: 15,
  });
  const unitOptions = getUnitOptions(formData.unit);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(PRODUCTS_API);
      setProducts(sortByCategory(res.data));
    } catch (err) {
      console.error("Error loading products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) return undefined;
    let active = true;

    Promise.all([
      axios.get(PRODUCTS_API),
      axios.get(apiUrl("/api/categories")),
    ]).then(([productsResponse, categoriesResponse]) => {
      if (!active) return;
      setProducts(sortByCategory(productsResponse.data));
      setCategories(sortByCategory(categoriesResponse.data));
      if (categoriesResponse.data.length > 0) {
        setFormData((prev) => prev.category ? prev : { ...prev, category: categoriesResponse.data[0].name });
      }
    }).catch((error) => {
      console.error("Error loading product management data:", error);
    }).finally(() => {
      if (active) setLoading(false);
    });

    return () => { active = false; };
  }, [isAdmin]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validationError = validateProductImage(file);
    if (validationError) {
      setImageError(validationError);
      e.target.value = "";
      return;
    }

    const previousPreview = imagePreview;
    setImageError("");
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);

    setUploadingImage(true);
    try {
      const optimizedFile = await optimizeProductImage(file);
      const uploadData = new FormData();
      uploadData.append("image", optimizedFile);
      const res = await axios.post(`${PRODUCTS_API}/upload`, uploadData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      setFormData((prev) => ({ ...prev, image: res.data.imageUrl }));
      setImagePreview(assetUrl(res.data.imageUrl));
    } catch (err) {
      setImagePreview(previousPreview);
      setImageError(err.response?.data?.message || err.message || "Image upload failed.");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const handleOpenAddModal = () => {
    setModalMode("add");
    setSelectedProduct(null);
    setFormData({
      name: "",
      brand: "",
      description: "",
      price: "",
      discountPercentage: 0,
      category: categories.length > 0 ? categories[0].name : "Fruits & Vegetables",
      stock: "",
      image: "",
      unit: "piece",
      variants: ["piece"],
      type: "Veg",
      lowStockThreshold: 15,
    });
    setImagePreview("");
    setImageError("");
    setModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setModalMode("edit");
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      brand: product.brand || "",
      description: product.description,
      price: product.price,
      discountPercentage: product.discountPercentage || 0,
      category: product.category,
      stock: product.stock,
      image: product.image || "",
      unit: product.unit || "piece",
      variants: product.variants?.length ? product.variants : [product.unit || "piece"],
      type: product.type || "Veg",
      lowStockThreshold: product.lowStockThreshold || 15,
    });
    setImagePreview(getProductImage(product));
    setImageError("");
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const body = {
        ...formData,
        price: Number(formData.price),
        discountPercentage: Number(formData.discountPercentage || 0),
        stock: Number(formData.stock),
        lowStockThreshold: Number(formData.lowStockThreshold),
        variants: formData.variants?.length ? formData.variants : [formData.unit || "piece"],
      };

      if (modalMode === "add") {
        await axios.post(PRODUCTS_API, body, { headers });
      } else {
        await axios.put(`${PRODUCTS_API}/${selectedProduct._id}`, body, { headers });
      }
      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      alert("Error saving product: " + (err.response?.data?.message || err.message));
    }
  };

  const setVariantGroup = (variants) => {
    setFormData({ ...formData, variants, unit: variants[0] || formData.unit || "piece" });
  };

  const toggleVariant = (variant) => {
    const currentVariants = formData.variants || [];
    const nextVariants = currentVariants.includes(variant)
      ? currentVariants.filter((item) => item !== variant)
      : [...currentVariants, variant];
    setFormData({
      ...formData,
      variants: nextVariants,
      unit: nextVariants[0] || formData.unit || "piece",
    });
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(`${PRODUCTS_API}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchProducts();
      } catch (err) {
        alert("Error deleting product: " + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleSeedDatabase = async () => {
    if (window.confirm("This will clear existing items and seed mock products. Proceed?")) {
      try {
        setLoading(true);
        await axios.post(`${PRODUCTS_API}/seed`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchProducts();
      } catch (err) {
        alert("Error seeding database: " + (err.response?.data?.message || err.message));
      }
    }
  };

  // Filter Catalog
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "All" || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Top Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h2 className="text-xl font-extrabold text-gray-800">Catalog Registry</h2>
          <p className="text-xs text-gray-500 mt-1">Manage catalog listings, pricing, units, and categories.</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSeedDatabase}
            className="flex items-center gap-1.5 px-4 py-2 border border-brand-200 bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-brand-650 animate-spin-hover" />
            <span>Seed Standard Catalog</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Filters & Searching */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
        <div className="relative w-full md:max-w-md">
          <input
            type="text"
            placeholder="Search products by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/25"
          />
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-xs text-gray-500 font-semibold">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none cursor-pointer"
          >
            <option value="All">All Categories</option>
            {groupCategories(categories).map((group) => (
              <optgroup key={group.name} label={group.name}>
                {group.categories.map((c) => (
                  <option key={c._id || c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      </div>

      {/* Catalog Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-gray-400 flex flex-col items-center justify-center gap-2">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
            <span>Loading product list...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400 space-y-2">
            <p>No products found matching filters.</p>
            <button
              onClick={handleOpenAddModal}
              className="text-brand-650 font-bold text-xs hover:underline cursor-pointer"
            >
              Add a product now &rarr;
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-gray-650">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-100 text-gray-400 font-bold text-[10px] uppercase tracking-wider">
                  <th className="py-4 px-6">Image</th>
                  <th className="py-4 px-6">Product Info</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Price</th>
                  <th className="py-4 px-6">Unit / Type</th>
                  <th className="py-4 px-6">Stock</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/50 transition">
                    <td className="py-4 px-6">
                      <div className="w-12 h-12 rounded-xl bg-slate-50 border flex items-center justify-center overflow-hidden">
                        <img
                          src={getProductImage(p)}
                          alt={p.name}
                          className="w-full h-full object-cover"
                          onError={(event) => handleProductImageError(event, p)}
                        />
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-bold text-gray-800 text-sm">{p.name}</p>
                      <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{p.description}</p>
                    </td>
                    <td className="py-4 px-6 text-xs font-semibold text-gray-500">{p.category}</td>
                    <td className="py-4 px-6 font-extrabold text-gray-800 text-sm">₹{p.price}</td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-700">{p.unit}</span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded mt-0.5 w-fit border ${
                            p.type === "Veg"
                              ? "bg-green-50 text-green-700 border-green-100"
                              : p.type === "Non-Veg"
                              ? "bg-red-50 text-red-700 border-red-100"
                              : "bg-slate-100 text-slate-700 border-slate-200"
                          }`}
                        >
                          {p.type}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {p.stock === 0 ? (
                        <span className="px-2 py-0.5 rounded-md bg-red-50 text-red-600 text-[10px] font-bold border border-red-100">
                          Out of Stock
                        </span>
                      ) : p.stock <= p.lowStockThreshold ? (
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-600 text-[10px] font-bold border border-amber-100 animate-pulse">
                          Low: {p.stock}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 text-[10px] font-bold border border-brand-100">
                          In Stock: {p.stock}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right space-x-3">
                      <button
                        onClick={() => handleOpenEditModal(p)}
                        className="text-gray-400 hover:text-brand-600 transition cursor-pointer inline-block"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p._id)}
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

      {/* CRUD Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setModalOpen(false)} />
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 max-w-md w-full relative z-10 animate-slide-up space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-extrabold text-gray-800">
              {modalMode === "add" ? "Add Store Product" : "Edit Catalog Item"}
            </h3>

            <form onSubmit={handleFormSubmit} className="space-y-3.5">
              {/* Product Name */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Organic Alphonso Mangoes"
                  className="w-full bg-slate-50 border border-gray-250 rounded-xl px-3.5 py-2 text-xs text-gray-850 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Brand</label>
                <input
                  type="text"
                  required
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  placeholder="e.g. Amul, Tata, Britannia"
                  className="w-full bg-slate-50 border border-gray-250 rounded-xl px-3.5 py-2 text-xs text-gray-850 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-slate-50 border border-gray-250 rounded-xl px-3 py-2 text-xs text-gray-750 focus:outline-none cursor-pointer"
                >
                  {groupCategories(categories).map((group) => (
                    <optgroup key={group.name} label={group.name}>
                      {group.categories.map((c) => (
                        <option key={c._id || c.name} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              {/* Price & Stock */}
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="MRP"
                    className="w-full bg-slate-50 border border-gray-250 rounded-xl px-3.5 py-2 text-xs text-gray-850 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Discount (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="90"
                    value={formData.discountPercentage}
                    onChange={(e) => setFormData({ ...formData, discountPercentage: e.target.value })}
                    placeholder="0"
                    className="w-full bg-slate-50 border border-gray-250 rounded-xl px-3.5 py-2 text-xs text-gray-850 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Stock Level</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="In-stock qty"
                    className="w-full bg-slate-50 border border-gray-250 rounded-xl px-3.5 py-2 text-xs text-gray-850 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>

              {/* Unit, Type & Low Stock Threshold */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Default Variant</label>
                  <select
                    required
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full bg-slate-50 border border-gray-250 rounded-xl px-3 py-2 text-xs text-gray-850 focus:outline-none focus:ring-2 focus:ring-brand-500/20 cursor-pointer"
                  >
                    {unitOptions.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-slate-50 border border-gray-250 rounded-xl px-3 py-2 text-xs text-gray-750 focus:outline-none cursor-pointer"
                  >
                    <option value="Veg">Veg</option>
                    <option value="Non-Veg">Non-Veg</option>
                    <option value="Egg">Egg</option>
                    <option value="Household">Household</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Low Stock</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.lowStockThreshold}
                    onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                    placeholder="15"
                    className="w-full bg-slate-50 border border-gray-250 rounded-xl px-3 py-2 text-xs text-gray-850 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-lime-100 bg-lime-50/30 p-3">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Customer Variants</label>
                    <p className="mt-1 text-[10px] font-semibold text-gray-500">Choose what customers can select for this product.</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => setVariantGroup(WEIGHT_UNIT_OPTIONS)} className="rounded-lg bg-white px-3 py-1.5 text-[10px] font-bold text-lime-800 shadow-sm hover:bg-lime-100">Weight</button>
                    <button type="button" onClick={() => setVariantGroup(PACK_UNIT_OPTIONS)} className="rounded-lg bg-white px-3 py-1.5 text-[10px] font-bold text-lime-800 shadow-sm hover:bg-lime-100">Pack</button>
                    <button type="button" onClick={() => setVariantGroup(["piece"])} className="rounded-lg bg-white px-3 py-1.5 text-[10px] font-bold text-lime-800 shadow-sm hover:bg-lime-100">Single</button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {unitOptions.map((unit) => (
                    <label key={unit} className="flex items-center gap-1.5 rounded-xl border border-lime-100 bg-white px-2 py-2 text-[11px] font-bold text-slate-700">
                      <input
                        type="checkbox"
                        checked={(formData.variants || []).includes(unit)}
                        onChange={() => toggleVariant(unit)}
                        className="accent-lime-600"
                      />
                      <span>{unit}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Image Upload Support */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Product Image</label>
                <div className="flex items-start gap-3.5">
                  <div className="w-24 h-24 bg-slate-50 border rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0">
                    <img
                      src={imagePreview || getProductImage(formData)}
                      alt="Product preview"
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.onerror = null; e.target.src = defaultProductImage; }}
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="upload-image-input"
                      disabled={uploadingImage}
                    />
                    <label
                      htmlFor="upload-image-input"
                      className="px-4 py-2 border border-gray-300 hover:bg-slate-50 text-gray-700 text-xs font-bold rounded-xl cursor-pointer inline-block transition"
                    >
                      {uploadingImage ? "Optimizing & uploading..." : formData.image ? "Replace Image" : "Upload Image"}
                    </label>
                    <p className="mt-2 text-[10px] leading-4 text-gray-400">JPG, PNG, or WEBP. Maximum 2MB. Large images are resized before upload.</p>
                    {(formData.image || imagePreview) && <button type="button" onClick={() => { setFormData({ ...formData, image: "" }); setImagePreview(""); setImageError(""); }} className="mt-1 text-[10px] font-bold text-red-600 hover:underline">Remove image</button>}
                  </div>
                </div>
                {imageError && <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-[10px] font-semibold text-red-700" role="alert">{imageError}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Description</label>
                <textarea
                  rows="2"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Summarize product features..."
                  className="w-full bg-slate-50 border border-gray-250 rounded-xl px-3.5 py-2 text-xs text-gray-850 focus:outline-none focus:ring-2 focus:ring-brand-500/20 resize-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 hover:bg-slate-50 text-gray-500 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingImage}
                  className="px-5 py-2 bg-brand-650 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminProducts;
