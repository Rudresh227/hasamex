import axios from 'axios';

const api = axios.create({
  // baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://hasamex.onrender.com/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
