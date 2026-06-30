import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { getCustomerUnitOptions } from "../data/unitOptions";
import { getProductImage } from "../utils/productImages";
import { Minus, Plus, Star } from "./Icons";

export default function ProductCard({ product, onAuthRequired, compact = false }) {
  const { cart, addToCart, updateQuantity, setCartOpen, getCartItemKey } = useCart();
  const [selectedVariant, setSelectedVariant] = useState(product?.unit || "piece");
  if (!product) return null;
  const unitOptions = getCustomerUnitOptions(product.unit, product.variants);
  const activeVariant = unitOptions.includes(selectedVariant) ? selectedVariant : unitOptions[0];
  const selectedProduct = { ...product, unit: activeVariant };
  const selectedCartKey = getCartItemKey(selectedProduct);
  const quantity = cart.find((item) => getCartItemKey(item) === selectedCartKey)?.quantity || 0;
  const discount = Number(product.discountPercentage || 0);
  const stock = Number(product.stock);
  const isPreviewOnly = Boolean(product.showcaseOnly);
  const isOutOfStock = isPreviewOnly || (Number.isFinite(stock) && stock <= 0);
  const rating = (4 + (Number.parseInt(product._id?.slice(-2), 16) % 9) / 10).toFixed(1);
  const reviews = 120 + (Number.parseInt(product._id?.slice(-3), 16) % 850);
  const mrp = discount > 0 ? Math.round(product.price / (1 - discount / 100)) : null;

  const handleAdd = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (addToCart(selectedProduct)) {
      setCartOpen(true);
    }
  };

  const handleQuantityChange = (event, quantity) => {
    event.preventDefault();
    event.stopPropagation();
    updateQuantity(selectedCartKey, quantity);
  };

  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-lime-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-lime-100">
      <Link to={`/product/${product._id}`} className="flex flex-1 cursor-pointer flex-col">
        <div className={`relative grid place-items-center overflow-hidden bg-lime-50/60 p-3 ${compact ? "h-36" : "h-48"}`}>
          <img src={getProductImage(product)} alt={product.name} loading="lazy" className="h-full max-h-full w-full object-contain transition duration-300 group-hover:scale-105" />
          {discount > 0 && <span className="absolute left-2 top-2 rounded-full bg-lime-600 px-2 py-1 text-[10px] font-bold text-white">{discount}% OFF</span>}
          {isOutOfStock && <span className="absolute inset-0 grid place-items-center bg-white/80 text-xs font-bold uppercase text-slate-500">{isPreviewOnly ? "Preview only" : "Out of stock"}</span>}
        </div>
        <div className="flex flex-1 flex-col px-3 pt-3">
          <span className="mb-2 w-fit rounded-md bg-lime-100 px-2 py-1 text-[10px] font-extrabold text-lime-800">10 MINS</span>
          <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-slate-500">{product.brand || product.category}</p>
          <h3 className="mt-1 line-clamp-2 min-h-10 text-sm font-semibold text-slate-800 group-hover:text-lime-700">{product.name}</h3>
          <div className="mt-2 flex items-center gap-2">
            <span className="inline-flex items-center gap-0.5 rounded bg-green-600 px-1.5 py-0.5 text-[11px] font-bold text-white">{rating}<Star className="h-2.5 w-2.5 fill-white" /></span>
            <span className="text-[11px] font-semibold text-slate-400">({reviews})</span>
          </div>
          <div className="pt-2">
            <span className="text-base font-bold text-slate-900">&#8377;{product.price}</span>
            {discount > 0 && <span className="ml-1 text-xs text-slate-400 line-through">&#8377;{mrp}</span>}
            {discount > 0 && <span className="ml-1 text-xs font-bold text-green-700">{discount}% off</span>}
          </div>
          <p className="mt-1 text-[11px] font-semibold text-lime-700">Fresh packed locally</p>
        </div>
      </Link>
      <div className="px-3 pb-3 pt-3">
        <div className="flex items-center justify-between gap-2">
          <select
            value={activeVariant}
            onChange={(event) => setSelectedVariant(event.target.value)}
            disabled={isOutOfStock}
            className="min-w-0 rounded-xl border border-lime-200 bg-lime-50 px-2 py-2 text-[11px] font-bold text-lime-800 outline-none disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-400"
            aria-label={`${product.name} variant`}
          >
            {unitOptions.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
          {quantity > 0 ? (
            <div className="flex items-center rounded-xl border border-lime-200 bg-lime-50 text-lime-700">
              <button type="button" className="p-2" onClick={(event) => handleQuantityChange(event, quantity - 1)} aria-label="Decrease quantity"><Minus className="h-3.5 w-3.5" /></button>
              <span className="min-w-5 text-center text-xs font-bold">{quantity}</span>
              <button type="button" className="p-2" onClick={(event) => handleQuantityChange(event, quantity + 1)} aria-label="Increase quantity"><Plus className="h-3.5 w-3.5" /></button>
            </div>
          ) : (
            <button type="button" onClick={handleAdd} disabled={isOutOfStock} className="rounded-xl border border-lime-600 bg-white px-4 py-2 text-xs font-extrabold text-lime-700 transition hover:bg-lime-50 disabled:border-slate-200 disabled:text-slate-400">{isPreviewOnly ? "PREVIEW" : "ADD"}</button>
          )}
        </div>
      </div>
    </article>
  );
}
