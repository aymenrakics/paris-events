/**
 * Hook personnalisé pour la gestion des événements.
 * Encapsule la logique de fetch, filtrage et pagination.
 */

import { useState, useEffect, useCallback } from 'react';
import { fetchEvents, fetchCategories } from '../services/api';

export function useEvents() {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    per_page: 20,
    total_pages: 1,
    has_next: false,
    has_prev: false,
  });

  const [filters, setFilters] = useState({
    q: '',
    category: '',
    date_filter: '',
    free_only: false,
    sort_by: 'date',
    order: 'asc',
    page: 1,
  });

  // Charger les catégories au montage
  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch((err) => console.error('Failed to load categories:', err));
  }, []);

  // Charger les événements quand les filtres changent
  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {};
      if (filters.q) params.q = filters.q;
      if (filters.category) params.category = filters.category;
      if (filters.date_filter) params.date_filter = filters.date_filter;
      if (filters.free_only) params.free_only = true;
      params.sort_by = filters.sort_by;
      params.order = filters.order;
      params.page = filters.page;
      params.per_page = 20;

      const data = await fetchEvents(params);
      setEvents(data.items);
      setPagination({
        total: data.total,
        page: data.page,
        per_page: data.per_page,
        total_pages: data.total_pages,
        has_next: data.has_next,
        has_prev: data.has_prev,
      });
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des événements');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // Actions
  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : value, // Reset page quand on change un filtre
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      q: '',
      category: '',
      date_filter: '',
      free_only: false,
      sort_by: 'date',
      order: 'asc',
      page: 1,
    });
  }, []);

  const goToPage = useCallback((page) => {
    updateFilter('page', page);
  }, [updateFilter]);

  return {
    events,
    categories,
    loading,
    error,
    pagination,
    filters,
    updateFilter,
    resetFilters,
    goToPage,
    reload: loadEvents,
  };
}
