/**
 * EventDetailPage — Page de détail complet d'un événement.
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Heart,
  Ticket,
  ExternalLink,
  Phone,
  Mail,
  Clock,
  Accessibility,
  Train,
} from 'lucide-react';
import { fetchEventById } from '../services/api';
import { useFavorites } from '../hooks/useFavorites';
import { formatEventDate } from '../utils/dateUtils';

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1200&h=600&fit=crop';

export default function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchEventById(id)
      .then(setEvent)
      .catch((err) => setError(err.message || 'Événement introuvable'))
      .finally(() => setLoading(false));
  }, [id]);

  // Loading
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
        <div className="h-6 w-32 bg-dark-100 rounded mb-6" />
        <div className="aspect-[21/9] bg-dark-100 rounded-2xl mb-8" />
        <div className="h-10 bg-dark-100 rounded w-3/4 mb-4" />
        <div className="h-4 bg-dark-100 rounded w-1/2 mb-8" />
        <div className="space-y-3">
          <div className="h-4 bg-dark-100 rounded w-full" />
          <div className="h-4 bg-dark-100 rounded w-full" />
          <div className="h-4 bg-dark-100 rounded w-2/3" />
        </div>
      </div>
    );
  }

  // Error
  if (error || !event) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="font-display text-2xl text-dark-700 mb-4">Événement introuvable</h2>
        <p className="text-dark-500 mb-6">{error}</p>
        <Link to="/" className="btn-primary">
          <ArrowLeft className="w-4 h-4" />
          Retour à l'accueil
        </Link>
      </div>
    );
  }

  const liked = isFavorite(event.id);

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Retour */}
      <button
        onClick={() => navigate(-1)}
        className="btn-ghost text-sm text-dark-500 mb-6 -ml-3"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour
      </button>

      {/* Image hero */}
      <div className="relative aspect-[21/9] rounded-2xl overflow-hidden mb-8 bg-dark-100">
        <img
          src={event.cover_image_url || FALLBACK_IMG}
          alt={event.cover_image_alt || event.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = FALLBACK_IMG;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* Actions overlay */}
        <div className="absolute bottom-4 right-4 flex gap-2">
          <button
            onClick={() => toggleFavorite(event.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
                       backdrop-blur-sm transition-all
              ${liked ? 'bg-primary-500 text-white' : 'bg-white/80 text-dark-700 hover:bg-white'}`}
          >
            <Heart className={`w-4 h-4 ${liked ? 'fill-white' : ''}`} />
            {liked ? 'Favori' : 'Ajouter aux favoris'}
          </button>
        </div>
      </div>

      {/* Header */}
      <header className="mb-8">
        {event.category && (
          <span className="inline-block px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-sm font-medium mb-3">
            {event.category}
          </span>
        )}

        <h1 className="font-display text-3xl sm:text-4xl text-dark-950 mb-4 leading-tight">
          {event.title}
        </h1>

        {event.lead_text && (
          <p className="text-lg text-dark-600 leading-relaxed">{event.lead_text}</p>
        )}
      </header>

      {/* Infos clés */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        {/* Date */}
        {event.date_start && (
          <InfoCard
            icon={<Calendar className="w-5 h-5 text-accent-500" />}
            label="Date"
            value={
              event.date_description ||
              formatEventDate(event.date_start, event.date_end)
            }
          />
        )}

        {/* Lieu */}
        {(event.place_name || event.address) && (
          <InfoCard
            icon={<MapPin className="w-5 h-5 text-primary-500" />}
            label="Lieu"
            value={[event.place_name, event.address, event.zipcode && `${event.zipcode} ${event.city}`]
              .filter(Boolean)
              .join('\n')}
          />
        )}

        {/* Prix */}
        {event.price_type && (
          <InfoCard
            icon={<Ticket className="w-5 h-5 text-green-500" />}
            label="Tarif"
            value={event.price_detail || event.price_type}
          />
        )}

        {/* Transport */}
        {event.transport && (
          <InfoCard
            icon={<Train className="w-5 h-5 text-indigo-500" />}
            label="Accès"
            value={event.transport}
          />
        )}
      </div>

      {/* Description complète */}
      {event.description && (
        <section className="mb-10">
          <h2 className="font-display text-2xl text-dark-900 mb-4">Description</h2>
          <div
            className="prose prose-dark max-w-none text-dark-600 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: event.description }}
          />
        </section>
      )}

      {/* Accessibilité */}
      {(event.pmr_accessible || event.blind_accessible || event.deaf_accessible) && (
        <section className="mb-10">
          <h2 className="font-display text-2xl text-dark-900 mb-4">Accessibilité</h2>
          <div className="flex flex-wrap gap-3">
            {event.pmr_accessible && (
              <span className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 text-sm">
                <Accessibility className="w-4 h-4" />
                Accessible PMR
              </span>
            )}
            {event.blind_accessible && (
              <span className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 text-sm">
                Accessible malvoyants
              </span>
            )}
            {event.deaf_accessible && (
              <span className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 text-sm">
                Accessible malentendants
              </span>
            )}
          </div>
        </section>
      )}

      {/* Contact */}
      {(event.contact_url || event.contact_phone || event.contact_email) && (
        <section className="mb-10">
          <h2 className="font-display text-2xl text-dark-900 mb-4">Contact & liens</h2>
          <div className="flex flex-wrap gap-3">
            {event.contact_url && (
              <a
                href={event.contact_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                <ExternalLink className="w-4 h-4" />
                Site officiel
              </a>
            )}
            {event.contact_phone && (
              <a href={`tel:${event.contact_phone}`} className="btn-secondary">
                <Phone className="w-4 h-4" />
                {event.contact_phone}
              </a>
            )}
            {event.contact_email && (
              <a href={`mailto:${event.contact_email}`} className="btn-secondary">
                <Mail className="w-4 h-4" />
                Email
              </a>
            )}
          </div>
        </section>
      )}

      {/* Retour */}
      <div className="pt-6 border-t border-dark-100">
        <Link to="/" className="btn-ghost text-dark-500">
          <ArrowLeft className="w-4 h-4" />
          Retour aux événements
        </Link>
      </div>
    </article>
  );
}

// ─── Composant utilitaire : Carte d'info ──────────────────────────

function InfoCard({ icon, label, value }) {
  return (
    <div className="flex gap-3 p-4 rounded-xl bg-white border border-dark-100">
      <div className="flex-shrink-0 mt-0.5">{icon}</div>
      <div>
        <p className="text-xs font-medium text-dark-400 uppercase tracking-wide mb-1">
          {label}
        </p>
        <p className="text-sm text-dark-700 whitespace-pre-line">{value}</p>
      </div>
    </div>
  );
}
