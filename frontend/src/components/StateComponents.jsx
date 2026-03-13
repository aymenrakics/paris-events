/**
 * Composants d'état : Loading, Empty, Error.
 */

import { SearchX, AlertTriangle, RefreshCw } from 'lucide-react';

// ─── Skeleton de carte ────────────────────────────────────────────

export function EventCardSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="aspect-[16/10] bg-dark-100" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-dark-100 rounded w-3/4" />
        <div className="h-4 bg-dark-100 rounded w-full" />
        <div className="h-4 bg-dark-100 rounded w-1/2" />
        <div className="space-y-2 pt-2">
          <div className="h-3 bg-dark-100 rounded w-2/3" />
          <div className="h-3 bg-dark-100 rounded w-1/2" />
        </div>
      </div>
    </div>
  );
}

export function LoadingGrid({ count = 8 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <EventCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ─── État vide ────────────────────────────────────────────────────

export function EmptyState({ query, onReset }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-full bg-dark-100 flex items-center justify-center mb-4">
        <SearchX className="w-8 h-8 text-dark-400" />
      </div>
      <h3 className="font-display text-xl text-dark-700 mb-2">
        Aucun événement trouvé
      </h3>
      <p className="text-dark-500 max-w-md mb-6">
        {query
          ? `Nous n'avons trouvé aucun résultat pour "${query}". Essayez d'autres mots-clés ou modifiez vos filtres.`
          : 'Aucun événement ne correspond à vos critères de recherche.'}
      </p>
      {onReset && (
        <button onClick={onReset} className="btn-primary">
          Réinitialiser les filtres
        </button>
      )}
    </div>
  );
}

// ─── Erreur ───────────────────────────────────────────────────────

export function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
        <AlertTriangle className="w-8 h-8 text-red-400" />
      </div>
      <h3 className="font-display text-xl text-dark-700 mb-2">
        Oups, une erreur est survenue
      </h3>
      <p className="text-dark-500 max-w-md mb-6">
        {message || "Impossible de charger les événements. Vérifiez votre connexion et réessayez."}
      </p>
      {onRetry && (
        <button onClick={onRetry} className="btn-primary">
          <RefreshCw className="w-4 h-4" />
          Réessayer
        </button>
      )}
    </div>
  );
}
