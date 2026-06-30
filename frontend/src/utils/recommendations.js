const recommendationPairs = {
  milk: ["bread"], bread: ["jam"], jam: ["butter"], butter: ["egg"],
  tea: ["biscuit", "cookie"], rice: ["dal"], oil: ["atta", "flour"],
};

export const getRecommendations = (product, products = []) => {
  const name = product?.name?.toLowerCase() || "";
  const keys = Object.keys(recommendationPairs).find((key) => name.includes(key));
  const terms = keys ? recommendationPairs[keys] : [];
  const matched = products.filter((item) =>
    item._id !== product?._id && terms.some((term) => item.name.toLowerCase().includes(term))
  );
  const fallback = products.filter((item) => item._id !== product?._id && item.category === product?.category);
  return [...matched, ...fallback.filter((item) => !matched.includes(item))].slice(0, 8);
};
