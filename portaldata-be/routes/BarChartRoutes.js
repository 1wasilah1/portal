const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/chart-bar', async (req, res) => {
  const {
    tahun_cap,
    tahun_cip,
    wilayah,
    kecamatan,
    kelurahan,
    rw,
  } = req.query;

  try {
    const filters = [];
    const values = [];

    // Tahun CAP dan CIP
    const tahunClause = `(tahun_cap = '2023' OR tahun_cip = '2024')`;

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
      filters.push(`LPAD(nama_rw, 2, '0') = $${values.length + 1}`);
      values.push(rw);
    }

    const whereClause = `WHERE ${tahunClause}` + (filters.length > 0 ? ` AND ${filters.join(' AND ')}` : '');

    const query = `
      SELECT 
        nama_kegiatan,
        SUM(total_kegiatan_cap) AS jumlah_cap,
        SUM(total_kegiatan_cip) AS jumlah_cip
      FROM sigapkumuh.stackedbar
      ${whereClause}
      GROUP BY nama_kegiatan
      ORDER BY nama_kegiatan
    `;

    // 🧪 Debug: tampilkan query dan values di log
    console.log('🟡 QUERY SQL:');
    console.log(query);
    console.log('🔵 VALUES:');
    console.log(values);

    const result = await pool.query(query, values);

    const response = result.rows.map(row => ({
      label: row.nama_kegiatan,
      jumlah_cap: parseInt(row.jumlah_cap || 0),
      jumlah_cip: parseInt(row.jumlah_cip || 0)
    }));

    res.json(response);
  } catch (error) {
    console.error('❌ Error fetching bar chart data:', error);
    res.status(500).json({
      error: 'Gagal mengambil data bar chart kegiatan',
      message: error.message,
    });
  }
});

module.exports = router;
