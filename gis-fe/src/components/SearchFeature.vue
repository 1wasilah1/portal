<template>
  <div class="search-container">
    <div class="search-wrapper">
      <input
        type="text"
        v-model="searchQuery"
        @input="onInput"
        placeholder="Cari..."
        class="search-box"
      />
      <button class="search-button" @click="onSearch">
        <i class="fa fa-search"></i>
      <!-- 🔍 -->
      </button>
    </div>
  </div>
  <div class="suggestions-container" v-if="suggestions.length">
    <table class="suggestions-table">
      <thead>
        <tr>
          <th>Nama layer</th>
          <th>Nama objek</th>
          <th>Atribut dicari</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(suggestion, index) in suggestions"
          :key="index"
          @click="selectSuggestion(suggestion)"
        >
          <td>{{ suggestion.layerName }}</td>
          <td>{{ suggestion.namobj }}</td>
          <td>{{ suggestion.matchedAttributes.join(', ') }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
// import { transform } from 'ol/proj';
import { Point, LineString, Polygon, MultiLineString } from 'ol/geom';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Style, Fill, Stroke, Circle as CircleStyle } from 'ol/style';
import { Feature } from 'ol';
import { boundingExtent } from 'ol/extent';

const searchQuery = ref('');
const suggestions = ref([]);
const allSuggestions = ref([]);
const tempVectorLayers = ref([]); // Array to hold temporary layers

const props = defineProps(['map', 'overlaygroup', 'layers']);

const getData = () => {
  const allSuggestionsData = [];
  props.layers.forEach(layer => {
    const source = layer.getSource();
    source.on('change', () => {
        if (source.getState() === 'ready') {
            const features = source.getFeatures();
            const layerSuggestions = features.map(feature => {
                const properties = feature.getProperties();
                return {
                    layerName: feature.getId()?.split('.')[0] || '',
                    namobj: properties.namobj || '',
                    geometry: feature.getGeometry(),
                    properties: properties,
                };
            });
            allSuggestionsData.push(...layerSuggestions);
        };
    });
    allSuggestions.value = allSuggestionsData;
  });
};


// const fetchWFSData = async () => {
//   const baseURL = 'https://sigita-csw.dephub.go.id/kemenhub/wfs';
//   const commonParams = 'service=WFS&version=1.1.0';

//   try {
//     const capabilitiesResponse = await fetch(`${baseURL}?${commonParams}&request=GetCapabilities`);
//     if (!capabilitiesResponse.ok) {
//       throw new Error(`Failed to fetch capabilities: ${capabilitiesResponse.statusText}`);
//     }

//     const capabilitiesText = await capabilitiesResponse.text();
//     const parser = new DOMParser();
//     const xmlDoc = parser.parseFromString(capabilitiesText, 'text/xml');
//     const typeNames = Array.from(xmlDoc.getElementsByTagName('Name')).map(node => node.textContent);

//     const allSuggestionsData = [];

//     for (const typeName of typeNames) {
//       const response = await fetch(`${baseURL}?${commonParams}&request=GetFeature&typename=${typeName}&outputFormat=application/json`);
//       if (!response.ok) {
//         console.error(`Failed to fetch data for ${typeName}: ${response.statusText}`);
//         continue;
//       }

//       const data = await response.json();
//       const layerSuggestions = data.features.map(feature => ({
//         layerName: feature.id.split('.')[0],
//         namobj: feature.properties.namobj || '',
//         geometry: feature.geometry,
//         properties: feature.properties,
//       }));

//       allSuggestionsData.push(...layerSuggestions);
//     }

//     allSuggestions.value = allSuggestionsData;
//   } catch (error) {
//     console.error("Error fetching WFS data:", error);
//   }
// };

const onInput = () => {
  if (searchQuery.value.length > 1) {
    suggestions.value = allSuggestions.value
      .map(feature => {
        const matchedAttributes = Object.entries(feature.properties)
          .filter(([, value]) =>
            value && value.toString().toLowerCase().includes(searchQuery.value.toLowerCase())
          )
          .map(([, value]) => value);

        if (matchedAttributes.length > 0) {
          return {
            layerName: feature.layerName,
            namobj: feature.namobj,
            matchedAttributes: matchedAttributes,
            geometry: feature.geometry,
          };
        }
        return null;
      })
      .filter(Boolean);
  } else {
    suggestions.value = [];
  }
};

const onSearch = () => {
  const featureList = suggestions.value;
  suggestions.value = []; // Clear suggestions after search
  clearTempVectorLayers(); // Clear all temporary layers
  featureList.forEach(suggestion => {
    addTempVectorLayer(suggestion);
  });
  zoomToAllTempLayers(); // Zoom to all temporary layers after adding them
};

const selectSuggestion = (suggestion) => {
  searchQuery.value = suggestion.namobj; // Set the search input to the selected suggestion
  suggestions.value = []; // Clear suggestions after selection
  clearTempVectorLayers(); // Clear all temporary layers
  addTempVectorLayer(suggestion); // Add new layer for the selected suggestion
  zoomToAllTempLayers(); // Zoom to the selected suggestion's layer
};

const addTempVectorLayer = (suggestion) => {
  if (suggestion.geometry) {
    // Create a new vector layer for the selected suggestion
    const newLayer = new VectorLayer({
      source: new VectorSource(),
      style: new Style({
        stroke: new Stroke({
          color: 'rgba(255, 255, 0, 0.8)',
          width: 8,
        }),
        fill: new Fill({
          color: 'rgba(255, 255, 0, 0.3)',
        }),
        image: new CircleStyle({
          radius: 8,
          fill: new Fill({ color: 'rgba(255, 255, 0, 0.8)' }),
        }),
      }),
    });

    let featureGeometry;

    try {
      switch (suggestion.geometry.getType()) {
        case 'Point':
          featureGeometry = new Point(suggestion.geometry.getCoordinates());
          break;
        case 'LineString':
          featureGeometry = new LineString(suggestion.geometry.getCoordinates().map(coord => coord));
          break;
        case 'Polygon':
          featureGeometry = new Polygon([suggestion.geometry.getCoordinates()[0].map(coord => coord)]);
          break;
        case 'MultiLineString':
          featureGeometry = new MultiLineString(suggestion.geometry.getCoordinates().map(lineCoords => lineCoords.map(coord => coord)));
          break;
        default:
          console.warn(`Unsupported geometry type: ${suggestion.geometry.getType()}`);
          return;
      }
      
      const feature = new Feature(featureGeometry);
      newLayer.getSource().addFeature(feature);
      const extent = featureGeometry.getExtent();
      if (extent) {
        props.map.addLayer(newLayer);
        tempVectorLayers.value.push(newLayer);
      }
    } catch (error) {
      console.error("Error with feature geometry:", error);
    }
  }
  return tempVectorLayers.value; // Return the array of temporary layers
};

const clearTempVectorLayers = () => {
  tempVectorLayers.value.forEach(layer => {
    props.map.removeLayer(layer);
    layer.getSource().clear();
  });
  tempVectorLayers.value = []; // Reset the array of temporary layers
};

const zoomToAllTempLayers = () => {
  if (!tempVectorLayers.value || tempVectorLayers.value.length === 0) {
    return;
  }

  let outerExtent = null;

  tempVectorLayers.value.forEach(layer => {
    const layerExtent = layer.getSource().getExtent();
    console.log("Layer extent:", layerExtent);
    outerExtent = outerExtent ? boundingExtent([outerExtent, layerExtent]) : layerExtent;
  });

  console.log("Combined outer extent before buffering:", outerExtent);

  if (outerExtent) {
    const buffer = 200; // Increase buffer size if necessary
    const minX = outerExtent[0] - buffer;
    const minY = outerExtent[1] - buffer;
    const maxX = outerExtent[2] + buffer;
    const maxY = outerExtent[3] + buffer;
    const bufferedExtent = [minX, minY, maxX, maxY];

    console.log("Buffered outer extent:", bufferedExtent);

    props.map.getView().fit(bufferedExtent, {
      duration: 1000,
    });
  }
};

const onMapClick = () => {
  clearTempVectorLayers(); // Clear layers on map click
};

onMounted(() => {
  getData();
  // fetchWFSData(); // Fetch WFS data on mount
  props.map.on('click', onMapClick); // Add map click event listener
});

onBeforeUnmount(() => {
  props.map.un('click', onMapClick); // Clean up event listener before unmount
});
</script>

<style scoped>
.search-container {
  position: absolute;
  z-index: 2;
  top: 15px;
  right: 50px;
  width: 35%;
  max-width: 250px;
}
.search-wrapper {
  display: flex;
  align-items: center;
  width: 100%;
}
.search-box {
  flex: 1;
  min-width: 0;
  padding: 5px 10px;
  border: 0px solid #ddd;
  border-radius: 25px 0 0 25px;
  box-shadow: inset 0px 0px 5px rgba(0, 0, 0, 0.1);
  outline: none;
  font-size: 16px;
  transition: box-shadow 0.3s ease;
}
.search-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px 10px;
  border: 0px;
  border-left: none;
  border-radius: 0 25px 25px 0;
  background-color: #f0f0f0;
  cursor: pointer;
}
.suggestions-container {
  position: absolute;
  z-index: 2;
  top: 50px;
  right: 50px;
  width: 73%;
  max-height: 75%;
  overflow-y: auto;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 5px;
}
.suggestions-table {
  width: 100%;
  border-collapse: collapse;
}
.suggestions-table th,
.suggestions-table td {
  padding: 10px;
  text-align: left;
}
.suggestions-table th {
  background-color: #f2f2f2;
}
.suggestions-table tr:hover {
  background-color: #f5f5f5;
}
</style>
