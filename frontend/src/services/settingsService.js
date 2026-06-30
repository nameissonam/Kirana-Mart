import axios from "axios";
import { apiUrl } from "../config/api";

const SETTINGS_API = apiUrl("/api/settings");

export const DEFAULT_STORE_SETTINGS = {
  deliveryCharge: 30,
  homeDeliveryMinValue: 750,
  minOrderValue: 100,
  address: "Kirana Mart, Railway Crossing Line, near Kali Mandir, Yashoda Nagar, Khankripara, Chhota Gobindpur, Jamshedpur, Jharkhand 831004",
};

export const getStoreSettings = async () => {
  const response = await axios.get(SETTINGS_API);
  return {
    ...DEFAULT_STORE_SETTINGS,
    ...(response.data.settings || {}),
  };
};
