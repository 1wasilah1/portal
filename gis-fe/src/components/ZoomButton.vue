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
  top: 14vh;         /* ubah sesuai kebutuhan */
  right: 4vw;
  z-index: 9999;
  pointer-events: auto;
}

/* Styling tombol zoom */
.ol-zoom {
  background-color: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(4px);
  border-radius: 8px;
  padding: 4px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.ol-zoom button {
  width: clamp(24px, 6vw, 36px);
  height: clamp(24px, 6vw, 36px);
  font-size: 1.2rem;
  border-radius: 50%;
  border: 2px solid transparent;
  margin-bottom: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.ol-zoom button:hover {
  border-color: slateblue;
}

@media (max-width: 768px) {
  .custom-zoom-control {
    top: auto;
    bottom: 4vh;
    right: 1rem;
  }

  .ol-zoom button {
    width: 36px;
    height: 36px;
  }
}
</style>