const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  'tlasway',
  'root',
  '',
  {
    host: 'localhost',
    port: 3306,
    dialect: 'mysql',
    logging: console.log,
    dialectOptions: {
      dateStrings: false,
    },
    timezone: '+00:00',
  }
);

sequelize.addHook('afterConnect', (connection) => {
  return new Promise((resolve, reject) => {
    connection.query("SET SESSION sql_mode = 'NO_ENGINE_SUBSTITUTION'", (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
});

module.exports = sequelize;