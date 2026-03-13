/**
 * HomePage — Page principale avec recherche, filtres et grille d'événements.
 */

import { useEvents } from '../hooks/useEvents';
import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';
import FilterBar from '../components/FilterBar';
import EventCard from '../components/EventCard';
import Pagination from '../components/Pagination';
import { LoadingGrid, EmptyState, ErrorState } from '../components/StateComponents';

export default function HomePage() {
  const {
    events,
    categories,
    loading,
    error,
    pagination,
    filters,
    updateFilter,
    resetFilters,
    goToPage,
    reload,
  } = useEvents();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <section className="text-center mb-10">
        <h1 className="font-display text-4xl sm:text-5xl text-dark-950 mb-3">
          Que faire à Paris ?
        </h1>
        <p className="text-lg text-dark-500 max-w-2xl mx-auto">
          Explorez les événements culturels et ludiques de la capitale :
          concerts, spectacles, expositions, sport et bien plus.
        </p>
      </section>

      {/* Recherche */}
      <section className="mb-6">
        <SearchBar
          value={filters.q}
          onChange={(value) => updateFilter('q', value)}
        />
      </section>

      {/* Catégories */}
      {categories.length > 0 && (
        <section className="mb-5">
          <CategoryFilter
            categories={categories}
            activeCategory={filters.category}
            onSelect={(cat) => updateFilter('category', cat)}
          />
        </section>
      )}

      {/* Filtres secondaires */}
      <section className="mb-8">
        <FilterBar
          filters={filters}
          updateFilter={updateFilter}
          resetFilters={resetFilters}
        />
      </section>

      {/* Résultats */}
      <section>
        {/* Header résultats */}
        {!loading && !error && events.length > 0 && (
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-dark-500">
              <span className="font-semibold text-dark-700">{pagination.total}</span>{' '}
              événement{pagination.total > 1 ? 's' : ''} trouvé{pagination.total > 1 ? 's' : ''}
              {filters.category && (
                <span>
                  {' '}dans <span className="font-medium text-dark-700">{filters.category}</span>
                </span>
              )}
            </p>
          </div>
        )}

        {/* Grille */}
        {loading ? (
          <LoadingGrid />
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : events.length === 0 ? (
          <EmptyState query={filters.q} onReset={resetFilters} />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {events.map((event, index) => (
                <EventCard key={event.id} event={event} index={index} />
              ))}
            </div>

            {/* Pagination */}
            <Pagination pagination={pagination} onPageChange={goToPage} />
          </>
        )}
      </section>
    </div>
  );
}
