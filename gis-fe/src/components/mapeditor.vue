<template>
  <div class="map-editor-container">
    <!-- Toolbar Controls -->
    <div class="editor-toolbar">
      <button @click="startDrawing('Point')" :class="{ active: activeTool === 'Point' }">
        <i class="fas fa-map-marker-alt"></i> Point
      </button>
      <button @click="startDrawing('LineString')" :class="{ active: activeTool === 'LineString' }">
        <i class="fas fa-slash"></i> Line
      </button>
      <button @click="startDrawing('Polygon')" :class="{ active: activeTool === 'Polygon' }">
        <i class="fas fa-draw-polygon"></i> Polygon
      </button>
      <button @click="enableEditMode" :class="{ active: isEditing }">
        <i class="fas fa-edit"></i> Edit
      </button>
      <button @click="clearAll" class="danger">
        <i class="fas fa-trash-alt"></i> Clear
      </button>
      <button v-if="activeTool" @click="stopDrawing" class="danger">
  <i class="fas fa-times-circle"></i> Stop Drawing
</button>
    </div>

    <!-- Attribute Form Popup -->
    <div v-if="showAttributeForm" class="attribute-popup">
      <div class="popup-header">
        <h3>Feature Attributes</h3>
        <button @click="closeAttributeForm" class="close-btn">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="form-group">
        <label>Type</label>
        <input type="text" v-model="currentFeature.type" disabled>
      </div>
      
      <div class="form-group">
        <label>Alamat</label>
        <input type="text" v-model="currentFeature.properties.Alamat" placeholder="contoh: Jalan Raya No. 123">
      </div>

      <div class="form-group">
        <label>RW</label>
        <input type="text" v-model="currentFeature.properties.RW" placeholder="contoh: 01">
      </div>

      <div class="form-group">
        <label>Kelurahan</label>
        <input type="text" v-model="currentFeature.properties.Kelurahan" placeholder="contoh: Kelurahan Gambir">
      </div>

      <div class="form-group">
        <label>Kecamatan</label>
        <input type="text" v-model="currentFeature.properties.Kecamatan" placeholder="contoh: Kecamatan Gambir">
      </div>

      <div class="form-group">
        <label>Wilayah Administrasi</label>
        <input type="text" v-model="currentFeature.properties.Wilayah_admin" placeholder="contoh: Jakarta Pusat">
      </div>

      <div class="form-group">
        <label>Nama Kegiatan</label>
        <input type="text" v-model="currentFeature.properties.Namakegiatan" placeholder="contoh: Jalan Lingkungan">
      </div>

      <div class="form-group">
        <label>Tipe Bahan</label>
        <input type="text" v-model="currentFeature.properties.Tipebahan" placeholder="contoh: Jalan Aspal">
      </div>

      <div class="form-group">
        <label>Tahun Pelaksanaan</label>
        <input type="text" v-model="currentFeature.properties.Tahunpelaksanaan" placeholder="contoh: 2024">
      </div>

      <div class="form-group">
        <label>Volume</label>
        <input type="text" v-model="currentFeature.properties.Volume" placeholder="contoh: 25,8">
      </div>

      <div class="form-group">
        <label>Satuan</label>
        <input type="text" v-model="currentFeature.properties.Satuan" placeholder="contoh: m'">
      </div>
      

      <div class="form-group">
        <label>Anggaran</label>
        <input type="text" v-model="currentFeature.properties.Anggaran" placeholder="contoh: 5000000">
      </div>
      
      <div class="form-group">
        <label>Nama Surveyor</label>
        <input type="text" v-model="currentFeature.properties.Namasurveyor" placeholder="contoh: Naufal">
      </div>

      <div class="form-group">
        <label>Keterangan</label>
        <textarea v-model="currentFeature.properties.description" placeholder="keterangan tambahan"></textarea>
      </div>
      
      <div class="form-group">
        <label>Coordinates</label>
        <textarea v-model="currentFeature.coordinates" disabled></textarea>
      </div>
      
      <div class="form-actions">
        <button @click="saveFeature" class="save-btn">
          <i class="fas fa-save"></i> Save
        </button>
        <button @click="deleteFeature" class="delete-btn">
          <i class="fas fa-trash-alt"></i> Delete
        </button>
      </div>
    </div>

    <!-- Status Message -->
    <div v-if="statusMessage" class="status-message" :class="statusType">
      {{ statusMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import Draw from 'ol/interaction/Draw';
import Modify from 'ol/interaction/Modify';
import Snap from 'ol/interaction/Snap';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Style, Fill, Stroke, Circle as CircleStyle } from 'ol/style';
import GeoJSON from 'ol/format/GeoJSON';
import { transform } from 'ol/proj';
import { unByKey } from 'ol/Observable';

const props = defineProps({
  map: {
    type: Object,
    required: true
  }
});

// State
const activeTool = ref(null);
const isEditing = ref(false);
const showAttributeForm = ref(false);
const currentFeature = ref({
  type: '',
  properties: {
    name: '',
    description: ''
  },
  coordinates: ''
});
const statusMessage = ref('');
const statusType = ref('info');

// Layers and Interactions
const source = new VectorSource();
const vectorLayer = new VectorLayer({
  source,
  style: new Style({
    fill: new Fill({ color: 'rgba(255, 165, 0, 0.2)' }),
    stroke: new Stroke({ color: 'rgba(255, 165, 0, 1)', width: 2 }),
    image: new CircleStyle({
      radius: 7,
      fill: new Fill({ color: 'rgba(255, 165, 0, 1)' })
    })
  })
});

let drawInteraction = null;
let modifyInteraction = null;
let snapInteraction = null;
let clickListenerKey = null;
let selectedFeature = null;

// Initialize
onMounted(() => {
  if (!props.map) {
    console.error('Map instance not provided to MapEditor');
    return;
  }
  props.map.addLayer(vectorLayer);
});

onBeforeUnmount(() => {
  cleanupInteractions();
  if (props.map) {
    props.map.removeLayer(vectorLayer);
  }
});

// Drawing
const startDrawing = (type) => {
  if (!props.map) return;
  
  cleanupInteractions();
  activeTool.value = type;
  isEditing.value = false;

  drawInteraction = new Draw({ source, type });

  drawInteraction.on('drawend', (event) => {
  const feature = event.feature;
  feature.set('type', type);
  showFeatureForm(feature);
  cleanupInteractions(); // <-- Ini sudah benar
  activeTool.value = null;
});

  snapInteraction = new Snap({ source });

  props.map.addInteraction(drawInteraction);
  props.map.addInteraction(snapInteraction);
};

const setupModifyInteraction = () => {
  if (!props.map) return;
  
  modifyInteraction = new Modify({ source });

  modifyInteraction.on('modifyend', (event) => {
    const feature = event.features.getArray()[0];
    updateFeatureCoordinates(feature);
  });

  props.map.addInteraction(modifyInteraction);
};

const enableEditMode = () => {
  if (!props.map) return;
  
  cleanupInteractions();
  isEditing.value = !isEditing.value;

  if (isEditing.value) {
    setupModifyInteraction();
    snapInteraction = new Snap({ source });
    props.map.addInteraction(snapInteraction);
    clickListenerKey = props.map.on('click', handleMapClick);
  }
};

const handleMapClick = (event) => {
  if (!props.map) return;
  
  props.map.forEachFeatureAtPixel(event.pixel, (feature) => {
    selectedFeature = feature;
    showFeatureForm(feature);
  });
};

const showFeatureForm = (feature) => {
  currentFeature.value = {
    type: feature.get('type'),
    properties: feature.getProperties(),
    coordinates: getFeatureCoordinates(feature)
  };
  showAttributeForm.value = true;
};

const updateFeatureCoordinates = (feature) => {
  if (showAttributeForm.value && selectedFeature === feature) {
    currentFeature.value.coordinates = getFeatureCoordinates(feature);
  }
};

const getFeatureCoordinates = (feature) => {
  const geometry = feature.getGeometry();
  const coords = geometry.getCoordinates();
  const type = geometry.getType();
  let coordinates = [];

  if (type === 'Point') {
    const [lon, lat] = transform(coords, 'EPSG:3857', 'EPSG:4326');
    coordinates.push([lat, lon]);
  } else if (type === 'LineString') {
    coordinates = coords.map(c => {
      const [lon, lat] = transform(c, 'EPSG:3857', 'EPSG:4326');
      return [lat, lon];
    });
  } else if (type === 'Polygon') {
    coordinates = coords[0].map(c => {
      const [lon, lat] = transform(c, 'EPSG:3857', 'EPSG:4326');
      return [lat, lon];
    });
  }

  return JSON.stringify(coordinates, null, 2);
};

const closeAttributeForm = () => {
  showAttributeForm.value = false;
  selectedFeature = null;
};

const saveFeature = async () => {
  try {
    const feature = selectedFeature;
    const props = { ...currentFeature.value.properties };
    delete props.geometry;

    const response = await fetch('/api/suku-dinas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: currentFeature.value.type,
        properties: props,
        geometry: new GeoJSON().writeGeometryObject(
          feature.getGeometry(),
          { featureProjection: 'EPSG:3857', dataProjection: 'EPSG:4326' }
        )
      })
    });

    if (!response.ok) throw new Error('Save failed');

    showStatus('Feature saved successfully!', 'success');
    closeAttributeForm();
  } catch (err) {
    console.error(err);
    showStatus('Failed to save feature', 'error');
  }
};

const deleteFeature = () => {
  if (selectedFeature) {
    source.removeFeature(selectedFeature);
    closeAttributeForm();
    showStatus('Feature deleted', 'info');
  }
};

const clearAll = () => {
  source.clear();
  showStatus('All features cleared', 'info');
};
const stopDrawing = () => {
  activeTool.value = null;
  cleanupInteractions();
};


const cleanupInteractions = () => {
  if (!props.map) return;
  
  if (drawInteraction) {
    props.map.removeInteraction(drawInteraction);
    drawInteraction = null;
  }
  if (modifyInteraction) {
    props.map.removeInteraction(modifyInteraction);
    modifyInteraction = null;
  }
  if (snapInteraction) {
    props.map.removeInteraction(snapInteraction);
    snapInteraction = null;
  }
  if (clickListenerKey) {
    unByKey(clickListenerKey);
    clickListenerKey = null;
  }
};

const showStatus = (message, type) => {
  statusMessage.value = message;
  statusType.value = type;
  setTimeout(() => {
    statusMessage.value = '';
  }, 3000);
};


</script>


<style scoped>
.map-editor-container {
  position: absolute;
  top: 165px;
  right: 35px;
  z-index: 1000;
}

.editor-toolbar {
  display: flex;
  gap: 8px;
  background: white;
  padding: 8px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
}

.editor-toolbar button {
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  background: #f0f0f0;
  transition: all 0.2s;
}

.editor-toolbar button:hover {
  background: #e0e0e0;
}

.editor-toolbar button.active {
  background: #4CAF50;
  color: white;
}

.editor-toolbar button.danger {
  background: #f44336;
  color: white;
}

.attribute-popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
  z-index: 1001;
  width: 350px;
  max-width: 90vw;
    /* Tambahan untuk scroll */
  max-height: 50vh;
  overflow-y: auto;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  color: #666;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-group textarea {
  min-height: 80px;
  resize: vertical;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.save-btn {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  flex: 1;
}

.delete-btn {
  background: #f44336;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
}

.status-message {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 20px;
  border-radius: 4px;
  background: #2196F3;
  color: white;
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  z-index: 1000;
}

.status-message.success {
  background: #4CAF50;
}

.status-message.error {
  background: #f44336;
}

@media (max-width: 768px) {
  .editor-toolbar {
    flex-wrap: wrap;
  }
  
  .attribute-popup {
    width: 90%;
  }
}
</style>