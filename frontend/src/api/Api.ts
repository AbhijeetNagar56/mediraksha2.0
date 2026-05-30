import axios from "axios";

const instance = axios.create({
  baseURL: "https://mediraksha2-0.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export default instance;