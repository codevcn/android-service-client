import axios from "axios"

const BASE_URL = import.meta.env.VITE_API_ENDPOINT_PREFIX

const clientAxios = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
})

export { clientAxios }
