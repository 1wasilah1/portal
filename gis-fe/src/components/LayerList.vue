<template>
  <div class="tools1">
    <button @click="toggleLayerList" id="btn-layer-list" class="btn rounded-circle logo" title="Daftar Data">
        <img v-if="!isLayerListVisible" :src="visibleIcon" alt="Show Layer List" class="icon"/>
        <i v-else class="fas fa-times icon-close"></i>
    </button>
  </div>
  <div class="layer-manager" v-if="isLayerListVisible">
    <!-- Main Panel -->
    <div class="main-panel">
      <h2>Katalog Layer</h2>
      <div class="action-buttons">
        <button class="add-btn" @click="showAddLayerDialog">
          <i class="fas fa-plus"></i> Tambah Layer
        </button>
        <button 
          class="delete-btn" 
          @click="confirmDeleteAll"
          :disabled="activeLayers.length === 0"
        >
          <i class="fas fa-trash"></i> Hapus Semua
        </button>
      </div>

      <div v-if="activeLayers.length === 0" class="empty-state">
        <i class="fas fa-layer-group"></i>
        <p>Belum ada layer yang ditambahkan</p>
      </div>

      <div v-else class="layer-list">
        <div 
          v-for="layer in activeLayers" 
          :key="layer.id" 
          class="layer-item"
          :class="{ 'active': layer.visible }"
        >
          <div class="layer-info">
            <div class="color-swatch" :style="{ backgroundColor: layer.color }"></div>
            <span class="layer-name">{{ layer.name }}</span>
          </div>
          <div class="layer-actions">
            <label class="toggle-switch">
              <input 
                type="checkbox" 
                v-model="layer.visible"
                @click.stop
              >
              <span class="slider"></span>
            </label>
            <button class="remove-btn" @click.stop="removeLayer(layer.id)">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Side Popup -->
    <div v-if="showLayerDialog" class="side-popup">
      <div class="popup-header">
        <h3>Pilih Layer</h3>
        <button class="close-btn" @click="closeDialog">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="category-container">
        <div 
          v-for="category in categories" 
          :key="category.id" 
          class="category-item"
        >
          <div 
            class="category-header"
            @click="toggleCategory(category.id)"
          >
            <i 
              class="fas fa-chevron-right arrow-icon"
              :class="{ rotated: expandedCategories[category.id] }"
            ></i>
            <span>{{ category.name }}</span>
          </div>

          <div 
            class="layer-options"
            v-show="expandedCategories[category.id]"
          >
            <div 
              v-for="item in category.items" 
              :key="item.id"
              class="layer-option"
              :class="{ 'selected': isSelected(item.id) }"
              @click="toggleLayerSelection(item)"
            >
              <div class="option-color" :style="{ backgroundColor: item.color }"></div>
              <span>{{ item.name }}</span>
              <i 
                class="fas fa-check check-icon"
                v-if="isSelected(item.id)"
              ></i>
            </div>
          </div>
        </div>
      </div>

      <div class="popup-footer">
        <button class="cancel-btn" @click="closeDialog">Batal</button>
        <button class="confirm-btn" @click="addSelectedLayers">Tambahkan</button>
      </div>
    </div>

    <!-- Confirmation Dialog -->
    <div v-if="showConfirmDialog" class="dialog-overlay">
      <div class="confirmation-dialog">
        <h3>Hapus semua layer?</h3>
        <p>Anda yakin ingin menghapus semua layer?</p>
        <div class="dialog-actions">
          <button class="cancel-btn" @click="cancelDelete">Batal</button>
          <button class="confirm-btn" @click="deleteAllLayers">Hapus</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import layerGroupIcon from '../assets/layers-group.svg' // Pastikan path benar

// State
const isLayerListVisible = ref(false)
const activeLayers = ref([])
const selectedLayers = ref([])
const expandedCategories = ref({})
const showLayerDialog = ref(false)
const showConfirmDialog = ref(false)
const visibleIcon = layerGroupIcon

// Kategori dan item layer
const categories = [
  {
    id: 'POINT',
    name: 'CIP POINT',
    items: [
      { id: 'Point1', name: 'Gapura', color: '#4CAF50' },
      { id: 'Point2', name: 'Vertikal Garden', color: '#2196F3' },
      { id: 'Point3', name: 'Speedbump', color: '#FF5722' }
    ]
  },
  {
    id: 'LINE',
    name: 'CIP LINE',
    items: [
      { id: 'Line1', name: 'Jalan', color: '#9C27B0' },
      { id: 'Line2', name: 'Saluran', color: '#607D8B' },
      { id: 'Line3', name: 'Pagar Pengaman', color: '#795548' }
    ]
  },
  {
    id: 'DATA',
    name: 'DATA LAINNYA',
    items: [
      { id: 'Data1', name: 'RW Kumuh', color: '#6C24B0' },
      { id: 'Data2', name: 'RPTRA', color: '#707D9B' }
    ]
  }
]

// Expand semua kategori saat inisialisasi
categories.forEach(cat => {
  expandedCategories.value[cat.id] = true
})

// Toggle visibility daftar layer
const toggleLayerList = () => {
  isLayerListVisible.value = !isLayerListVisible.value
}

// Buka dialog tambah layer
const showAddLayerDialog = () => {
  selectedLayers.value = activeLayers.value.map(layer => layer.id)
  showLayerDialog.value = true
}

const closeDialog = () => {
  showLayerDialog.value = false
}

const toggleCategory = (categoryId) => {
  expandedCategories.value[categoryId] = !expandedCategories.value[categoryId]
}

const toggleLayerSelection = (item) => {
  const index = selectedLayers.value.indexOf(item.id)
  if (index === -1) {
    selectedLayers.value.push(item.id)
  } else {
    selectedLayers.value.splice(index, 1)
  }
}

const isSelected = (id) => selectedLayers.value.includes(id)

const addSelectedLayers = () => {
  categories.forEach(category => {
    category.items.forEach(item => {
      if (selectedLayers.value.includes(item.id) &&
          !activeLayers.value.some(l => l.id === item.id)) {
        activeLayers.value.push({ ...item, visible: true })
      }
    })
  })

  // Sort berdasarkan urutan kategori
  activeLayers.value.sort((a, b) => {
    const getOrder = (id) => {
      for (const category of categories) {
        for (let i = 0; i < category.items.length; i++) {
          if (category.items[i].id === id) return i + categories.indexOf(category) * 100
        }
      }
      return 9999
    }
    return getOrder(a.id) - getOrder(b.id)
  })

  closeDialog()
}

const removeLayer = (id) => {
  activeLayers.value = activeLayers.value.filter(layer => layer.id !== id)
}

const confirmDeleteAll = () => {
  if (activeLayers.value.length > 0) {
    showConfirmDialog.value = true
  }
}

const cancelDelete = () => {
  showConfirmDialog.value = false
}

const deleteAllLayers = () => {
  activeLayers.value = []
  showConfirmDialog.value = false
}

// OPTIONAL: integrasi dengan OpenLayers bisa ditambahkan di watch ini
watch(
  activeLayers,
  (layers) => {
    layers.forEach(layer => {
      // Integrasi OL: show/hide based on layer.visible
    })
  },
  { deep: true }
)
</script>

<style scoped>
.layer-manager {
  position: absolute;
  top: 180px;
  left: 80px;
  display: flex;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  z-index: 1000;
}

.main-panel {
  width: 250px;
  height: 700px; /* tambah ini */
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  padding: 16px;
  margin-right: 10px;
}


.main-panel h2 {
  font-size: 1.2rem;
  margin-bottom: 16px;
  color: #333;
  text-align: center; /* Add this line to center the text */
}

.action-buttons {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

button {
  padding: 8px 12px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.add-btn {
  background: #4CAF50;
  color: white;
}

.add-btn:hover {
  background: #3e8e41;
}

.delete-btn {
  background: #f44336;
  color: white;
}

.delete-btn:hover {
  background: #d32f2f;
}

.delete-btn:disabled {
  background: #cccccc;
  cursor: not-allowed;
}

.empty-state {
  padding: 20px;
  text-align: center;
  color: #666;
  font-size: 0.9rem;
}

.empty-state i {
  font-size: 2rem;
  margin-bottom: 8px;
  color: #ddd;
}

.layer-list {
  max-height: 500px;
  overflow-y: auto;
}

.layer-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  margin-bottom: 8px;
  background: #f9f9f9;
  border-radius: 4px;
  border: 1px solid #eee;
}

.layer-item.active {
  border-color: #2196F3;
  background: #e3f2fd;
}

.layer-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.color-swatch {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 1px solid rgba(0,0,0,0.1);
}

.layer-name {
  font-size: 0.9rem;
}

.layer-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 20px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 20px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #2196F3;
}

input:checked + .slider:before {
  transform: translateX(20px);
}

.remove-btn {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 4px;
}

.remove-btn:hover {
  color: #f44336;
}

/* Side Popup Styles */
.side-popup {
  width: 300px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #eee;
}

.popup-header h3 {
  font-size: 1.1rem;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  font-size: 1rem;
}

.close-btn:hover {
  color: #333;
}

.category-container {
  flex: 1;
  overflow-y: auto;
  padding: 0 16px;
}

.category-item {
  margin-bottom: 12px;
}

.category-header {
  display: flex;
  align-items: center;
  padding: 8px 0;
  cursor: pointer;
  font-weight: 500;
  color: #444;
}

.arrow-icon {
  font-size: 0.8rem;
  margin-right: 8px;
  transition: transform 0.2s;
}

.arrow-icon.rotated {
  transform: rotate(90deg);
}

.layer-options {
  margin-left: 16px;
  border-left: 2px solid #eee;
  padding-left: 10px;
}

.layer-option {
  display: flex;
  align-items: center;
  padding: 8px;
  margin-bottom: 4px;
  border-radius: 4px;
  cursor: pointer;
  position: relative;
}

.layer-option:hover {
  background: #f5f5f5;
}

.layer-option.selected {
  background: #e3f2fd;
}

.option-color {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  margin-right: 8px;
  border: 1px solid rgba(0,0,0,0.1);
}

.check-icon {
  margin-left: auto;
  color: #2196F3;
  font-size: 0.8rem;
}

.popup-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 16px;
  border-top: 1px solid #eee;
}

.cancel-btn {
  background: #f1f1f1;
  color: #333;
}

.cancel-btn:hover {
  background: #e0e0e0;
}

.confirm-btn {
  background: #2196F3;
  color: white;
}

.confirm-btn:hover {
  background: #0b7dda;
}

/* Confirmation Dialog */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.confirmation-dialog {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  width: 300px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
}

.confirmation-dialog h3 {
  margin-top: 0;
  font-size: 1.1rem;
}

.confirmation-dialog p {
  margin-bottom: 20px;
  color: #666;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* Scrollbar */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.btn.logo,
.btn.logo:active:focus {
  background-color: white;
  margin-left: 10px;
  width: 10vw;
  height: 10vw;
  max-width: 50px;
  max-height: 50px;
  border-radius: 8px;
  border: 2px solid transparent;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.1);
}

.btn.logo:hover {
  background-color: white;
  border-color: slateblue;
  transition: all 500ms;
}

.icon {
  height: 4vw;
  max-height: 30px;
  width: auto;
}

.tools1 {
    position: absolute;
    z-index: 1;
    top: 160px;
    left: 0px;
}

/* Responsif tambahan untuk layar kecil */
@media (max-width: 768px) {
  .btn.logo {
    width: 12vw;
    height: 12vw;
  }

  .icon {
    height: 5vw;
  }

  .tools1 {
    top: 22vh;
    left: 2vw;
  }

  
}

@media (max-width: 480px) {
  .btn.logo {
    width: 14vw;
    height: 14vw;
  }

  .icon {
    height: 6vw;
  }
}
</style>
