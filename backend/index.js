<<<<<<< HEAD
require('./server');
=======
const express = require('express');
const cors = require('cors');
const sequelize = require('./database');
const User = require('./models/User');
const Trip = require('./models/Trip');
const Review = require('./models/Review');
const Post = require('./models/Post');

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', require('./routes/auth')());
app.use('/users', require('./routes/users')());
app.use('/trips', require('./routes/trips')());
app.use('/privacy', require('./routes/privacy')());
app.use('/admin', require('./routes/admin')());
app.use('/superadmin', require('./routes/superadmin')());

const PORT = process.env.PORT || 4000;

// Sync database and start server
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected ✓');
    
    await sequelize.sync({ alter: true }); // Create/alter tables to match models
    console.log('Database synced ✓');
    
    // Insert super admin user if it doesn't exist
    await User.findOrCreate({
      where: { email: 'superadmin@local' },
      defaults: {
        email: 'superadmin@local',
        password: 'superadmin123',
        firstName: 'Super',
        lastName: 'Admin',
        role: 'superadmin'
      }
    });

    // Insert demo user if it doesn't exist
    await User.findOrCreate({
      where: { email: 'demo@local' },
      defaults: {
        email: 'demo@local',
        password: 'password',
        firstName: 'Demo',
        lastName: 'User',
        role: 'user'
      }
    });

    // Insert demo admin if it doesn't exist
    await User.findOrCreate({
      where: { email: 'admin@local' },
      defaults: {
        email: 'admin@local',
        password: 'admin123',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin'
      }
    });
    
    app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
  } catch (error) {
    console.error('Unable to connect to database:', error);
    process.exit(1);
  }
})();
>>>>>>> 3445939 (chore: sync project files for aya)
