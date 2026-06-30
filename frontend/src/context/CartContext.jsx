import { createContext, useContext, useState, useEffect } from "react";
import { fallbackProductIds } from "../data/fallbackProducts";

const CartContext = createContext();

const getCartItemKey = (item) => `${item._id}::${item.unit || "piece"}`;

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setCartOpen] = useState(false);

  // Load cart on mount
  useEffect(() => {
    const storedCart = localStorage.getItem("kirana_cart");
    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart);
        const validCart = Array.isArray(parsedCart)
          ? parsedCart.filter((item) => item?._id && !fallbackProductIds.has(item._id))
          : [];
        setCart(validCart);
        if (validCart.length !== parsedCart.length) {
          localStorage.setItem("kirana_cart", JSON.stringify(validCart));
        }
      } catch {
        localStorage.removeItem("kirana_cart");
      }
    }
  }, []);

  // Save cart to local storage when it changes
  const saveCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem("kirana_cart", JSON.stringify(newCart));
  };

  const addToCart = (product, quantityToAdd = 1) => {
    if (product.showcaseOnly || fallbackProductIds.has(product._id)) {
      alert(`${product.name} is a preview item and cannot be ordered right now.`);
      return false;
    }

    const requestedQuantity = Math.max(1, Number(quantityToAdd) || 1);
    const stock = Number(product.stock);
    const hasStockLimit = Number.isFinite(stock);
    const cartItem = { ...product, unit: product.unit || "piece" };
    const cartItemKey = getCartItemKey(cartItem);
    const existingIndex = cart.findIndex((item) => getCartItemKey(item) === cartItemKey);
    let newCart = [...cart];

    if (existingIndex > -1) {
      const currentQty = newCart[existingIndex].quantity;
      const targetQty = currentQty + requestedQuantity;
      
      // Check stock limits if available
      if (hasStockLimit && targetQty > stock) {
        alert(`Only ${product.stock} items of ${product.name} are available in stock.`);
        return false;
      }
      newCart[existingIndex].quantity = targetQty;
    } else {
      if (hasStockLimit && stock <= 0) {
        alert(`${product.name} is currently out of stock.`);
        return false;
      }
      newCart.push({ ...cartItem, cartItemKey, quantity: requestedQuantity });
    }

    saveCart(newCart);
    return true;
  };

  const removeFromCart = (cartItemKey) => {
    const newCart = cart.filter((item) => getCartItemKey(item) !== cartItemKey);
    saveCart(newCart);
  };

  const updateQuantity = (cartItemKey, quantity) => {
    if (quantity <= 0) {
      removeFromCart(cartItemKey);
      return;
    }

    const newCart = cart.map((item) => {
      if (getCartItemKey(item) === cartItemKey) {
        const stock = Number(item.stock);
        const hasStockLimit = Number.isFinite(stock);

        // Check stock limit
        if (hasStockLimit && quantity > stock) {
          alert(`Only ${item.stock} items of ${item.name} are available in stock.`);
          return { ...item, quantity: stock };
        }
        return { ...item, quantity };
      }
      return item;
    });

    saveCart(newCart);
  };

  const clearCart = () => {
    saveCart([]);
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        isCartOpen,
        setCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        getCartItemKey,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
