const path = require('path');
const bcrypt = require('bcryptjs');
const { User, Ride, Review } = require('../models');

async function me(req, res, next) {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
    });
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' });
    return res.json({ user });
  } catch (err) { return next(err); }
}

async function getProfile(req, res, next) {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ['id', 'firstName', 'lastName', 'photo', 'bio', 'avgRating', 'totalRatings', 'preferences', 'createdAt'],
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
        limit: 5,
      }),
    ]);

    return res.json({ user, rides, reviews });
  } catch (err) { return next(err); }
}

async function updateProfile(req, res, next) {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' });

    const { firstName, lastName, phone, bio, preferences } = req.body;
    const updates = {};

    if (firstName) updates.firstName = firstName;
    if (lastName)  updates.lastName  = lastName;
    if (phone)     updates.phone     = phone;
    if (bio)       updates.bio       = bio;
    if (preferences) {
      updates.preferences = typeof preferences === 'string'
        ? JSON.parse(preferences)
        : preferences;
    }
    if (req.file)  updates.photo = `/uploads/${req.file.filename}`;

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

    if (req.files?.photo?.[0])    updates.photo    = `/uploads/${req.files.photo[0].filename}`;
    if (req.files?.carPhoto?.[0]) updates.carPhoto = `/uploads/${req.files.carPhoto[0].filename}`;
    if (isDriver && licensePlate)  updates.licensePlate = licensePlate;

    await user.update(updates);
    const updated = await User.findByPk(req.user.id, { attributes: { exclude: ['password'] } });
    return res.json({ user: updated });
  } catch (err) { return next(err); }
}

module.exports = { me, getProfile, updateProfile, completeOnboarding };
