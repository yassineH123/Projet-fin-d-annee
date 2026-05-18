const bcrypt = require('bcryptjs');
const { User } = require('../models');

async function seedAuthUsers() {
  const seeds = [
    {
      email: 'superadmin@atlasway.com',
      password: 'superadmin123',
      firstName: 'Super',
      lastName: 'Admin',
      role: 'superadmin',
      verified: true,
    },
    {
      email: 'admin@atlasway.com',
      password: 'admin123',
      firstName: 'Admin',
      lastName: 'AtlasWay',
      role: 'admin',
      verified: true,
    },
  ];

  for (const seed of seeds) {
    const existing = await User.findOne({ where: { email: seed.email } });
    if (existing) continue;
    const password = await bcrypt.hash(seed.password, 12);
    await User.create({ ...seed, password });
    console.log(`✅ Seed créé: ${seed.email}`);
  }
}

module.exports = { seedAuthUsers };
