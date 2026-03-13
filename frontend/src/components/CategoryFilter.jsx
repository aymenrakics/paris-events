/**
 * CategoryFilter — Filtrage par catégorie sous forme de chips.
 */

const CATEGORY_EMOJIS = {
  Concert: '🎵',
  Spectacle: '🎪',
  'Théâtre': '🎭',
  Exposition: '🖼️',
  Sport: '⚽',
  Danse: '💃',
  'Conférence': '🎤',
  Atelier: '🎨',
  Animation: '🎡',
  Festival: '🎉',
  'Cinéma': '🎬',
  Lecture: '📖',
  Salon: '🏛️',
  Enfants: '👶',
  Loisirs: '🎲',
  Balade: '🚶',
  Visite: '🏰',
  Autre: '📌',
};

export default function CategoryFilter({ categories, activeCategory, onSelect }) {
  return (
    <div className="flex flex-wrap gap-2">
      {/* Chip "Tout" */}
      <button
        onClick={() => onSelect('')}
        className={`chip ${!activeCategory ? 'chip-active' : ''}`}
      >
        Tout
      </button>

      {categories.map((cat) => (
        <button
          key={cat.name}
          onClick={() => onSelect(cat.name === activeCategory ? '' : cat.name)}
          className={`chip ${cat.name === activeCategory ? 'chip-active' : ''}`}
        >
          <span>{CATEGORY_EMOJIS[cat.name] || '📌'}</span>
          <span>{cat.name}</span>
          <span className="text-xs opacity-60">({cat.count})</span>
        </button>
      ))}
    </div>
  );
}
