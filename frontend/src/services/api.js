/**
 * Service API — Client HTTP pour communiquer avec le backend FastAPI.
 * Centralise tous les appels réseau et la gestion d'erreurs.
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur de réponse pour la gestion centralisée des erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

/**
 * Récupère la liste des événements avec filtres et pagination.
 */
export async function fetchEvents(params = {}) {
  const { data } = await api.get('/events', { params });
  return data;
}

/**
 * Récupère le détail d'un événement par son ID.
 */
export async function fetchEventById(id) {
  const { data } = await api.get(`/events/${id}`);
  return data;
}

/**
 * Récupère la liste des catégories.
 */
export async function fetchCategories() {
  const { data } = await api.get('/categories');
  return data;
}

/**
 * Lance une synchronisation manuelle.
 */
export async function triggerSync() {
  const { data } = await api.post('/events/sync');
  return data;
}

/**
 * Récupère le health check.
 */
export async function fetchHealth() {
  const { data } = await api.get('/health');
  return data;
}

/**
 * Récupère les statistiques.
 */
export async function fetchStats() {
  const { data } = await api.get('/stats');
  return data;
}

export default api;
