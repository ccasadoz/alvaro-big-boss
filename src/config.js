const envUrl = import.meta.env.VITE_API_URL;
export const API_BASE_URL = (envUrl && envUrl.startsWith('http')) ? envUrl : 'https://bigboss-api.onrender.com';
