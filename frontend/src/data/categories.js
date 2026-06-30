const images = {
  staples: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80",
  spices: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80",
  beverages: "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=600&q=80",
  dairy: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=600&q=80",
  snacks: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=600&q=80",
  produce: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
  care: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80",
  home: "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=600&q=80",
  organic: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80",
};

export const categories = [
  { name: "Pulses & Dals", aliases: ["pulses & dals", "dal", "dals", "staples & spices"], image: images.staples },
  { name: "Atta & Flour", aliases: ["atta & flour", "atta", "flour", "staples & spices"], image: images.staples },
  { name: "Cooking Oil & Ghee", aliases: ["cooking oil & ghee", "oil", "ghee", "staples & spices"], image: images.staples },
  { name: "Spices & Masalas", aliases: ["spices & masalas", "spices", "masalas", "staples & spices"], image: images.spices },
  { name: "Salt, Sugar & Jaggery", aliases: ["salt, sugar & jaggery", "salt", "sugar", "jaggery", "staples & spices"], image: images.spices },
  { name: "Tea, Coffee & Beverages", aliases: ["tea, coffee & beverages", "beverages"], image: images.beverages },
  { name: "Milk & Dairy", aliases: ["milk & dairy", "dairy & eggs"], image: images.dairy },
  { name: "Biscuits & Cookies", aliases: ["biscuits & cookies", "biscuits", "cookies", "snacks & munchies"], image: images.snacks },
  { name: "Snacks & Namkeen", aliases: ["snacks & namkeen", "snacks", "snacks & munchies"], image: images.snacks },
  { name: "Chocolates & Confectionery", aliases: ["chocolates & confectionery", "chocolates", "confectionery"], image: images.snacks },
  { name: "Instant Foods", aliases: ["instant foods"], image: images.snacks },
  { name: "Breakfast & Cereals", aliases: ["breakfast & cereals", "breakfast", "cereals"], image: images.staples },
  { name: "Frozen Foods", aliases: ["frozen foods"], image: images.snacks },
  { name: "Fruits & Vegetables", aliases: ["fruits & vegetables", "fruits", "vegetables"], image: images.produce },
  { name: "Dry Fruits & Nuts", aliases: ["dry fruits & nuts", "dry fruits", "nuts"], image: images.staples },
  { name: "Baby Care", aliases: ["baby care"], image: images.care },
  { name: "Personal Care", aliases: ["personal care", "beauty & hygiene"], image: images.care },
  { name: "Beauty & Cosmetics", aliases: ["beauty & cosmetics", "beauty", "cosmetics", "beauty & hygiene"], image: images.care },
  { name: "Cleaning & Household", aliases: ["cleaning & household"], image: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=600&q=80" },
  { name: "Home & Kitchen", aliases: ["home & kitchen"], image: images.home },
  { name: "Stationery & Essentials", aliases: ["stationery & essentials", "stationery"], image: images.home },
  { name: "Organic Products", aliases: ["organic products", "organic"], image: images.organic },
  { name: "Pet Care", aliases: ["pet care"], image: images.organic },
];

export const categoryNames = categories.map((category) => category.name);

export const matchesCategory = (value = "", category) => {
  if (category === "All") return true;
  const normalized = value.toLowerCase();
  const match = categories.find((item) => item.name === category);
  return match ? match.aliases.includes(normalized) : normalized === category.toLowerCase();
};

export const sortByCategory = (items = []) => {
  const rank = (value = "") => {
    const normalized = value.toLowerCase();
    const index = categories.findIndex((item) => item.aliases.includes(normalized));
    return index === -1 ? categories.length : index;
  };
  return [...items].sort((a, b) => rank(a.category || a.name) - rank(b.category || b.name));
};
