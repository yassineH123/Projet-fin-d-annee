const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { User } = require('../models');
const { logAdminAction } = require('../services/auditLogService');

async function listAdmins(req, res, next) {
  try {
    const admins = await User.findAll({
      where: { role: { [Op.in]: ['admin', 'superadmin'] } },
      attributes: ['id', 'firstName', 'lastName', 'email', 'role', 'status', 'verified'],
    });

    return res.json({ admins });
  } catch (error) {
    return next(error);
  }
}

async function createAdmin(req, res, next) {
  try {
    const { firstName, lastName, email, password, role = 'admin' } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'Email déjà utilisé.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const admin = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
      verified: true,
      status: 'active',
    });

    await logAdminAction({
      adminId: req.user.id,
      action: 'CREATE_ADMIN',
      targetType: 'User',
      targetId: admin.id,
      details: { email: admin.email, role: admin.role },
    });

    return res.status(201).json({
      message: 'Admin créé avec succès.',
      admin: {
        id: admin.id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        role: admin.role,
        status: admin.status,
        verified: admin.verified,
      },
    });
  } catch (error) {
    return next(error);
  }
}

async function deleteAdmin(req, res, next) {
  try {
    const admin = await User.findByPk(req.params.id);
    if (!admin || !['admin', 'superadmin'].includes(admin.role)) {
      return res.status(404).json({ message: 'Admin introuvable.' });
    }
    if (admin.id === req.user.id) {
      return res.status(403).json({ message: 'Vous ne pouvez pas supprimer votre propre compte.' });
    }

    await admin.destroy();
    await logAdminAction({
      adminId: req.user.id,
      action: 'DELETE_ADMIN',
      targetType: 'User',
      targetId: admin.id,
      details: { email: admin.email, role: admin.role },
    });
    return res.json({ message: 'Admin supprimé.' });
  } catch (error) {
    return next(error);
  }
}

module.exports = { listAdmins, createAdmin, deleteAdmin };
