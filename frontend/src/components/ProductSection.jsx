import ProductCard from "./ProductCard";
import ProductSlider from "./ProductSlider";

export default function ProductSection({ title, eyebrow, products, onViewAll, onAuthRequired, tone = "white" }) {
  const tones = {
    white: "bg-white",
    yellow: "bg-white",
    green: "bg-white",
    rose: "bg-white",
    blue: "bg-white",
    violet: "bg-white",
  };

  if (!products.length) return null;

  return (
    <section className={`overflow-hidden rounded-3xl px-4 py-5 shadow-sm sm:px-5 ${tones[tone] || tones.white}`}>
      <div className="mb-4 flex items-center justify-between gap-4 border-b border-lime-50 pb-3">
        <div>
          <h2 className="text-xl font-black text-slate-900 md:text-2xl">{title}</h2>
          {eyebrow && <p className="mt-1 text-xs font-semibold text-slate-500">{eyebrow}</p>}
        </div>
        <button type="button" onClick={onViewAll} className="shrink-0 rounded-xl bg-lime-100 px-4 py-2 text-xs font-extrabold text-lime-800 shadow-sm transition hover:bg-lime-200">View All</button>
      </div>
      <ProductSlider ariaLabel={title}>
        {products.map((product) => (
          <div key={product._id} className="w-[min(18rem,calc(100vw-3.5rem))] shrink-0 snap-start sm:w-52 lg:w-56">
            <ProductCard product={product} compact onAuthRequired={onAuthRequired} />
          </div>
        ))}
      </ProductSlider>
    </section>
  );
}
