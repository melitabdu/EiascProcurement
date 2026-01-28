// src/services/authService.js
import api from './api';

export const login = async (phone, password) => {
  const res = await api.post('/auth/login', { phone, password });
  return res.data;
};

export const register = async (name, phone, password) => {
  const res = await api.post('/auth/register', { name, phone, password });
  return res.data;
};
