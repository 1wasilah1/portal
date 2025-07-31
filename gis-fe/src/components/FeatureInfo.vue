<template>
  <div>
    <!-- POPUP -->
    <div ref="popupRef" id="popup" class="ol-popup">
      <a href="#" class="ol-popup-closer" @click.prevent="closePopup">×</a>
      <div v-if="popupData">
        <div class="popup-header">
          <h4>{{ popupData.layerName }}</h4>
        </div>
        <div class="popup-body" style="text-align: left">
          <p><strong>ID:</strong> {{ popupData.id }}</p>
          <p><strong>Nama:</strong> {{ popupData.nama }}</p>
          <p><strong>Keterangan:</strong> {{ popupData.keterangan }}</p>
          <img v-if="popupData.foto" :src="popupData.foto" alt="foto" class="popup-image" />
        </div>
        <div class="popup-footer">
          <button @click="openSlide" class="detail-button">Lihat Detail</button>
        </div>
      </div>
    </div>

    <!-- SLIDE DETAIL -->
    <div v-if="isSlideOpen" class="slide-detail" style="text-align: left;">
      <div class="slide-header">
        <h3>Detail Fitur</h3>
        <button @click="isSlideOpen = false" class="close-slide">×</button>
      </div>
      <div class="slide-content">
        <table v-if="slideData && Object.keys(slideData).length" class="detail-table">
          <tbody>
            <tr v-for="(val, key) in slideData" :key="key">
              <td class="key-cell"><strong>{{ formatKey(key) }}</strong></td>
              <td class="val-cell">{{ val }}</td>
            </tr>
          </tbody>
        </table>
        <p v-else>Tidak ada data.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Overlay from 'ol/Overlay';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Style, Stroke, Fill } from 'ol/style';
import { getCenter } from 'ol/extent';

// Format key agar tampil rapi di tabel
const formatKey = (key) => {
  return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const highlightSource = new VectorSource();

const highlightLayer = new VectorLayer({
  source: highlightSource,
  style: new Style({
    stroke: new Stroke({ color: '#FF0000', width: 3 }),
    fill: new Fill({ color: 'rgba(255, 0, 0, 0.1)' })
  })
});

const props = defineProps({ map: Object });

const popupRef = ref(null);
const popupData = ref(null);
const slideData = ref(null);
const isSlideOpen = ref(false);
let popupOverlay;

const closePopup = () => {
  popupOverlay?.setPosition(undefined);
  popupData.value = null;
  isSlideOpen.value = false;
};

const openSlide = () => {
  isSlideOpen.value = true;
};

const highlightAndZoomToFeature = (feature) => {
  if (!feature) return;

  highlightSource.clear();
  highlightSource.addFeature(feature);

  const geometry = feature.getGeometry();
  const extent = geometry.getExtent();
  const isMobile = window.innerWidth <= 600;
  const padding = isMobile ? [50, 50, 300, 50] : [80, 80, 100, 80];

  props.map.getView().fit(extent, {
    maxZoom: 18,
    duration: 500,
    padding: padding
  });

  props.map.once('moveend', () => {
    const coord = geometry.getType() === 'Point'
      ? geometry.getCoordinates()
      : geometry.getInteriorPoint().getCoordinates();
    popupOverlay.setPosition(coord);
  });
};

onMounted(() => {
  popupOverlay = new Overlay({
    element: popupRef.value,
    autoPan: true,
    autoPanAnimation: { duration: 250 }
  });

  props.map.addOverlay(popupOverlay);
  props.map.addLayer(highlightLayer);

  props.map.on('singleclick', function (evt) {
  const features = [];

  props.map.forEachFeatureAtPixel(evt.pixel, (feature, layer) => {
    features.push({ feature, layer });
  }, { hitTolerance: 5 });

  const priorityOrder = ['Point', 'LineString', 'MultiLineString', 'Polygon', 'MultiPolygon'];

  // Urutkan fitur berdasarkan tipe geometri
  features.sort((a, b) => {
    const typeA = a.feature.getGeometry().getType();
    const typeB = b.feature.getGeometry().getType();
    return priorityOrder.indexOf(typeA) - priorityOrder.indexOf(typeB);
  });

  const selected = features[0];

  if (selected) {
    const propsF = selected.feature.getProperties();
    const cleaned = { ...propsF };
    delete cleaned.geometry;
    delete cleaned.geom;

    slideData.value = cleaned;

    highlightAndZoomToFeature(selected.feature);

    popupData.value = {
      layerName: selected.layer?.get('title') || '',
      id: propsF.id || '-',
      nama: propsF.nama || propsF.name || propsF.namobj || propsF.namaobj || propsF.NAMAOBJ || propsF.KIB || '-',
      keterangan: propsF.keterangan || propsF.deskripsi || propsF.symbology || '-',
      foto: propsF.foto || propsF.image || null
    };

    popupOverlay.setPosition(evt.coordinate);
  } else {
    closePopup();
  }
});
});
</script>

<style scoped>
.ol-popup {
  max-width: 90vw;
  transform: translate(-50%, -100%);
  position: absolute;
  background-color: white;
  border-radius: 10px;
  padding: 12px;
  min-width: 250px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}
.ol-popup-closer {
  position: absolute;
  top: 5px;
  right: 10px;
  font-size: 18px;
  font-weight: bold;
  color: #999;
  cursor: pointer;
}
.popup-header h4 {
  margin: 0 0 10px;
}
.popup-image {
  width: 100%;
  border-radius: 4px;
  margin-top: 8px;
}
.detail-button {
  margin-top: 10px;
  padding: 6px 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
.detail-button:hover {
  background-color: #0056b3;
}

/* Slide Detail */
.slide-detail {
  position: fixed;
  right: 0;
  top: 0;
  width: 350px;
  height: 100vh;
  background: white;
  border-left: 1px solid #ccc;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
  z-index: 999;
}
.slide-header {
  padding: 12px;
  background: #f0f0f0;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
}
.slide-content {
  padding: 12px;
  overflow-y: auto;
  height: calc(100% - 50px);
}

.detail-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 8px;
}
.detail-table td {
  padding: 6px 8px;
  border-bottom: 1px solid #ddd;
  vertical-align: top;
}
.key-cell {
  font-weight: bold;
  width: 35%;
  text-transform: capitalize;
}
</style>
