const express = require('express');
const router = express.Router();
const pool = require('../db'); // sesuaikan path db.js kamu

const allowedTables = {
  cap_line: 'CAP_LINE',
  cap_point: 'CAP_POINT',
  cip_line: 'CIP_LINE',
  cip_point: 'CIP_POINT',
  admin_jkt: 'admin_jkt',
  // tambah sesuai kebutuhan
};

router.get('/catalog/layers', async (req, res) => {
  try {
    const result = [];
    for (const [alias, table] of Object.entries(allowedTables)) {
      const layerInfo = {
        alias,
        table,
        label: table.replace(/_/g, ' ').toUpperCase(),
        kategori: ['Lainnya'],
        kegiatan: [],
        tahun: [] // sementara static jika tidak ada kolom tahun
      };

      if (alias.startsWith('cap_')) layerInfo.kategori = ['CAP'];
      else if (alias.startsWith('cip_')) layerInfo.kategori = ['CIP'];

      try {
        const { rows } = await pool.query(`SELECT DISTINCT "Nama Kegiatan" AS kegiatan FROM "${table}" WHERE "Nama Kegiatan" IS NOT NULL LIMIT 100`);
        layerInfo.kegiatan = rows.map(r => r.kegiatan);
      } catch (err) {
        console.warn(`⚠️ Tidak bisa ambil kegiatan dari ${table}: ${err.message}`);
      }

      result.push(layerInfo);
    }

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
