<script setup>
import { computed } from 'vue';

// Define component props
const props = defineProps({
    map: Object,
    overlaygroup: Array,
    isvisible: Boolean,
    basemapImages: Array
});

// Emit events
const emit = defineEmits(['update:activeBasemapImage', 'close']);

// Import basemap images
import basemap0 from '../assets/basemap0.png';
import basemap1 from '../assets/basemap1.png';
import basemap2 from '../assets/basemap2.png';
import basemap3 from '../assets/basemap3.png';

// Array of imported images
const basemapImages = [basemap0, basemap1, basemap2, basemap3];

// Compute basemap layers from the first overlay group
const basemapLayers = computed(() => props.overlaygroup[0]?.getLayersArray() || []);

// Function to select a basemap
const selectBasemap = (index) => {
    const selectedImage = basemapImages[index];
    emit('update:activeBasemapImage', selectedImage);
    emit('close');

    basemapLayers.value.forEach((layer, idx) => {
        const alwaysOn = layer.get('subtype') === 'always-on';
        layer.setVisible(alwaysOn || idx === index);
    });
};
</script>

<template>
  <div class="basemap-list">
    <div class="basemap-item" v-for="(layer, index) in basemapLayers" :key="index" @click="selectBasemap(index)">
        <span>{{ layer.get('title') || `Basemap ${index}` }}</span>
        <img :src="basemapImages[index]" :alt="layer.get('title')" width="50" height="50" />
    </div>
  </div>
</template>

<style scoped>
.basemap-list {
    display: flex;
    flex-direction: column;
    z-index: 1;
    position: absolute;
    bottom: 10vh;
    right: 2vw;
    text-align: right;
    background-color: white;
    border-radius: 15px;
    padding: 0px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
    width: auto;
    max-width: 90vw;
}

img {
    border: 1px solid black;
    border-radius: 10px;
}

.basemap-list div {
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    border-radius: 15px;
}

.basemap-item {
    background-color: white;
    padding: 10px;
}

.basemap-item:hover {
    background-color: #f0f0f0;
}

.basemap-list img {
    border: 1px solid black;
    border-radius: 10px;
    width: 12vw;
    max-width: 70px;
    height: auto;
    margin-left: 10px;
    object-fit: cover;
}

/* Responsif tambahan untuk HP dan tablet */
@media (max-width: 768px) {
  .basemap-list {
    right: 4vw;
    bottom: 10vh;
    padding: 0.25rem;
  }

  .basemap-list img {
    width: 16vw;
    max-width: 60px;
  }

  .basemap-list div {
    padding: 0.25rem;
  }
}

@media (max-width: 480px) {
  .basemap-list {
    right: 3vw;
    bottom: 10vh;
  }

  .basemap-list img {
    width: 20vw;
    max-width: 55px;
  }
}
</style>
