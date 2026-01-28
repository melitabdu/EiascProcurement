// src/utils/axios.js
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true, // Required for sending cookies/sessions
});

export default axiosInstance;
