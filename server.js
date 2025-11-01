const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');

const app = express();
app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(compression());
app.use(morgan('combined'));

// Health check pentru Render
app.get('/healthz', (req, res) => res.status(200).send('ok'));

// Servește folderul /public ca site simplu
app.use(express.static(path.join(__dirname, 'public')));

// Dacă vrei ca "/" să fie HTML, trimite index.html:
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// EXEMPLE DEMO (NU descarcă nimic)
app.get('/convert', (req, res) => {
  const { url, format = 'mp3' } = req.query || {};
  if (!url) return res.status(400).json({ error: 'Lipsește ?url=' });
  if (!['mp3','aac','wav','flac'].includes(String(format).toLowerCase()))
    return res.status(400).json({ error: 'Format invalid' });

  return res.status(501).json({
    message: 'Demo — funcționalitatea nu e implementată aici.',
    received: { url, format }
  });
});

// 404
app.use((req, res) => res.status(404).json({ error: 'Ruta nu există.' }));

// 500
app.use((err, req, res, next) => {
  console.error('Eroare:', err);
  if (!res.headersSent) res.status(500).json({ error: 'Eroare internă.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server pe ${PORT}`));
