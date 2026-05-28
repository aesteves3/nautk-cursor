import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';

dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '.env') });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const dataDir = path.join(__dirname, 'data');
const coursesFile = path.join(root, 'public/data/courses.json');

fs.mkdirSync(dataDir, { recursive: true });

const app = express();
const port = Number(process.env.PORT || 3001);

app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',').map((s) => s.trim()) || true,
}));
app.use(express.json({ limit: '64kb' }));

function loadCourses() {
  const raw = fs.readFileSync(coursesFile, 'utf8');
  return JSON.parse(raw);
}

function appendJson(fileName, record) {
  const filePath = path.join(dataDir, fileName);
  const list = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf8')) : [];
  const entry = { id: crypto.randomUUID(), created_at: new Date().toISOString(), ...record };
  list.push(entry);
  fs.writeFileSync(filePath, JSON.stringify(list, null, 2));
  return entry;
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const courseLabels = {
  arrais: 'Arrais Amador',
  mestre: 'Mestre Amador',
  capitao: 'Capitão Amador',
  pratica: 'Prática',
  internacional: 'Internacional',
  general: 'Geral',
};

async function sendMail({ subject, html }) {
  const to = process.env.MAIL_TO || 'contato@nautk.org';
  if (process.env.SMTP_HOST) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
    });
    await transporter.sendMail({
      from: process.env.MAIL_FROM || process.env.SMTP_USER || to,
      to,
      subject,
      html,
    });
    return;
  }
  console.log('[email skipped — configure SMTP in server/.env]', subject);
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/courses', (req, res) => {
  let courses = loadCourses();
  if (req.query.certification_level) {
    courses = courses.filter((c) => c.certification_level === req.query.certification_level);
  }
  if (req.query.is_active === 'true') {
    courses = courses.filter((c) => c.is_active);
  }
  res.json(courses);
});

app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, phone, course_interest, message } = req.body || {};
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Nome, e-mail e mensagem são obrigatórios.' });
    }
    const record = appendJson('contact-messages.json', {
      name, email, phone, course_interest, message,
    });
    const subject = `[NAUTK] Nova mensagem de contato – ${name}`;
    const html = `
      <h2>Nova mensagem de contato</h2>
      <p><strong>Nome:</strong> ${escapeHtml(name)}</p>
      <p><strong>E-mail:</strong> ${escapeHtml(email)}</p>
      <p><strong>Telefone:</strong> ${escapeHtml(phone || 'Não informado')}</p>
      <p><strong>Interesse:</strong> ${escapeHtml(courseLabels[course_interest] || course_interest || 'Geral')}</p>
      <p><strong>Mensagem:</strong></p>
      <pre>${escapeHtml(message)}</pre>
    `;
    await sendMail({ subject, html });
    res.status(201).json({ ok: true, id: record.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Falha ao processar mensagem.' });
  }
});

app.post('/api/enrollments', async (req, res) => {
  try {
    const { course_id, student_name, student_email, student_phone, notes } = req.body || {};
    if (!course_id || !student_name || !student_email) {
      return res.status(400).json({ error: 'Curso, nome e e-mail são obrigatórios.' });
    }
    const courses = loadCourses();
    const course = courses.find((c) => c.id === course_id);
    const record = appendJson('enrollments.json', {
      course_id,
      course_title: course?.title || course_id,
      student_name,
      student_email,
      student_phone,
      notes,
      status: 'pending',
    });
    const subject = `[NAUTK] Nova matrícula – ${student_name}`;
    const html = `
      <h2>Nova solicitação de matrícula</h2>
      <p><strong>Curso:</strong> ${escapeHtml(course?.title || course_id)}</p>
      <p><strong>Nome:</strong> ${escapeHtml(student_name)}</p>
      <p><strong>E-mail:</strong> ${escapeHtml(student_email)}</p>
      <p><strong>Telefone:</strong> ${escapeHtml(student_phone || 'Não informado')}</p>
      <p><strong>Observações:</strong></p>
      <pre>${escapeHtml(notes || '-')}</pre>
    `;
    await sendMail({ subject, html });
    res.status(201).json({ ok: true, id: record.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Falha ao processar matrícula.' });
  }
});

// Serve built frontend when deployed as a single Node app
const distPath = path.join(root, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(port, () => {
  console.log(`NAUTK API listening on http://localhost:${port}`);
});
