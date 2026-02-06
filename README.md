# Favorite Movies List

A full-stack application for managing a personal favorite movies collection. Built with **NestJS**, **React**, **TypeScript**, **PostgreSQL**, and **Redux Toolkit**.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript, Redux Toolkit, CSS Modules, Vite |
| **Backend** | NestJS, TypeScript, TypeORM, PostgreSQL |
| **Auth** | JWT (JSON Web Tokens), bcrypt |
| **Validation** | class-validator, class-transformer |

## Prerequisites

- **Node.js** >= 20
- **PostgreSQL** >= 14
- **npm** >= 9

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd favorite-movies
```

### 2. Database Setup

Create the PostgreSQL database:

```bash
psql -U postgres -c "CREATE DATABASE favorite_movies;"
```

Or via **pgAdmin**: right-click Databases > Create > Database > name it `favorite_movies`.

### 3. Backend

```bash
cd backend
cp .env.example .env    # Edit .env with your DB credentials
npm install
npm run start:dev       # Starts on http://localhost:3000
```

### 4. Frontend

```bash
cd frontend
npm install
npm run dev             # Starts on http://localhost:5173
```

Open **http://localhost:5173** in your browser.

## Features

- **Authentication** - Register and login with JWT-based auth
- **Movies CRUD** - Add, edit, and delete your favorite movies
- **Pagination** - Paginated movie list (10 per page)
- **Search** - Search movies by title (debounced)
- **Sorting** - Click column headers to sort by title, year, genre, director, or rating
- **Authorization** - Only movie owners can edit/delete their movies
- **Validation** - Full input validation on both frontend and backend
- **Guards** - JWT auth guards protecting write operations
- **Fun UX** - Try clicking "Add Movie" without logging in ;)

## API Endpoints

### Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/auth/register` | No | Register a new user |
| `POST` | `/auth/login` | No | Login and receive JWT |
| `GET` | `/auth/profile` | Yes | Get current user profile |

### Movies

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/movies` | No | List movies (paginated) |
| `GET` | `/movies/:id` | No | Get single movie |
| `POST` | `/movies` | Yes | Create a movie |
| `PATCH` | `/movies/:id` | Yes | Update a movie (owner only) |
| `DELETE` | `/movies/:id` | Yes | Delete a movie (owner only) |

**Query parameters for `GET /movies`:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `search` - Search by title
- `sortBy` - Sort column: `title`, `year`, `genre`, `director`, `rating`, `createdAt`
- `sortOrder` - `ASC` or `DESC`

## Project Structure

```
├── backend/              # NestJS API
│   └── src/
│       ├── auth/         # Authentication (JWT, guards, strategies)
│       ├── users/        # User entity and service
│       └── movies/       # Movies CRUD with pagination/search/sort
├── frontend/             # React SPA
│   └── src/
│       ├── components/   # Reusable UI components
│       ├── pages/        # Page components (Movies, Login, Register)
│       ├── store/        # Redux Toolkit (slices, store config)
│       ├── api/          # Axios instance with JWT interceptor
│       └── types/        # TypeScript interfaces
└── README.md
```

## Environment Variables

### Backend (`backend/.env`)

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=favorite_movies
JWT_SECRET=your_secret_key
```
