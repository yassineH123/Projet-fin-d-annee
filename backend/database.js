const { Sequelize } = require('sequelize');

// Configure MySQL connection
const sequelize = new Sequelize(
  'tlasway', // database name - à créer dans MySQL
  'root',    // username (change si besoin)
  '',        // password (change si besoin)
  {
    host: 'localhost',
    port: 3306,
    dialect: 'mysql',
    logging: console.log, // Voir les requêtes SQL
  }
);

module.exports = sequelize;
