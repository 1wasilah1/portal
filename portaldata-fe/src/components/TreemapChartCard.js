import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, Tooltip, Legend } from 'chart.js';
import { TreemapController, TreemapElement } from 'chartjs-chart-treemap';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Chart } from 'react-chartjs-2';
import './css/TreemapChartCard.css';

ChartJS.register(TreemapController, TreemapElement, Tooltip, Legend, ChartDataLabels);

const TreemapChartCard = ({ title, filters = {}, data = [] }) => {
  const [authStatus, setAuthStatus] = useState(null);

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

  const filteredData = data.filter((item) => {
    return (
      (!filters.wilayah || item.nama_kabkota === filters.wilayah) &&
      (!filters.kecamatan || item.nama_kec === filters.kecamatan) &&
      (!filters.kelurahan || item.nama_kel === filters.kelurahan) &&
      (!filters.rw || item.nama_rw === filters.rw)
    );
  });

  const MAX_ANGGARAN = 1_000_000_000_000_000;

  const treeData = filteredData.map((item) => ({
    label: item.nama_kegiatan || 'Lainnya',
    value: Math.min(item.anggaran || 0, MAX_ANGGARAN),
  }));

  const total = treeData.reduce((sum, d) => sum + d.value, 0);

  const chartData = {
    datasets: [
      {
        label: 'Treemap CIP/CAP',
        tree: treeData,
        key: 'value',
        groups: ['label'],
        backgroundColor: (ctx) => {
          const val = ctx?.raw?.v ?? 0;
          const alpha = total > 0 ? val / total : 0;
          return `rgba(102, 102, 255, ${Math.min(0.85, alpha + 0.2)})`;
        },
        borderWidth: 1,
        borderColor: '#fff',
      },
    ],
  };

  const options = {
    plugins: {
      tooltip: {
        callbacks: {
          title: (ctx) => ctx[0]?.raw?.g || 'Tidak diketahui',
          label: (ctx) => {
            const val = ctx?.raw?.v ?? 0;
            const percentage = total > 0 ? ((val / total) * 100).toFixed(2) : 0;
            if (shouldHideAnggaran) {
              return `(${percentage}%)`;
            }
            return `Rp ${val.toLocaleString('id-ID')} (${percentage}%)`;
          },
        },
      },
      legend: {
        display: false,
      },
      datalabels: {
        display: (ctx) => {
          const val = ctx.raw?.v ?? 0;
          const ratio = total > 0 ? val / total : 0;
          return ratio > 0.01;
        },
        formatter: (value, ctx) => {
          const val = ctx.raw?.v ?? 0;
          const label = ctx.raw?.g || '';
          const percentage = total > 0 ? ((val / total) * 100).toFixed(2) : 0;
          return `${label}\n${percentage}%`;
        },
        color: '#fff',
        font: (ctx) => {
          const val = ctx.raw?.v ?? 0;
          const ratio = total > 0 ? val / total : 0;
          const size = ratio > 0.2 ? 16 : ratio > 0.1 ? 14 : ratio > 0.05 ? 12 : 10;
          return {
            size,
            weight: 'bold',
            lineHeight: 1.2,
          };
        },
        align: 'center',
        anchor: 'center',
        clamp: true,
        clip: true,
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="card treemap-card">
      <div className="card-header text-center fw-bold">{title}</div>
      <div className="card-body treemap-body">
        {treeData.length === 0 ? (
          <p className="text-center">Tidak ada data untuk ditampilkan.</p>
        ) : (
          <Chart
            key={JSON.stringify(chartData)}
            type="treemap"
            data={chartData}
            options={options}
          />
        )}
      </div>
    </div>
  );
};

export default TreemapChartCard;
