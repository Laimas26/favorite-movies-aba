const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });
const { Client } = require('pg');

const OWNER_ID = '0691934f-a8a8-44ff-9968-0bd4c8118bb2';
const TEST_USER_ID = '1bbf68b4-1dd2-4b04-a8d6-ef3acd8f9caa';
const REVIEWER_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

// bcrypt hash of "test123"
const TEST_PASSWORD_HASH = '$2b$10$tnqSgmbwCKTZcKCWeBDu8Od03H29IzYMCbPbF5RmXIOzq/vXrrgc2';
// bcrypt hash of "owner123"
const REVIEWER_PASSWORD_HASH = '$2b$10$au8F/IZPZ.KNOKgRekuJDeTuhj57HVFQ5NYbgiDpw9JwgJAXEnHYW';

const users = [
  {
    id: OWNER_ID,
    email: 'laimonas.rupeika@gmail.com',
    password: null,
    name: 'Laimonas Rupeika',
    googleId: '115976348580568684153',
  },
  {
    id: REVIEWER_ID,
    email: 'owner@owner.com',
    password: REVIEWER_PASSWORD_HASH,
    name: 'Owner',
    googleId: null,
  },
  {
    id: TEST_USER_ID,
    email: 'test@test.com',
    password: TEST_PASSWORD_HASH,
    name: 'Test User',
    googleId: null,
  },
];

const movies = [
  {
    title: 'Open Season',
    year: 2006,
    genres: ['Animation', 'Adventure', 'Comedy'],
    director: 'Roger Allers & Jill Culton & Anthony Stacchi',
    rating: 10.0,
    notes: null,
    image: '543896e2-7b7c-4fd8-bd08-9e96a9da6885.jpg',
  },
  {
    title: 'The Rubber',
    year: 2010,
    genres: ['Horror', 'Action', 'Adventure'],
    director: 'Quentin Dupieux',
    rating: 10.0,
    notes: 'One of the best horror movies I saw.',
    image: '5b0c259b-22d1-4a94-b41a-f82d0a37fb62.jpg',
  },
  {
    title: 'Harry Potter series',
    year: 2001,
    genres: ['Fantasy', 'Adventure', 'Family'],
    director: 'J.K. Rowling & Steve Kloves',
    rating: 10.0,
    notes: null,
    image: 'cf195309-025d-4bf8-9bb9-79ab6369636c.jpg',
  },
  {
    title: 'Avengers: End Game',
    year: 2019,
    genres: ['Action', 'Sci-Fi', 'Superhero'],
    director: 'Anthony Russo & Joe Russo',
    rating: 10.0,
    notes: 'Best avengers movie.',
    image: '5d0016e1-af0c-4bf6-ace2-0737261cf6a3.jpg',
  },
  {
    title: 'Fractured',
    year: 2019,
    genres: ['Mystery', 'Thriller', 'Psychological Thriller'],
    director: 'Brad Anderson',
    rating: 10.0,
    notes: null,
    image: '5412446f-1573-4942-9588-7861bf7bdae8.jpg',
  },
  {
    title: 'Vacation Friends',
    year: 2021,
    genres: ['Comedy', 'Adventure'],
    director: 'Clay Tarver',
    rating: 10.0,
    notes: null,
    image: '53a4d58d-461a-4417-a42b-1ce15b032645.jpg',
  },
  {
    title: '21 Jump Street',
    year: 2012,
    genres: ['Comedy', 'Action', 'Crime'],
    director: 'Phil Lord & Christopher Miller',
    rating: 10.0,
    notes: 'Ice Cube was best suited for his role.',
    image: '1df1a8b3-7a22-4b31-986f-84ebb233c13a.jpg',
  },
  {
    title: 'The Giver',
    year: 2014,
    genres: ['Sci-Fi', 'Thriller', 'Drama', 'Romance'],
    director: 'Phillip Noyce',
    rating: 9.0,
    notes: null,
    image: '776fc6f7-f056-474d-8dde-722ef626f7f7.jpg',
  },
  {
    title: 'ARQ',
    year: 2016,
    genres: ['Sci-Fi', 'Thriller', 'Action', 'Time Travel'],
    director: 'Tony Elliott',
    rating: 9.0,
    notes: 'Movie about couple stuck in the time loop.',
    image: '22d000e2-391c-460c-ad8f-f7f0f9cf74b5.jpg',
  },
  {
    title: 'The Garfield Movie',
    year: 2004,
    genres: ['Comedy', 'Fantasy', 'Adventure', 'Family'],
    director: 'Peter Hewitt',
    rating: 8.0,
    notes: null,
    image: '1d3df0cc-0efa-4e54-8b1b-470676b8bef5.jpg',
  },
  {
    title: 'Black Sheep',
    year: 2006,
    genres: ['Horror', 'Comedy', 'Sci-Fi'],
    director: 'Jonathan King',
    rating: 7.5,
    notes: 'Sheeps were not actually black.',
    image: 'cb4ce84b-12a2-4747-92ad-27628a25f650.jpg',
  },
  {
    title: 'Hereditary',
    year: 2018,
    genres: ['Horror', 'Mystery', 'Drama'],
    director: 'Ari Aster',
    rating: 4.5,
    notes: 'Horror movie, which made no sense most of the time.',
    image: '2eb040a0-2810-415e-a13c-b18ae63eacb5.jpg',
  },
];

async function seed() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'favorite_movies',
  });

  try {
    await client.connect();

    // Seed users
    let usersInserted = 0;
    for (const u of users) {
      const res = await client.query(
        `INSERT INTO users (id, email, password, name, "googleId")
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO NOTHING`,
        [u.id, u.email, u.password, u.name, u.googleId],
      );
      usersInserted += res.rowCount;
    }

    // Seed movies
    let moviesInserted = 0;
    for (const m of movies) {
      const existing = await client.query(
        'SELECT 1 FROM movies WHERE title = $1 AND "userId" = $2',
        [m.title, OWNER_ID],
      );
      if (existing.rowCount === 0) {
        await client.query(
          `INSERT INTO movies (title, year, genres, director, rating, notes, image, "userId")
           VALUES ($1, $2, $3::jsonb, $4, $5, $6, $7, $8)`,
          [m.title, m.year, JSON.stringify(m.genres), m.director, m.rating, m.notes, m.image, OWNER_ID],
        );
        moviesInserted++;
      }
    }

    console.log(`Seed complete: ${usersInserted} users added, ${moviesInserted} movies added.`);
    if (usersInserted === 0 && moviesInserted === 0) {
      console.log('(All data already existed - nothing new inserted.)');
    }
    console.log('\nAccounts:');
    console.log('  Owner:  owner@owner.com / owner123  (can add/edit/delete)');
    console.log('  Viewer: test@test.com   / test123   (view only)');
  } catch (err) {
    if (err.message.includes('relation "users" does not exist')) {
      console.error('Tables do not exist yet. Start the backend first (`npm run dev`) to auto-create tables, then run seed again.');
    } else {
      console.error('Seed failed:', err.message);
    }
    process.exit(1);
  } finally {
    await client.end();
  }
}

seed();
