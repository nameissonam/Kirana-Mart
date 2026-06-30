import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  LayoutDashboard,
  Package,
  List,
  BarChart3,
  ShoppingBag,
  Users,
  Settings,
  LogOut,
  AlertCircle,
  PlusCircle,
} from "./Icons";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { apiUrl } from "../config/api";

function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();
  const { logout, token, isAdmin } = useAuth();

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/admin" },
    { name: "Products", icon: Package, path: "/admin/products" },
    { name: "Inventory", icon: BarChart3, path: "/admin/inventory" },
    { name: "Categories", icon: List, path: "/admin/categories" },
    { name: "Orders", icon: ShoppingBag, path: "/admin/orders" },
    { name: "Customers", icon: Users, path: "/admin/customers" },
    { name: "Reports", icon: BarChart3, path: "/admin/reports" },
    { name: "Notifications", icon: AlertCircle, path: "/admin/notifications", badge: true },
    { name: "Settings", icon: Settings, path: "/admin/settings" },
    { name: "Manual Order Entry", icon: PlusCircle, path: "/admin/manual-order" },
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
        console.error("Error fetching unread notification count:", err);
      }
    };

    fetchUnreadCount();
    // Poll unread count every 15s to keep UI updated in real-time
    const interval = setInterval(fetchUnreadCount, 15000);
    return () => clearInterval(interval);
  }, [token, isAdmin]);

  const isActive = (path) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="hidden"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <div
        className={`hidden ${
          isOpen ? "w-64" : "w-0"
        } lg:flex lg:w-64 bg-gray-950 text-white fixed left-0 top-0 h-screen overflow-y-auto transition-all duration-300 z-45 flex-col`}
      >
        <div className="p-6 flex-1 flex flex-col justify-between">
          <div>
            {/* Logo */}
            <Link to="/admin" className="flex items-center gap-2.5 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center font-black text-xl shadow-md">
                K
              </div>
              <div>
                <div className="font-extrabold text-lg tracking-tight">KiranaMart</div>
                <div className="text-[10px] text-brand-400 font-bold uppercase tracking-wider">Owner Console</div>
              </div>
            </Link>

            {/* Menu Items */}
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => {
                      if (window.innerWidth < 1024) setIsOpen(false);
                    }}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all duration-200 group ${
                      active
                        ? "bg-brand-600 text-white shadow-lg shadow-brand-650/15 font-semibold"
                        : "text-gray-400 hover:bg-gray-900 hover:text-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 ${active ? "text-white" : "text-gray-400 group-hover:text-gray-200"}`} />
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                    {item.badge && unreadCount > 0 && (
                      <span className="px-2 py-0.5 text-[10px] font-extrabold bg-red-500 text-white rounded-full animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="mt-8">
            {/* Divider */}
            <div className="border-t border-gray-900 mb-6"></div>

            {/* Logout */}
            <button
              onClick={() => {
                logout();
                window.location.href = "/";
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-gray-400 hover:bg-red-950/35 hover:text-red-400 transition-all cursor-pointer font-medium"
            >
              <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-400" />
              <span className="text-sm">Logout</span>
            </button>
          </div>
        </div>
      </div>

    </>
  );
}

export default AdminSidebar;
