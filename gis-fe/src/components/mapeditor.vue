<template>
  <div class="map-editor-container">
    <!-- Toolbar Controls -->
    <div class="editor-toolbar">
      <button @click="startDrawing('Point')" :class="{ active: activeTool === 'Point' }">
        <i class="fas fa-map-marker-alt"></i> Point
      </button>
      <!-- <button @click="startDrawing('LineString')" :class="{ active: activeTool === 'LineString' }">
        <i class="fas fa-slash"></i> Line
      </button>
      <button @click="startDrawing('Polygon')" :class="{ active: activeTool === 'Polygon' }">
        <i class="fas fa-draw-polygon"></i> Polygon
      </button>
      <button @click="enableEditMode" :class="{ active: isEditing }">
        <i class="fas fa-edit"></i> Edit
      </button> -->
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
        <input type="text" v-model="currentFeature.properties.Wilayahadmin" placeholder="contoh: Jakarta Pusat">
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
import axios from 'axios';

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
// Perbaikan pada VectorLayer
const vectorLayer = new VectorLayer({
  source,
  style: (feature) => {
    const type = feature.getGeometry().getType();
    const style = new Style({
      fill: new Fill({ 
        color: type === 'Polygon' ? 'rgba(255, 165, 0, 0.5)' : 'transparent' 
      }),
      stroke: new Stroke({ 
        color: 'rgba(255, 165, 0, 1)', 
        width: type === 'Point' ? 1 : 3 
      }),
      image: new CircleStyle({
        radius: type === 'Point' ? 7 : 0,
        fill: new Fill({ color: 'rgba(255, 165, 0, 1)' })
      })
    });
    return style;
  },
  updateWhileAnimating: true,  // Tambahkan ini
  updateWhileInteracting: true // Tambahkan ini
});

let drawInteraction = null;
let modifyInteraction = null;
let snapInteraction = null;
let clickListenerKey = null;
let selectedFeature = null;

// Initialize
onMounted(() => {
  if (!props.map) {
    console.error("Map instance not provided to MapEditor");
    return;
  }
  props.map.addLayer(vectorLayer);
  
  // Prevent default double click zoom
  props.map.getViewport().addEventListener('dblclick', (e) => {
    if (activeTool.value) {
      e.preventDefault();
      e.stopPropagation();
    }
  });
});

onBeforeUnmount(() => {
  cleanupInteractions();
  if (props.map) {
    props.map.removeLayer(vectorLayer);
  }
});

// Drawing:
const stopDrawing = () => {
  if (drawInteraction) {
    props.map.removeInteraction(drawInteraction);
    drawInteraction = null;
  }
  if (snapInteraction) {
    props.map.removeInteraction(snapInteraction);
    snapInteraction = null;
  }
  activeTool.value = null;
  isEditing.value = false;
};

// Perbaikan pada startDrawing function
const startDrawing = (type) => {
  if (!props.map) return;
  
  cleanupInteractions();
  activeTool.value = type;
  isEditing.value = false;

  const drawOptions = {
    source,
    type,
    style: new Style({
      fill: new Fill({ color: 'rgba(255, 165, 0, 0.2)' }),
      stroke: new Stroke({ color: 'rgba(255, 165, 0, 1)', width: 3 }),
      image: new CircleStyle({
        radius: 7,
        fill: new Fill({ color: 'rgba(255, 165, 0, 1)' })
      })
    }),
    freehand: false,
    wrapX: false
  };

  // Handle double click untuk mengakhiri drawing
  if (type === 'Polygon' || type === 'LineString') {
  drawOptions.finishCondition = (event) => {
    const feature = drawInteraction.sketchFeature;
    if (!feature) return false;

    const geometry = feature.getGeometry();
    let coords = geometry.getCoordinates();
    let pointCount = 0;

    if (type === 'Polygon') {
      pointCount = Array.isArray(coords[0]) ? coords[0].length : 0;
    } else if (type === 'LineString') {
      pointCount = Array.isArray(coords) ? coords.length : 0;
    }

    const minPoints = type === 'Polygon' ? 3 : 2;
    return event.originalEvent.type === 'dblclick' && pointCount >= minPoints;
  };
}

  drawInteraction = new Draw(drawOptions);

  drawInteraction.on('drawend', (event) => {
    const feature = event.feature;
    feature.set('type', type);
    selectedFeature = feature;
    showFeatureForm(feature);
    stopDrawing();
  });

  // Tambahkan event listener untuk double click di viewport
  const dblClickListener = (e) => {
    if (activeTool.value && (activeTool.value === 'Polygon' || activeTool.value === 'LineString')) {
      e.stopPropagation();
    }
  };
  props.map.getViewport().addEventListener('dblclick', dblClickListener);

  // Bersihkan event listener saat komponen unmount
  onBeforeUnmount(() => {
    props.map.getViewport().removeEventListener('dblclick', dblClickListener);
  });

  snapInteraction = new Snap({
    source,
    pixelTolerance: 20,
    vertex: true,
    edge: true
  });

  props.map.addInteraction(drawInteraction);
  props.map.addInteraction(snapInteraction);
};

// Ganti setupModifyInteraction dengan ini:
const setupModifyInteraction = () => {
  if (!props.map) return;
  
  modifyInteraction = new Modify({ 
    source,
    style: new Style({
      fill: new Fill({ color: 'rgba(0, 255, 0, 0.2)' }),
      stroke: new Stroke({ color: 'rgba(0, 255, 0, 1)', width: 3 }),
      image: new CircleStyle({
        radius: 7,
        fill: new Fill({ color: 'rgba(0, 255, 0, 1)' })
      })
    })
  });

  modifyInteraction.on('modifyend', (event) => {
    const features = event.features.getArray();
    features.forEach(feature => {
      feature.getGeometry().changed();
      if (selectedFeature === feature) {
        updateFeatureCoordinates(feature);
      }
    });
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
  if (!props.map || !isEditing.value) return;
  
  props.map.forEachFeatureAtPixel(event.pixel, (feature) => {
    selectedFeature = feature;
    showFeatureForm(feature);
    return true; // Hentikan setelah menemukan feature pertama
  });
};

const showFeatureForm = (feature) => {
  currentFeature.value = {
    type: feature.get('type') || feature.getGeometry().getType(),
    properties: {
      Alamat: feature.get('Alamat') || '',
      RW: feature.get('RW') || '',
      Kelurahan: feature.get('Kelurahan') || '',
      Kecamatan: feature.get('Kecamatan') || '',
      Wilayahadmin: feature.get('Wilayahadmin') || '',
      Namakegiatan: feature.get('Namakegiatan') || '',
      Tipebahan: feature.get('Tipebahan') || '',
      Tahunpelaksanaan: feature.get('Tahunpelaksanaan') || '',
      Volume: feature.get('Volume') || '',
      Satuan: feature.get('Satuan') || '',
      Anggaran: feature.get('Anggaran') || '',
      Namasurveyor: feature.get('Namasurveyor') || '',
      description: feature.get('description') || ''
    },
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
  try {
    const geometry = feature.getGeometry();
    const coords = geometry.getCoordinates();
    const type = geometry.getType();
    
    let coordinates = [];
    const transformCoord = (coord) => {
      const [lon, lat] = transform(coord, 'EPSG:3857', 'EPSG:4326');
      return [lat, lon];
    };

    if (type === 'Point') {
      coordinates = transformCoord(coords);
    } else if (type === 'LineString') {
      coordinates = coords.map(transformCoord);
    } else if (type === 'Polygon') {
      coordinates = coords[0].map(transformCoord); // Hanya ring pertama
    }

    return JSON.stringify(coordinates, null, 2);
  } catch (err) {
    console.error('Error transforming coordinates:', err);
    return 'Error getting coordinates';
  }
};

const closeAttributeForm = () => {
  showAttributeForm.value = false;
  selectedFeature = null;
};

const saveFeature = async () => {
  console.log('saveFeature=>')
  try {
    // const feature = selectedFeature;
    const props = { ...currentFeature.value.properties };
    delete props.geometry;
    const formData = new FormData();
    formData.append('alamat', props.Alamat);
    formData.append('rw', props.RW);
    formData.append('kelurahan', props.Kelurahan);
    formData.append('kecamatan', props.Kecamatan);
    formData.append('wilayah_administrasi', props.Wilayahadmin);
    formData.append('nama_kegiatan', props.Namakegiatan);
    formData.append('tipe_bahan', props.Tipebahan);
    formData.append('tahun_pelaksanaan', props.Tahunpelaksanaan);
    formData.append('volume', props.Volume);
    formData.append('satuan', props.Satuan);
    formData.append('anggaran', props.Anggaran);
    formData.append('nama_surveyor', props.Namasurveyor);
    // formData.append('foto', 'null');

    const response = await fetch('/api/suku-dinas', {
      method: 'POST',
      body: formData
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
    // Pastikan feature ada di source sebelum menghapus
    const features = source.getFeatures();
    const featureToDelete = features.find(f => f === selectedFeature);
    
    if (featureToDelete) {
      source.removeFeature(featureToDelete);
      showStatus('Feature deleted', 'info');
    } else {
      showStatus('Feature not found', 'error');
    }
    
    closeAttributeForm();
    selectedFeature = null;
  }
};

const clearAll = () => {
  source.clear();
  showStatus('All features cleared', 'info');
};


const cleanupInteractions = () => {
  if (!props.map) return;
  
  // Hapus semua interaksi
  [drawInteraction, modifyInteraction, snapInteraction].forEach(interaction => {
    if (interaction) {
      props.map.removeInteraction(interaction);
    }
  });

  // Reset semua interaksi
  drawInteraction = null;
  modifyInteraction = null;
  snapInteraction = null;

  // Hapus event listener
  if (clickListenerKey) {
    unByKey(clickListenerKey);
    clickListenerKey = null;
  }

  // Reset state
  activeTool.value = null;
  isEditing.value = false;
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