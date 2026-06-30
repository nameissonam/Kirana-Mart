import React, { useEffect, useState } from "react";
import {
  Outlet,
  Link,
  NavLink,
  Navigate,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useDeliveryLocation } from "../context/DeliveryLocationContext";
import { ShoppingCart, User, Search, LogOut, Store, MapPin, Package, ShieldCheck, Home as HomeIcon } from "../components/Icons";
import CartDrawer from "../components/CartDrawer";
import DeliveryLocationModal from "../components/DeliveryLocationModal";

function CustomerLayout() {
  const { setCartOpen, cartCount } = useCart();
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { deliveryLocation, locationPromptSkipped } = useDeliveryLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const customerNavItems = [
    { label: "Home", to: "/", icon: HomeIcon },
    { label: "Products", to: "/products", icon: Package },
  ];

  if (isAuthenticated) {
    customerNavItems.push({ label: "Orders", to: "/orders", icon: ShoppingCart });
  }

  useEffect(() => {
    if (!isAdmin && !deliveryLocation && !locationPromptSkipped) {
      const timeout = setTimeout(() => setShowLocationModal(true), 300);
      return () => clearTimeout(timeout);
    }
  }, [deliveryLocation, isAdmin, locationPromptSkipped]);

  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/products");
    }
  };

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-lime-50/40 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-lime-100 bg-white/95 shadow-sm backdrop-blur">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 min-h-16 flex items-center justify-between gap-2 sm:gap-3">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0 group">
            <div className="w-10 h-10 rounded-2xl bg-lime-500 flex items-center justify-center shadow-md shadow-lime-500/20 group-hover:scale-105 transition-transform">
              <span className="text-slate-950 font-extrabold text-xl">K</span>
            </div>
            <span className="hidden text-xl font-bold text-slate-900 sm:block">
              Kirana<span className="text-lime-600">Mart</span>
            </span>
          </Link>

          {!isAdmin && (
            <button
              type="button"
              onClick={() => setShowLocationModal(true)}
              className="hidden max-w-xs items-center gap-1 rounded-xl bg-lime-50 px-3 py-2 text-left text-xs font-bold text-slate-800 hover:bg-lime-100 lg:flex"
            >
              <MapPin className="h-4 w-4 text-lime-700" />
              <span className="min-w-0">
                <span className="block text-[11px] font-black text-slate-950">
                  {deliveryLocation ? "Delivering to" : "Select Location"}
                </span>
                <span className="block max-w-56 truncate text-[11px] text-slate-600">
                  {deliveryLocation?.label || deliveryLocation?.query || "Deliver to your door step"}
                </span>
              </span>
            </button>
          )}

          {/* Search */}
          {!isAdmin && (
            <form
            onSubmit={handleSearchSubmit}
            className="flex-1 max-w-2xl hidden lg:block"
          >
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search milk, atta, chips, soap..."
                className="w-full rounded-2xl border border-lime-100 bg-lime-50/80 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-200"
              />
              <Search className="absolute left-3 top-2.5 w-5 h-5 text-lime-700" />
            </div>
          </form>
          )}
          {/* <form
            onSubmit={handleSearchSubmit}
            className="flex-1 max-w-md mx-4 hidden md:block"
          >
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search fresh milk, fruits, tea..."
                className="w-full bg-slate-100 border rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-brand-500"
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            </div>
          </form> */}

          {/* Right Section */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* Navigation */}
            {!isAdmin && (
              <nav className="hidden md:flex items-center gap-1">
                {customerNavItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === "/"}
                    className={({ isActive }) =>
                      `px-3 py-1.5 rounded-xl text-sm font-semibold transition ${
                        isActive
                          ? "bg-lime-100 text-lime-800"
                          : "text-slate-600 hover:bg-lime-50 hover:text-slate-900"
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            )}

            {/* Admin Links */}
            {isAdmin && (
              <div className="flex items-center gap-2">
                <Link
                  to="/admin"
                  className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 text-xs font-bold"
                >
                  Dashboard
                </Link>
                <Link
                  to="/admin/orders"
                  className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold"
                >
                  Orders
                </Link>
              </div>
            )}

            {/* Cart */}
            {!isAdmin && (
              <button
                onClick={() => setCartOpen(true)}
                className="relative rounded-2xl border border-lime-200 bg-white p-2.5 text-slate-900 hover:bg-lime-50"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-lime-500 text-slate-950 text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {/* Auth */}
            <div className="relative">
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-2 rounded-2xl border border-lime-200 bg-white p-1.5"
                  >
                    <div className="w-7 h-7 rounded-xl bg-lime-100 text-lime-700 flex items-center justify-center font-bold">
                      {user.name.charAt(0)}
                    </div>
                    <span className="text-sm font-semibold hidden lg:inline text-slate-800">
                      {user.name}
                    </span>
                  </button>

                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-56 bg-white shadow-xl rounded-xl border z-50">
                      <div className="px-4 py-2 border-b">
                        <p className="text-sm font-bold">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setShowDropdown(false)}
                          className="block px-4 py-2 text-sm hover:bg-slate-50"
                        >
                          <Store className="inline w-4 h-4 mr-2" />
                          Seller Dashboard
                        </Link>
                      )}

                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="inline w-4 h-4 mr-2" />
                        Logout
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center rounded-2xl bg-lime-500 px-3 py-2 text-sm font-bold text-slate-950 hover:bg-lime-400 sm:px-4"
                >
                  <User className="inline w-4 h-4 mr-1" />
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
        {!isAdmin && (
          <>
            <form onSubmit={handleSearchSubmit} className="border-t border-lime-100 px-3 pb-2 pt-2 lg:hidden">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-lime-700" />
                <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search groceries..." className="w-full rounded-2xl border border-lime-100 bg-lime-50 py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none" />
              </div>
            </form>
            <nav className="flex gap-2 overflow-x-auto border-t border-lime-100 px-3 py-2 md:hidden">
              {customerNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === "/"}
                    className={({ isActive }) =>
                      `inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold transition ${
                        isActive
                          ? "bg-lime-500 text-slate-950"
                          : "bg-lime-50 text-slate-700 hover:bg-lime-100"
                      }`
                    }
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>
          </>
        )}
      </header>

      {/* Main */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
        <Outlet />
      </main>

      {/* Cart Drawer */}
      <CartDrawer />

      {!isAdmin && (
        <DeliveryLocationModal
          open={showLocationModal}
          onClose={() => setShowLocationModal(false)}
        />
      )}

      {!isAdmin && cartCount > 0 && <button onClick={() => setCartOpen(true)} className="fixed bottom-5 right-4 z-30 flex items-center gap-2 rounded-full bg-green-700 px-5 py-3 text-sm font-bold text-white shadow-xl lg:hidden"><ShoppingCart className="h-5 w-5" /> Cart ({cartCount})</button>}

      {/* Footer */}
      <footer className="mt-16 bg-slate-950 text-slate-300">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 text-sm sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <h3 className="font-bold text-white">ABOUT</h3>
            <p className="mt-3 leading-6 text-slate-400">KiranaMart brings daily groceries, household essentials, and quick local checkout into one simple store.</p>
          </div>
          <div>
            <h3 className="font-bold text-white">HELP</h3>
            <ul className="mt-3 space-y-2 text-slate-400"><li>Payments</li><li>Shipping</li><li>Cancellation & Returns</li><li>FAQ</li></ul>
          </div>
          <div>
            <h3 className="font-bold text-white">CONSUMER POLICY</h3>
            <ul className="mt-3 space-y-2 text-slate-400"><li>Return Policy</li><li>Terms of Use</li><li>Privacy</li><li>Security</li></ul>
          </div>
          <div>
            <h3 className="font-bold text-white">STORE TOOLS</h3>
            <ul className="mt-3 space-y-2 text-slate-400"><li>Seller Dashboard</li><li>Inventory</li><li>Reports</li><li>Manual Orders</li></ul>
          </div>
          <div>
            <h3 className="font-bold text-white">TRUST</h3>
            <div className="mt-3 space-y-3 text-slate-400">
              <p className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-yellow-300" /> Secure payments</p>
              <p className="flex items-center gap-2"><Package className="h-4 w-4 text-yellow-300" /> Fresh packed orders</p>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-800 px-4 py-4 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} KiranaMart India
        </div>
      </footer>
    </div>
  );
}

export default CustomerLayout;
