import axios from 'axios';
import { secureStorage } from './secureStorage';

const getBaseURL = () => {
  let url = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  if (!url.endsWith('/api')) {
    url = url.replace(/\/$/, '') + '/api';
  }
  return url;
};

export const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000, // Timeout süresini 30 saniyeye çıkardım (Android için daha güvenli)
});

api.interceptors.request.use(async (config) => {
  const token = await secureStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
