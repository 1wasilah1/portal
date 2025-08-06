-- Create suku_dinas table
CREATE TABLE IF NOT EXISTS suku_dinas (
  id SERIAL PRIMARY KEY,
  alamat TEXT NOT NULL,
  rw VARCHAR(10) NOT NULL,
  kelurahan VARCHAR(100) NOT NULL,
  kecamatan VARCHAR(100) NOT NULL,
  wilayah_administrasi VARCHAR(100) NOT NULL,
  nama_kegiatan TEXT NOT NULL,
  tipe_bahan VARCHAR(100) NOT NULL,
  tahun_pelaksanaan INTEGER NOT NULL,
  volume DECIMAL(10,2) NOT NULL,
  satuan VARCHAR(50) NOT NULL,
  anggaran DECIMAL(15,2) NOT NULL,
  nama_surveyor VARCHAR(100) NOT NULL,
  foto VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_suku_dinas_kelurahan ON suku_dinas(kelurahan);
CREATE INDEX IF NOT EXISTS idx_suku_dinas_kecamatan ON suku_dinas(kecamatan);
CREATE INDEX IF NOT EXISTS idx_suku_dinas_tahun ON suku_dinas(tahun_pelaksanaan);
CREATE INDEX IF NOT EXISTS idx_suku_dinas_created_at ON suku_dinas(created_at);

-- Add comments for documentation
COMMENT ON TABLE suku_dinas IS 'Tabel untuk menyimpan data kegiatan suku dinas';
COMMENT ON COLUMN suku_dinas.alamat IS 'Alamat lokasi kegiatan';
COMMENT ON COLUMN suku_dinas.rw IS 'Nomor RW';
COMMENT ON COLUMN suku_dinas.kelurahan IS 'Nama kelurahan';
COMMENT ON COLUMN suku_dinas.kecamatan IS 'Nama kecamatan';
COMMENT ON COLUMN suku_dinas.wilayah_administrasi IS 'Wilayah administrasi';
COMMENT ON COLUMN suku_dinas.nama_kegiatan IS 'Nama kegiatan yang dilakukan';
COMMENT ON COLUMN suku_dinas.tipe_bahan IS 'Tipe bahan yang digunakan';
COMMENT ON COLUMN suku_dinas.tahun_pelaksanaan IS 'Tahun pelaksanaan kegiatan';
COMMENT ON COLUMN suku_dinas.volume IS 'Volume pekerjaan';
COMMENT ON COLUMN suku_dinas.satuan IS 'Satuan volume';
COMMENT ON COLUMN suku_dinas.anggaran IS 'Anggaran kegiatan';
COMMENT ON COLUMN suku_dinas.nama_surveyor IS 'Nama surveyor';
COMMENT ON COLUMN suku_dinas.foto IS 'Nama file foto kegiatan'; 