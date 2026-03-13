/**
 * Service de gestion des favoris — Stockage local côté client.
 */

const STORAGE_KEY = 'paris-events-favorites';

/**
 * Récupère la liste des IDs favoris.
 */
export function getFavorites() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Vérifie si un événement est en favoris.
 */
export function isFavorite(eventId) {
  return getFavorites().includes(eventId);
}

/**
 * Ajoute ou retire un événement des favoris (toggle).
 */
export function toggleFavorite(eventId) {
  const favorites = getFavorites();
  const index = favorites.indexOf(eventId);

  if (index === -1) {
    favorites.push(eventId);
  } else {
    favorites.splice(index, 1);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  return favorites;
}

/**
 * Retourne le nombre de favoris.
 */
export function getFavoritesCount() {
  return getFavorites().length;
}
