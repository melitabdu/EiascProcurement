import axios from './axios';

// Save token and user data to localStorage
const saveAuthData = (data) => {
  if (data.token) {
    localStorage.setItem('token', data.token);
  }
  if (data.user) {
    localStorage.setItem('user', JSON.stringify(data.user));
  }
};

// Get the stored user object
export const getLoggedInUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Get stored token
export const getToken = () => {
  return localStorage.getItem('token');
};

// Login function
export const login = async (phone, password) => {
  const response = await axios.post('/auth/login', { phone, password });
  saveAuthData(response.data);
  return response.data;
};

// Register function
export const register = async (name, phone, password) => {
  const response = await axios.post('/auth/register', { name, phone, password });
  saveAuthData(response.data);
  return response.data;
};

// Logout function
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};
