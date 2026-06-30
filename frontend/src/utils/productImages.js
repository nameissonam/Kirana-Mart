import { assetUrl } from "../config/api";

const imageMap = [
  [/amul.*milk|milk/i, "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=700&q=85"],
  [/amul.*butter|butter/i, "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=700&q=85"],
  [/tea/i, "https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?auto=format&fit=crop&w=700&q=85"],
  [/salt|spice/i, "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=700&q=85"],
  [/biscuit|cookie|good day/i, "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=700&q=85"],
  [/maggi|noodle/i, "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&w=700&q=85"],
  [/coke|coca|pepsi|cola/i, "https://images.unsplash.com/photo-1629203851122-3726ecdf080e?auto=format&fit=crop&w=700&q=85"],
  [/mango|fruit/i, "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?auto=format&fit=crop&w=700&q=85"],
  [/tomato|vegetable/i, "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=700&q=85"],
  [/paneer|cheese/i, "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=700&q=85"],
  [/atta|flour|rice|dal/i, "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=700&q=85"],
  [/oil/i, "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=700&q=85"],
];

export const defaultProductImage = "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=700&q=85";

export const getProductImage = (product = {}) => {
  const image = product.image || product.images?.find(Boolean) || "";
  if (image.startsWith("http") || image.startsWith("data:")) return image;
  if (image.startsWith("/uploads")) return assetUrl(image);
  if (image.startsWith("uploads")) return assetUrl(`/${image}`);
  if (image.startsWith("/")) return image;
  const text = `${product.brand || ""} ${product.name || ""}`;
  return imageMap.find(([pattern]) => pattern.test(text))?.[1] || defaultProductImage;
};
