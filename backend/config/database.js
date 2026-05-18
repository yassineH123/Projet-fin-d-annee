const { Sequelize } = require('sequelize');
const mysql2 = require('mysql2/promise');

async function ensureDatabaseExists() {
  const connection = await mysql2.createConnection({
    host:     process.env.DB_HOST     || 'localhost',
    port:     Number(process.env.DB_PORT || 3306),
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
  });

  const dbName = process.env.DB_NAME || 'atlasway';
  await connection.query(
    `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
  );
  await connection.end();
  console.log(`✅ Base de données "${dbName}" prête.`);
}

const sequelize = new Sequelize(
  process.env.DB_NAME     || 'atlasway',
  process.env.DB_USER     || 'root',
  process.env.DB_PASSWORD || '',
  {
    host:    process.env.DB_HOST || 'localhost',
    port:    Number(process.env.DB_PORT || 3306),
    dialect: 'mysql',
    logging: process.env.DB_LOGGING === 'true' ? console.log : false,
  }
);

module.exports = { sequelize, ensureDatabaseExists };
