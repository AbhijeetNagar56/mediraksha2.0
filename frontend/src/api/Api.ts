import axios from "axios";

const instance = axios.create({
  // import.meta.env is used for Vite
  baseURL: "https://mediraksha2-0.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export default instance;