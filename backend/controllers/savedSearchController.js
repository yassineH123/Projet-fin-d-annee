const { SavedSearch } = require('../models');

async function list(req, res, next) {
  try {
    const searches = await SavedSearch.find({ userId: req.user.id }).sort({ createdAt: -1 });
    return res.json({ searches });
  } catch (err) { return next(err); }
}

async function create(req, res, next) {
  try {
    const { fromCity, toCity } = req.body;
    if (!fromCity?.trim() || !toCity?.trim()) {
      return res.status(400).json({ message: 'Ville de départ et ville d\'arrivée requises.' });
    }

    const existing = await SavedSearch.findOne({
      userId: req.user.id, fromCity: fromCity.trim(), toCity: toCity.trim(),
    });
    if (existing) return res.status(409).json({ message: 'Cette recherche est déjà sauvegardée.' });

    const search = await SavedSearch.create({
      userId: req.user.id,
      fromCity: fromCity.trim(),
      toCity: toCity.trim(),
    });
    return res.status(201).json({ search });
  } catch (err) { return next(err); }
}

async function remove(req, res, next) {
  try {
    const search = await SavedSearch.findById(req.params.id);
    if (!search || search.userId !== req.user.id) {
      return res.status(404).json({ message: 'Recherche introuvable.' });
    }
    await search.deleteOne();
    return res.json({ message: 'Recherche supprimée.' });
  } catch (err) { return next(err); }
}

module.exports = { list, create, remove };
