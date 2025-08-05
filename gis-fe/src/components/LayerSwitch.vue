<template>
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
</template>

<script setup>
import { onMounted } from 'vue';
import LayerSwitcher from 'ol-layerswitcher';

const props = defineProps({
    map: {
        type: Object,
        required: true
    },
});

// const emit = defineEmits(['sendData']);

onMounted(() => {
    const layerSwitcher = new LayerSwitcher({
        activationMode: 'click',
        startActive: false,
        groupSelectStyle: 'children',
        tipLabel: 'Daftar Layer',
        collapseTipLabel: 'Tutup Daftar Layer',
    });

    props.map.addControl(layerSwitcher);

});
</script>

<template>
    <div class="layer-switcher"></div>
</template>

<style scoped>
/* Add your styles here if needed */
</style>
