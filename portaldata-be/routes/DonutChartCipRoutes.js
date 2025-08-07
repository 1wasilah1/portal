const express = require('express');
const pool = require('../config/db');
const router = express.Router();

router.get('/donut-cip-chart', async (req, res) => {
  const { wilayah, kecamatan, kelurahan, rw } = req.query;

  try {
    const filters = [`tahun_cip = '2024'`]; // hanya data tahun 2024 (CIP)
    const values = [];

    if (wilayah && wilayah !== 'Semua') {
      filters.push(`nama_kab = $${values.length + 1}`);
      values.push(wilayah);
    }

    if (kecamatan && kecamatan !== 'Semua') {
      filters.push(`nama_kec = $${values.length + 1}`);
      values.push(kecamatan);
    }

    if (kelurahan && kelurahan !== 'Semua') {
      filters.push(`nama_kel = $${values.length + 1}`);
      values.push(kelurahan);
    }

    if (rw && rw !== 'Semua') {
      filters.push(`nama_rw = $${values.length + 1}`);
      values.push(rw);
    }

    // Hanya data yang memiliki kegiatan CIP
    filters.push(`total_kegiatan_cip > 0`);

    const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';

    const query = `
      SELECT
        nama_kegiatan,
        SUM(total_kegiatan_cip) AS jumlah_cip,
        SUM(total_anggaran_cip) AS total_anggaran_cip
      FROM sigapkumuh.stackedbar
      ${whereClause}
      GROUP BY nama_kegiatan
      ORDER BY nama_kegiatan;
    `;

    const result = await pool.query(query, values);

    res.json(result.rows);
  } catch (error) {
    console.error('Gagal mengambil data donut chart stackedbar:', error);
    res.status(500).json({ error: 'Gagal mengambil data donut chart stackedbar' });
  }
});

module.exports = router;
