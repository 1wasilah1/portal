import React, { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import './css/DonutChartCard.css';

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const DonutChartCard = ({ title, filters = {}, data = [] }) => {
  const [legendPosition, setLegendPosition] = useState(
    window.innerWidth < 576 ? 'bottom' : 'right'
  );
  const [authStatus, setAuthStatus] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      setLegendPosition(window.innerWidth < 576 ? 'bottom' : 'right');
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const MAX_ANGGARAN = 1_000_000_000_000_000;
  const aggregation = {};

  data.forEach((item) => {
    const label = item.nama_kegiatan?.trim() || 'Lainnya';
    const rawValue = item.total_anggaran_cip || 0;
    const value = Math.min(rawValue, MAX_ANGGARAN);
    aggregation[label] = (aggregation[label] || 0) + value;
  });

  const labels = Object.keys(aggregation);
  const values = Object.values(aggregation);
  const total = values.reduce((sum, val) => sum + val, 0);

  const chartData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: [
          '#F76060',
          '#F54A8A',
          '#C03E99',
          '#993399',
          '#6666CC',
          '#3399CC',
          '#66DDEE',
          '#4BC0C0',
          '#36A2EB',
          '#A9A9A9',
        ].slice(0, values.length),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    cutout: '65%',
    layout: {
      padding: 50,
    },
    plugins: {
      legend: {
        display: false,
        position: legendPosition,
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const value = context.parsed;
            const label = context.label;
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;

            // Hanya tampilkan label dan persentase jika bukan admin
            if (shouldHideAnggaran) {
              return `${label}: ${percentage}%`;
            }

            return `${label}: Rp ${value.toLocaleString('id-ID')} (${percentage}%)`;
          },
        },
      },
      datalabels: {
        color: '#000',
        anchor: 'end',
        align: 'end',
        offset: 10,
        clamp: true,
        clip: false,
        font: {
          size: 11,
        },
        formatter: function (value, context) {
          const label = context.chart.data.labels[context.dataIndex];
          const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;

          if (percentage <= 0 || value === 0) return null;

          const wrapLabel = (label, maxLength = 10) => {
            const words = label.split(' ');
            let result = '';
            let line = '';
            words.forEach(word => {
              if ((line + word).length > maxLength) {
                result += line + '\n';
                line = '';
              }
              line += word + ' ';
            });
            result += line.trim();
            return result;
          };

          return `${wrapLabel(label)}\n${percentage}%`;
        },
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="card">
      <div className="card-header text-center fw-bold">
        {title}
      </div>
      <div className="card-body donut-body">
        <div className="donut-wrapper">
          <Doughnut data={chartData} options={options} />
        </div>
      </div>
    </div>
  );
};

export default DonutChartCard;
