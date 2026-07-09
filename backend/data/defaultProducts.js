const imageByCategory = {
  "Vegetables & Fruits": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=700&q=85",
  "Atta, Rice & Dal": "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=700&q=85",
  "Oil, Ghee & Masala": "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=700&q=85",
  "Dairy, Bread & Eggs": "https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=700&q=85",
  "Bakery & Biscuits": "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=700&q=85",
  "Dry Fruits & Cereals": "https://images.unsplash.com/photo-1515543904379-3d757afe72e4?auto=format&fit=crop&w=700&q=85",
  "Chicken, Meat & Fish": "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=700&q=85",
  "Kitchenware & Appliances": "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=700&q=85",
  "Chips & Namkeen": "https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=700&q=85",
  "Sweets & Chocolates": "https://images.unsplash.com/photo-1575377427642-087cf684f29d?auto=format&fit=crop&w=700&q=85",
  "Drinks & Juices": "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=700&q=85",
  "Tea, Coffee & Milk Drinks": "https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?auto=format&fit=crop&w=700&q=85",
  "Instant Food": "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&w=700&q=85",
  "Sauces & Spreads": "https://images.unsplash.com/photo-1472476443507-c7a5948772fc?auto=format&fit=crop&w=700&q=85",
  "Paan Corner": "https://images.unsplash.com/photo-1606851091885-e083ae0a9b80?auto=format&fit=crop&w=700&q=85",
  "Ice Creams & More": "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=700&q=85",
  "Bath & Body": "https://images.unsplash.com/photo-1607006344152-62699f97b42c?auto=format&fit=crop&w=700&q=85",
  Hair: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=700&q=85",
  "Skin & Face": "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=700&q=85",
  "Beauty & Cosmetics": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=700&q=85",
  "Feminine Hygiene": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=700&q=85",
  "Baby Care": "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=700&q=85",
  "Health & Pharma": "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=700&q=85",
  "Sexual Wellness": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=700&q=85",
  "Home & Lifestyle": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=700&q=85",
  "Cleaners & Repellents": "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=700&q=85",
  Electronics: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=700&q=85",
  "Stationery & Games": "https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?auto=format&fit=crop&w=700&q=85",
  "Ice Cream Store": "https://images.unsplash.com/photo-1567206563064-6f60f40a2b57?auto=format&fit=crop&w=700&q=85",
  "Travel Store": "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=700&q=85",
  "Hobby Store": "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=700&q=85",
  "Sports Store": "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=700&q=85",
};

const rotate = (items, index) => items[index % items.length];

const safeImageQueryByCategory = {
  "Sexual Wellness": "pharmacy wellness product",
  "Feminine Hygiene": "hygiene product pack",
  "Health & Pharma": "medicine pack",
  "Paan Corner": "mouth freshener",
};

const getImageQuery = (product, category) => {
  if (safeImageQueryByCategory[category]) return safeImageQueryByCategory[category];
  const brand = product.brand || "";
  const name = product.name || "";
  const brandedName = brand && !name.toLowerCase().startsWith(brand.toLowerCase()) ? `${brand} ${name}` : name;
  return `${brandedName} ${category}`.trim();
};

const getProductImage = (product, category, index) => {
  const query = encodeURIComponent(getImageQuery(product, category));
  return `https://loremflickr.com/700/700/${query}?lock=${1200 + index}`;
};

const vegBrands = ["Fresho", "Safe Harvest", "Organic India", "Organic Tattva", "Farmley Fresh", "Local Farm"];
const fruitBrands = ["Fresho", "Kimaye", "Organic India", "Local Farm"];

const vegetableProducts = [
  "Potato", "Onion", "Tomato", "Garlic", "Ginger", "Green Chilli", "Capsicum", "Cabbage", "Cauliflower", "Brinjal",
  "Lady Finger", "Cucumber", "Spinach", "Coriander", "Mint", "Beetroot", "Radish", "Pumpkin", "Bottle Gourd", "Bitter Gourd",
].map((name, index) => ({
  name: `${rotate(vegBrands, index)} ${name}`,
  brand: rotate(vegBrands, index),
  description: `Fresh ${name.toLowerCase()} for everyday Indian cooking.`,
  category: "Vegetables & Fruits",
  unit: index < 12 ? "1 kg" : "250 g",
  variants: index < 12 ? ["500 g", "1 kg", "2 kg"] : ["100 g", "250 g", "500 g"],
  price: [35, 42, 48, 120, 85, 28, 70, 45, 55, 50][index % 10],
  stock: 80 + index,
}));

const fruitProducts = [
  "Banana", "Apple", "Mango", "Orange", "Grapes", "Watermelon", "Papaya", "Guava", "Kiwi", "Pineapple", "Pear", "Pomegranate", "Coconut", "Muskmelon",
].map((name, index) => ({
  name: `${rotate(fruitBrands, index)} ${name}`,
  brand: rotate(fruitBrands, index),
  description: `Naturally sweet ${name.toLowerCase()} picked for quick grocery baskets.`,
  category: "Vegetables & Fruits",
  unit: ["1 dozen", "1 kg", "1 kg", "1 kg", "500 g"][index % 5],
  variants: ["500 g", "1 kg", "2 kg"],
  price: [55, 180, 140, 90, 120, 65, 75, 85, 170, 95][index % 10],
  stock: 60 + index,
}));

const productGroups = [
  { category: "Vegetables & Fruits", products: [...vegetableProducts, ...fruitProducts] },
  {
    category: "Atta, Rice & Dal",
    products: [
      ...["Aashirvaad", "Fortune", "Pillsbury", "Annapurna", "Patanjali", "Nature Fresh", "Shakti Bhog"].map((brand, index) => ({
        name: `${brand} Whole Wheat Atta`, brand, description: "Everyday chakki atta for soft rotis.", unit: "5 kg", variants: ["1 kg", "5 kg", "10 kg"], price: 245 + index * 8, stock: 70,
      })),
      ...["India Gate", "Daawat", "Fortune", "Lal Qilla", "Kohinoor", "Fortune Rozana"].map((brand, index) => ({
        name: `${brand} Basmati Rice`, brand, description: "Aromatic rice for biryani, pulao, and daily meals.", unit: "5 kg", variants: ["1 kg", "5 kg", "10 kg"], price: 330 + index * 18, stock: 55,
      })),
      ...["Tata Sampann", "Organic Tattva", "24 Mantra", "Fortune", "Vedaka", "Natureland"].map((brand, index) => ({
        name: `${brand} Toor Dal`, brand, description: "Protein-rich dal for homestyle meals.", unit: "1 kg", variants: ["500 g", "1 kg", "2 kg"], price: 145 + index * 7, stock: 90,
      })),
    ],
  },
  {
    category: "Oil, Ghee & Masala",
    products: [
      ...["Fortune", "Dhara", "Saffola", "Sundrop", "Gemini", "Freedom", "Engine", "Emami Healthy", "Patanjali"].map((brand, index) => ({
        name: `${brand} Cooking Oil`, brand, description: "Refined cooking oil for frying and daily cooking.", unit: "1 L", variants: ["1 L", "5 L"], price: 135 + index * 5, stock: 75,
      })),
      ...["Amul", "Mother Dairy", "Gowardhan", "Patanjali", "Aashirvaad", "Nandini"].map((brand, index) => ({
        name: `${brand} Pure Ghee`, brand, description: "Aromatic ghee for sweets, tadka, and festive cooking.", unit: "1 L", variants: ["500 ml", "1 L"], price: 540 + index * 15, stock: 45,
      })),
      ...["MDH", "Everest", "Catch", "Tata Sampann", "Badshah", "Ramdev", "Sunrise", "Patanjali"].map((brand, index) => ({
        name: `${brand} Garam Masala`, brand, description: "Classic spice blend for rich Indian gravies.", unit: "100 g", variants: ["50 g", "100 g", "200 g"], price: 72 + index * 4, stock: 95,
      })),
    ],
  },
  {
    category: "Dairy, Bread & Eggs",
    products: [
      ...["Amul", "Mother Dairy", "Nandini", "Verka", "Sudha", "Aavin", "Heritage", "Nestle", "Country Delight"].map((brand, index) => ({
        name: `${brand} Toned Milk`, brand, description: "Fresh milk for tea, coffee, cereal, and daily nutrition.", unit: "500 ml", variants: ["500 ml", "1 L"], price: 30 + index, stock: 120,
      })),
      ...["Amul", "Britannia", "Mother Dairy"].map((brand, index) => ({
        name: `${brand} Butter`, brand, description: "Creamy table butter for breakfast and cooking.", unit: "500 g", variants: ["100 g", "500 g"], price: 265 + index * 10, stock: 60,
      })),
      ...["Amul", "Britannia", "Go Cheese", "Milky Mist"].map((brand, index) => ({
        name: `${brand} Cheese Slices`, brand, description: "Cheese slices for sandwiches, burgers, and snacks.", unit: "200 g", variants: ["100 g", "200 g", "400 g"], price: 135 + index * 12, stock: 50,
      })),
      ...["Amul", "Mother Dairy", "Milky Mist"].map((brand, index) => ({
        name: `${brand} Paneer`, brand, description: "Soft paneer for curries, rolls, and grilling.", unit: "200 g", variants: ["200 g", "500 g"], price: 95 + index * 8, stock: 45,
      })),
      ...["Britannia", "Harvest Gold", "Modern", "English Oven", "Bonn"].map((brand, index) => ({
        name: `${brand} Bread`, brand, description: "Soft bread for toast, sandwiches, and breakfast.", unit: "400 g", variants: ["400 g"], price: 42 + index * 3, stock: 80,
      })),
      ...["Eggoz", "Happy Eggs", "Local Farm Eggs"].map((brand, index) => ({
        name: `${brand} Brown Eggs`, brand, description: "Protein-rich eggs for breakfast and baking.", unit: "6 pieces", variants: ["6 pieces", "12 pieces"], price: 75 + index * 8, stock: 60, type: "Egg",
      })),
    ],
  },
  {
    category: "Bakery & Biscuits",
    products: ["Britannia", "Parle", "Sunfeast", "Unibic", "McVitie's", "Oreo", "Bisk Farm", "Priyagold"].map((brand, index) => ({
      name: `${brand} Biscuits`, brand, description: "Crunchy biscuits and cookies for tea-time snacking.", unit: "200 g", variants: ["100 g", "200 g", "400 g"], price: 35 + index * 6, stock: 90,
    })),
  },
  {
    category: "Dry Fruits & Cereals",
    products: ["Farmley", "Happilo", "Tulsi", "Nutraj", "Urban Platter", "Saffola", "Kellogg's", "Bagrry's", "Yoga Bar"].map((brand, index) => ({
      name: index < 5 ? `${brand} Almonds` : `${brand} Breakfast Cereal`, brand, description: "Healthy dry fruit and cereal picks for everyday nutrition.", unit: index < 5 ? "200 g" : "475 g", variants: ["200 g", "475 g", "1 kg"], price: 185 + index * 12, stock: 50,
    })),
  },
  {
    category: "Chicken, Meat & Fish",
    products: ["Licious", "FreshToHome", "Godrej Real Good", "Venky's", "Suguna"].map((brand, index) => ({
      name: `${brand} Fresh Chicken`, brand, description: "Clean and fresh non-veg essentials for home cooking.", unit: "500 g", variants: ["500 g", "1 kg"], price: 210 + index * 15, stock: 35, type: "Non-Veg",
    })),
  },
  {
    category: "Kitchenware & Appliances",
    products: ["Prestige", "Pigeon", "Hawkins", "Milton", "Borosil", "Cello", "Wonderchef", "Bajaj", "Philips", "Butterfly"].map((brand, index) => ({
      name: `${brand} Kitchen Essential`, brand, description: "Useful kitchenware and appliance item for modern homes.", unit: "piece", variants: ["piece"], price: 249 + index * 90, stock: 30, type: "Household",
    })),
  },
  {
    category: "Chips & Namkeen",
    products: ["Lay's", "Bingo", "Haldiram's", "Balaji", "Too Yumm", "Kurkure", "Pringles", "Bikaji"].map((brand, index) => ({
      name: `${brand} Chips & Namkeen`, brand, description: "Crunchy savoury snacks for cravings and guests.", unit: "200 g", variants: ["52 g", "200 g", "400 g"], price: 25 + index * 8, stock: 100,
    })),
  },
  {
    category: "Sweets & Chocolates",
    products: ["Cadbury", "Nestle", "Ferrero", "Mars", "Haldiram's", "Bikaji", "Kaju Katli Packs", "Lindt"].map((brand, index) => ({
      name: `${brand} Sweet Treat`, brand, description: "Chocolate or sweet pack for gifting and cravings.", unit: "100 g", variants: ["55 g", "100 g", "200 g"], price: 45 + index * 25, stock: 75,
    })),
  },
  {
    category: "Drinks & Juices",
    products: ["Real", "Tropicana", "Minute Maid", "B Natural", "Paper Boat", "Frooti", "Maaza", "Slice"].map((brand, index) => ({
      name: `${brand} Fruit Drink`, brand, description: "Refreshing juice and fruit drink for any time of day.", unit: "1 L", variants: ["200 ml", "1 L"], price: 20 + index * 8, stock: 85,
    })),
  },
  {
    category: "Tea, Coffee & Milk Drinks",
    products: [
      ...["Tata Tea", "Red Label", "Brooke Bond", "Society Tea", "Wagh Bakri", "Girnar"].map((brand, index) => ({
        name: `${brand} Tea`, brand, description: "Strong tea blend for refreshing Indian chai.", unit: "500 g", variants: ["250 g", "500 g", "1 kg"], price: 190 + index * 9, stock: 70,
      })),
      ...["Nescafe", "Bru", "Rage Coffee", "Sleepy Owl"].map((brand, index) => ({
        name: `${brand} Coffee`, brand, description: "Coffee for quick hot or cold brews.", unit: "100 g", variants: ["50 g", "100 g", "200 g"], price: 180 + index * 25, stock: 45,
      })),
      ...["Horlicks", "Bournvita", "Boost", "Complan", "Pediasure"].map((brand, index) => ({
        name: `${brand} Health Drink`, brand, description: "Milk drink mix for daily energy and nutrition.", unit: "500 g", variants: ["200 g", "500 g", "1 kg"], price: 220 + index * 15, stock: 55,
      })),
    ],
  },
  {
    category: "Instant Food",
    products: ["Maggi", "Yippee", "Knorr", "Top Ramen", "Ching's", "MTR", "Gits", "Haldiram's"].map((brand, index) => ({
      name: `${brand} Instant Food`, brand, description: "Quick meal option for busy days and late-night snacks.", unit: "pack", variants: ["pack", "4 pack", "12 pack"], price: 18 + index * 12, stock: 120,
    })),
  },
  {
    category: "Sauces & Spreads",
    products: ["Kissan", "Veeba", "Del Monte", "Heinz", "Funfoods", "Nutella", "Dr. Oetker"].map((brand, index) => ({
      name: `${brand} Sauce & Spread`, brand, description: "Sauce or spread for sandwiches, snacks, and breakfast.", unit: "300 g", variants: ["200 g", "300 g", "500 g"], price: 95 + index * 18, stock: 65,
    })),
  },
  {
    category: "Paan Corner",
    products: [
      ...["Mouth Freshener", "Pan Masala", "Saunf", "Supari", "Elaichi", "Mint"].map((name, index) => ({
        name, brand: rotate(["Pass Pass", "Rajnigandha", "Pan Vilas", "Pulse", "Chingles"], index), description: "Paan corner pick for freshness and after-meal use.", unit: "pack", variants: ["pack"], price: 20 + index * 6, stock: 70,
      })),
      ...["Pass Pass", "Rajnigandha", "Pan Vilas", "Pulse", "Chingles"].map((brand, index) => ({
        name: `${brand} Mouth Freshener`, brand, description: "Compact mouth freshener pack.", unit: "pack", variants: ["pack"], price: 15 + index * 8, stock: 80,
      })),
    ],
  },
  {
    category: "Ice Creams & More",
    products: ["Amul", "Kwality Wall's", "Vadilal", "Havmor", "Mother Dairy", "Baskin Robbins", "Cream Bell", "Naturals"].map((brand, index) => ({
      name: `${brand} Ice Cream`, brand, description: "Chilled ice cream tub or bar for dessert time.", unit: "500 ml", variants: ["100 ml", "500 ml", "1 L"], price: 45 + index * 18, stock: 50,
    })),
  },
  {
    category: "Bath & Body",
    products: ["Dove", "Lux", "Lifebuoy", "Pears", "Dettol", "Santoor", "Fiama", "Nivea"].map((brand, index) => ({
      name: `${brand} Bath Soap`, brand, description: "Bath and body care essential for daily hygiene.", unit: "100 g", variants: ["75 g", "100 g", "3 pack"], price: 38 + index * 6, stock: 85, type: "Other",
    })),
  },
  {
    category: "Hair",
    products: ["Dove", "Tresemme", "Pantene", "Clinic Plus", "Sunsilk", "Head & Shoulders", "Indulekha", "Parachute", "Livon"].map((brand, index) => ({
      name: `${brand} Hair Care`, brand, description: "Hair care product for everyday grooming.", unit: "180 ml", variants: ["90 ml", "180 ml", "340 ml"], price: 95 + index * 18, stock: 60, type: "Other",
    })),
  },
  {
    category: "Skin & Face",
    products: ["Pond's", "Nivea", "Lakme", "Himalaya", "Mamaearth", "Cetaphil", "Minimalist", "Dot & Key"].map((brand, index) => ({
      name: `${brand} Face Care`, brand, description: "Skin and face care product for daily routines.", unit: "100 ml", variants: ["50 ml", "100 ml"], price: 120 + index * 25, stock: 55, type: "Other",
    })),
  },
  {
    category: "Beauty & Cosmetics",
    products: ["Lakme", "Maybelline", "L'Oreal Paris", "Sugar", "Swiss Beauty", "Faces Canada", "Colorbar", "Insight"].map((brand, index) => ({
      name: `${brand} Makeup Essential`, brand, description: "Beauty and cosmetic essential for everyday looks.", unit: "piece", variants: ["piece"], price: 149 + index * 35, stock: 45, type: "Other",
    })),
  },
  {
    category: "Feminine Hygiene",
    products: ["Whisper", "Stayfree", "Sofy", "Carmesi", "Pee Safe", "Sirona"].map((brand, index) => ({
      name: `${brand} Hygiene Pack`, brand, description: "Feminine hygiene essential for comfort and care.", unit: "pack", variants: ["pack"], price: 85 + index * 15, stock: 65, type: "Other",
    })),
  },
  {
    category: "Baby Care",
    products: ["Johnson's", "Himalaya Baby", "Sebamed", "Mee Mee", "Pampers", "Huggies", "Mamaearth Baby"].map((brand, index) => ({
      name: `${brand} Baby Care`, brand, description: "Baby care essential for gentle daily use.", unit: "pack", variants: ["pack"], price: 120 + index * 30, stock: 55, type: "Other",
    })),
  },
  {
    category: "Health & Pharma",
    products: ["Dabur", "Baidyanath", "Himalaya", "Patanjali", "Digene", "ENO", "Crocin", "Dolo 650", "Volini", "Vicks"].map((brand, index) => ({
      name: `${brand} Health Essential`, brand, description: "Health and wellness product for home medicine needs.", unit: "pack", variants: ["pack"], price: 45 + index * 18, stock: 50, type: "Other",
    })),
  },
  {
    category: "Sexual Wellness",
    products: ["Durex", "Manforce", "Skore", "KamaSutra", "Moods"].map((brand, index) => ({
      name: `${brand} Wellness Pack`, brand, description: "Personal wellness product for private care.", unit: "pack", variants: ["pack"], price: 120 + index * 20, stock: 35, type: "Other",
    })),
  },
  {
    category: "Home & Lifestyle",
    products: ["Cello", "Milton", "Home Centre", "Solimo", "IKEA", "Borosil"].map((brand, index) => ({
      name: `${brand} Home Essential`, brand, description: "Home and lifestyle essential for everyday living.", unit: "piece", variants: ["piece"], price: 149 + index * 60, stock: 40, type: "Household",
    })),
  },
  {
    category: "Cleaners & Repellents",
    products: ["Lizol", "Harpic", "Colin", "Domex", "Vim", "Exo", "Scotch-Brite", "Good Knight", "All Out", "Mortein", "Hit"].map((brand, index) => ({
      name: `${brand} Cleaner & Repellent`, brand, description: "Home cleaning or pest-control essential.", unit: "500 ml", variants: ["250 ml", "500 ml", "1 L"], price: 75 + index * 12, stock: 65, type: "Household",
    })),
  },
  {
    category: "Electronics",
    products: ["Boat", "Noise", "JBL", "Philips", "Bajaj", "Havells", "Syska", "Wipro", "Portronics"].map((brand, index) => ({
      name: `${brand} Electronic Accessory`, brand, description: "Useful electronic accessory for home or travel.", unit: "piece", variants: ["piece"], price: 299 + index * 110, stock: 35, type: "Household",
    })),
  },
  {
    category: "Stationery & Games",
    products: ["Classmate", "Camlin", "Faber-Castell", "Reynolds", "Cello", "Navneet", "Funskool", "Hasbro", "Mattel"].map((brand, index) => ({
      name: `${brand} Stationery & Game`, brand, description: "Stationery, activity, or game item for school and play.", unit: "piece", variants: ["piece"], price: 35 + index * 35, stock: 70, type: "Other",
    })),
  },
  {
    category: "Ice Cream Store",
    products: ["Baskin Robbins", "Naturals", "Amul", "Havmor", "Kwality Wall's", "Vadilal"].map((brand, index) => ({
      name: `${brand} Premium Ice Cream`, brand, description: "Spotlight ice cream pick for chilled dessert baskets.", unit: "500 ml", variants: ["100 ml", "500 ml", "1 L"], price: 80 + index * 25, stock: 45,
    })),
  },
  {
    category: "Travel Store",
    products: ["Safari", "VIP", "American Tourister", "Wildcraft", "Skybags", "Aristocrat"].map((brand, index) => ({
      name: `${brand} Travel Essential`, brand, description: "Travel store pick for trips, storage, and commute needs.", unit: "piece", variants: ["piece"], price: 399 + index * 130, stock: 25, type: "Household",
    })),
  },
  {
    category: "Hobby Store",
    products: ["Camel", "Faber-Castell", "Cricut", "Fevicol", "Pidilite", "Kokuyo"].map((brand, index) => ({
      name: `${brand} Hobby Supply`, brand, description: "Creative hobby and craft supply for projects.", unit: "piece", variants: ["piece"], price: 45 + index * 45, stock: 60, type: "Other",
    })),
  },
  {
    category: "Sports Store",
    products: ["Nike", "Adidas", "Puma", "Nivia", "Cosco", "Yonex", "SG", "SS", "Decathlon", "Reebok"].map((brand, index) => ({
      name: `${brand} Sports Gear`, brand, description: "Sports and fitness gear for active routines.", unit: "piece", variants: ["piece"], price: 199 + index * 120, stock: 35, type: "Other",
    })),
  },
];

let imageIndex = 0;

const defaultProducts = productGroups.flatMap(({ category, products }) =>
  products.map((product, index) => {
    const image = getProductImage(product, category, imageIndex);
    imageIndex += 1;

    return {
    discountPercentage: index % 7 === 0 ? 5 : 0,
    image,
    images: [image, imageByCategory[category]],
    lowStockThreshold: 15,
    stock: product.stock || 50,
    type: product.type || "Veg",
    variants: product.variants || [product.unit || "piece"],
    unit: product.unit || "piece",
    price: product.price || 99,
    category,
    ...product,
    };
  })
);

module.exports = defaultProducts;
