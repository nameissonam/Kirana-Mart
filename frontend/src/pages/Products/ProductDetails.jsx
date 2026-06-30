import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BackButton from "../../components/BackButton";
import ProductCard from "../../components/ProductCard";
import AuthRequiredModal from "../../components/AuthRequiredModal";
import { CreditCard, MapPin, ShieldCheck, Star } from "../../components/Icons";
import { useCart } from "../../context/CartContext";
import { getCustomerUnitOptions } from "../../data/unitOptions";
import { getProducts } from "../../services/productService";
import { getProductImage } from "../../utils/productImages";
import { getRecommendations } from "../../utils/recommendations";
import ProductSlider from "../../components/ProductSlider";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, setCartOpen } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState("piece");
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => { getProducts().then(setProducts).finally(() => setLoading(false)); }, []);
  const product = products.find((item) => item._id === id);
  useEffect(() => {
    if (product) setSelectedVariant(product.unit || "piece");
  }, [product]);
  const recommendations = useMemo(() => getRecommendations(product, products), [product, products]);
  const addSelected = (openCart = true) => {
    if (!product) return false;
    const variants = getCustomerUnitOptions(product.unit, product.variants);
    const variant = variants.includes(selectedVariant) ? selectedVariant : variants[0];
    const success = addToCart({ ...product, unit: variant }, quantity);
    if (success && openCart) setCartOpen(true);
    return success;
  };

  if (loading) return <div className="grid min-h-96 place-items-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-green-600 border-t-transparent" /></div>;
  if (!product) return <div className="py-20 text-center"><h1 className="text-2xl font-bold">Product not found</h1><button onClick={() => navigate('/products')} className="mt-4 text-green-700">Browse products</button></div>;

  const stock = Number(product.stock);
  const hasStockLimit = Number.isFinite(stock);
  const isOutOfStock = hasStockLimit && stock <= 0;
  const rating = (4 + (Number.parseInt(product._id?.slice(-2), 16) % 9) / 10).toFixed(1);
  const reviews = 120 + (Number.parseInt(product._id?.slice(-3), 16) % 850);
  const discount = Number(product.discountPercentage || 0);
  const mrp = discount > 0 ? Math.round(product.price / (1 - discount / 100)) : null;
  const unitOptions = getCustomerUnitOptions(product.unit, product.variants);
  const activeVariant = unitOptions.includes(selectedVariant) ? selectedVariant : unitOptions[0];

  return (
    <div className="space-y-10 pb-8">
      <AuthRequiredModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
      <div className="flex items-center gap-4"><BackButton /><span className="text-sm font-bold text-slate-800">Kirana<span className="text-green-600">Mart</span></span></div>
      <section className="grid gap-8 rounded-3xl border border-lime-100 bg-white p-5 shadow-sm lg:grid-cols-[42%_58%] lg:p-6">
        <div className="space-y-4">
          <div className="grid place-items-center overflow-hidden rounded-3xl border border-lime-100 bg-lime-50/60 p-5"><img src={getProductImage(product)} alt={product.name} className="aspect-square h-full w-full object-contain transition duration-500 hover:scale-105" /></div>
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => addSelected()} disabled={isOutOfStock} className="rounded-2xl border border-lime-600 bg-white px-6 py-4 font-extrabold text-lime-700 hover:bg-lime-50 disabled:bg-slate-300">Add to cart</button>
            <button type="button" onClick={() => { if (addSelected(false)) navigate('/checkout'); }} disabled={isOutOfStock} className="rounded-2xl bg-lime-500 px-6 py-4 font-extrabold text-slate-950 hover:bg-lime-400 disabled:bg-slate-300">Buy now</button>
          </div>
        </div>
        <div className="flex flex-col lg:pr-6">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">{product.brand || "KiranaMart Select"}</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">{product.name}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-lg bg-lime-600 px-2 py-1 text-xs font-bold text-white">{rating}<Star className="h-3 w-3 fill-white" /></span>
            <span className="text-sm font-semibold text-slate-500">{reviews} ratings and reviews</span>
          </div>
          <p className="mt-3 text-sm font-medium text-slate-500">{product.category} &middot; {activeVariant}</p>
          <div className="mt-4 flex flex-wrap items-end gap-2">
            <span className="text-3xl font-bold">&#8377;{product.price}</span>
            {discount > 0 && <span className="text-sm text-slate-400 line-through">&#8377;{mrp}</span>}
            {discount > 0 && <span className="text-sm font-bold text-green-700">{discount}% off</span>}
          </div>
          <p className={`mt-3 text-sm font-semibold ${!isOutOfStock ? "text-green-700" : "text-red-600"}`}>{!isOutOfStock ? `In stock${hasStockLimit ? ` (${stock} available)` : ""}` : "Currently unavailable"}</p>

          <div className="mt-5 space-y-3 rounded-2xl border border-lime-100 bg-lime-50/40 p-4">
            <h2 className="text-sm font-bold text-slate-900">Available offers</h2>
            <p className="flex gap-2 text-sm text-slate-700"><CreditCard className="mt-0.5 h-4 w-4 text-lime-700" /> 10% instant discount on selected UPI payments.</p>
            <p className="flex gap-2 text-sm text-slate-700"><ShieldCheck className="mt-0.5 h-4 w-4 text-lime-700" /> Freshness checked and packed by KiranaMart.</p>
            <p className="flex gap-2 text-sm text-slate-700"><MapPin className="mt-0.5 h-4 w-4 text-lime-700" /> Home delivery eligibility is checked at checkout.</p>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className="text-sm font-bold text-slate-700">Variant</span>
            <select
              value={activeVariant}
              onChange={(event) => setSelectedVariant(event.target.value)}
              className="rounded-2xl border border-lime-200 bg-lime-50 px-4 py-3 text-sm font-bold text-lime-800 outline-none"
            >
              {unitOptions.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className="text-sm font-bold text-slate-700">Quantity</span>
            <div className="flex items-center rounded-2xl border border-lime-200"><button type="button" className="px-4 py-3" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button><span className="min-w-10 text-center font-bold">{quantity}</span><button type="button" className="px-4 py-3" onClick={() => setQuantity(hasStockLimit ? Math.min(stock, quantity + 1) : quantity + 1)}>+</button></div>
          </div>

          <div className="mt-5 grid gap-4 border-t border-slate-100 pt-5 md:grid-cols-[120px_1fr]">
            <span className="text-sm font-bold text-slate-500">Delivery</span>
            <div>
              <div className="flex max-w-xs items-center gap-2 border-b border-lime-500 pb-2 text-sm font-semibold text-slate-800"><MapPin className="h-4 w-4 text-lime-700" /> Bengaluru 560001 <button className="ml-auto text-lime-700">Change</button></div>
              <p className="mt-2 text-sm text-slate-600">Delivery in 1-2 days. Cash on Delivery available.</p>
            </div>
            <span className="text-sm font-bold text-slate-500">Highlights</span>
            <ul className="list-disc space-y-1 pl-4 text-sm text-slate-700">
              <li>{product.description}</li>
              <li>Category: {product.category}</li>
              <li>Variant: {activeVariant}</li>
            </ul>
            <span className="text-sm font-bold text-slate-500">Seller</span>
            <div className="text-sm text-slate-700"><span className="font-bold text-lime-700">KiranaMart Retail</span><p className="mt-1">Local support for damaged or incorrect items.</p></div>
          </div>
        </div>
      </section>
      {recommendations.length > 0 && <section><h2 className="mb-5 text-2xl font-bold text-slate-900">Frequently Bought Together</h2><ProductSlider ariaLabel="Frequently Bought Together">{recommendations.map((item) => <div key={item._id} className="w-[calc(100vw-4.5rem)] max-w-80 shrink-0 snap-start sm:w-56 sm:max-w-none"><ProductCard product={item} compact onAuthRequired={() => setShowAuth(true)} /></div>)}</ProductSlider></section>}
    </div>
  );
}
