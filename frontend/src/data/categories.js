const images = {
  produce: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
  staples: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80",
  spices: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80",
  dairy: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=600&q=80",
  bakery: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=600&q=80",
  snacks: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=600&q=80",
  beverages: "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=600&q=80",
  care: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80",
  home: "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=600&q=80",
  cleaning: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=600&q=80",
  sports: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=600&q=80",
};

export const catalogGroups = [
  {
    name: "Groceries",
    categories: [
      { name: "Vegetables & Fruits", aliases: ["vegetables & fruits", "fruits & vegetables", "fruits", "vegetables"], image: images.produce },
      { name: "Atta, Rice & Dal", aliases: ["atta, rice & dal", "atta & flour", "atta", "flour", "rice", "pulses & dals", "dal", "dals", "staples & spices"], image: images.staples },
      { name: "Oil, Ghee & Masala", aliases: ["oil, ghee & masala", "cooking oil & ghee", "oil", "ghee", "spices & masalas", "spices", "masalas", "salt, sugar & jaggery", "staples & spices"], image: images.spices },
      { name: "Dairy, Bread & Eggs", aliases: ["dairy, bread & eggs", "milk & dairy", "dairy & eggs", "milk", "bread", "eggs"], image: images.dairy },
      { name: "Bakery & Biscuits", aliases: ["bakery & biscuits", "biscuits & cookies", "biscuits", "cookies"], image: images.bakery },
      { name: "Dry Fruits & Cereals", aliases: ["dry fruits & cereals", "dry fruits & nuts", "dry fruits", "nuts", "breakfast & cereals", "breakfast", "cereals"], image: images.staples },
      { name: "Chicken, Meat & Fish", aliases: ["chicken, meat & fish", "chicken", "meat", "fish"], image: images.produce },
      { name: "Kitchenware & Appliances", aliases: ["kitchenware & appliances", "home & kitchen", "kitchenware", "appliances"], image: images.home },
    ],
  },
  {
    name: "Snacks & Drinks",
    categories: [
      { name: "Chips & Namkeen", aliases: ["chips & namkeen", "snacks & namkeen", "snacks", "snacks & munchies", "chips", "namkeen"], image: images.snacks },
      { name: "Sweets & Chocolates", aliases: ["sweets & chocolates", "chocolates & confectionery", "chocolates", "confectionery", "sweets"], image: images.snacks },
      { name: "Drinks & Juices", aliases: ["drinks & juices", "beverages", "drinks", "juices"], image: images.beverages },
      { name: "Tea, Coffee & Milk Drinks", aliases: ["tea, coffee & milk drinks", "tea, coffee & beverages", "tea", "coffee", "milk drinks"], image: images.beverages },
      { name: "Instant Food", aliases: ["instant food", "instant foods"], image: images.snacks },
      { name: "Sauces & Spreads", aliases: ["sauces & spreads", "sauces", "spreads"], image: images.snacks },
      { name: "Paan Corner", aliases: ["paan corner", "paan"], image: images.snacks },
      { name: "Ice Creams & More", aliases: ["ice creams & more", "ice creams", "frozen foods", "frozen desserts"], image: images.snacks },
    ],
  },
  {
    name: "Beauty & Personal Care",
    categories: [
      { name: "Bath & Body", aliases: ["bath & body", "personal care", "beauty & hygiene", "soap", "body wash"], image: images.care },
      { name: "Hair", aliases: ["hair", "hair care", "shampoo"], image: images.care },
      { name: "Skin & Face", aliases: ["skin & face", "skin", "face", "skincare"], image: images.care },
      { name: "Beauty & Cosmetics", aliases: ["beauty & cosmetics", "beauty", "cosmetics", "beauty & hygiene"], image: images.care },
      { name: "Feminine Hygiene", aliases: ["feminine hygiene", "sanitary"], image: images.care },
      { name: "Baby Care", aliases: ["baby care"], image: images.care },
      { name: "Health & Pharma", aliases: ["health & pharma", "health", "pharma", "wellness"], image: images.care },
      { name: "Sexual Wellness", aliases: ["sexual wellness"], image: images.care },
    ],
  },
  {
    name: "Household Essentials",
    categories: [
      { name: "Home & Lifestyle", aliases: ["home & lifestyle", "home & kitchen", "home"], image: images.home },
      { name: "Cleaners & Repellents", aliases: ["cleaners & repellents", "cleaning & household", "cleaning", "household", "repellents"], image: images.cleaning },
      { name: "Electronics", aliases: ["electronics"], image: images.home },
      { name: "Stationery & Games", aliases: ["stationery & games", "stationery & essentials", "stationery", "games"], image: images.home },
    ],
  },
  {
    name: "Stores in Spotlight",
    categories: [
      { name: "Ice Cream Store", aliases: ["ice cream store", "ice creams & more"], image: images.snacks },
      { name: "Travel Store", aliases: ["travel store", "travel"], image: images.home },
      { name: "Hobby Store", aliases: ["hobby store", "hobby"], image: images.home },
      { name: "Sports Store", aliases: ["sports store", "sports"], image: images.sports },
    ],
  },
];

export const categories = catalogGroups.flatMap((group) =>
  group.categories.map((category, index) => ({
    ...category,
    parent: group.name,
    displayOrder: categoriesBeforeGroup(group.name) + index + 1,
  }))
);

export const categoryNames = categories.map((category) => category.name);

export const groupCategories = (items = []) => {
  const knownParents = catalogGroups.map((group) => group.name);
  const grouped = new Map(knownParents.map((parent) => [parent, []]));
  const other = [];

  items.forEach((item) => {
    const parent = item.parent || findCategory(item.name)?.parent || "Other";
    if (grouped.has(parent)) {
      grouped.get(parent).push(item);
    } else {
      other.push(item);
    }
  });

  const groups = knownParents
    .map((parent) => ({ name: parent, categories: sortByCategory(grouped.get(parent)) }))
    .filter((group) => group.categories.length > 0);

  if (other.length > 0) {
    groups.push({ name: "Other", categories: sortByCategory(other) });
  }

  return groups;
};

export const matchesCategory = (value = "", category) => {
  if (category === "All") return true;
  const normalized = value.toLowerCase();
  const match = findCategory(category);
  return match ? match.aliases.includes(normalized) || normalized === match.name.toLowerCase() : normalized === category.toLowerCase();
};

export const sortByCategory = (items = []) => {
  const rank = (value = "") => {
    const normalized = value.toLowerCase();
    const index = categories.findIndex((item) => item.aliases.includes(normalized) || item.name.toLowerCase() === normalized);
    return index === -1 ? categories.length : index;
  };
  return [...items].sort((a, b) => {
    const orderA = Number(a.displayOrder || 0);
    const orderB = Number(b.displayOrder || 0);
    if (orderA && orderB) return orderA - orderB;
    if (orderA) return -1;
    if (orderB) return 1;
    return rank(a.category || a.name) - rank(b.category || b.name);
  });
};

function categoriesBeforeGroup(groupName) {
  const index = catalogGroups.findIndex((group) => group.name === groupName);
  if (index <= 0) return 0;
  return catalogGroups.slice(0, index).reduce((total, group) => total + group.categories.length, 0);
}

function findCategory(name = "") {
  const normalized = name.toLowerCase();
  return categories.find((category) => category.name.toLowerCase() === normalized || category.aliases.includes(normalized));
}
