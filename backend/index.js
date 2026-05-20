require('./server');
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
