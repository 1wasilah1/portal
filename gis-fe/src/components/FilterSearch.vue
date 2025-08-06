<template>
  <button class="button-filter" @click="togglePanel" :class="{ active: !panelCollapsed }">
    <i class="fas fa-search"></i>
  </button>

  <div class="map-container" :class="{ collapsed: panelCollapsed }">
    <div class="filter-panel">
      <div class="panel-header">
        <h2><i class="fas fa-filter"></i> Filter Wilayah</h2>
        <button @click="togglePanel" style="background: none;">
          <i class="fas fa-close"></i>
        </button>
      </div>

      <div class="filter-group">
        <h3><i class="fas fa-city"></i> Kota/Kabupaten</h3>
        <select v-model="selectedKota" @change="loadKecamatan">
          <option value="">Pilih Kota/Kabupaten</option>
          <option v-for="kota in kotaList" :key="kota.id" :value="kota">
            {{ kota.name }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <h3><i class="fas fa-map-marked-alt"></i> Kecamatan</h3>
        <select v-model="selectedKecamatan" @change="loadKelurahan" :disabled="!selectedKota">
          <option value="">Pilih Kecamatan</option>
          <option v-for="kec in kecamatanList" :key="kec.id" :value="kec">
            {{ kec.name }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <h3><i class="fas fa-map-pin"></i> Kelurahan</h3>
        <select v-model="selectedKelurahan" @change="loadRukunWarga" :disabled="!selectedKecamatan">
          <option value="">Pilih Kelurahan</option>
          <option v-for="kel in kelurahanList" :key="kel.id" :value="kel">
            {{ kel.name }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <h3><i class="fas fa-map-pin"></i> Rukun Warga (RW)</h3>
        <select v-model="selectedRukunWarga" @change="zoomToLocation" :disabled="!selectedKelurahan">
          <option value="">Pilih Rukun Warga (RW)</option>
          <option v-for="kel in rukunWargaList" :key="kel.id" :value="kel">
            {{ kel.name }}
          </option>
        </select>
      </div>

      <div class="button-reset-apply">
        <button class="reset-btn" @click="resetFilters">
          Reset Filter
        </button>
        <button class="apply-btn" @click="applyFilters" :disabled="!selectedKota">
          Apply Filter
        </button>
      </div>
    </div>

  </div>
</template>

<script>
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import GeoJSON from 'ol/format/GeoJSON';
import { Style, Stroke, Fill } from 'ol/style';
import {fromLonLat} from 'ol/proj';

const apiBase = import.meta.env.VITE_API_BASE;

export default {
  props: ['map'], // map instance dikirim dari parent
  data() {
    return {
      kotaList: [],
      kecamatanList: [],
      kelurahanList: [],
      rukunWargaList: [],

      selectedKota: null,
      selectedKecamatan: null,
      selectedKelurahan: null,
      selectedRukunWarga: null,

      filteredLayer: null,
      panelCollapsed: true
    };
  },
  mounted() {
    this.loadKota();
  },
  methods: {
    togglePanel() {
      this.panelCollapsed = !this.panelCollapsed;
    },
    
    async loadKota() {
      try {
        const res = await fetch(`${apiBase}/api/admin/geojson-kota`);
        const data = await res.json();
        this.kotaList = data.map((kota, i) => ({
          id: i + 1,
          name: kota
        }));
      } catch (err) {
        console.error('Gagal ambil kota:', err);
      }
    },

    async loadKecamatan() {
      this.kecamatanList = [];
      this.kelurahanList = [];
      this.selectedKecamatan = null;
      this.selectedKelurahan = null;
      this.selectedRukunWarga = null;

      if (!this.selectedKota?.name) return;

      try {
        const res = await fetch(`${apiBase}/api/admin/geojson-kecamatan?kota=${this.selectedKota.name}`);
        const data = await res.json();
        this.kecamatanList = data.map((kec, i) => ({
          id: i + 1,
          name: kec
        }));
      } catch (err) {
        console.error('Gagal ambil kecamatan:', err);
      }
    },

    async loadKelurahan() {
      this.kelurahanList = [];
      this.selectedKelurahan = null;

      if (!this.selectedKecamatan?.name) return;

      try {
        const res = await fetch(`${apiBase}/api/admin/geojson-kelurahan?kota=${this.selectedKota.name}&kecamatan=${this.selectedKecamatan.name}`);
        const data = await res.json();
        this.kelurahanList = data.map((kel, i) => ({
          id: i + 1,
          name: kel
        }));
      } catch (err) {
        console.error('Gagal ambil kelurahan:', err);
      }
    },

    async loadRukunWarga() {
      this.rukunWargaList = [];
      this.selectedRukunWarga = null;

      if (!this.selectedKelurahan?.name) return;

      try {
        const res = await fetch(`${apiBase}/api/admin/geojson-rukunwarga?kota=${this.selectedKota.name}&kecamatan=${this.selectedKecamatan.name}&kelurahan=${this.selectedKelurahan.name}`);
        const data = await res.json();
        this.rukunWargaList = data.map((kel, i) => ({
          id: i + 1,
          name: kel
        }));
      } catch (err) {
        console.error('Gagal ambil rukun warga:', err);
      }
    },

    async applyFilters() {
      if (!this.selectedKota?.name) {
        console.warn('Kota belum dipilih');
        return;
      };

      const params = new URLSearchParams();

      params.append('kota', this.selectedKota?.name || '');
      if (this.selectedKecamatan?.name) params.append('kecamatan', this.selectedKecamatan.name);
      if (this.selectedKelurahan?.name) params.append('kelurahan', this.selectedKelurahan.name);
      if (this.selectedRukunWarga?.name) params.append('rw', this.selectedRukunWarga.name)

      try {
        const res = await fetch(`${apiBase}/api/admin/geojson?${params.toString()}`);
        const geojson = await res.json();
        this.zoomToLocation(geojson);
        this.panelCollapsed = true;
      } catch (err) {
        console.error('Gagal apply filter:', err);
      }
    },

    resetFilters() {
      this.selectedKota = null;
      this.selectedKecamatan = null;
      this.selectedKelurahan = null;
      this.kecamatanList = [];
      this.kelurahanList = [];
      this.rukunWargaList = [];
      this.panelCollapsed = true;

      if (this.filteredLayer) {
        this.map.removeLayer(this.filteredLayer);
        this.filteredLayer = null;
      }

      this.goToHome();
    },

      goToHome() {
      const defaultCenter = fromLonLat([106.8272, -6.1751]); // Jakarta
      const defaultZoom = 11;

      const view = this.map.getView();
      view.animate({
        center: defaultCenter,
        zoom: defaultZoom,
        duration: 1000
      });
    },

      zoomToLocation(geojsonData) {
        if (!this.map) return;

        if (!geojsonData || geojsonData.type !== 'FeatureCollection') {
          console.warn('GeoJSON tidak valid:', geojsonData);
          return;
        }

        if (this.filteredLayer) {
          this.map.removeLayer(this.filteredLayer);
          this.filteredLayer = null;
        }

        const source = new VectorSource({
          features: new GeoJSON().readFeatures(geojsonData, {
            featureProjection: 'EPSG:3857'
          })
        });

        this.filteredLayer = new VectorLayer({
          source,
          style: new Style({
            stroke: new Stroke({ color: 'red', width: 2 }),
            fill: new Fill({ color: 'rgba(255, 0, 0, 0.1)' })
          })
        });

        this.map.addLayer(this.filteredLayer);

        // Gunakan extent dari source (bukan dari geojson.bbox)
        const extent = source.getExtent();

        // Cegah zoom jika extent tidak valid
        if (extent && extent[0] !== Infinity) {
          this.map.getView().fit(extent, {
            padding: [40, 40, 40, 40],
            duration: 800
          });
        } else {
          console.warn('Extent tidak valid. Data mungkin kosong.');
        }
      }
  }
};
</script>

<style scoped>
.button-filter {
  position: absolute;
  top: 105px;
  right: 180px;
  z-index: 1000;
  background: white;
  color: #c2c1c0;
  border: 2px solid rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  width: 50px;              /* ✅ lebar tetap */
  height: 50px;             /* ✅ tinggi tetap */
  padding: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.1);

  /* button {
    background: white;
    border: 2px solid rgba(0, 0, 0, 0.2);
    border-radius: 3px;
  } */
}

.map-container {
  width: 15%;
  justify-items: flex-end;
  margin-top: 165px;
  background: white;
  position: absolute;
  right: 0;
  z-index: 1000;
  margin-right: 30px;
  border-radius: 6px;
}

.filter-panel {
  height: 370px;
  width: 100%;
  background: white;
  padding: 1rem;
  padding-right: 1.25rem;
  overflow-y: auto;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  transition: var(--transition);
  border-left: 1px solid #e0e0e0;
  border-radius: 6px;
  clip-path: inset(0 round 6px);
}

.map-container.collapsed {
  display: none;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}

.panel-header h2 {
  font-size: 1.25rem;
  color: var(--dark-color);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.toggle-panel {
  background: #83dbf6;
  color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--transition);
}

.toggle-panel:hover {
  background: var(--secondary-color);
  transform: rotate(90deg);
}

.filter-group {
  margin-bottom: 1.5rem;
  position: relative;
}

.filter-group h3 {
  font-size: 1rem;
  margin-bottom: 0.75rem;
  color: var(--dark-color);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-group select {
  border-radius: 3px;
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  font-size: 0.95rem;
  transition: var(--transition);
  background-color: white;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1rem;
}

.filter-group select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.filter-group select:disabled {
  background-color: #f9f9f9;
  color: #999;
}

.loading {
  padding: 1rem;
  text-align: center;
  color: #666;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.button-reset-apply {
  gap: 8px;
  justify-content: center;
  display: flex;

}

.reset-btn {
  background-color: 1px solid #ddd;
  background-color: #c5c4c4;
  border-radius: 3px;
}

.reset-btn:hover {
  background-color: #d5d4d4;
}

.apply-btn {
  background-color: #78d2ed;
  border-radius: 3px;
}

.apply-btn:hover {
  background-color: #8ee0f9;
}

.map-controls {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.map-control-btn {
  background: green;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--box-shadow);
  cursor: pointer;
  transition: var(--transition);
  color: var(--dark-color);
}

.map-control-btn:hover {
  background: var(--light-color);
  transform: scale(1.1);
}

.map-control-btn.active {
  background: var(--primary-color);
  color: white;
}

@media (max-width: 768px) {
  .map {
    width: 100%;
  }

  .map-container {
    width: 30%;
    justify-items: flex-end;
    margin-top: 165px;
    background: white;
    position: absolute;
    right: 0;
    z-index: 10000;
    margin-right: 30px;
  }

  .filter-panel {
    width: 100%;
    background: white;
    padding: 1.25rem;
    overflow-y: auto;
    box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    transition: var(--transition);
    border-left: 1px solid #e0e0e0;
  }

  .filter-panel:not(.collapsed) {
    transform: translateX(0);
  }
}
</style>