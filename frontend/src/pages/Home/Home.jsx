import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthRequiredModal from "../../components/AuthRequiredModal";
import ProductSection from "../../components/ProductSection";
import RotatingQuote from "../../components/RotatingQuote";
import { catalogGroups } from "../../data/categories";
import { getProducts } from "../../services/productService";

const includesAny = (product, terms) => {
  const text = `${product.name} ${product.brand || ""} ${product.category || ""}`.toLowerCase();
  return terms.some((term) => text.includes(term));
};

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [showAuth, setShowAuth] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getProducts()
      .then((data) => {
        setProducts(data);
        setLoadError("");
      })
      .catch(() => {
        setProducts([]);
        setLoadError("Products could not be loaded from the server right now.");
      })
      .finally(() => setLoading(false));
  }, []);

  const sections = useMemo(() => ({
    bestSellers: [...products].sort((a, b) => (b.salesRank || 0) - (a.salesRank || 0)).slice(0, 8),
    topOffers: products.filter((product) => product.discountPercentage > 0).sort((a, b) => b.discountPercentage - a.discountPercentage).slice(0, 8),
    dailyStaples: products.filter((product) => includesAny(product, ["milk", "bread", "egg", "rice", "atta", "dal", "staple"])).slice(0, 8),
    snacks: products.filter((product) => includesAny(product, ["snack", "chips", "biscuit", "cookie", "namkeen", "chocolate"])).slice(0, 8),
    homeKitchen: products.filter((product) => includesAny(product, ["home", "kitchen", "kitchenware", "appliance"])).slice(0, 8),
    beauty: products.filter((product) => includesAny(product, ["beauty", "personal care", "bath", "body", "hair", "skin"])).slice(0, 8),
    cleaning: products.filter((product) => includesAny(product, ["cleaning", "cleaner", "repellent", "household"])).slice(0, 8),
  }), [products]);

  const goTo = (query = "") => navigate(query ? `/products?${query}` : "/products");

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

      <section id="home-categories" className="rounded-3xl bg-white px-4 py-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black text-slate-950">Shop by category</h2>
            <p className="text-xs font-semibold text-slate-500">Fresh aisles for every basket</p>
          </div>
          <button onClick={() => goTo()} className="rounded-xl bg-lime-100 px-3 py-2 text-xs font-extrabold text-lime-800">View all</button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {catalogGroups.map((group) => (
            <div key={group.name} className="rounded-2xl border border-lime-100 bg-lime-50/40 p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <h3 className="line-clamp-1 text-xs font-black uppercase tracking-wide text-lime-800">{group.name}</h3>
                <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-[10px] font-black text-lime-700">{group.categories.length}</span>
              </div>
              <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2">
                {group.categories.map((category) => (
                  <button
                    key={category.name}
                    onClick={() => goTo(`category=${encodeURIComponent(category.name)}`)}
                    className="group flex min-w-full snap-center flex-col items-center gap-2 rounded-xl bg-white px-3 py-3 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <span className="grid h-16 w-16 overflow-hidden rounded-2xl bg-lime-50 p-1 shadow-sm">
                      <img src={category.image} alt={category.name} loading="lazy" className="h-full w-full object-cover" />
                    </span>
                    <span className="line-clamp-2 min-h-9 text-sm font-black leading-4 text-slate-800 group-hover:text-lime-700">{category.name}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
          <button onClick={() => goTo("category=Dairy%2C%20Bread%20%26%20Eggs")} className="rounded-3xl bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <p className="text-xs font-black uppercase text-lime-700">Fresh corner</p>
            <h2 className="mt-2 text-xl font-black text-slate-900">Milk, bread & eggs</h2>
            <p className="mt-2 text-sm font-semibold text-slate-500">Morning essentials in minutes</p>
          </button>
          <button onClick={() => goTo("category=Chips%20%26%20Namkeen")} className="rounded-3xl bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <p className="text-xs font-black uppercase text-lime-700">Snack attack</p>
            <h2 className="mt-2 text-xl font-black text-slate-900">Chips, biscuits & more</h2>
            <p className="mt-2 text-sm font-semibold text-slate-500">Movie-night basket ready</p>
          </button>
          <button onClick={() => goTo("category=Cleaners%20%26%20Repellents")} className="rounded-3xl bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
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
      ) : loadError ? (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-center">
          <h2 className="text-lg font-black text-amber-900">Catalog is not connected</h2>
          <p className="mt-2 text-sm font-semibold text-amber-800">{loadError}</p>
          <button onClick={() => goTo()} className="mt-4 rounded-2xl bg-amber-500 px-5 py-3 text-sm font-extrabold text-white">Try products page</button>
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-3xl border border-lime-100 bg-white p-6 text-center shadow-sm">
          <h2 className="text-lg font-black text-slate-900">No products available yet</h2>
          <p className="mt-2 text-sm font-semibold text-slate-500">Add products from the owner dashboard to show them here.</p>
          <button onClick={() => goTo()} className="mt-4 rounded-2xl bg-lime-500 px-5 py-3 text-sm font-extrabold text-slate-950">Open catalog</button>
        </div>
      ) : (
        <>
          <ProductSection title="🔥 Best Sellers" eyebrow="Loved by shoppers" products={sections.bestSellers} onViewAll={() => goTo("sort=best-sellers")} onAuthRequired={() => setShowAuth(true)} />
          <ProductSection title="🎉 Top Offers" eyebrow="More value in every basket" products={sections.topOffers} onViewAll={() => goTo("sort=price-low")} onAuthRequired={() => setShowAuth(true)} tone="yellow" />
          <ProductSection title="🥛 Daily Staples" eyebrow="Everyday kitchen favourites" products={sections.dailyStaples} onViewAll={() => goTo("category=Atta%2C%20Rice%20%26%20Dal")} onAuthRequired={() => setShowAuth(true)} tone="green" />
          <ProductSection title="🍪 Snacks" eyebrow="Crunchy, sweet and savoury" products={sections.snacks} onViewAll={() => goTo("category=Chips%20%26%20Namkeen")} onAuthRequired={() => setShowAuth(true)} tone="rose" />
          <ProductSection title="🏠 Home & Kitchen" eyebrow="Smart essentials for your space" products={sections.homeKitchen} onViewAll={() => goTo("category=Kitchenware%20%26%20Appliances")} onAuthRequired={() => setShowAuth(true)} tone="blue" />
          <ProductSection title="💄 Beauty & Hygiene" eyebrow="Feel good every day" products={sections.beauty} onViewAll={() => goTo("category=Bath%20%26%20Body")} onAuthRequired={() => setShowAuth(true)} tone="violet" />
          <ProductSection title="🧹 Cleaning & Household" eyebrow="A fresher, happier home" products={sections.cleaning} onViewAll={() => goTo("category=Cleaners%20%26%20Repellents")} onAuthRequired={() => setShowAuth(true)} tone="green" />
        </>
      )}

      <RotatingQuote />
    </div>
  );
}
