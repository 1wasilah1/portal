import React, { useState, useEffect } from 'react';

const TableDetailCard = ({ title = "Detail CIP", filters, data = [] }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [authStatus, setAuthStatus] = useState(null);
  const itemsPerPage = 10;

  useEffect(() => {
    const cookies = document.cookie;
    const hasAccessToken = cookies.includes('accessToken');
    const hasRefreshToken = cookies.includes('refreshToken');
    const userData = localStorage.getItem('userData');

    if (hasAccessToken && hasRefreshToken) {
      setAuthStatus('admin');
    } else if (userData) {
      setAuthStatus('external');
    } else {
      setAuthStatus('public');
    }
  }, []);

  const shouldHideAnggaran = authStatus === 'external' || authStatus === 'public';

  // 1. Filter berdasarkan input user
  const filtered = data.filter((item) => {
    return (
      (filters.tahun_cip === 'Semua' || String(item.tahun) === String(filters.tahun_cip)) &&
      (filters.wilayah === '' || item.nama_kabkota === filters.wilayah) &&
      (filters.kecamatan === '' || item.nama_kec === filters.kecamatan) &&
      (filters.kelurahan === '' || item.nama_kel === filters.kelurahan) &&
      (filters.rw === '' || item.nama_rw === filters.rw)
    );
  });

  // 2. Grouping dan sorting berdasarkan nama_kegiatan + tipe_bahan
  const groupedMap = new Map();
  filtered.forEach((item) => {
    const key = `${item.nama_kegiatan}||${item.tipe_bahan}`;
    if (!groupedMap.has(key)) {
      groupedMap.set(key, {
        nama_kegiatan: item.nama_kegiatan,
        tipe_bahan: item.tipe_bahan,
        volume: Number(item.volume) || 0,
        satuan: item.satuan || '-',
        anggaran: Number(item.anggaran) || 0,
      });
    } else {
      const existing = groupedMap.get(key);
      existing.volume += Number(item.volume) || 0;
      existing.anggaran += Number(item.anggaran) || 0;
      groupedMap.set(key, existing);
    }
  });

  const grouped = Array.from(groupedMap.values()).sort((a, b) => {
    const kegiatanCompare = a.nama_kegiatan.localeCompare(b.nama_kegiatan);
    if (kegiatanCompare !== 0) return kegiatanCompare;
    return a.tipe_bahan.localeCompare(b.tipe_bahan);
  });

  // 3. Hitung total anggaran (jika admin)
  const totalAnggaran = shouldHideAnggaran
    ? null
    : grouped.reduce((sum, item) => sum + item.anggaran, 0);

  // 4. Pagination
  const totalPages = Math.ceil(grouped.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = grouped.slice(startIndex, startIndex + itemsPerPage);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <div className="card">
      <div className="card-header text-center fw-bold">
        {title}
      </div>
      <div className="card-body p-3">
        <div className="table-responsive">
          <table className="table table-sm table-hover text-nowrap">
            <thead>
              <tr>
                <th className="text-uppercase text-secondary small">Nama Kegiatan</th>
                <th className="text-uppercase text-secondary small">Jenis Bahan</th>
                <th className="text-uppercase text-secondary small">Volume</th>
                <th className="text-uppercase text-secondary small">Satuan</th>
                {!shouldHideAnggaran && (
                  <th className="text-uppercase text-secondary small">Anggaran (Rp)</th>
                )}
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((item, index) => (
                  <tr key={index}>
                    <td>{item.nama_kegiatan || '-'}</td>
                    <td>{item.tipe_bahan || '-'}</td>
                    <td>{item.volume.toFixed(2)}</td>
                    <td>{item.satuan || '-'}</td>
                    {!shouldHideAnggaran && (
                      <td>
                        {item.anggaran
                          ? item.anggaran.toLocaleString('id-ID', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                          : '0,00'}
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={shouldHideAnggaran ? 4 : 5} className="text-center">
                    Tidak ada data
                  </td>
                </tr>
              )}
            </tbody>
            {!shouldHideAnggaran && grouped.length > 0 && (
              <tfoot>
                <tr>
                  <td colSpan="4" className="text-end fw-bold">Total</td>
                  <td className="fw-bold">
                    {totalAnggaran.toLocaleString('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {totalPages > 1 && (
          <div className="d-flex justify-content-between align-items-center mt-2">
            <button
              className="btn btn-sm custom-btn"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              &laquo; Sebelumnya
            </button>
            <button
              className="btn btn-sm custom-btn"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              Berikutnya &raquo;
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TableDetailCard;
