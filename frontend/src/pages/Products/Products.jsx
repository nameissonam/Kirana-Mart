import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getProducts } from "../../services/productService";
import ProductCard from "../../components/ProductCard";
import AuthRequiredModal from "../../components/AuthRequiredModal";
import { Filter, Search, Star, ShieldCheck } from "../../components/Icons";
import BackButton from "../../components/BackButton";
import { catalogGroups, matchesCategory, sortByCategory } from "../../data/categories";

function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get("category")?.split(",").filter(Boolean)[0] || "";
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Filter & Sort States
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [maxPrice, setMaxPrice] = useState(500);
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "featured");

  // Sync state with URL params
  useEffect(() => {
    const categoryFromUrl = searchParams.get("category")?.split(",").filter(Boolean)[0] || "";
    setSearchQuery(searchParams.get("search") || "");
    setSelectedCategory(categoryFromUrl);
    setSortBy(searchParams.get("sort") || "featured");

    if (searchParams.get("category")?.includes(",")) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.set("category", categoryFromUrl);
      setSearchParams(nextParams, { replace: true });
    }
  }, [searchParams]);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
        setLoadError("");
      } catch (error) {
        console.error("Error loading products:", error);
        setProducts([]);
        setLoadError("Products could not be loaded from the server. Please check the backend and MongoDB connection.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Filter and Sort Logic
  useEffect(() => {
    let result = [...products];

    // Filter by Search Query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
      );
    }

    // Filter by Category
    if (selectedCategory) {
      result = result.filter((p) => matchesCategory(p.category, selectedCategory));
    }

    // Filter by Price
    result = result.filter((p) => p.price <= maxPrice);

    // Filter by Stock
    if (onlyInStock) {
      result = result.filter((p) => p.stock > 0);
    }

    // Sort Logic
    if (sortBy === "price-low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "best-sellers") {
      result.sort((a, b) => (b.salesRank || 0) - (a.salesRank || 0));
    } else if (sortBy === "stock-level") {
      result.sort((a, b) => b.stock - a.stock);
    } else if (sortBy === "name-asc") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    setFilteredProducts(sortBy === "featured" ? sortByCategory(result) : result);
  }, [products, searchQuery, selectedCategory, maxPrice, onlyInStock, sortBy]);

  const handleClearFilters = () => {
    setSearchParams({});
    setSearchQuery("");
    setSelectedCategory("");
    setMaxPrice(500);
    setOnlyInStock(false);
    setSortBy("featured");
  };

  const handleCategoryChange = (cat) => {
    const nextParams = new URLSearchParams(searchParams);
    if (cat === "All") {
      nextParams.delete("category");
      setSelectedCategory("");
    } else {
      setSelectedCategory(cat);
      nextParams.set("category", cat);
    }
    setSearchParams(nextParams);
  };

  const removeSelectedCategory = () => {
    const nextParams = new URLSearchParams(searchParams);
    setSelectedCategory("");
    nextParams.delete("category");
    setSearchParams(nextParams);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      
      <AuthRequiredModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      <div className="flex items-center gap-3"><BackButton /><span className="text-sm font-bold text-slate-800">Kirana<span className="text-green-600">Mart</span></span></div>
      {/* Search Header for Mobile */}
      <div className="md:hidden w-full relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search items..."
          className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
        />
        <Search className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-gray-400" />
      </div>

      <div className="rounded-3xl bg-white p-4 shadow-sm sm:p-5">
        <h1 className="text-xl font-black text-slate-900 sm:text-2xl">All groceries</h1>
        <p className="mt-1 text-sm font-semibold text-slate-500">Search and filter daily essentials for quick local delivery.</p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
          <span className="inline-flex items-center gap-1 rounded-lg bg-lime-50 px-2 py-1 text-lime-700"><Star className="h-3 w-3 fill-lime-700" /> Fresh picks</span>
          <span className="inline-flex items-center gap-1 rounded-lg bg-lime-50 px-2 py-1 text-lime-700"><ShieldCheck className="h-3 w-3" /> Secure checkout</span>
          <span className="rounded-lg bg-yellow-50 px-2 py-1 text-yellow-700">Quick local delivery</span>
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:gap-5">
        
        {/* Filters Sidebar */}
        <aside className="w-full max-h-[70vh] overflow-y-auto rounded-3xl border border-lime-100 bg-white p-4 self-start space-y-5 shadow-sm lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:w-72 lg:p-5">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-extrabold text-gray-800 text-sm flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-brand-600" />
              <span>Filters</span>
            </h3>
            <button
              onClick={handleClearFilters}
              className="text-xs font-bold text-gray-400 hover:text-brand-600 cursor-pointer"
            >
              Reset All
            </button>
          </div>

          {/* Category List */}
          <div className="space-y-3">
            <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider">
              Category
            </h4>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:block lg:space-y-2.5">
              <label className="flex items-center gap-2.5 text-sm text-gray-600 cursor-pointer select-none">
                <input
                  type="radio"
                  name="category"
                  checked={!selectedCategory}
                  onChange={() => handleCategoryChange("All")}
                  className="accent-brand-600 cursor-pointer rounded"
                />
                <span className={!selectedCategory ? "font-bold text-brand-700" : "hover:text-gray-800"}>
                  All
                </span>
              </label>
              {catalogGroups.map((group) => (
                <div key={group.name} className="space-y-2">
                  <p className="pt-2 text-[10px] font-black uppercase tracking-wider text-gray-400">{group.name}</p>
                  {group.categories.map((cat) => (
                    <label key={cat.name} className="flex items-center gap-2.5 text-sm text-gray-600 cursor-pointer select-none">
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory.toLowerCase() === cat.name.toLowerCase()}
                        onChange={() => handleCategoryChange(cat.name)}
                        className="accent-brand-600 cursor-pointer rounded"
                      />
                      <span className={selectedCategory.toLowerCase() === cat.name.toLowerCase() ? "font-bold text-brand-700" : "hover:text-gray-800"}>
                        {cat.name}
                      </span>
                    </label>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="space-y-3 border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between text-xs">
              <h4 className="font-bold text-gray-800 uppercase tracking-wider">
                Max Price
              </h4>
              <span className="font-extrabold text-brand-600 text-sm">
                ₹{maxPrice}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1000"
              step="10"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-brand-600 cursor-pointer h-1.5 bg-gray-100 rounded-lg appearance-none"
            />
            <div className="flex justify-between text-[10px] text-gray-400 font-semibold">
              <span>₹0</span>
              <span>₹500</span>
              <span>₹1000</span>
            </div>
          </div>

          {/* Availability Toggle */}
          <div className="space-y-3 border-t border-gray-100 pt-4">
            <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider">
              Availability
            </h4>
            <label className="flex items-center gap-2.5 text-sm text-gray-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={(e) => setOnlyInStock(e.target.checked)}
                className="accent-brand-600 rounded cursor-pointer"
              />
              <span className={onlyInStock ? "font-bold text-brand-700" : "hover:text-gray-850"}>
                Show In Stock Only
              </span>
            </label>
          </div>
        </aside>

        {/* Catalog Main Panel */}
        <section className="min-w-0 flex-1 space-y-5 md:space-y-6">
          {/* Sorting / Results Count Header */}
          <div className="flex flex-col items-stretch justify-between gap-3 rounded-3xl border border-lime-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
            <span className="text-sm font-medium text-gray-500">
              Showing <span className="font-bold text-gray-800">{filteredProducts.length}</span> matching products
            </span>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Sort by:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full cursor-pointer rounded-xl border border-gray-150 bg-slate-50 px-3 py-2 text-sm font-semibold text-gray-700 transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 sm:w-auto sm:py-1.5"
              >
                <option value="featured">Popularity</option>
                <option value="best-sellers">Best Sellers</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="stock-level">In Stock Quantity</option>
                <option value="name-asc">Alphabetical (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Active Filter Badges */}
          {(searchQuery || selectedCategory || onlyInStock || maxPrice !== 500) && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-gray-400 font-bold uppercase mr-1">Active:</span>
              {selectedCategory && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-brand-50 border border-brand-200 text-xs font-bold text-brand-700">
                  Category: {selectedCategory}
                  <button onClick={removeSelectedCategory} className="hover:text-brand-900 cursor-pointer font-bold">&times;</button>
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-brand-50 border border-brand-200 text-xs font-bold text-brand-700">
                  Search: "{searchQuery}"
                  <button onClick={() => setSearchQuery("")} className="hover:text-brand-900 cursor-pointer font-bold">&times;</button>
                </span>
              )}
              {onlyInStock && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-brand-50 border border-brand-200 text-xs font-bold text-brand-700">
                  In Stock Only
                  <button onClick={() => setOnlyInStock(false)} className="hover:text-brand-900 cursor-pointer font-bold">&times;</button>
                </span>
              )}
              {maxPrice !== 500 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-brand-50 border border-brand-200 text-xs font-bold text-brand-700">
                  Max price: ₹{maxPrice}
                  <button onClick={() => setMaxPrice(500)} className="hover:text-brand-900 cursor-pointer font-bold">&times;</button>
                </span>
              )}
            </div>
          )}

          {/* Product Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 gap-3 min-[460px]:grid-cols-2 md:gap-4 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4, 5, 6].map((id) => (
                <div key={id} className="bg-white rounded-2xl border border-gray-100 p-4 space-y-4 animate-pulse">
                  <div className="h-40 bg-gray-150 rounded-xl" />
                  <div className="h-4 bg-gray-150 rounded w-2/3" />
                  <div className="h-4 bg-gray-150 rounded w-1/2" />
                  <div className="h-8 bg-gray-150 rounded-xl" />
                </div>
              ))}
            </div>
          ) : loadError ? (
            <div className="bg-amber-50 rounded-3xl border border-amber-200 p-6 text-center max-w-xl mx-auto space-y-4 shadow-xs sm:p-12">
              <h3 className="font-extrabold text-amber-900 text-lg">Catalog is not connected</h3>
              <p className="text-sm font-semibold text-amber-800">{loadError}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-md transition cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-100 p-6 text-center max-w-md mx-auto space-y-4 shadow-xs sm:p-12">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto text-2xl">
                🔎
              </div>
              <h3 className="font-extrabold text-gray-800 text-lg">No Results Found</h3>
              <p className="text-sm text-gray-500">
                We couldn't find any items matching your filters. Try checking spelling or adjusting sliders.
              </p>
              <button
                onClick={handleClearFilters}
                className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/10 transition cursor-pointer"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 min-[460px]:grid-cols-2 md:gap-4 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <ProductCard 
                  key={product._id} 
                  product={product}
                  onAuthRequired={() => setShowAuthModal(true)}
                />
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}

export default Products;
