module.exports = function() {
  const express = require('express');
  const router = express.Router();
  const User = require('../models/User');
  const { checkRole } = require('../middleware/auth');

  // GET /superadmin/users - Voir tous les utilisateurs ET admins
  router.get('/users', async (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      await checkRole(token, 'superadmin');
      
      const users = await User.findAll({
        attributes: { exclude: ['password'] }
      });
      return res.json(users);
    } catch (error) {
      return res.status(401).json({ error: error.message });
    }
  });

  // GET /superadmin/admins - Voir tous les admins
  router.get('/admins', async (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      await checkRole(token, 'superadmin');
      
      const admins = await User.findAll({
        where: { role: 'admin' },
        attributes: { exclude: ['password'] }
      });
      return res.json(admins);
    } catch (error) {
      return res.status(401).json({ error: error.message });
    }
  });

  // POST /superadmin/admins - Créer un nouvel admin
  router.post('/admins', async (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      await checkRole(token, 'superadmin');
      
      const { email, password, firstName, lastName } = req.body;
      const admin = await User.create({
        email,
        password,
        firstName,
        lastName,
        role: 'admin'
      });
      
      return res.json({ 
        id: admin.id, 
        email: admin.email, 
        firstName: admin.firstName, 
        lastName: admin.lastName,
        role: admin.role
      });
    } catch (error) {
      return res.status(401).json({ error: error.message });
    }
  });

  // DELETE /superadmin/admins/:id - Supprimer un admin
  router.delete('/admins/:id', async (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      const superAdmin = await checkRole(token, 'superadmin');
      
      const admin = await User.findByPk(req.params.id);
      if (!admin) return res.status(404).json({ error: 'Admin not found' });
      if (admin.role !== 'admin') return res.status(403).json({ error: 'This user is not an admin' });
      if (admin.id === superAdmin.id) return res.status(403).json({ error: 'Cannot delete yourself' });
      
      await admin.destroy();
      return res.json({ ok: true, message: 'Admin deleted successfully' });
    } catch (error) {
      return res.status(401).json({ error: error.message });
    }
  });

  // DELETE /superadmin/users/:id - Supprimer n'importe quel utilisateur
  router.delete('/users/:id', async (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      const superAdmin = await checkRole(token, 'superadmin');
      
      const user = await User.findByPk(req.params.id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      if (user.id === superAdmin.id) return res.status(403).json({ error: 'Cannot delete yourself' });
      if (user.role === 'superadmin') return res.status(403).json({ error: 'Cannot delete another superadmin' });
      
      await user.destroy();
      return res.json({ ok: true, message: 'User deleted successfully' });
    } catch (error) {
      return res.status(401).json({ error: error.message });
    }
  });

  // PATCH /superadmin/users/:id/suspend - Suspendre n'importe quel utilisateur
  router.patch('/users/:id/suspend', async (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      const superAdmin = await checkRole(token, 'superadmin');
      
      const user = await User.findByPk(req.params.id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      if (user.id === superAdmin.id) return res.status(403).json({ error: 'Cannot suspend yourself' });
      if (user.role === 'superadmin') return res.status(403).json({ error: 'Cannot suspend another superadmin' });
      
      await user.update({ status: 'suspended' });
      return res.json({ ok: true, message: 'User suspended successfully' });
    } catch (error) {
      return res.status(401).json({ error: error.message });
    }
  });

  // PATCH /superadmin/users/:id/unsuspend - Réactiver n'importe quel utilisateur
  router.patch('/users/:id/unsuspend', async (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      const superAdmin = await checkRole(token, 'superadmin');
      
      const user = await User.findByPk(req.params.id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      if (user.id === superAdmin.id) return res.status(403).json({ error: 'Cannot unsuspend yourself' });
      if (user.role === 'superadmin') return res.status(403).json({ error: 'Cannot unsuspend another superadmin' });
      
      await user.update({ status: 'active' });
      return res.json({ ok: true, message: 'User unsuspended successfully' });
    } catch (error) {
      return res.status(401).json({ error: error.message });
    }
  });

  // PATCH /superadmin/admins/:id/suspend - Suspendre un admin
  router.patch('/admins/:id/suspend', async (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      const superAdmin = await checkRole(token, 'superadmin');
      
      const admin = await User.findByPk(req.params.id);
      if (!admin) return res.status(404).json({ error: 'Admin not found' });
      if (admin.role !== 'admin') return res.status(403).json({ error: 'This user is not an admin' });
      if (admin.id === superAdmin.id) return res.status(403).json({ error: 'Cannot suspend yourself' });
      
      await admin.update({ status: 'suspended' });
      return res.json({ ok: true, message: 'Admin suspended successfully' });
    } catch (error) {
      return res.status(401).json({ error: error.message });
    }
  });

  // PATCH /superadmin/admins/:id/unsuspend - Réactiver un admin
  router.patch('/admins/:id/unsuspend', async (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      await checkRole(token, 'superadmin');
      
      const admin = await User.findByPk(req.params.id);
      if (!admin) return res.status(404).json({ error: 'Admin not found' });
      if (admin.role !== 'admin') return res.status(403).json({ error: 'This user is not an admin' });
      
      await admin.update({ status: 'active' });
      return res.json({ ok: true, message: 'Admin unsuspended successfully' });
    } catch (error) {
      return res.status(401).json({ error: error.message });
    }
  });

  return router;
};
