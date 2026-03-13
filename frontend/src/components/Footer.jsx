/**
 * Footer — Pied de page avec crédits.
 */

export default function Footer() {
  return (
    <footer className="bg-white border-t border-dark-100 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎭</span>
            <span className="font-display text-dark-900">Paris Events</span>
          </div>

          <p className="text-sm text-dark-400 text-center">
            Données issues de l'
            <a
              href="https://opendata.paris.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-600 hover:text-accent-700 underline"
            >
              Open Data de la Ville de Paris
            </a>
          </p>

          <p className="text-sm text-dark-400">
            © {new Date().getFullYear()} — Aymen RAKI
          </p>
        </div>
      </div>
    </footer>
  );
}
