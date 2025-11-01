// server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');

const app = express();

// --- Setări generale
app.set('trust proxy', 1); // Render/Heroku style proxies

// --- Middleware de bază
app.use(helmet());
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(compression());
app.use(morgan('combined'));

// --- Health check pentru Render
app.get('/healthz', (req, res) => {
  res.status(200).send('ok');
});

// --- Root (info utilă)
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'render-express-starter',
    status: 'ok',
    time: new Date().toISOString()
  });
});

// --- Endpoint STUB: /convert
// ATENȚIE: acesta NU descarcă nimic și nu accesează servicii terțe.
// E doar un exemplu de cum ai valida inputul și ai răspunde corect.
app.get('/convert', async (req, res) => {
  const { url, format = 'mp3' } = req.query || {};

  // Validare minimală de input
  if (!url || typeof url !== 'string') {
    return res.status(400).json({
      error: 'Parametrul "url" este obligatoriu.'
    });
  }

  if (!['mp3', 'aac', 'wav', 'flac'].includes(String(format).toLowerCase())) {
    return res.status(400).json({
      error: 'Format invalid. Acceptat: mp3, aac, wav, flac.'
    });
  }

  // Aici te-ai opri. Nu faci request la upstream.
  // Returnezi un răspuns neutru ca exemplu.
  return res.status(501).json({
    message: 'Funcționalitatea nu este implementată în acest demo.',
    received: { url, format }
  });
});

// --- Catch-all pentru rute inexistente (evită 410 confuz)
app.use((req, res, next) => {
  res.status(404).json({ error: 'Ruta nu există.' });
});

// --- Handler centralizat de erori
app.use((err, req, res, next) => {
  console.error('Eroare neprevăzută:', err);
  if (!res.headersSent) {
    res.status(500).json({ error: 'Eroare internă.' });
  }
});

// --- Pornire server
const PORT = process.env.PORT || 3000;
// Important: ascultă pe 0.0.0.0 pentru Render
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server pornit pe portul ${PORT}`);
});

// --- Timeout opțional (server-level), dacă vrei să fii mai strict
// Notă: Express nu are timeout built-in pe route handlers.
// Poți controla la nivel de platformă (Render are timeouts proprii).
