const { Parser } = require('@json2csv/plainjs');
const { Booking, Ride, User, Transaction } = require('../models');

async function exportDriverEarnings(req, res, next) {
  try {
    const rides = await Ride.find({ driverId: req.user.id }).select('_id');
    const rideIds = rides.map(r => r.id);
    const bookings = await Booking.find({ rideId: { $in: rideIds }, status: 'accepted' })
      .populate({ path: 'ride', select: 'from to departureDate price distanceKm' })
      .sort({ createdAt: -1 });
    const rows = bookings.map(b => ({
      date: new Date(b.createdAt).toLocaleDateString('fr-FR'),
      trajet: `${b.ride.from} → ${b.ride.to}`,
      depart: new Date(b.ride.departureDate).toLocaleString('fr-FR'),
      places: b.seats,
      prix_par_place: b.ride.price,
      total: (b.ride.price * b.seats).toFixed(2),
      km: b.ride.distanceKm || 0,
    }));
    const parser = new Parser({ fields: ['date','trajet','depart','places','prix_par_place','total','km'] });
    const csv = parser.parse(rows);
    res.header('Content-Type','text/csv; charset=utf-8');
    res.header('Content-Disposition','attachment; filename=revenus_atlasway.csv');
    res.send('﻿' + csv);
  } catch (err) { return next(err); }
}

async function exportTransactions(req, res, next) {
  try {
    const txs = await Transaction.find({ userId: req.user.id }).sort({ createdAt: -1 });
    const rows = txs.map(t => ({
      date: new Date(t.createdAt).toLocaleString('fr-FR'),
      type: t.type === 'credit' ? 'Crédit' : 'Débit',
      montant: `${t.type === 'credit' ? '+' : '-'}${t.amount} DH`,
      description: t.description,
      solde_apres: `${t.balanceAfter} DH`,
    }));
    const parser = new Parser({ fields: ['date','type','montant','description','solde_apres'] });
    const csv = parser.parse(rows);
    res.header('Content-Type','text/csv; charset=utf-8');
    res.header('Content-Disposition','attachment; filename=transactions_atlasway.csv');
    res.send('﻿' + csv);
  } catch (err) { return next(err); }
}

module.exports = { exportDriverEarnings, exportTransactions };
