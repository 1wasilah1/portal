<template>
  <button 
    @click="locateUser"
    :disabled="isLocating"
    class="geolocation-button"
    :class="{ 'is-locating': isLocating }"
    :title="buttonTitle"
  >
    <span v-if="isLocating" class="spinner"></span>
    <img v-else src="/geolocation.svg" alt="Locate" class="icon" />
  </button>
</template>

<script setup>
import { ref, computed } from 'vue';
import { fromLonLat } from 'ol/proj';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';

const props = defineProps({
  map: {
    type: Object,
    required: true
  },
  zoomToLocation: {
    type: Boolean,
    default: true
  },
  showAccuracy: {
    type: Boolean,
    default: true
  },
  showMarker: {
    type: Boolean,
    default: true
  },
  zoomLevel: {
    type: Number,
    default: 17
  },
  tracking: {
    type: Boolean,
    default: false
  },
  trackingOptions: {
    type: Object,
    default: () => ({
      maximumAge: 10000,
      timeout: 6000,
      enableHighAccuracy: true
    })
  }
});

const emit = defineEmits(['location-found', 'location-error', 'tracking-started', 'tracking-stopped']);

const isLocating = ref(false);
const isTracking = ref(false);
const watchId = ref(null);
const accuracyCircle = ref(null);
const positionMarker = ref(null);
const geolocationLayer = ref(null);

const buttonTitle = computed(() => {
  if (isTracking.value) return 'Stop tracking';
  if (isLocating.value) return 'Locating...';
  return 'Find my location';
});

// Initialize the geolocation layer
const initGeolocationLayer = () => {
  if (geolocationLayer.value) {
    props.map.removeLayer(geolocationLayer.value);
  }

  const source = new VectorSource();
  geolocationLayer.value = new VectorLayer({
    source: source,
    zIndex: 1000
  });
  
  props.map.addLayer(geolocationLayer.value);
  return source;
};

// Create accuracy circle feature
const createAccuracyCircle = (coordinate, accuracy) => {
  if (!props.showAccuracy) return null;
  
  const circleFeature = new Feature({
    geometry: new Point(coordinate)
  });
  
  circleFeature.setStyle(
    new Style({
      image: new CircleStyle({
        radius: accuracy / props.map.getView().getResolution(),
        fill: new Fill({
          color: 'rgba(66, 165, 245, 0.2)'
        }),
        stroke: new Stroke({
          color: 'rgba(66, 165, 245, 0.8)',
          width: 1.5
        })
      })
    })
  );
  
  return circleFeature;
};

// Create position marker feature
const createPositionMarker = (coordinate) => {
  if (!props.showMarker) return null;
  
  const markerFeature = new Feature({
    geometry: new Point(coordinate)
  });
  
  markerFeature.setStyle(
    new Style({
      image: new CircleStyle({
        radius: 6,
        fill: new Fill({
          color: '#4285F4'
        }),
        stroke: new Stroke({
          color: '#FFFFFF',
          width: 2
        })
      })
    })
  );
  
  return markerFeature;
};

// Handle successful geolocation
const handleGeolocationSuccess = (position) => {
  const coordinates = fromLonLat([
    position.coords.longitude,
    position.coords.latitude
  ]);
  
  const source = initGeolocationLayer();
  source.clear();
  
  // Add accuracy circle if enabled
  if (props.showAccuracy && position.coords.accuracy) {
    accuracyCircle.value = createAccuracyCircle(coordinates, position.coords.accuracy);
    source.addFeature(accuracyCircle.value);
  }
  
  // Add position marker if enabled
  if (props.showMarker) {
    positionMarker.value = createPositionMarker(coordinates);
    source.addFeature(positionMarker.value);
  }
  
  // Zoom to location if enabled
  if (props.zoomToLocation) {
    props.map.getView().animate({
      center: coordinates,
      zoom: props.zoomLevel,
      duration: 500
    });
  }
  
  emit('location-found', {
    coordinates,
    position,
    map: props.map
  });
};

// Handle geolocation error
const handleGeolocationError = (error) => {
  console.error('Geolocation error:', error);
  isLocating.value = false;
  isTracking.value = false;
  
  let errorMessage;
  switch (error.code) {
    case error.PERMISSION_DENIED:
      errorMessage = 'Geolocation permission denied.';
      break;
    case error.POSITION_UNAVAILABLE:
      errorMessage = 'Location information unavailable.';
      break;
    case error.TIMEOUT:
      errorMessage = 'The request to get location timed out.';
      break;
    default:
      errorMessage = 'An unknown error occurred.';
  }
  
  emit('location-error', {
    error,
    message: errorMessage
  });
};

// Stop tracking the user's location
const stopTracking = () => {
  if (watchId.value) {
    navigator.geolocation.clearWatch(watchId.value);
    watchId.value = null;
  }
  isTracking.value = false;
  isLocating.value = false;
  emit('tracking-stopped');
};

// Start tracking the user's location
const startTracking = () => {
  if (!navigator.geolocation) {
    handleGeolocationError({ code: 0, message: 'Geolocation not supported' });
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

// Locate the user (single shot or tracking)
const locateUser = () => {
  if (isTracking.value) {
    stopTracking();
    return;
  }
  
  if (!navigator.geolocation) {
    handleGeolocationError({ code: 0, message: 'Geolocation not supported' });
    return;
  }
  
  if (props.tracking) {
    startTracking();
    return;
  }
  
  isLocating.value = true;
  
  navigator.geolocation.getCurrentPosition(
    (position) => {
      isLocating.value = false;
      handleGeolocationSuccess(position);
    },
    handleGeolocationError,
    props.trackingOptions
  );
};

// Clean up on unmount
const cleanup = () => {
  stopTracking();
  if (geolocationLayer.value) {
    props.map.removeLayer(geolocationLayer.value);
  }
};

defineExpose({
  locateUser,
  stopTracking,
  startTracking
});
</script>

<style scoped>
.geolocation-button {
  position: fixed; /* ganti dari absolute ke fixed */
  top: 105px;
  right: 60px;
  color: #c2c1c0; 
  width: 50px;
  height: 50px;
  padding: 0;
  background: white;
  border: 2px solid rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.3s ease, border-color 0.3s ease, transform 0.2s ease;

  z-index: 1000; /* agar tidak ketindih */
}


.geolocation-button:hover {
  background-color: #f8f8f8;
  border-color: slateblue;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
  transform: translateY(-1px);
}

.geolocation-button:active {
  transform: translateY(0);
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.2);
}

.geolocation-button:disabled {
  cursor: wait;
  opacity: 0.7;
  transform: none !important;
}

.geolocation-button.is-locating {
  animation: pulse 1.5s infinite, colorPulse 3s infinite;
}

.icon {
  width: auto;
  height: auto;
  max-width: 30px;
  max-height: 30px;
  transition: transform 0.3s ease;
}

.geolocation-button:hover .icon {
  transform: scale(1.1);
}

.spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(66, 133, 244, 0.2); /* Lighter blue */
  border-radius: 50%;
  border-top-color: #4285F4;
  border-right-color: #4285F4;
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
  0% { border-color: rgba(0, 0, 0, 0.2); }
  50% { border-color: #4285F4; }
  100% { border-color: rgba(0, 0, 0, 0.2); }
}
</style>