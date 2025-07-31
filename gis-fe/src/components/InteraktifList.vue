<template>
  <div>
    <div class="tabs">
      <button @click="activeTab = 'bangunan'" :class="{ active: activeTab === 'bangunan' }">Bangunan</button>
      <button @click="activeTab = 'lainnya'" :class="{ active: activeTab === 'lainnya' }">Lainnya</button>
    </div>

    <div v-if="activeTab === 'bangunan'" class="tab-content">
      <div class="filters">
        <select v-model="filters.provinsi" @change="onProvinsiChange">
          <option disabled value="">Pilih Provinsi</option>
          <option v-for="prov in provinsiList" :key="prov">{{ prov }}</option>
        </select>

        <select v-model="filters.kabupaten" @change="onKabupatenChange" :disabled="!filters.provinsi">
          <option disabled value="">Pilih Kabupaten</option>
          <option v-for="kab in kabupatenList" :key="kab">{{ kab }}</option>
        </select>

        <select v-model="filters.kecamatan" @change="onKecamatanChange" :disabled="!filters.kabupaten">
          <option disabled value="">Pilih Kecamatan</option>
          <option v-for="kec in kecamatanList" :key="kec">{{ kec }}</option>
        </select>

        <select v-model="filters.rw" :disabled="!filters.kecamatan">
          <option disabled value="">Pilih RW</option>
          <option v-for="rw in rwList" :key="rw">{{ rw }}</option>
        </select>
      </div>

      <div class="summary">
        <p>Jumlah Bangunan: {{ filteredBangunan.length }}</p>
      </div>

      <ul>
        <li v-for="item in filteredBangunan" :key="item.id">
          {{ item.nama }} - {{ item.rw }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      activeTab: 'bangunan',
      filters: {
        provinsi: '',
        kabupaten: '',
        kecamatan: '',
        rw: ''
      },
      bangunanData: [],
      provinsiList: ['Jawa Barat'],
      kabupatenList: [],
      kecamatanList: [],
      rwList: []
    };
  },
  computed: {
    filteredBangunan() {
      return this.bangunanData.filter(item => {
        return (
          (!this.filters.provinsi || item.provinsi === this.filters.provinsi) &&
          (!this.filters.kabupaten || item.kabupaten === this.filters.kabupaten) &&
          (!this.filters.kecamatan || item.kecamatan === this.filters.kecamatan) &&
          (!this.filters.rw || item.rw === this.filters.rw)
        );
      });
    }
  },
  methods: {
    onProvinsiChange() {
      this.kabupatenList = ['Bandung'];
      this.filters.kabupaten = '';
      this.kecamatanList = [];
      this.rwList = [];
    },
    onKabupatenChange() {
      this.kecamatanList = ['Kec. Sukajadi'];
      this.filters.kecamatan = '';
      this.rwList = [];
    },
    onKecamatanChange() {
      this.rwList = ['RW 01', 'RW 02'];
      this.filters.rw = '';
    },
    async fetchBangunanData() {
      // Simulasi fetch API dummy
      this.bangunanData = [
        { id: 1, nama: 'Bangunan A', provinsi: 'Jawa Barat', kabupaten: 'Bandung', kecamatan: 'Kec. Sukajadi', rw: 'RW 01' },
        { id: 2, nama: 'Bangunan B', provinsi: 'Jawa Barat', kabupaten: 'Bandung', kecamatan: 'Kec. Sukajadi', rw: 'RW 02' },
        { id: 3, nama: 'Bangunan C', provinsi: 'Jawa Barat', kabupaten: 'Bandung', kecamatan: 'Kec. Sukajadi', rw: 'RW 01' },
      ];
    }
  },
  mounted() {
    this.fetchBangunanData();
  }
};
</script>

<style scoped>
.tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  right: auto;
}
.tabs button {
  padding: 0.5rem 1rem;
  border: 1px solid #ccc;
  background-color: #eee;
  cursor: pointer;
}
.tabs button.active {
  background-color: #ddd;
  font-weight: bold;
}
.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}
.summary {
  margin-bottom: 1rem;
}
</style>
