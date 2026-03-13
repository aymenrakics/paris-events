/**
 * App — Composant racine avec le routing.
 */

import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import EventDetailPage from './pages/EventDetailPage';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-dark-50/30">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
