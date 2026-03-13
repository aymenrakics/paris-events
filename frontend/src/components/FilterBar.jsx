/**
 * FilterBar — Filtres secondaires (date, gratuit, tri).
 */

import { Calendar, ArrowUpDown, Ticket, RotateCcw } from 'lucide-react';

const DATE_OPTIONS = [
  { value: '', label: 'Toutes les dates' },
  { value: 'today', label: "Aujourd'hui" },
  { value: 'week', label: 'Cette semaine' },
  { value: 'month', label: 'Ce mois-ci' },
];

const SORT_OPTIONS = [
  { value: 'date:asc', label: 'Date (proche → loin)' },
  { value: 'date:desc', label: 'Date (loin → proche)' },
  { value: 'title:asc', label: 'Titre (A → Z)' },
  { value: 'title:desc', label: 'Titre (Z → A)' },
];

export default function FilterBar({ filters, updateFilter, resetFilters }) {
  const hasActiveFilters =
    filters.q || filters.category || filters.date_filter || filters.free_only;

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Filtre date */}
      <div className="relative">
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400 pointer-events-none" />
        <select
          value={filters.date_filter}
          onChange={(e) => updateFilter('date_filter', e.target.value)}
          className="pl-9 pr-4 py-2 rounded-lg border border-dark-200 bg-white text-sm text-dark-700 
                     focus:outline-none focus:ring-2 focus:ring-accent-400 appearance-none cursor-pointer"
        >
          {DATE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Filtre tri */}
      <div className="relative">
        <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400 pointer-events-none" />
        <select
          value={`${filters.sort_by}:${filters.order}`}
          onChange={(e) => {
            const [sort_by, order] = e.target.value.split(':');
            updateFilter('sort_by', sort_by);
            // Petit hack : on doit mettre à jour order séparément
            setTimeout(() => updateFilter('order', order), 0);
          }}
          className="pl-9 pr-4 py-2 rounded-lg border border-dark-200 bg-white text-sm text-dark-700
                     focus:outline-none focus:ring-2 focus:ring-accent-400 appearance-none cursor-pointer"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Toggle gratuit */}
      <button
        onClick={() => updateFilter('free_only', !filters.free_only)}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors
          ${
            filters.free_only
              ? 'bg-green-50 border-green-300 text-green-700'
              : 'bg-white border-dark-200 text-dark-600 hover:bg-dark-50'
          }`}
      >
        <Ticket className="w-4 h-4" />
        Gratuit
      </button>

      {/* Reset */}
      {hasActiveFilters && (
        <button
          onClick={resetFilters}
          className="btn-ghost text-sm text-primary-600 hover:text-primary-700"
        >
          <RotateCcw className="w-4 h-4" />
          Réinitialiser
        </button>
      )}
    </div>
  );
}
