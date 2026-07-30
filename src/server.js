const express = require('express');
const path = require('path');
const Database = require('better-sqlite3');

const app = express();
const PORT = process.env.PORT || 3000;

const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'portfolio.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
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
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

const existingProjects = db.prepare('SELECT COUNT(*) as count FROM projects').get();
if (existingProjects.count === 0) {
  const insert = db.prepare('INSERT INTO projects (title, description, tech_stack, status) VALUES (?, ?, ?, ?)');
  insert.run('Task Manager API', 'A RESTful API for managing tasks with CRUD operations, authentication, and role-based access control.', 'Node.js, Express, SQLite, JWT', 'completed');
  insert.run('Portfolio Website', 'Personal portfolio website showcasing projects, skills, and experience with responsive design and API integration.', 'HTML, CSS, JavaScript, Express', 'completed');
  insert.run('Inventory Dashboard', 'A web dashboard for tracking inventory with charts, filtering, and export functionality.', 'Express, SQLite, Chart.js', 'completed');
}

const existingSkills = db.prepare('SELECT COUNT(*) as count FROM skills').get();
if (existingSkills.count === 0) {
  const insertSkill = db.prepare('INSERT INTO skills (name, category, level) VALUES (?, ?, ?)');
  insertSkill.run('HTML/CSS', 'Frontend', 'advanced');
  insertSkill.run('JavaScript', 'Frontend', 'advanced');
  insertSkill.run('Express.js', 'Backend', 'intermediate');
  insertSkill.run('SQLite', 'Database', 'intermediate');
  insertSkill.run('REST API Design', 'Integration', 'intermediate');
  insertSkill.run('Docker', 'Deployment', 'intermediate');
  insertSkill.run('Testing', 'QA', 'intermediate');
  insertSkill.run('Git', 'DevOps', 'advanced');
  insertSkill.run('Web Deployment', 'DevOps', 'advanced');
}

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/api/projects', (req, res) => {
  const projects = db.prepare('SELECT * FROM projects ORDER BY created_at DESC').all();
  res.json({ success: true, data: projects });
});

app.get('/api/projects/:id', (req, res) => {
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
  if (!project) {
    return res.status(404).json({ success: false, error: 'Project not found' });
  }
  res.json({ success: true, data: project });
});

app.post('/api/projects', (req, res) => {
  const { title, description, tech_stack, status } = req.body;
  if (!title || !description) {
    return res.status(400).json({ success: false, error: 'Title and description are required' });
  }
  const result = db.prepare('INSERT INTO projects (title, description, tech_stack, status) VALUES (?, ?, ?, ?)').run(title, description, tech_stack || '', status || 'completed');
  res.status(201).json({ success: true, data: { id: result.lastInsertRowid, title, description, tech_stack, status } });
});

app.get('/api/skills', (req, res) => {
  const skills = db.prepare('SELECT * FROM skills ORDER BY category, name').all();
  res.json({ success: true, data: skills });
});

app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: 'All fields are required' });
  }
  const result = db.prepare('INSERT INTO messages (name, email, message) VALUES (?, ?, ?)').run(name, email, message);
  res.status(201).json({ success: true, data: { id: result.lastInsertRowid } });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Portfolio server running at http://localhost:${PORT}`);
  });
}

module.exports = app;