import axios from "axios";
import { mergeWithFallbackProducts } from "../data/fallbackProducts";
import { apiUrl } from "../config/api";

const API_URL = apiUrl("/api/products");

export const getProducts = async () => {
  try {
    const response = await axios.get(API_URL);
    return mergeWithFallbackProducts(response.data);
  } catch (error) {
    console.warn("Using the local showcase catalog because the product API is unavailable.", error.message);
    return mergeWithFallbackProducts([]);
  }
};
