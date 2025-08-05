const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/admin/geojson?kota=...&kecamatan=...&kelurahan=...&rw=...
router.get('/geojson', async (req, res) => {
  try {
     // Validasi: kota wajib diisi
    if (!req.query.kota) {
      return res.status(400).json({ error: 'Parameter kota wajib diisi' });
    }
    // Ambil query dan normalisasi jadi array
    const toArray = (v) => Array.isArray(v) ? v : v ? [v] : [];
    const kota = toArray(req.query.kota);
    const kecamatan = toArray(req.query.kecamatan);
    const kelurahan = toArray(req.query.kelurahan);
    const rw = toArray(req.query.rw);

    let where = 'WHERE 1=1';
    const params = [];
    let i = 1;

    // Jika kolom bertipe TEXT, pakai ::text[] ; jika NUMERIC/INTEGER ganti jadi ::int[]
    if (kota.length)      { where += ` AND "WADMKK" = ANY($${i++}::text[])`; params.push(kota); }
    if (kecamatan.length) { where += ` AND "WADMKC" = ANY($${i++}::text[])`; params.push(kecamatan); }
    if (kelurahan.length) { where += ` AND "WADMKD" = ANY($${i++}::text[])`; params.push(kelurahan); }
    if (rw.length)        { where += ` AND "WADMRW" = ANY($${i++}::text[])`; params.push(rw); }

    const sql = `
      WITH src AS (
        SELECT
          id,
          "WADMKK" AS kota,
          "WADMKC" AS kecamatan,
          "WADMKD" AS kelurahan,
          "WADMRW" AS rw,
          ST_Transform(geom, 4326) AS geom4326
        FROM admin_jkt
        ${where}
      ),
      fc AS (
        SELECT
          jsonb_build_object(
            'type','FeatureCollection',
            'features', COALESCE(
              jsonb_agg(
                jsonb_build_object(
                  'type','Feature',
                  'geometry', ST_AsGeoJSON(geom4326)::jsonb,
                  'properties', to_jsonb(src) - 'geom4326'
                )
              ),
              '[]'::jsonb
            )
          ) AS geojson,
          ST_Extent(geom4326) AS extent
        FROM src
      )
      SELECT
        fc.geojson,
        CASE WHEN fc.extent IS NULL THEN NULL
            ELSE jsonb_build_array(
              ST_XMin(fc.extent), ST_YMin(fc.extent),
              ST_XMax(fc.extent), ST_YMax(fc.extent)
            )
        END AS bbox
      FROM fc;
    `;


    const r = await pool.query(sql, params);
    const row = r.rows[0] || {};
    const out = row.geojson || { type: 'FeatureCollection', features: [] };
    if (row.bbox) out.bbox = row.bbox; // → frontend bisa langsung fit ke bbox ini

    res.json(out);
  } catch (err) {
    console.error('[ERROR] /api/admin/geojson', err);
    res.status(500).json({ error: 'Query error' });
  }
});

// Ambil list kota unik
router.get('/geojson-kota', async (req, res) => {
  try {
    const result = await pool.query(`SELECT DISTINCT "WADMKK" FROM admin_jkt ORDER BY "WADMKK"`);
    res.json(result.rows.map(r => r.WADMKK));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch kota' });
  }
});

// Ambil list kecamatan berdasarkan kota
router.get('/geojson-kecamatan', async (req, res) => {
  const { kota } = req.query;
  if (!kota) return res.status(400).json({ error: 'Missing kota' });

  try {
    const result = await pool.query(
      `SELECT DISTINCT "WADMKC" FROM admin_jkt WHERE "WADMKK" = $1 ORDER BY "WADMKC"`,
      [kota]
    );
    res.json(result.rows.map(r => r.WADMKC));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch kecamatan' });
  }
});

// Ambil list kelurahan berdasarkan kota + kecamatan
router.get('/geojson-kelurahan', async (req, res) => {
  const { kota, kecamatan } = req.query;
  if (!kota || !kecamatan) return res.status(400).json({ error: 'Missing kota/kecamatan' });

  try {
    const result = await pool.query(
      `SELECT DISTINCT "WADMKD" FROM admin_jkt WHERE "WADMKK" = $1 AND "WADMKC" = $2 ORDER BY "WADMKD"`,
      [kota, kecamatan]
    );
    res.json(result.rows.map(r => r.WADMKD));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch kelurahan' });
  }
});


module.exports = router;