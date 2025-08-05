<template>
  <!-- Div target tempat tombol zoom ditempelkan -->
  <div ref="zoomContainer" class="custom-zoom-control"></div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { Zoom } from 'ol/control';

const props = defineProps({
  map: {
    type: Object,
    required: true
  }
});

const zoomContainer = ref(null);

onMounted(() => {
  if (props.map && zoomContainer.value) {
    const zoomControl = new Zoom({
      target: zoomContainer.value // tombol ditempel ke div ini
    });
    props.map.addControl(zoomControl);
  }
});
</script>

<style scoped>
.custom-zoom-control {
  position: absolute;
  top: 100px;         /* ubah sesuai kebutuhan */
  right: 60px;
  z-index: 1000;
  pointer-events: auto;
}

/* Styling tombol zoom */
.ol-zoom {
  position: absolute;
  top: 100px;
  right: 60px;
  left: auto;
  display: flex;             /* aktifkan flexbox */
  flex-direction: row;       /* arah horizontal */
  gap: 10px;                 /* jarak antar tombol 10px */
  background-color: transparent;
  transition: all 500ms ease-out;
  z-index: 1000;
  padding: 0;
  margin: 0;
}

.ol-zoom .ol-zoom-in,
.ol-zoom .ol-zoom-out {
  width: 50px;               /* ukuran tombol 50px */
  height: 50px;
  font-size: 1.5rem;
  border-radius: 25%;
  border: 2px solid transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  background-color: white;
  color: #333;
}

.ol-zoom button:hover {
  border-color: slateblue;
  transition: all 500ms;
}

@media (max-width: 768px) {
  .custom-zoom-control {
    top: auto;
    bottom: 4vh;
    right: 1rem;
  }

  .ol-zoom {
    gap: 10px;               /* tetap 10px di mobile */
  }
  
  .ol-zoom button {
    width: 50px;
    height: 50px;
    transition: all 500ms;
    cursor: pointer;
  }
}
</style>