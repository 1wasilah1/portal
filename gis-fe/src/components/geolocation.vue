<template>
  <button 
    @click="locateUser"
    :disabled="isLocating"
    class="geolocation-button"
    :class="{ 'is-locating': isLocating }"
    :title="buttonTitle"
  >
    <span v-if="isLocating" class="spinner"></span>
    <span v-else class="icon">📍</span>
  </button>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue';
import { fromLonLat } from 'ol/proj';
import { Circle as CircleGeom } from 'ol/geom';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Style, Fill, Stroke, Circle as CircleStyle } from 'ol/style';

const props = defineProps({
  map: { type: Object, required: true },
  zoomToLocation: { type: Boolean, default: true },
  showAccuracy: { type: Boolean, default: true },
  showMarker: { type: Boolean, default: true },
  zoomLevel: { type: Number, default: 17 },
  tracking: { type: Boolean, default: false },
  trackingOptions: {
    type: Object,
    default: () => ({
      maximumAge: 10000,
      timeout: 6000,
      enableHighAccuracy: true
    })
  }
});

const emit = defineEmits([
  'location-found',
  'location-error',
  'tracking-started',
  'tracking-stopped'
]);

const isLocating = ref(false);
const isTracking = ref(false);
const watchId = ref(null);
const geolocationLayer = ref(null);

const buttonTitle = computed(() => {
  if (isTracking.value) return 'Stop tracking';
  if (isLocating.value) return 'Locating...';
  return 'Find my location';
});

const initGeolocationLayer = () => {
  if (!geolocationLayer.value) {
    const source = new VectorSource();
    geolocationLayer.value = new VectorLayer({
      source,
      zIndex: 1000
    });
    props.map.addLayer(geolocationLayer.value);
  }
  return geolocationLayer.value.getSource();
};

const createAccuracyCircle = (center, accuracy) => {
  const circle = new Feature(new CircleGeom(center, accuracy));
  circle.setStyle(
    new Style({
      fill: new Fill({ color: 'rgba(66, 165, 245, 0.2)' }),
      stroke: new Stroke({ color: 'rgba(66, 165, 245, 0.8)', width: 1.5 })
    })
  );
  return circle;
};

const createPositionMarker = (center) => {
  const marker = new Feature(new Point(center));
  marker.setStyle(
    new Style({
      image: new CircleStyle({
        radius: 6,
        fill: new Fill({ color: '#4285F4' }),
        stroke: new Stroke({ color: '#fff', width: 2 })
      })
    })
  );
  return marker;
};

const handleGeolocationSuccess = (position) => {
  const coords = fromLonLat([
    position.coords.longitude,
    position.coords.latitude
  ]);
  const accuracy = position.coords.accuracy || 20;

  const source = initGeolocationLayer();
  source.clear();

  if (props.showAccuracy) {
    source.addFeature(createAccuracyCircle(coords, accuracy));
  }

  if (props.showMarker) {
    source.addFeature(createPositionMarker(coords));
  }

  if (props.zoomToLocation) {
    props.map.getView().animate({
      center: coords,
      zoom: props.zoomLevel,
      duration: 500
    });
  }

  emit('location-found', { coordinates: coords, position });
};

const handleGeolocationError = (error) => {
  isLocating.value = false;
  isTracking.value = false;

  let msg;
  switch (error.code) {
    case error.PERMISSION_DENIED:
      msg = 'Geolocation permission denied.';
      break;
    case error.POSITION_UNAVAILABLE:
      msg = 'Location unavailable.';
      break;
    case error.TIMEOUT:
      msg = 'Geolocation timed out.';
      break;
    default:
      msg = 'Unknown error.';
  }

  emit('location-error', { error, message: msg });
};

const stopTracking = () => {
  if (watchId.value) {
    navigator.geolocation.clearWatch(watchId.value);
    watchId.value = null;
  }
  isTracking.value = false;
  isLocating.value = false;
  emit('tracking-stopped');
};

const startTracking = () => {
  if (!navigator.geolocation) {
    handleGeolocationError({ code: 0, message: 'Geolocation not supported.' });
    return;
  }

  isTracking.value = true;
  isLocating.value = true;
  emit('tracking-started');

  watchId.value = navigator.geolocation.watchPosition(
    (position) => {
      isLocating.value = false;
      handleGeolocationSuccess(position);
    },
    handleGeolocationError,
    props.trackingOptions
  );
};

const locateUser = () => {
  if (isTracking.value) {
    stopTracking();
    return;
  }

  if (!navigator.geolocation) {
    handleGeolocationError({ code: 0, message: 'Geolocation not supported.' });
    return;
  }

  if (props.tracking) {
    startTracking();
  } else {
    isLocating.value = true;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        isLocating.value = false;
        handleGeolocationSuccess(position);
      },
      handleGeolocationError,
      props.trackingOptions
    );
  }
};

onUnmounted(() => {
  stopTracking();
  if (geolocationLayer.value) {
    props.map.removeLayer(geolocationLayer.value);
  }
});

defineExpose({ locateUser, startTracking, stopTracking });
</script>

<style scoped>
.geolocation-button {
  position: fixed;
  top: 13vh;
  right: 4vw;
  width: 40px;
  height: 40px;
  background: white;
  border: 2px solid rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 1000;
}
.geolocation-button:hover {
  background: #f8f8f8;
  border-color: slateblue;
  transform: translateY(-1px);
}
.geolocation-button:active {
  transform: translateY(0);
}
.geolocation-button:disabled {
  cursor: wait;
  opacity: 0.7;
}
.geolocation-button.is-locating {
  animation: pulse 1.5s infinite, colorPulse 3s infinite;
}
.icon {
  font-size: 22px;
  color: #4285f4;
}
.spinner {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(66, 133, 244, 0.2);
  border-top-color: #4285f4;
  border-right-color: #4285f4;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
@keyframes pulse {
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(66, 133, 244, 0.4); }
  70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(66, 133, 244, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(66, 133, 244, 0); }
}
@keyframes colorPulse {
  0%, 100% { border-color: rgba(0, 0, 0, 0.2); }
  50% { border-color: #4285f4; }
}
</style>