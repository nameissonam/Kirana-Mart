import { Routes, Route } from "react-router-dom";

import CustomerLayout from "../layouts/CustomerLayout";
import AdminLayout from "../layouts/AdminLayout";

import Home from "../pages/Home/Home";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import Products from "../pages/Products/Products";
import ProductDetails from "../pages/Products/ProductDetails";
import Checkout from "../pages/Checkout/Checkout";
import OrderSuccess from "../pages/Checkout/OrderSuccess";
import MyOrders from "../pages/Orders/MyOrders";

import AdminDashboard from "../pages/Admin/AdminDashboard";
import AdminProducts from "../pages/Admin/AdminProducts";
import AdminCustomers from "../pages/Admin/AdminCustomers";
import AdminReports from "../pages/Admin/AdminReports";
import AdminInventory from "../pages/Admin/AdminInventory";
import AdminCategories from "../pages/Admin/AdminCategories";
import AdminSettings from "../pages/Admin/AdminSettings";
import AdminNotifications from "../pages/Admin/AdminNotifications";
import AdminManualOrder from "../pages/Admin/AdminManualOrder";
import Orders from "../pages/Admin/Orders";

function AppRoutes() {
  return (
    <Routes>
      {/* Customer Routes */}
      <Route element={<CustomerLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/checkout/success" element={<OrderSuccess />} />
        <Route path="/orders" element={<MyOrders />} />
      </Route>

      {/* Admin Side System - Locked under AdminLayout */}
      <Route element={<AdminLayout />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/products" element={<AdminProducts />} />
        <Route path="/admin/customers" element={<AdminCustomers />} />
        <Route path="/admin/reports" element={<AdminReports />} />
        <Route path="/admin/inventory" element={<AdminInventory />} />
        <Route path="/admin/categories" element={<AdminCategories />} />
        <Route path="/admin/orders" element={<Orders />} />
        <Route path="/admin/notifications" element={<AdminNotifications />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/admin/manual-order" element={<AdminManualOrder />} />
      </Route>

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
}

export default AppRoutes;
