/**
 * Utilitaires de formatage de dates pour l'affichage.
 */

import { format, isToday, isTomorrow, isThisWeek, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Parse une date (string ISO ou objet Date).
 */
function ensureDate(date) {
  if (!date) return null;
  if (date instanceof Date) return date;
  try {
    return parseISO(date);
  } catch {
    return null;
  }
}

/**
 * Formate une date d'événement de manière lisible et contextuelle.
 */
export function formatEventDate(dateStart, dateEnd) {
  const start = ensureDate(dateStart);
  if (!start) return '';

  const end = ensureDate(dateEnd);

  // Contexte : aujourd'hui, demain, etc.
  let prefix = '';
  if (isToday(start)) {
    prefix = "Aujourd'hui";
  } else if (isTomorrow(start)) {
    prefix = 'Demain';
  }

  const dateStr = prefix || format(start, 'EEEE d MMMM yyyy', { locale: fr });

  // Si même jour ou pas de date de fin
  if (!end || format(start, 'yyyy-MM-dd') === format(end, 'yyyy-MM-dd')) {
    const timeStr = format(start, 'HH:mm');
    return timeStr !== '00:00' ? `${dateStr} à ${timeStr}` : dateStr;
  }

  // Période
  const endStr = format(end, 'd MMMM yyyy', { locale: fr });
  return `Du ${format(start, 'd MMMM', { locale: fr })} au ${endStr}`;
}

/**
 * Formate une date courte.
 */
export function formatShortDate(date) {
  const d = ensureDate(date);
  if (!d) return '';
  return format(d, 'd MMM yyyy', { locale: fr });
}

/**
 * Retourne un label relatif (Aujourd'hui, Demain, ou la date).
 */
export function getRelativeLabel(date) {
  const d = ensureDate(date);
  if (!d) return '';

  if (isToday(d)) return "Aujourd'hui";
  if (isTomorrow(d)) return 'Demain';
  if (isThisWeek(d)) return format(d, 'EEEE', { locale: fr });
  return format(d, 'd MMMM', { locale: fr });
}
