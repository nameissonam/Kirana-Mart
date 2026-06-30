import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthRequiredModal from "../../components/AuthRequiredModal";
import ProductSection from "../../components/ProductSection";
import RotatingQuote from "../../components/RotatingQuote";
import { categories } from "../../data/categories";
import { getProducts } from "../../services/productService";

const includesAny = (product, terms) => {
  const text = `${product.name} ${product.brand || ""} ${product.category || ""}`.toLowerCase();
  return terms.some((term) => text.includes(term));
};

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getProducts().then(setProducts).finally(() => setLoading(false));
  }, []);

  const sections = useMemo(() => ({
    bestSellers: [...products].sort((a, b) => (b.salesRank || 0) - (a.salesRank || 0)).slice(0, 8),
    topOffers: products.filter((product) => product.discountPercentage > 0).sort((a, b) => b.discountPercentage - a.discountPercentage).slice(0, 8),
    dailyStaples: products.filter((product) => includesAny(product, ["milk", "bread", "egg", "rice", "atta", "dal", "staple"])).slice(0, 8),
    snacks: products.filter((product) => includesAny(product, ["snack", "chips", "biscuit", "cookie", "namkeen", "chocolate"])).slice(0, 8),
    homeKitchen: products.filter((product) => product.category === "Home & Kitchen").slice(0, 8),
    beauty: products.filter((product) => product.category === "Beauty & Hygiene").slice(0, 8),
    cleaning: products.filter((product) => product.category === "Cleaning & Household").slice(0, 8),
  }), [products]);

  const goTo = (query = "") => navigate(query ? `/products?${query}` : "/products");
  const featuredCategories = categories.slice(0, 12);

  return (
    <div className="space-y-6 pb-10">
      <AuthRequiredModal isOpen={showAuth} onClose={() => setShowAuth(false)} />

      <section className="overflow-hidden rounded-3xl bg-lime-400 p-6 text-slate-950 shadow-sm md:p-8">
        <div className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.18em]">Fresh groceries, fast</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight md:text-6xl">Daily needs delivered quick</h1>
          <p className="mt-4 max-w-xl text-sm font-semibold text-lime-950/80 md:text-base">Milk, snacks, staples, personal care, and home essentials packed from your local KiranaMart shelves.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button onClick={() => goTo()} className="rounded-2xl bg-slate-950 px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-slate-900/20">Start shopping</button>
            <button onClick={() => goTo("sort=price-low")} className="rounded-2xl bg-white px-6 py-3 text-sm font-extrabold text-slate-950">Today's offers</button>
          </div>
        </div>
      </section>

      <section id="home-categories" className="rounded-3xl bg-white px-4 py-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-950">Shop by category</h2>
            <p className="text-xs font-semibold text-slate-500">Fresh aisles for every basket</p>
          </div>
          <button onClick={() => goTo()} className="rounded-xl bg-lime-100 px-3 py-2 text-xs font-extrabold text-lime-800">View all</button>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6 lg:grid-cols-12">
          {featuredCategories.map((category) => (
            <button key={category.name} onClick={() => goTo(`category=${encodeURIComponent(category.name)}`)} className="group flex flex-col items-center gap-2 text-center">
              <span className="grid h-16 w-16 overflow-hidden rounded-2xl bg-lime-50 p-1 shadow-sm transition group-hover:shadow-md">
                <img src={category.image} alt={category.name} loading="lazy" className="h-full w-full object-cover" />
              </span>
              <span className="line-clamp-2 min-h-8 text-xs font-bold text-slate-800 group-hover:text-lime-700">{category.name}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
          <button onClick={() => goTo("category=Milk%20%26%20Dairy")} className="rounded-3xl bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <p className="text-xs font-black uppercase text-lime-700">Fresh corner</p>
            <h2 className="mt-2 text-xl font-black text-slate-900">Milk, bread & eggs</h2>
            <p className="mt-2 text-sm font-semibold text-slate-500">Morning essentials in minutes</p>
          </button>
          <button onClick={() => goTo("category=Snacks")} className="rounded-3xl bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <p className="text-xs font-black uppercase text-lime-700">Snack attack</p>
            <h2 className="mt-2 text-xl font-black text-slate-900">Chips, biscuits & more</h2>
            <p className="mt-2 text-sm font-semibold text-slate-500">Movie-night basket ready</p>
          </button>
          <button onClick={() => goTo("category=Cleaning%20%26%20Household")} className="rounded-3xl bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <p className="text-xs font-black uppercase text-lime-700">Home care</p>
            <h2 className="mt-2 text-xl font-black text-slate-900">Cleaning essentials</h2>
            <p className="mt-2 text-sm font-semibold text-slate-500">Detergents, dish wash, floor care</p>
          </button>
      </section>

      <div className="grid gap-3 rounded-3xl bg-white p-4 shadow-sm sm:grid-cols-3">
        <div><p className="text-lg font-black text-lime-700">1-2 days</p><p className="text-xs font-semibold text-slate-500">Quick local delivery</p></div>
        <div><p className="text-lg font-black text-lime-700">Fresh picked</p><p className="text-xs font-semibold text-slate-500">Packed from store shelves</p></div>
        <div><p className="text-lg font-black text-lime-700">Secure UPI</p><p className="text-xs font-semibold text-slate-500">Razorpay checkout ready</p></div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">{[1, 2, 3, 4].map((id) => <div key={id} className="aspect-[.72] animate-pulse rounded-2xl bg-slate-200" />)}</div>
      ) : (
        <>
          <ProductSection title="🔥 Best Sellers" eyebrow="Loved by shoppers" products={sections.bestSellers} onViewAll={() => goTo("sort=best-sellers")} onAuthRequired={() => setShowAuth(true)} />
          <ProductSection title="🎉 Top Offers" eyebrow="More value in every basket" products={sections.topOffers} onViewAll={() => goTo("sort=price-low")} onAuthRequired={() => setShowAuth(true)} tone="yellow" />
          <ProductSection title="🥛 Daily Staples" eyebrow="Everyday kitchen favourites" products={sections.dailyStaples} onViewAll={() => goTo("category=Staples%20%26%20Spices")} onAuthRequired={() => setShowAuth(true)} tone="green" />
          <ProductSection title="🍪 Snacks" eyebrow="Crunchy, sweet and savoury" products={sections.snacks} onViewAll={() => goTo("category=Snacks")} onAuthRequired={() => setShowAuth(true)} tone="rose" />
          <ProductSection title="🏠 Home & Kitchen" eyebrow="Smart essentials for your space" products={sections.homeKitchen} onViewAll={() => goTo("category=Home%20%26%20Kitchen")} onAuthRequired={() => setShowAuth(true)} tone="blue" />
          <ProductSection title="💄 Beauty & Hygiene" eyebrow="Feel good every day" products={sections.beauty} onViewAll={() => goTo("category=Beauty%20%26%20Hygiene")} onAuthRequired={() => setShowAuth(true)} tone="violet" />
          <ProductSection title="🧹 Cleaning & Household" eyebrow="A fresher, happier home" products={sections.cleaning} onViewAll={() => goTo("category=Cleaning%20%26%20Household")} onAuthRequired={() => setShowAuth(true)} tone="green" />
        </>
      )}

      <RotatingQuote />
    </div>
  );
}
