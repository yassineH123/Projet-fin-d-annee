const { User, Ride, Booking, Review } = require('../models');
const upload = require('../middleware/uploadMiddleware');

// Liste blanche des champs visibles sur un profil PUBLIC (route non authentifiée
// GET /users/:id) — volontairement plus stricte que celle de /users/me, pour ne
// jamais exposer phone/birthDate/nationality/documents/kycSelfie à un tiers.
const PUBLIC_PROFILE_FIELDS = 'firstName lastName photo bio avgRating totalRatings totalTrips ' +
  'languages isHandicapped handicapAccessible nationality country driverVerified isDriver ' +
  'carModel carColor carYear carPhoto kycStatus createdAt';

async function searchUsers(req, res, next) {
  try {
    const q = (req.query.q || '').trim();
    if (!q || q.length < 2) return res.json({ users: [] });

    const users = await User.find({
      status: 'active',
      $or: [
        { firstName: { $regex: q, $options: 'i' } },
        { lastName:  { $regex: q, $options: 'i' } },
      ],
    })
      .select('id firstName lastName photo avgRating totalTrips isDriver driverVerified')
      .sort({ avgRating: -1 })
      .limit(6);

    return res.json({ users });
  } catch (err) { return next(err); }
}

async function me(req, res, next) {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' });

    // Avis reçus (pour pouvoir y répondre depuis son propre profil)
    const reviews = await Review.find({ reviewedId: req.user.id })
      .populate({ path: 'reviewer', select: 'id firstName lastName photo' })
      .sort({ createdAt: -1 })
      .limit(20);
    return res.json({ user, reviews });
  } catch (err) { return next(err); }
}

async function getProfile(req, res, next) {
  try {
    const user = await User.findById(req.params.id).select(PUBLIC_PROFILE_FIELDS);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' });

    const [rides, reviews] = await Promise.all([
      Ride.find({ driverId: req.params.id, status: 'active' })
        .select('id from to departureDate price seatsAvailable')
        .sort({ departureDate: 1 })
        .limit(5),
      Review.find({ reviewedId: req.params.id })
        .populate({ path: 'reviewer', select: 'id firstName lastName photo' })
        .sort({ createdAt: -1 })
        .limit(10),
    ]);

    return res.json({ user, rides, reviews });
  } catch (err) { return next(err); }
}

async function updateProfile(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' });

    const {
      firstName, lastName, phone, bio, preferences, languages,
      carModel, carColor, carYear, licensePlate,
      isHandicapped, handicapAccessible,
      nationality, country, birthDate, gender,
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
    if (gender      !== undefined)        updates.gender             = gender || null;
    if (country     !== undefined)        updates.country            = country;
    if (birthDate   !== undefined)        updates.birthDate          = birthDate || null;

    if (preferences) {
      updates.preferences = typeof preferences === 'string' ? JSON.parse(preferences) : preferences;
    }
    if (languages) {
      updates.languages = typeof languages === 'string' ? JSON.parse(languages) : languages;
    }

    if (req.files?.photo?.[0])        updates.photo        = upload.getFileUrl(req.files.photo[0]);
    if (req.files?.carPhoto?.[0])     updates.carPhoto     = upload.getFileUrl(req.files.carPhoto[0]);
    if (req.files?.cinDoc?.[0])       updates.cinDoc       = upload.getFileUrl(req.files.cinDoc[0]);
    if (req.files?.permisDoc?.[0])    updates.permisDoc    = upload.getFileUrl(req.files.permisDoc[0]);
    if (req.files?.carteGriseDoc?.[0]) updates.carteGriseDoc = upload.getFileUrl(req.files.carteGriseDoc[0]);
    if (req.files?.passportDoc?.[0])   updates.passportDoc   = upload.getFileUrl(req.files.passportDoc[0]);

    if (req.files?.cinDoc?.[0] || req.files?.permisDoc?.[0] || req.files?.carteGriseDoc?.[0] || req.files?.passportDoc?.[0]) {
      updates.driverVerified = false; // reset, admin doit re-valider
    }

    user.set(updates);
    await user.save();
    const updated = await User.findById(req.user.id).select('-password');
    return res.json({ user: updated });
  } catch (err) { return next(err); }
}

async function completeOnboarding(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
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

    user.set(updates);
    await user.save();
    const updated = await User.findById(req.user.id).select('-password');
    return res.json({ user: updated });
  } catch (err) { return next(err); }
}

async function driverStats(req, res, next) {
  try {
    const driverId = req.user.id;
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const rides = await Ride.find({ driverId })
      .populate({ path: 'bookings', match: { status: 'accepted' } })
      .sort({ departureDate: 1 });

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

    const driver = await User.findById(driverId)
      .select('avgRating totalRatings referralCode badges driverVerified handicapAccessible totalTrips');

    const referredCount = await User.countDocuments({ referredBy: driverId });

    const badges = computeBadges(driver, rides.length, referredCount);
    if (JSON.stringify(badges) !== JSON.stringify(driver.badges || [])) {
      await User.findByIdAndUpdate(driverId, { badges });
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

// Soumission de la vérification d'identité (KYC) : selfie + CIN
async function submitKyc(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' });

    const updates = {};
    if (req.files?.kycSelfie?.[0]) updates.kycSelfie = upload.getFileUrl(req.files.kycSelfie[0]);
    if (req.files?.cinDoc?.[0])    updates.cinDoc    = `/uploads/${req.files.cinDoc[0].filename}`;

    if (!updates.kycSelfie && !user.kycSelfie) return res.status(400).json({ message: 'Selfie requis.' });
    if (!updates.cinDoc && !user.cinDoc)       return res.status(400).json({ message: "Photo de la CIN requise." });

    updates.kycStatus = 'pending';
    user.set(updates);
    await user.save();
    return res.json({ message: 'Vérification d\'identité soumise.', kycStatus: 'pending' });
  } catch (err) { return next(err); }
}

module.exports = { me, getProfile, updateProfile, completeOnboarding, driverStats, searchUsers, submitKyc };
