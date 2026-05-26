const { Op } = require('sequelize');
const { User, Ride, Booking, Review } = require('../models');

async function searchUsers(req, res, next) {
  try {
    const q = (req.query.q || '').trim();
    if (!q || q.length < 2) return res.json({ users: [] });

    const users = await User.findAll({
      where: {
        status: 'active',
        [Op.or]: [
          { firstName: { [Op.like]: `%${q}%` } },
          { lastName:  { [Op.like]: `%${q}%` } },
        ],
      },
      attributes: ['id', 'firstName', 'lastName', 'photo', 'avgRating', 'totalTrips', 'isDriver', 'driverVerified'],
      limit: 6,
      order: [['avgRating', 'DESC']],
    });

    return res.json({ users });
  } catch (err) { return next(err); }
}

async function me(req, res, next) {
  try {
    const user = await User.findByPk(req.user.id, { attributes: { exclude: ['password'] } });
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' });
    return res.json({ user });
  } catch (err) { return next(err); }
}

async function getProfile(req, res, next) {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password', 'cinDoc', 'permisDoc', 'carteGriseDoc'] },
    });
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' });

    const [rides, reviews] = await Promise.all([
      Ride.findAll({
        where: { driverId: req.params.id, status: 'active' },
        attributes: ['id', 'from', 'to', 'departureDate', 'price', 'seatsAvailable'],
        order: [['departureDate', 'ASC']],
        limit: 5,
      }),
      Review.findAll({
        where: { reviewedId: req.params.id },
        include: [{ model: User, as: 'reviewer', attributes: ['id', 'firstName', 'lastName', 'photo'] }],
        order: [['createdAt', 'DESC']],
        limit: 10,
      }),
    ]);

    return res.json({ user, rides, reviews });
  } catch (err) { return next(err); }
}

async function updateProfile(req, res, next) {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' });

    const {
      firstName, lastName, phone, bio, preferences, languages,
      carModel, carColor, carYear, licensePlate,
      isHandicapped, handicapAccessible,
      nationality, country, birthDate,
    } = req.body;

    const updates = {};
    if (firstName !== undefined)         updates.firstName         = firstName;
    if (lastName  !== undefined)         updates.lastName          = lastName;
    if (phone     !== undefined)         updates.phone             = phone;
    if (bio       !== undefined)         updates.bio               = bio;
    if (carModel  !== undefined)         updates.carModel          = carModel;
    if (carColor  !== undefined)         updates.carColor          = carColor;
    if (carYear   !== undefined)         updates.carYear           = carYear ? Number(carYear) : null;
    if (licensePlate !== undefined)      updates.licensePlate      = licensePlate;
    if (isHandicapped !== undefined)     updates.isHandicapped     = isHandicapped === 'true' || isHandicapped === true;
    if (handicapAccessible !== undefined) updates.handicapAccessible = handicapAccessible === 'true' || handicapAccessible === true;
    if (nationality !== undefined)        updates.nationality        = nationality;
    if (country     !== undefined)        updates.country            = country;
    if (birthDate   !== undefined)        updates.birthDate          = birthDate || null;

    if (preferences) {
      updates.preferences = typeof preferences === 'string' ? JSON.parse(preferences) : preferences;
    }
    if (languages) {
      updates.languages = typeof languages === 'string' ? JSON.parse(languages) : languages;
    }

    if (req.files?.photo?.[0])        updates.photo        = `/uploads/${req.files.photo[0].filename}`;
    if (req.files?.carPhoto?.[0])     updates.carPhoto     = `/uploads/${req.files.carPhoto[0].filename}`;
    if (req.files?.cinDoc?.[0])        updates.cinDoc        = `/uploads/${req.files.cinDoc[0].filename}`;
    if (req.files?.permisDoc?.[0])     updates.permisDoc     = `/uploads/${req.files.permisDoc[0].filename}`;
    if (req.files?.carteGriseDoc?.[0]) updates.carteGriseDoc = `/uploads/${req.files.carteGriseDoc[0].filename}`;
    if (req.files?.passportDoc?.[0])   updates.passportDoc   = `/uploads/${req.files.passportDoc[0].filename}`;

    if (req.files?.cinDoc?.[0] || req.files?.permisDoc?.[0] || req.files?.carteGriseDoc?.[0] || req.files?.passportDoc?.[0]) {
      updates.driverVerified = false; // reset, admin doit re-valider
    }

    await user.update(updates);
    const updated = await User.findByPk(req.user.id, { attributes: { exclude: ['password'] } });
    return res.json({ user: updated });
  } catch (err) { return next(err); }
}

async function completeOnboarding(req, res, next) {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' });

    const { type, firstName, lastName, licensePlate } = req.body;
    const isDriver = type === 'driver';

    const updates = {
      onboardingDone: true,
      isDriver,
      firstName: firstName || user.firstName,
      lastName:  lastName  || user.lastName,
    };

    if (req.files?.photo?.[0])    updates.photo        = `/uploads/${req.files.photo[0].filename}`;
    if (req.files?.carPhoto?.[0]) updates.carPhoto     = `/uploads/${req.files.carPhoto[0].filename}`;
    if (isDriver && licensePlate)  updates.licensePlate = licensePlate;

    await user.update(updates);
    const updated = await User.findByPk(req.user.id, { attributes: { exclude: ['password'] } });
    return res.json({ user: updated });
  } catch (err) { return next(err); }
}

async function driverStats(req, res, next) {
  try {
    const driverId = req.user.id;
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const rides = await Ride.findAll({
      where: { driverId },
      include: [{ model: Booking, as: 'bookings', where: { status: 'accepted' }, required: false }],
      order: [['departureDate', 'ASC']],
    });

    let totalPassengers = 0, totalEarnings = 0, monthlyEarnings = 0;
    rides.forEach(ride => {
      const seats = ride.bookings.reduce((s, b) => s + b.seats, 0);
      const amount = seats * Number(ride.price);
      totalPassengers += seats;
      totalEarnings += amount;
      if (new Date(ride.departureDate) >= firstOfMonth) monthlyEarnings += amount;
    });

    const upcomingRides = rides.filter(r => r.status === 'active' && new Date(r.departureDate) > now);
    const completedRides = rides.filter(r => r.status === 'completed').length;

    const driver = await User.findByPk(driverId, {
      attributes: ['avgRating', 'totalRatings', 'referralCode', 'badges', 'driverVerified', 'handicapAccessible', 'totalTrips'],
    });

    const referredCount = await User.count({ where: { referredBy: driverId } });

    const badges = computeBadges(driver, rides.length, referredCount);
    if (JSON.stringify(badges) !== JSON.stringify(driver.badges || [])) {
      await User.update({ badges }, { where: { id: driverId } });
    }

    return res.json({
      totalRides: rides.length,
      completedRides,
      totalPassengers,
      totalEarnings: Math.round(totalEarnings),
      monthlyEarnings: Math.round(monthlyEarnings),
      avgRating: driver.avgRating || 0,
      totalRatings: driver.totalRatings || 0,
      co2Saved: Math.round(totalPassengers * 2 * 120 / 1000),
      referralCode: driver.referralCode,
      referredCount,
      badges,
      upcomingRides: upcomingRides.slice(0, 5),
    });
  } catch (err) { return next(err); }
}

function computeBadges(user, totalRides, referredCount) {
  const badges = [];
  if (totalRides >= 1)                                                   badges.push('first_trip');
  if (user.driverVerified)                                               badges.push('verified');
  if (user.avgRating >= 4.8 && user.totalRatings >= 3)                   badges.push('five_star');
  if (totalRides >= 10)                                                  badges.push('top_driver');
  if (user.handicapAccessible)                                           badges.push('pmr_friendly');
  if (referredCount >= 5)                                                badges.push('referral_5');
  return badges;
}

module.exports = { me, getProfile, updateProfile, completeOnboarding, driverStats, searchUsers };
