const path = require('path');

process.env.DB_PATH = path.join(__dirname, '..', 'data', 'test-portfolio.db');

const request = require('supertest');
const app = require('../src/server');
const Database = require('better-sqlite3');

const testDbPath = process.env.DB_PATH;

let db;

beforeAll(() => {
  db = new Database(testDbPath);
  db.pragma('journal_mode = WAL');
  db.exec(`
    DROP TABLE IF EXISTS projects;
    DROP TABLE IF EXISTS skills;
    DROP TABLE IF EXISTS messages;
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      tech_stack TEXT NOT NULL,
      status TEXT DEFAULT 'completed',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS skills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      level TEXT DEFAULT 'intermediate'
    );
    INSERT INTO skills (name, category, level) VALUES ('HTML/CSS', 'Frontend', 'advanced');
    INSERT INTO skills (name, category, level) VALUES ('JavaScript', 'Frontend', 'advanced');
    INSERT INTO skills (name, category, level) VALUES ('Express.js', 'Backend', 'intermediate');
    INSERT INTO skills (name, category, level) VALUES ('SQLite', 'Database', 'intermediate');
    INSERT INTO skills (name, category, level) VALUES ('REST API Design', 'Integration', 'intermediate');
    INSERT INTO skills (name, category, level) VALUES ('Docker', 'Deployment', 'intermediate');
    INSERT INTO skills (name, category, level) VALUES ('Testing', 'QA', 'intermediate');
    INSERT INTO skills (name, category, level) VALUES ('Git', 'DevOps', 'advanced');
    INSERT INTO skills (name, category, level) VALUES ('Web Deployment', 'DevOps', 'advanced');
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    INSERT INTO projects (title, description, tech_stack, status) VALUES ('Test Project', 'A test project description', 'Node.js, Express', 'completed');
  `);
});

afterAll(() => {
  db.close();
  try {
    require('fs').unlinkSync(testDbPath);
  } catch (e) {}
});

describe('API Health Check', () => {
  test('GET /api/health should return status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('Projects API', () => {
  test('GET /api/projects should return a list of projects', async () => {
    const res = await request(app).get('/api/projects');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test('GET /api/projects/:id should return a single project', async () => {
    const res = await request(app).get('/api/projects/1');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Test Project');
  });

  test('GET /api/projects/:id should return 404 for non-existent project', async () => {
    const res = await request(app).get('/api/projects/9999');
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test('POST /api/projects should create a new project', async () => {
    const res = await request(app)
      .post('/api/projects')
      .send({
        title: 'New Test Project',
        description: 'Created via test',
        tech_stack: 'Node.js',
        status: 'completed'
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('New Test Project');
  });

  test('POST /api/projects should return 400 when title is missing', async () => {
    const res = await request(app)
      .post('/api/projects')
      .send({ description: 'Missing title' });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('Skills API', () => {
  test('GET /api/skills should return a list of skills', async () => {
    const res = await request(app).get('/api/skills');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });
});

describe('Contact API', () => {
  test('POST /api/contact should accept a message', async () => {
    const res = await request(app)
      .post('/api/contact')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        message: 'Hello from test'
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
  });

  test('POST /api/contact should return 400 when fields are missing', async () => {
    const res = await request(app)
      .post('/api/contact')
      .send({ name: 'Test User' });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('Frontend Serving', () => {
  test('GET / should serve the portfolio page', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('<title>My Portfolio');
  });

  test('GET /css/style.css should serve stylesheet', async () => {
    const res = await request(app).get('/css/style.css');
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toContain('text/css');
  });
});