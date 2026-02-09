const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });
const { Client } = require('pg');

const dbName = process.env.DB_NAME || 'favorite_movies';

async function createDatabase() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: 'postgres',
  });

  try {
    await client.connect();
    await client.query(`CREATE DATABASE "${dbName}"`);
    console.log(`Database "${dbName}" created successfully.`);
  } catch (err) {
    if (err.code === '42P04') {
      console.log(`Database "${dbName}" already exists - skipping.`);
    } else {
      console.error('Failed to create database:', err.message);
      process.exit(1);
    }
  } finally {
    await client.end();
  }
}

createDatabase();
