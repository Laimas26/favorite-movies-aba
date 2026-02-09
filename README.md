# Favorite Movies List

A full-stack web application for managing a personal favorite movies collection. Built as a test task for **ababa.tech** internship.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript, Redux Toolkit, CSS Modules, Vite |
| **Backend** | NestJS, TypeScript, TypeORM, Passport.js |
| **Database** | PostgreSQL (JSONB, UUID primary keys) |
| **Auth** | JWT + Google OAuth 2.0, bcrypt password hashing |

## Prerequisites

You need **Node.js** (>= 20) and **PostgreSQL** (>= 14). Follow the instructions for your operating system below.

### Node.js

<details>
<summary><strong>Windows</strong></summary>

1. Download the **LTS** installer from [nodejs.org](https://nodejs.org/)
2. Run the installer — keep all defaults
3. Open a new terminal and verify:
   ```bash
   node --version   # Should show v20+
   npm --version    # Should show 9+
   ```

</details>

<details>
<summary><strong>Linux (Ubuntu / Debian)</strong></summary>

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node --version   # Should show v20+
```

</details>

<details>
<summary><strong>macOS</strong></summary>

```bash
brew install node@20
node --version   # Should show v20+
```

Or download the installer from [nodejs.org](https://nodejs.org/).

</details>

### PostgreSQL

<details>
<summary><strong>Windows</strong></summary>

1. Download the installer from [postgresql.org/download/windows](https://www.postgresql.org/download/windows/)
2. Run the installer:
   - Set the password for the `postgres` user to **`postgres`** (this matches the app's default config)
   - Keep the default port **5432**
   - Finish the installation (pgAdmin is optional but helpful)
3. PostgreSQL starts automatically as a Windows service. To verify, open *Services* (`services.msc`) and check that **postgresql-x64-17** (or your version) shows "Running".

</details>

<details>
<summary><strong>Linux (Ubuntu / Debian)</strong></summary>

```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable --now postgresql
```

Set the password for the `postgres` user to match the app's default config:

```bash
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';"
```

Verify it's running:

```bash
sudo systemctl status postgresql
```

</details>

<details>
<summary><strong>macOS</strong></summary>

```bash
brew install postgresql@14
brew services start postgresql@14
```

Set the password:

```bash
psql -U postgres -c "ALTER USER postgres PASSWORD 'postgres';"
```

</details>

## Quick Start

### 1. Clone & install

```bash
git clone <repository-url>
cd favorite-movies
npm run install:all
```

This installs dependencies for the root, backend, and frontend.

### 2. Configure environment

Copy the example files — all defaults work out of the box (including Google OAuth):

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

> On Windows CMD, use `copy` instead of `cp` (or just use Git Bash).

Only edit `backend/.env` if your PostgreSQL credentials differ from `postgres`/`postgres`.

### 3. Create the database

```bash
npm run db:create
```

This automatically creates the `favorite_movies` PostgreSQL database. If it already exists, it skips gracefully. Database **tables are created automatically** by TypeORM when the backend starts — no migrations needed.

### 4. Start the app (first run)

```bash
npm run dev
```

This starts both servers concurrently:
- **Backend** → http://localhost:3001
- **Frontend** → http://localhost:5173

On the first run, wait a few seconds for TypeORM to create the database tables, then seed the sample data:

```bash
npm run db:seed
```

This populates the database with 12 movies (with poster images) and a test account.

### 5. Open in browser

Go to http://localhost:5173 and log in with one of the test accounts:

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| **Owner** | `owner@owner.com` | `owner123` | Add, edit, delete movies |
| **Viewer** | `test@test.com` | `test123` | View only |

> **One-liner setup (after first run):** `npm run setup && npm run dev` — installs deps, creates DB, and seeds sample data. Note: the backend must have run at least once to create the tables before seeding works.

## Features

- **JWT Authentication** — register and login with email/password
- **Google OAuth** — one-click login with Google account
- **Password Reset** — forgot password on login page, change password on profile; reset link logged to backend console (Ethereal fake SMTP)
- **Movies CRUD** — add, edit, and delete movies with image upload
- **Image Cropper** — built-in 2:3 poster cropping (pan, zoom, crop on submit)
- **Multi-Genre Support** — movies can have multiple genres (JSONB), main genre highlighted in gold
- **Search** — debounced (300ms) case-insensitive search by title
- **Sorting** — click column headers to sort by title, year, genre, director, rating, or date added
- **Filters** — year range slider, rating range slider (0-10, step 0.5), genre pills — with deferred "Apply" to prevent flicker
- **Pagination** — configurable page size (10 / 25 / 50), page navigation
- **Collapsible Rows** — click any row to expand and see all genre tags + notes
- **Authorization** — only movie owners can edit/delete their movies
- **Auto-Logout** — expired JWT tokens are detected and cleared automatically
- **Mobile Responsive** — hamburger menu with slide drawer, adapted layouts at 480px breakpoint
- **Dark Theme** — neutral grey palette with green accents, CSS custom properties throughout

## API Endpoints

### Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/auth/register` | No | Register a new user |
| `POST` | `/auth/login` | No | Login and receive JWT |
| `POST` | `/auth/google` | No | Login/register via Google OAuth token |
| `GET` | `/auth/profile` | Yes | Get current user profile |
| `POST` | `/auth/forgot-password` | No | Send password reset email (link in backend console) |
| `POST` | `/auth/reset-password` | No | Reset password using token from email link |

### Movies

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/movies` | Yes | List movies (paginated, filtered, sorted) |
| `GET` | `/movies/:id` | Yes | Get a single movie |
| `POST` | `/movies` | Yes | Create a movie (multipart form with optional image) |
| `PATCH` | `/movies/:id` | Yes | Update a movie (owner only) |
| `DELETE` | `/movies/:id` | Yes | Delete a movie (owner only) |

**Query parameters for `GET /movies`:**

| Parameter | Default | Description |
|-----------|---------|-------------|
| `page` | `1` | Page number |
| `limit` | `10` | Items per page |
| `search` | — | Case-insensitive title search |
| `sortBy` | `rating` | Column: `title`, `year`, `genres`, `director`, `rating`, `createdAt` |
| `sortOrder` | `DESC` | `ASC` or `DESC` |
| `yearFrom` | — | Minimum year filter |
| `yearTo` | — | Maximum year filter |
| `ratingMin` | — | Minimum rating (0-10) |
| `ratingMax` | — | Maximum rating (0-10) |
| `genres` | — | Comma-separated genre filter (e.g. `Action,Drama`) |

## Project Structure

```
favorite-movies/
├── backend/                  # NestJS API
│   ├── scripts/
│   │   └── create-db.js      # Database auto-creation script
│   ├── src/
│   │   ├── auth/             # JWT strategy, guards, Google OAuth, password reset, email service
│   │   ├── users/            # User entity and service
│   │   └── movies/           # Movies CRUD, pagination, search, sort, filters
│   ├── uploads/              # Uploaded movie poster images
│   └── .env.example
├── frontend/                 # React SPA (Vite)
│   ├── public/               # Static assets (hero video, images)
│   ├── src/
│   │   ├── components/       # MovieTable, MovieForm, Navbar, GenreTag, etc.
│   │   ├── pages/            # Movies, Login, Register, Profile, MovieDetail
│   │   ├── store/            # Redux Toolkit (authSlice, moviesSlice)
│   │   ├── api/              # Axios instance with JWT interceptor
│   │   └── types/            # TypeScript interfaces
│   └── .env.example
├── package.json              # Root: npm run dev, install:all, setup, db:create
└── README.md
```

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_USERNAME` | PostgreSQL user | `postgres` |
| `DB_PASSWORD` | PostgreSQL password | `postgres` |
| `DB_NAME` | Database name | `favorite_movies` |
| `JWT_SECRET` | Secret key for signing JWT tokens | — |
| `PORT` | Backend server port | `3001` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID (optional) | — |
| `FRONTEND_URL` | Frontend URL for password reset links | `http://localhost:5173` |

### Frontend (`frontend/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:3001` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID (optional) | — |
