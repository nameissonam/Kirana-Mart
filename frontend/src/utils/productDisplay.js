export const getProductDisplayName = (product = {}) => {
  if (product.category !== "Vegetables & Fruits" || !product.brand || !product.name) {
    return product.name || "";
  }

  const normalizedBrand = product.brand.toLowerCase();
  const normalizedName = product.name.toLowerCase();

  if (normalizedName.startsWith(`${normalizedBrand} `)) {
    return product.name.slice(product.brand.length).trim();
  }

  return product.name;
};
