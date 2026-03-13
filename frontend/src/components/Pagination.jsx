/**
 * Pagination — Navigation entre les pages de résultats.
 */

import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ pagination, onPageChange }) {
  const { page, total_pages, has_next, has_prev, total } = pagination;

  if (total_pages <= 1) return null;

  // Générer les numéros de page à afficher
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    let end = Math.min(total_pages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push('...');
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < total_pages) {
      if (end < total_pages - 1) pages.push('...');
      pages.push(total_pages);
    }

    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6">
      <p className="text-sm text-dark-500">
        Page {page} sur {total_pages} — {total} résultat{total > 1 ? 's' : ''}
      </p>

      <nav className="flex items-center gap-1" aria-label="Pagination">
        {/* Précédent */}
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={!has_prev}
          className="p-2 rounded-lg text-dark-500 hover:bg-dark-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Page précédente"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Numéros */}
        {getPageNumbers().map((p, idx) =>
          p === '...' ? (
            <span key={`dots-${idx}`} className="px-2 text-dark-400">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`min-w-[40px] h-10 rounded-lg text-sm font-medium transition-colors
                ${
                  p === page
                    ? 'bg-primary-600 text-white'
                    : 'text-dark-600 hover:bg-dark-100'
                }`}
              aria-current={p === page ? 'page' : undefined}
            >
              {p}
            </button>
          )
        )}

        {/* Suivant */}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!has_next}
          className="p-2 rounded-lg text-dark-500 hover:bg-dark-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Page suivante"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </nav>
    </div>
  );
}
