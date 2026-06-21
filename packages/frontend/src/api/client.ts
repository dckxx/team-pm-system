import axios from 'axios';
import router from '../router';

const client = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request interceptor: attach Bearer token ──────────────────────────
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor: handle 401 and parse errors ─────────────────
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response) {
      const { status, data } = error.response;

      // 401 → auto-logout via SPA navigation
      if (status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
        return Promise.reject(new Error('未登录或登录已过期'));
      }

      // Extract meaningful error message from response body
      const message =
        data?.message || data?.error || error.message || '请求失败';
      return Promise.reject(new Error(message));
    }

    // Network or timeout errors
    console.error('[API] Network error:', error);
    return Promise.reject(new Error('网络错误，请稍后重试'));
  },
);

export default client;
