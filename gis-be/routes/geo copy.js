const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// Whitelist untuk keamanan
const allowedSchemas = ['gis', 'public'];
const allowedTables = ['bangunan', 'jalan', 'kecamatan'];
const allowedPublicTables = ['Apartemen','Aset_drCitata', 'RUSUNAWA', 'Rusunami', 'CIP_POINT', 'CIP_LINE','rwkumuh', 'RTLH', 'admin_jkt', 'htm', 'RPTRA', 'v_cip']; // yang boleh diakses publik
const publicTableAliases = {
  'apartemen': 'Apartemen',
  'rusun': 'Rusun',
  'cip-point': 'CIP_POINT',
  'cip-line': 'CIP_LINE',
  'rw-kumuh': 'RW KUMUH',
  'rtlh': 'RTLH',
  'batas-rw-jakut': 'Batas Admin (RW)_Kota Adm. Jakarta Utara'
};

// Fungsi query
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

/////////////////////////////////////////////////
// PROTECTED: butuh token
router.get('/geojson/:schema/:table', auth, async (req, res) => {
  const { schema, table } = req.params;
  console.log('[REQUEST]', schema, table);

  if (!allowedSchemas.includes(schema) || !allowedTables.includes(table)) {
    return res.status(400).json({ error: 'Invalid schema or table' });
  }

  try {
    const data = await getGeoJSON(schema, table);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/////////////////////////////////////////////////
// PUBLIC: tidak butuh token
router.get('/geojson-public/:schema/:table', async (req, res) => {
  const { schema, table } = req.params;

  if (schema !== 'public' || !allowedPublicTables.includes(table)) {
    return res.status(400).json({ error: 'Invalid public schema or table' });
  }

  try {
    const data = await getGeoJSON(schema, table);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
