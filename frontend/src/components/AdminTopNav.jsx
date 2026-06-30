import { useState, useEffect } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { AlertCircle, LogOut } from "./Icons";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import BackButton from "./BackButton";
import { apiUrl } from "../config/api";

function AdminTopNav() {
  const { user, token, isAdmin, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const adminNavItems = [
    ["Dashboard", "/admin"],
    ["Products", "/admin/products"],
    ["Inventory", "/admin/inventory"],
    ["Categories", "/admin/categories"],
    ["Orders", "/admin/orders"],
    ["Customers", "/admin/customers"],
    ["Reports", "/admin/reports"],
    ["Alerts", "/admin/notifications"],
    ["Settings", "/admin/settings"],
    ["Manual Order", "/admin/manual-order"],
  ];

  useEffect(() => {
    if (!token || !isAdmin) return;

    const fetchUnreadCount = async () => {
      try {
        const res = await axios.get(apiUrl("/api/notifications"), {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUnreadCount(res.data.unreadCount || 0);
      } catch (err) {
        console.error("Error loading notifications:", err);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 15000);
    return () => clearInterval(interval);
  }, [token, isAdmin]);

  // Derive page title from route path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/admin") return "Dashboard Overview";
    if (path.startsWith("/admin/products")) return "Product Catalog";
    if (path.startsWith("/admin/inventory")) return "Inventory Levels";
    if (path.startsWith("/admin/categories")) return "Product Categories";
    if (path.startsWith("/admin/orders")) return "Customer Orders";
    if (path.startsWith("/admin/customers")) return "Customer Database";
    if (path.startsWith("/admin/reports")) return "Business Reports";
    if (path.startsWith("/admin/notifications")) return "System Alerts";
    if (path.startsWith("/admin/settings")) return "Shop Settings";
    if (path.startsWith("/admin/manual-order")) return "Manual Order Entry";
    return "Owner Workspace";
  };

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    navigate("/login", { replace: true });
  };

  return (
    <div className="sticky top-0 z-40 w-full border-b border-gray-150 bg-white/95 shadow-xs backdrop-blur-md">
      <div className="flex min-h-16 items-center justify-between gap-3 px-3 py-2 sm:px-4 md:px-8">
      {/* Page Title */}
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        {location.pathname !== "/admin" && <BackButton label="" />}
        <div className="min-w-0">
          <h1 className="truncate text-sm font-extrabold text-gray-800 sm:text-base">{getPageTitle()}</h1>
          <p className="truncate text-[9px] font-semibold uppercase tracking-wider text-gray-500 sm:text-[10px]">Kirana Mart Management</p>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-4 md:gap-5">
        {/* Notification Bell Icon */}
        <Link
          to="/admin/notifications"
          className="relative p-2 text-gray-400 hover:text-brand-650 hover:bg-slate-50 rounded-xl transition duration-150"
        >
          <AlertCircle className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white animate-pulse"></span>
          )}
        </Link>

        {/* Vertical Divider */}
        <div className="h-6 w-px bg-gray-200"></div>

        {/* User profile details */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowDropdown((open) => !open)}
            className="flex items-center gap-3 rounded-2xl border border-transparent p-1.5 transition hover:border-lime-100 hover:bg-lime-50"
            aria-expanded={showDropdown}
            aria-label="Admin account menu"
          >
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-gray-800 leading-tight">{user?.name || "Store Owner"}</p>
              <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest mt-0.5">Admin</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-400 text-white font-extrabold text-sm flex items-center justify-center shadow-md">
              {(user?.name || "S").charAt(0).toUpperCase()}
            </div>
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-lime-100 bg-white shadow-xl z-50">
              <div className="border-b border-slate-100 px-4 py-3">
                <p className="text-sm font-bold text-slate-900">{user?.name || "Store Owner"}</p>
                <p className="mt-0.5 truncate text-xs text-slate-500">{user?.email}</p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
      </div>
      <nav className="flex gap-2 overflow-x-auto border-t border-slate-100 px-3 py-2 sm:px-4 lg:hidden">
        {adminNavItems.map(([label,path]) => <NavLink key={path} end={path === '/admin'} to={path} className={({isActive}) => `shrink-0 rounded-full px-3 py-2 text-xs font-bold transition sm:px-4 ${isActive ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{label}</NavLink>)}
      </nav>
    </div>
  );
}

export default AdminTopNav;
