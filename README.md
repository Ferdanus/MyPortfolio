# My Portfolio

A personal portfolio website and REST API built with Node.js, Express, and SQLite. This project demonstrates full-stack web development skills including web deployment, database management, API design, testing, and Docker-based deployment.

## Live Demo

Deployed and accessible at a production URL (see deployment section).

## Features

- **About Me** — Personal introduction and profile overview
- **Skills Section** — Skills mapped to job requirements
- **Projects Section** — Showcasing work with dynamic loading
- **Contact Form** — Send messages stored in the database
- **REST API** — Full CRUD API for projects and skills
- **SQLite Database** — Lightweight, zero-config database
- **Docker Support** — One-command deployment with Docker Compose
- **Health Check** — API health monitoring endpoint

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, JavaScript (Vanilla) |
| Backend | Node.js, Express.js |
| Database | SQLite (better-sqlite3) |
| Deployment | Docker, Docker Compose |
| Testing | Jest, Supertest |

## Project Structure

```
MyPortofolio/
├── public/
│   ├── index.html        # Main portfolio page
│   ├── css/
│   │   └── style.css      # Stylesheet
│   └── js/
│       └── app.js         # Frontend JavaScript
├── src/
│   └── server.js          # Express server + API routes
├── tests/
│   └── server.test.js     # API integration tests
├── data/                   # SQLite database
├── Dockerfile              # Docker image
├── docker-compose.yml      # Docker Compose configuration
├── package.json            # Project configuration and scripts
└── README.md               # This file
```

## Getting Started

### Prerequisites

- Node.js v24 or later
- npm

### Installation

```bash
npm install
```

### Running Locally

```bash
npm start
```

The application will be available at `http://localhost:3000`.

### Development Mode

```bash
npm run dev
```

This enables auto-restart on file changes.

### Testing

```bash
npm test
```

Tests use Jest and Supertest to verify API endpoints and frontend serving.

### Deployment with Docker

```bash
docker-compose up -d
```

The application will be available at `http://localhost:3000`.

## API Endpoints

### GET /api/health
Health check endpoint.

### GET /api/projects
Returns all projects.

### GET /api/projects/:id
Returns a single project by ID.

### POST /api/projects
Creates a new project. Requires `title` and `description` in the request body.

### GET /api/skills
Returns all skills.

### POST /api/contact
Submits a contact message. Requires `name`, `email`, and `message`.

## Deployment

This project is configured for easy deployment:

- **Docker** — Includes a `Dockerfile` and `docker-compose.yml` for containerized deployment
- **Health Check** — Built-in `/api/health` endpoint for monitoring
- **Zero Config** — SQLite requires no external database setup

## Skills Mapping

This portfolio addresses the following job requirements:

1. Membantu pengembangan sistem informasi berbasis web — Full-stack web development
2. Membuat modul aplikasi menggunakan bahasa pemrograman dan framework — Node.js + Express
3. Membantu pengembangan database, API, dan integrasi antar sistem informasi — SQLite + REST API
4. Melakukan pengujian (testing) dan perbaikan (bug fixing) aplikasi — Jest + Supertest
5. Membantu deployment, pemeliharaan, dan dokumentasi teknis aplikasi — Docker + README

## License

ISC