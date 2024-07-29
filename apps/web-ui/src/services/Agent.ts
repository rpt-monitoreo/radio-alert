import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_LOCAL, // Asegúrate de que esta variable esté configurada en tu .env
  headers: {
    'bypass-tunnel-reminder': 'true', // Encabezado para evitar la página de recordatorio
    'User-Agent': 'CustomUserAgent', // User-Agent personalizado
  },
});

export default api;
