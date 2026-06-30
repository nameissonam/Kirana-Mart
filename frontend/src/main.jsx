import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "./index.css";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { DeliveryLocationProvider } from "./context/DeliveryLocationContext";
import ScrollToTop from "./components/ScrollToTop";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <DeliveryLocationProvider>
          <CartProvider>
            <AppRoutes />
          </CartProvider>
        </DeliveryLocationProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
