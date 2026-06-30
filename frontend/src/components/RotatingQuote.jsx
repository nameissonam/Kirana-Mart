import { useEffect, useState } from "react";

const quotes = [
  "Fresh groceries for a healthier life.", "Eat healthy, stay happy.",
  "Good food is the foundation of wellness.", "Healthy choices start with fresh ingredients.",
  "Quality groceries delivered with care.", "Fresh ingredients make better meals.",
  "Wellness begins with healthy food choices.",
];

export default function RotatingQuote() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => { setIndex((value) => (value + 1) % quotes.length); setVisible(true); }, 300);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="rounded-xl border-l-4 border-green-500 bg-green-50/70 px-5 py-5 text-center shadow-sm">
      <div className="mb-2 text-xl" aria-hidden="true">&#127807;</div>
      <p className={`text-base font-semibold text-slate-700 transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}>
        {quotes[index]}
      </p>
    </section>
  );
}
