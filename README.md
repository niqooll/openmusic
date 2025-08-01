# 🎵 OpenMusic API

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Hapi.js](https://img.shields.io/badge/Hapi.js-FF6600?style=for-the-badge&logo=hapi&logoColor=white)

**RESTful API untuk mengelola data album dan lagu pada aplikasi OpenMusic**

[Demo](#demo) • [Installation](#installation) • [API Documentation](#api-documentation) • [Contributing](#contributing)

</div>

---

## 📋 Table of Contents

- [🎵 OpenMusic API](#-openmusic-api)
  - [📋 Table of Contents](#-table-of-contents)
  - [✨ Features](#-features)
  - [🛠️ Tech Stack](#️-tech-stack)
  - [📦 Prerequisites](#-prerequisites)
  - [🚀 Installation](#-installation)
    - [1. Clone Repository](#1-clone-repository)
    - [2. Install Dependencies](#2-install-dependencies)
    - [3. Database Setup](#3-database-setup)
    - [4. Environment Configuration](#4-environment-configuration)
    - [5. Database Migration](#5-database-migration)
    - [6. Start Server](#6-start-server)
  - [📖 API Documentation](#-api-documentation)
    - [🎼 Albums Endpoints](#-albums-endpoints)
    - [🎵 Songs Endpoints](#-songs-endpoints)
    - [🔍 Query Parameters](#-query-parameters)
  - [📝 Request/Response Examples](#-requestresponse-examples)
    - [Create Album](#create-album)
    - [Get Album with Songs](#get-album-with-songs)
    - [Create Song](#create-song)
    - [Search Songs](#search-songs)
  - [❌ Error Handling](#-error-handling)
  - [🏗️ Project Structure](#️-project-structure)
  - [🗃️ Database Schema](#️-database-schema)
  - [🧪 Testing](#-testing)
  - [🚀 Deployment](#-deployment)
  - [🤝 Contributing](#-contributing)
  - [📄 License](#-license)

---

## ✨ Features

- ✅ **Complete CRUD Operations** - Full Create, Read, Update, Delete for Albums & Songs
- ✅ **Advanced Search** - Search songs by title, performer, or both
- ✅ **Relational Data** - Albums can contain multiple songs with proper relationships
- ✅ **Data Validation** - Comprehensive input validation using Joi
- ✅ **Error Handling** - Proper HTTP status codes and error messages
- ✅ **PostgreSQL Integration** - Reliable data persistence with migrations
- ✅ **RESTful Design** - Clean and intuitive API endpoints
- ✅ **Environment Configuration** - Flexible deployment configuration

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | ≥14.0.0 | Runtime Environment |
| **Hapi.js** | ^21.3.2 | Web Framework |
| **PostgreSQL** | ≥12.0 | Database |
| **Joi** | ^17.11.0 | Data Validation |
| **node-pg-migrate** | ^6.2.2 | Database Migrations |
| **nanoid** | ^3.3.7 | Unique ID Generation |

---

## 📦 Prerequisites

Pastikan Anda telah menginstall:

- **Node.js** (version 14 atau lebih tinggi)
- **PostgreSQL** (version 12 atau lebih tinggi)
- **npm** atau **yarn**

---

## 🚀 Installation

### 1. Clone Repository

```bash
git clone https://github.com/your-username/openmusic-api.git
cd openmusic-api
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

Buka PostgreSQL dan jalankan:

```sql
-- Buat database
CREATE DATABASE openmusic;

-- Buat user (opsional)
CREATE USER openmusic_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE openmusic TO openmusic_user;
```

### 4. Environment Configuration

```bash
# Copy environment template
cp .env.example .env
```

Edit file `.env`:

```env
# Server Configuration
HOST=localhost
PORT=5000

# Database Configuration
PGUSER=postgres
PGPASSWORD=your_password
PGDATABASE=openmusic
PGHOST=localhost
PGPORT=5432

# Database URL untuk migration
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/openmusic
```

### 5. Database Migration

```bash
# Jalankan semua migrations
npm run migrate:up
```

### 6. Start Server

```bash
# Production mode
npm start

# Development mode (dengan auto-reload)
npm run dev
```

✅ **Server berhasil running di:** `http://localhost:5000`

---

## 📖 API Documentation

### 🎼 Albums Endpoints

| Method | Endpoint | Description | Status Code |
|--------|----------|-------------|-------------|
| `POST` | `/albums` | Create new album | `201` |
| `GET` | `/albums/{id}` | Get album details with songs | `200` |
| `PUT` | `/albums/{id}` | Update album | `200` |
| `DELETE` | `/albums/{id}` | Delete album | `200` |

### 🎵 Songs Endpoints

| Method | Endpoint | Description | Status Code |
|--------|----------|-------------|-------------|
| `POST` | `/songs` | Create new song | `201` |
| `GET` | `/songs` | Get all songs (with optional search) | `200` |
| `GET` | `/songs/{id}` | Get song details | `200` |
| `PUT` | `/songs/{id}` | Update song | `200` |
| `DELETE` | `/songs/{id}` | Delete song | `200` |

### 🔍 Query Parameters

**GET /songs** mendukung parameter pencarian:

- `?title=<string>` - Search by song title
- `?performer=<string>` - Search by performer name
- Kedua parameter dapat dikombinasikan

**Contoh:**
```
GET /songs?title=life&performer=coldplay
```

---

## 📝 Request/Response Examples

### Create Album

**Request:**
```http
POST /albums
Content-Type: application/json

{
  "name": "Viva la Vida",
  "year": 2008
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "albumId": "album-Mk8AnmCp210PwT6B"
  }
}
```

### Get Album with Songs

**Request:**
```http
GET /albums/album-Mk8AnmCp210PwT6B
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "album": {
      "id": "album-Mk8AnmCp210PwT6B",
      "name": "Viva la Vida",
      "year": 2008,
      "songs": [
        {
          "id": "song-Qbax5Oy7L8WKf74l",
          "title": "Life in Technicolor",
          "performer": "Coldplay"
        },
        {
          "id": "song-poax5Oy7L8WKllqw",
          "title": "Cemeteries of London",
          "performer": "Coldplay"
        }
      ]
    }
  }
}
```

### Create Song

**Request:**
```http
POST /songs
Content-Type: application/json

{
  "title": "Life in Technicolor",
  "year": 2008,
  "genre": "Alternative Rock",
  "performer": "Coldplay",
  "duration": 120,
  "albumId": "album-Mk8AnmCp210PwT6B"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "songId": "song-Qbax5Oy7L8WKf74l"
  }
}
```

### Search Songs

**Request:**
```http
GET /songs?performer=coldplay
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "songs": [
      {
        "id": "song-Qbax5Oy7L8WKf74l",
        "title": "Life in Technicolor",
        "performer": "Coldplay"
      },
      {
        "id": "song-poax5Oy7L8WKllqw",
        "title": "Cemeteries of London",
        "performer": "Coldplay"
      }
    ]
  }
}
```

---

## ❌ Error Handling

API menggunakan standar HTTP status codes:

### Client Errors (4xx)

```json
{
  "status": "fail",
  "message": "Validation error message"
}
```

**Common Status Codes:**
- `400` - Bad Request (validation failed)
- `404` - Not Found (resource tidak ditemukan)

### Server Errors (5xx)

```json
{
  "status": "error",
  "message": "Maaf, terjadi kegagalan pada server kami."
}
```

---

## 🏗️ Project Structure

```
openmusic-api/
├── 📁 migrations/                 # Database migrations
│   ├── 1700000000000_create-table-albums.js
│   ├── 1700000000001_create-table-songs.js
│   └── 1700000000002_fix-foreign-key-songs.js
├── 📁 src/
│   ├── 📁 api/                    # API layer
│   │   ├── 📁 albums/             # Albums endpoints
│   │   │   ├── handler.js
│   │   │   ├── index.js
│   │   │   └── routes.js
│   │   └── 📁 songs/              # Songs endpoints
│   │       ├── handler.js
│   │       ├── index.js
│   │       └── routes.js
│   ├── 📁 exceptions/             # Custom exceptions
│   │   ├── ClientError.js
│   │   ├── InvariantError.js
│   │   └── NotFoundError.js
│   ├── 📁 services/               # Business logic
│   │   └── 📁 postgres/
│   │       ├── AlbumsService.js
│   │       └── SongsService.js
│   ├── 📁 validator/              # Input validation
│   │   ├── 📁 albums/
│   │   │   ├── index.js
│   │   │   └── schema.js
│   │   └── 📁 songs/
│   │       ├── index.js
│   │       └── schema.js
│   └── server.js                  # Main server file
├── .env.example                   # Environment template
├── .pgmigrate.json               # Migration config
├── package.json
└── README.md
```

---

## 🗃️ Database Schema

### Albums Table
```sql
CREATE TABLE albums (
  id VARCHAR(50) PRIMARY KEY,
  name TEXT NOT NULL,
  year INTEGER NOT NULL
);
```

### Songs Table
```sql
CREATE TABLE songs (
  id VARCHAR(50) PRIMARY KEY,
  title TEXT NOT NULL,
  year INTEGER NOT NULL,
  genre TEXT NOT NULL,
  performer TEXT NOT NULL,
  duration INTEGER,
  album_id VARCHAR(50) REFERENCES albums(id) ON DELETE SET NULL
);
```

---

## 🧪 Testing

### Manual Testing dengan cURL

**Test Create Album:**
```bash
curl -X POST http://localhost:5000/albums \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Album", "year": 2023}'
```

**Test Get Album:**
```bash
curl http://localhost:5000/albums/{album_id}
```

**Test Search Songs:**
```bash
curl "http://localhost:5000/songs?title=test"
```

### Testing dengan Postman

Import collection Postman dari file `postman_collection.json` (jika tersedia) atau buat request manual sesuai dokumentasi API di atas.

---

## 🚀 Deployment

### Environment Variables untuk Production

```env
# Production database
PGHOST=your_production_host
PGPORT=5432
PGUSER=your_production_user
PGPASSWORD=your_secure_password
PGDATABASE=openmusic_prod

# Production server
HOST=0.0.0.0
PORT=80
```

### Database Migration di Production

```bash
# Jalankan migration di production
NODE_ENV=production npm run migrate:up
```

---

## 🤝 Contributing

1. **Fork** repository ini
2. **Create** feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** perubahan (`git commit -m 'Add amazing feature'`)
4. **Push** ke branch (`git push origin feature/amazing-feature`)
5. **Open** Pull Request

### Development Guidelines

- Gunakan ESLint untuk code formatting
- Tulis test untuk fitur baru
- Update dokumentasi jika diperlukan
- Follow existing code patterns

---

## 📄 License

This project is licensed under the **ISC License** - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Made with ❤️ by TSC Team**

⭐ **Star this repo if you find it helpful!** ⭐

[Report Bug](https://github.com/your-username/openmusic-api/issues) • [Request Feature](https://github.com/your-username/openmusic-api/issues)

</div>