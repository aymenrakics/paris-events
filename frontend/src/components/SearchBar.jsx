/**
 * SearchBar — Barre de recherche avec debounce.
 */

import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

export default function SearchBar({ value, onChange }) {
  const [localValue, setLocalValue] = useState(value);

  // Debounce : attendre 400ms après la dernière frappe avant de lancer la recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [localValue, onChange, value]);

  // Synchroniser avec la valeur externe (ex: reset)
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400 pointer-events-none" />
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder="Rechercher un événement, un lieu, un artiste..."
        className="input-field pl-12 pr-10 text-base"
        aria-label="Recherche d'événements"
      />
      {localValue && (
        <button
          onClick={() => {
            setLocalValue('');
            onChange('');
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-dark-100 transition-colors"
          aria-label="Effacer la recherche"
        >
          <X className="w-4 h-4 text-dark-400" />
        </button>
      )}
    </div>
  );
}
