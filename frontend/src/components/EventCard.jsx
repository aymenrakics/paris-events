/**
 * EventCard — Carte d'un événement dans la liste.
 */

import { Link } from 'react-router-dom';
import { MapPin, Calendar, Heart, Ticket } from 'lucide-react';
import { useFavorites } from '../hooks/useFavorites';
import { formatEventDate } from '../utils/dateUtils';

const CATEGORY_COLORS = {
  Concert: 'bg-violet-100 text-violet-700',
  Spectacle: 'bg-amber-100 text-amber-700',
  'Théâtre': 'bg-rose-100 text-rose-700',
  Exposition: 'bg-blue-100 text-blue-700',
  Sport: 'bg-green-100 text-green-700',
  Danse: 'bg-pink-100 text-pink-700',
  'Conférence': 'bg-cyan-100 text-cyan-700',
  Atelier: 'bg-orange-100 text-orange-700',
  Festival: 'bg-yellow-100 text-yellow-700',
  'Cinéma': 'bg-indigo-100 text-indigo-700',
  default: 'bg-dark-100 text-dark-600',
};

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1471623320832-752e8bbf8413?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=600&h=400&fit=crop',
];

export default function EventCard({ event, index = 0 }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const liked = isFavorite(event.id);

  const colorClass = CATEGORY_COLORS[event.category] || CATEGORY_COLORS.default;
  const fallbackImg = FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];

  return (
    <article
      className="card group animate-fade-in"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-dark-100">
        <img
          src={event.cover_image_url || fallbackImg}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            e.target.src = fallbackImg;
          }}
        />

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Badge catégorie */}
        {event.category && (
          <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold ${colorClass}`}>
            {event.category}
          </span>
        )}

        {/* Bouton favori */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(event.id);
          }}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm
                     hover:bg-white transition-all duration-200 group/heart"
          aria-label={liked ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              liked
                ? 'text-primary-500 fill-primary-500'
                : 'text-dark-400 group-hover/heart:text-primary-400'
            }`}
          />
        </button>

        {/* Badge gratuit */}
        {event.price_type && event.price_type.toLowerCase().includes('gratuit') && (
          <span className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full
                          bg-green-500 text-white text-xs font-semibold">
            <Ticket className="w-3 h-3" />
            Gratuit
          </span>
        )}
      </div>

      {/* Content */}
      <Link to={`/events/${event.id}`} className="block p-4">
        <h3 className="font-display text-lg text-dark-900 leading-snug mb-2 
                       group-hover:text-primary-600 transition-colors line-clamp-2">
          {event.title}
        </h3>

        {event.lead_text && (
          <p className="text-sm text-dark-500 mb-3 line-clamp-2">
            {event.lead_text}
          </p>
        )}

        <div className="flex flex-col gap-1.5">
          {/* Date */}
          {event.date_start && (
            <div className="flex items-center gap-2 text-sm text-dark-500">
              <Calendar className="w-3.5 h-3.5 flex-shrink-0 text-accent-500" />
              <span className="truncate">
                {event.date_description || formatEventDate(event.date_start, event.date_end)}
              </span>
            </div>
          )}

          {/* Lieu */}
          {(event.place_name || event.address) && (
            <div className="flex items-center gap-2 text-sm text-dark-500">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-primary-400" />
              <span className="truncate">
                {event.place_name || event.address}
              </span>
            </div>
          )}
        </div>
      </Link>
    </article>
  );
}
