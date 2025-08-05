const express = require('express');
const router = express.Router();
const pool = require('../db');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

// WHITELISTED SCHEMA & TABEL
const allowedSchemas = ['public'];
const allowedPublicTables = {
  // alias: nama_tabel_asli
  'aprtm': 'Apartemen',
  'rsnwa': 'RUSUNAWA',
  'cippt': 'CIP_POINT',
  'cipl': 'CIP_LINE',
  'rsn': 'Rusunami',
  'rwk': 'rwkumuh',
  'rtlh': 'RTLH',
  'rptra': 'RPTRA',
  'htm': 'htm',
  'admin': 'admin_jkt',
  'aset': 'Aset_drCitata',
  'vcip': 'v_cip',
  'cippsu': 'CIP_Bangunan_PSU',
  'cipdll': 'CIP_Drainase_Lingkungan_Line',
  'cipdlp': 'CIP_Drainase_Lingkungan_Point',
  'cipjl': 'CIP_Jalan_Lingkungan',
  'cippk': 'CIP_Pencegahan_Kebakaran',
  'cippd': 'CIP_Pendukung_Dekorasi',
  'cippkdkk': 'CIP_Pendukung_Keamanan_Dan_Keselamatan_Kawasan',
  'cippju': 'CIP_Penerangan_Jalan_Umum',
  'cippj': 'CIP_Penghijauan',
  'cipsl': 'CIP_Sarpras_Lainnya',
  'caplm': 'CAP_Line_Menteng',
  'cappt': 'CAP_Point_Menteng',
};

// 🌐 CORS Only For Frontend
const allowedOrigin = 'http://localhost:9100'; // Ganti sesuai frontend kamu
router.use(cors({
  origin: allowedOrigin,
  methods: ['GET'],
}));

// 🕵️‍♂️ Basic Anti-bot Middleware
router.use((req, res, next) => {
  const ua = req.get('User-Agent') || '';
  const block = /curl|wget|httpie|python|go-http|scrapy|bot/i.test(ua);
  if (block) return res.status(403).json({ error: 'Forbidden: Bot Detected' });
  next();
});

// ⏳ Rate Limiter
const geoLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  message: 'Too many requests, please slow down',
});

// // 🛡️ Token checker (simple)
// const checkPublicToken = (req, res, next) => {
//   const token = req.query.token;
//   if (token !== process.env.PUBLIC_GEOJSON_TOKEN) {
//     return res.status(403).json({ error: 'Invalid or missing token' });
//   }
//   next();
// };

// 📦 Function ambil data GeoJSON
async function getGeoJSON(schema, table) {
  const result = await pool.query(`
    SELECT jsonb_build_object(
      'type', 'FeatureCollection',
      'features', jsonb_agg(ST_AsGeoJSON(t)::jsonb)
    )
    FROM (
      SELECT *, ST_Transform(geom, 4326) AS geom
      FROM ${schema}."${table}"
    ) t;
  `);
  return result.rows[0]?.jsonb_build_object || {
    type: 'FeatureCollection',
    features: []
  };
}

// 📍 Endpoint Public, Dilindungi
router.get('/geojson-public/:schema/:alias', geoLimiter, 
  // checkPublicToken,
   async (req, res) => {
  const { schema, alias } = req.params;

  if (!allowedSchemas.includes(schema)) {
    return res.status(400).json({ error: 'Invalid schema' });
  }

  const realTable = allowedPublicTables[alias];
  if (!realTable) {
    return res.status(400).json({ error: 'Invalid layer' });
  }

  try {
    const data = await getGeoJSON(schema, realTable);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
