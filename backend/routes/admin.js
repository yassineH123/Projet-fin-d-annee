module.exports = function() {
  const express = require('express');
  const router = express.Router();
  const User = require('../models/User');
  const Review = require('../models/Review');
  const Post = require('../models/Post');
  const { checkRole } = require('../middleware/auth');

  // GET /admin/users - Voir tous les utilisateurs
  router.get('/users', async (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      await checkRole(token, 'admin');
      
      const users = await User.findAll({
        where: { role: 'user' },
        attributes: { exclude: ['password'] }
      });
      return res.json(users);
    } catch (error) {
      return res.status(401).json({ error: error.message });
    }
  });

  // GET /admin/users/:id - Voir le profil d'un utilisateur
  router.get('/users/:id', async (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      await checkRole(token, 'admin');
      
      const user = await User.findByPk(req.params.id, {
        attributes: { exclude: ['password'] }
      });
      if (!user) return res.status(404).json({ error: 'User not found' });
      return res.json(user);
    } catch (error) {
      return res.status(401).json({ error: error.message });
    }
  });

  // GET /admin/users/:id/reviews - Voir les avis d'un utilisateur
  router.get('/users/:id/reviews', async (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      await checkRole(token, 'admin');
      
      const reviews = await Review.findAll({
        where: { userId: req.params.id }
      });
      return res.json(reviews);
    } catch (error) {
      return res.status(401).json({ error: error.message });
    }
  });

  // GET /admin/users/:id/posts - Voir les posts d'un utilisateur
  router.get('/users/:id/posts', async (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      await checkRole(token, 'admin');
      
      const posts = await Post.findAll({
        where: { userId: req.params.id }
      });
      return res.json(posts);
    } catch (error) {
      return res.status(401).json({ error: error.message });
    }
  });

  // DELETE /admin/users/:id - Supprimer un utilisateur
  router.delete('/users/:id', async (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      await checkRole(token, 'admin');
      
      const user = await User.findByPk(req.params.id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      if (user.role !== 'user') return res.status(403).json({ error: 'Cannot delete non-user accounts' });
      
      await Review.destroy({ where: { userId: req.params.id } });
      await Post.destroy({ where: { userId: req.params.id } });
      await user.destroy();
      
      return res.json({ ok: true, message: 'User deleted successfully' });
    } catch (error) {
      return res.status(401).json({ error: error.message });
    }
  });

  // PATCH /admin/users/:id/suspend - Suspendre un utilisateur
  router.patch('/users/:id/suspend', async (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      await checkRole(token, 'admin');
      
      const user = await User.findByPk(req.params.id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      if (user.role !== 'user') return res.status(403).json({ error: 'Cannot suspend non-user accounts' });
      
      await user.update({ status: 'suspended' });
      return res.json({ ok: true, message: 'User suspended successfully' });
    } catch (error) {
      return res.status(401).json({ error: error.message });
    }
  });

  // PATCH /admin/users/:id/unsuspend - Réactiver un utilisateur
  router.patch('/users/:id/unsuspend', async (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      await checkRole(token, 'admin');
      
      const user = await User.findByPk(req.params.id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      if (user.role !== 'user') return res.status(403).json({ error: 'Cannot unsuspend non-user accounts' });
      
      await user.update({ status: 'active' });
      return res.json({ ok: true, message: 'User unsuspended successfully' });
    } catch (error) {
      return res.status(401).json({ error: error.message });
    }
  });

  return router;
};
