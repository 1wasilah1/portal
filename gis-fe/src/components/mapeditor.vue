<template>
  <div class="map-container">
    <div ref="mapContainer" class="map" />
    <div class="editor-toolbar">
      <button @click="startDrawing('Polygon')">
        <i class="fas fa-draw-polygon"></i> Polygon
      </button>
      <button @click="startDrawing('LineString')">
        <i class="fas fa-pencil-alt"></i> Polyline
      </button>
      <button @click="startDrawing('Point')">
        <i class="fas fa-map-marker-alt"></i> Point
      </button>
      <button class="danger" @click="clearAll">
        <i class="fas fa-trash"></i> Clear All
      </button>
      <label class="upload-btn">
        <i class="fas fa-upload"></i> Upload
        <input type="file" @change="handleFileUpload" accept=".geojson,.json" hidden>
      </label>
    </div>
    <div v-if="status.message" :class="['status-message', status.type]">
      {{ status.message }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import OSM from 'ol/source/OSM';
import Draw from 'ol/interaction/Draw';
import { fromLonLat } from 'ol/proj';
import GeoJSON from 'ol/format/GeoJSON';

const mapContainer = ref(null);
const drawInteraction = ref(null);
const status = reactive({ message: '', type: '' });

const source = new VectorSource({ wrapX: false });
const vectorLayer = new VectorLayer({ source });

const map = ref(null);

const startDrawing = (type) => {
  if (drawInteraction.value) {
    map.value.removeInteraction(drawInteraction.value);
  }

  drawInteraction.value = new Draw({ source, type });
  map.value.addInteraction(drawInteraction.value);

  drawInteraction.value.on('drawend', () => {
    map.value.removeInteraction(drawInteraction.value);
    drawInteraction.value = null;
    showStatus('Shape added successfully!', 'success');
  });
};

const clearAll = () => {
  source.clear();
  showStatus('All shapes cleared.', 'info');
};

const showStatus = (message, type = 'info') => {
  status.message = message;
  status.type = type;
  setTimeout(() => (status.message = ''), 3000);
};

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const geojson = JSON.parse(e.target.result);
      const features = new GeoJSON().readFeatures(geojson, {
        featureProjection: 'EPSG:3857',
        dataProjection: 'EPSG:4326',
      });
      source.addFeatures(features);
      showStatus('GeoJSON loaded successfully!', 'success');
    } catch (error) {
      console.error('Error reading GeoJSON:', error);
      showStatus('Failed to load GeoJSON file', 'error');
    }
  };
  reader.readAsText(file);
  event.target.value = '';
};

onMounted(() => {
  map.value = new Map({
    target: mapContainer.value,
    layers: [
      new TileLayer({ source: new OSM() }),
      vectorLayer,
    ],
    view: new View({
      center: fromLonLat([106.8167, -6.2]),
      zoom: 10,
    }),
  });
});
</script>

<style scoped>
.map-container {
  position: relative;
  width: 100%;
  height: 100vh;
}

.map {
  width: 100%;
  height: 100%;
}

.editor-toolbar {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.9);
  padding: 10px;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.editor-toolbar button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  background: #4CAF50;
  color: white;
  cursor: pointer;
  transition: background 0.3s;
}

.editor-toolbar button:hover {
  background: #45a049;
}

.editor-toolbar button.danger {
  background: #f44336;
}

.editor-toolbar button.danger:hover {
  background: #d32f2f;
}

.upload-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 4px;
  background: #2196F3;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
}

.upload-btn input[type="file"] {
  position: absolute;
  left: 0;
  top: 0;
  opacity: 0;
  cursor: pointer;
  width: 100%;
  height: 100%;
}

.status-message {
  position: absolute;
  bottom: 10px;
  left: 10px;
  padding: 10px 14px;
  border-radius: 4px;
  color: white;
  z-index: 1000;
  font-weight: bold;
}

.status-message.success {
  background: #4CAF50;
}

.status-message.error {
  background: #f44336;
}

.status-message.info {
  background: #2196F3;
}
</style>
