/**
 * Hook personnalisé pour la gestion des favoris avec re-rendering React.
 */

import { useState, useCallback } from 'react';
import {
  getFavorites,
  isFavorite as checkFavorite,
  toggleFavorite as toggle,
} from '../services/favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState(getFavorites());

  const toggleFavorite = useCallback((eventId) => {
    const updated = toggle(eventId);
    setFavorites([...updated]);
  }, []);

  const isFavorite = useCallback(
    (eventId) => favorites.includes(eventId),
    [favorites]
  );

  return {
    favorites,
    toggleFavorite,
    isFavorite,
    count: favorites.length,
  };
}
