import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const api = axios.create({
  baseURL: '/api',  // Базовый адрес API
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null) => {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(error);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;

        try {
          // Запрос на обновление токена
          const refreshResponse = await api.post('/auth/refresh', {
            refreshToken: localStorage.getItem('refreshToken'),
          });

          const newAccessToken = refreshResponse.data.accessToken;

          // Сохраняем новый токен и обновляем заголовки
          localStorage.setItem('token', newAccessToken);
          api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;

          processQueue(null, newAccessToken);
          isRefreshing = false;

          // Повторяем исходный запрос с новым токеном
          return api(originalRequest);
        } catch (err) {
          processQueue(err, null);
          isRefreshing = false;
          const auth = useAuth();
          auth.logout();
          throw err;
        }
      }

      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token: string) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            resolve(api(originalRequest));
          },
          reject: (err: any) => reject(err),
        });
      });
    }

    return Promise.reject(error);
  }
);

export default api;
