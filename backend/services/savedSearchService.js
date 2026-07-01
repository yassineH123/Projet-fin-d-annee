const { SavedSearch } = require('../models');
const { createNotification } = require('./notificationService');

const normalize = (s) => (s || '').trim().toLowerCase();

/**
 * Notifie les utilisateurs ayant sauvegardé une recherche correspondant
 * au trajet nouvellement publié (correspondance ville départ + ville arrivée).
 */
async function notifyMatchingSavedSearches(ride) {
  try {
    const searches = await SavedSearch.find().lean();
    const rideFrom = normalize(ride.from);
    const rideTo   = normalize(ride.to);

    const matches = searches.filter((s) => {
      if (s.userId === ride.driverId) return false;
      const from = normalize(s.fromCity);
      const to   = normalize(s.toCity);
      return (rideFrom.includes(from) || from.includes(rideFrom))
          && (rideTo.includes(to) || to.includes(rideTo));
    });

    await Promise.all(matches.map((s) => createNotification(s.userId, {
      type: 'ride',
      title: 'Nouveau trajet disponible',
      message: `Un trajet ${ride.from} → ${ride.to} vient d'être publié.`,
      link: `/rides/${ride.id}`,
    })));
  } catch (err) {
    console.error('[SAVED SEARCH NOTIFY ERROR]', err.message);
  }
}

module.exports = { notifyMatchingSavedSearches };
