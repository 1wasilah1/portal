<template>
  <div>
    <div id="map" class="map" style="height: 400px;"></div>
    <input type="file" @change="handleFileUpload" accept=".geojson" />
    <button @click="saveFeature">Save Feature</button>
    <p v-if="statusMessage" :class="statusType">{{ statusMessage }}</p>
  </div>
</template>

<script>
import 'ol/ol.css';
import { Map, View } from 'ol';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { OSM } from 'ol/source';
import { Vector as VectorSource } from 'ol/source';
import GeoJSON from 'ol/format/GeoJSON';
import { Draw, Select } from 'ol/interaction';
import { Style, Fill, Stroke } from 'ol/style';

export default {
  name: 'MapEditor',
  data() {
    return {
      map: null,
      vectorSource: null,
      vectorLayer: null,
      draw: null,
      select: null,
      selectedFeature: null,
      statusMessage: '',
      statusType: '', // 'success' or 'error'
    };
  },
  methods: {
    initializeMap() {
      this.vectorSource = new VectorSource();
      this.vectorLayer = new VectorLayer({
        source: this.vectorSource,
        style: new Style({
          fill: new Fill({
            color: 'rgba(255, 255, 255, 0.2)',
          }),
          stroke: new Stroke({
            color: '#ffcc33',
            width: 2,
          }),
        }),
      });

      this.map = new Map({
        target: 'map',
        layers: [
          new TileLayer({
            source: new OSM(),
          }),
          this.vectorLayer,
        ],
        view: new View({
          center: [0, 0],
          zoom: 2,
        }),
      });

      this.draw = new Draw({
        source: this.vectorSource,
        type: 'Polygon',
      });

      this.map.addInteraction(this.draw);

      this.select = new Select();
      this.map.addInteraction(this.select);

      this.select.on('select', (e) => {
        this.selectedFeature = e.selected[0] || null;
      });
    },

    handleFileUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const geojsonData = JSON.parse(e.target.result);
          const features = new GeoJSON().readFeatures(geojsonData, {
            featureProjection: 'EPSG:3857',
          });
          this.vectorSource.addFeatures(features);
          this.showStatus('File uploaded successfully', 'success');
        } catch (error) {
          this.showStatus('Invalid GeoJSON file', 'error');
        }
      };
      reader.readAsText(file);
    },

    saveFeature() {
      if (!this.selectedFeature) {
        this.showStatus('No feature selected', 'error');
        return;
      }

      const geometry = this.selectedFeature.getGeometry();
      const id = this.selectedFeature.getId();
      const name = this.selectedFeature.get('name');
      const style = this.selectedFeature.getStyle();

      console.log("Saving feature:", {
        id,
        name,
        geometry: geometry?.getType(),
      });

      this.showStatus('Feature saved successfully!', 'success');
    },

    showStatus(message, type) {
      this.statusMessage = message;
      this.statusType = type;
      setTimeout(() => {
        this.statusMessage = '';
      }, 3000);
    },
  },
  mounted() {
    this.initializeMap();
  },
};
</script>

<style scoped>
.map {
  width: 100%;
  height: 400px;
  margin-bottom: 10px;
}

.success {
  color: green;
}

.error {
  color: red;
}
</style>
