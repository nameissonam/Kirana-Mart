import axios from "axios";
import { apiUrl } from "../config/api";

const API_URL = apiUrl("/api/products");

export const getProducts = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const getProductById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};
