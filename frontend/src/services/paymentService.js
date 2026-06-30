import axios from "axios";
import { apiUrl } from "../config/api";

const API_URL = apiUrl("/api/payments");

const authConfig = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export const getPaymentConfig = async () => {
  const response = await axios.get(`${API_URL}/config`);
  return response.data;
};

export const createPaymentOrder = async (payload, token) => {
  const response = await axios.post(`${API_URL}/create-order`, payload, authConfig(token));
  return response.data;
};

export const verifyPayment = async (payload, token) => {
  const response = await axios.post(`${API_URL}/verify`, payload, authConfig(token));
  return response.data;
};

export const getPaymentStatus = async (attemptId, token) => {
  const response = await axios.get(`${API_URL}/status/${attemptId}`, authConfig(token));
  return response.data;
};

export const cancelPayment = async (attemptId, token) => {
  const response = await axios.post(`${API_URL}/cancel/${attemptId}`, {}, authConfig(token));
  return response.data;
};

export const loadRazorpayCheckout = () => new Promise((resolve, reject) => {
  if (window.Razorpay) {
    resolve(window.Razorpay);
    return;
  }
  const script = document.createElement("script");
  script.src = "https://checkout.razorpay.com/v1/checkout.js";
  script.async = true;
  script.onload = () => resolve(window.Razorpay);
  script.onerror = () => reject(new Error("Unable to load secure Razorpay Checkout"));
  document.body.appendChild(script);
});
