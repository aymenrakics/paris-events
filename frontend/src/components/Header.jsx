/**
 * Header — Barre de navigation principale.
 */

import { Link } from 'react-router-dom';
import { MapPin, Heart } from 'lucide-react';
import { useFavorites } from '../hooks/useFavorites';

export default function Header() {
  const { count } = useFavorites();

  return (
    <header className="bg-white border-b border-dark-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <span className="text-2xl">🎭</span>
            <div>
              <span className="font-display text-xl text-dark-900 group-hover:text-primary-600 transition-colors">
                Paris Events
              </span>
            </div>
          </Link>

          {/* Nav */}
          <nav className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1.5 text-sm text-dark-500">
              <MapPin className="w-4 h-4" />
              <span>Paris, France</span>
            </div>

            {count > 0 && (
              <div className="flex items-center gap-1.5 text-sm text-primary-600 font-medium">
                <Heart className="w-4 h-4 fill-primary-600" />
                <span>{count}</span>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
