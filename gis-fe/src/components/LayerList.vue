<script setup>
import { reactive, onMounted } from 'vue';

// Define props
const props = defineProps(['map', 'overlaygroup', 'layers']);

const layerData = reactive({
  overlayGroups: [], // This will hold the overlay group data
});

// Initialize and set feature counts
props.layers.forEach(layer => {
  const source = layer.getSource();

  // Update feature count on source change
  source.on('change', () => {
    if (source.getState() === 'ready') {
      const features = source.getFeatures();
      updateFeatureCount(layer, features.length);
    }
  });
});

function updateFeatureCount(layer, count) {
  layerData.overlayGroups.forEach(group => {
    const item = group.layers.find(l => l.layer === layer);
    if (item) {
      item.featureCount = count;
    }
  });
}

// Function to fetch layer names and create checklist items, excluding index 0
const fetchLayerNames = () => {
  layerData.overlayGroups = props.overlaygroup
    .slice(1) // Exclude the first overlay group (index 0)
    .map((group, index) => {
      const layers = group.getLayersArray().map(layer => ({
        text: layer.get('title') || 'Unnamed Layer', // Get the layer name
        checked: layer.getVisible(), // Initialize with current visibility
        layer, // Store reference to the layer for visibility toggle
        featureCount: 0, // Initialize feature count
      }));

      return {
        title: group.get('title') || `Group ${index + 1}`, // Use group title or index
        layers, // Layers for the group
        isCollapsed: true, // Initial collapse state
      };
    });
};

// Toggle collapse state
const toggleCollapse = (group) => {
  group.isCollapsed = !group.isCollapsed;
};

// Toggle layer visibility based on checkbox
const toggleLayerVisibility = (layer, isVisible) => {
  layer.setVisible(isVisible);

  // Reset feature count to zero if layer is hidden
  if (!isVisible) {
    updateFeatureCount(layer, 0);
  } else {
    // If layer is visible, update the count with actual features
    const source = layer.getSource();
    const features = source.getFeatures();
    updateFeatureCount(layer, features.length);
  }
};


// Log the check status
const logCheckStatus = (item) => {
  if (item.checked) {
    console.log(`${item.text} checked`);
  } else {
    console.log(`${item.text} unchecked`);
  }
};

// Handle the toggle for all items in the group
const toggleAllItems = (group, checked) => {
  group.layers.forEach(item => {
    item.checked = checked;
    toggleLayerVisibility(item.layer, checked); // Update visibility of each layer
  });
};

// Lifecycle hook to fetch layer names when component is mounted
onMounted(() => {
  fetchLayerNames();
});
</script>

<template>
  <div class="layer-list">
    <div v-for="(group, groupIndex) in layerData.overlayGroups" :key="groupIndex">
      <!-- Heading now only collapses when the heading itself is clicked -->
      <h2 @click="toggleCollapse(group)" class="collapsible-heading">
        <input 
          type="checkbox"
          :checked="group.layers.every(item => item.checked)"
          @click.stop="toggleAllItems(group, $event.target.checked)" 
        /> <!-- Checkbox in header; using @click.stop to prevent collapse -->
        {{ group.title }}
        <i :class="group.isCollapsed ? 'fas fa-chevron-down' : 'fas fa-chevron-up'"></i>
      </h2>
      <ul v-if="!group.isCollapsed">
        <li v-for="(item, index) in group.layers" :key="index">
          <label class="item-label">
            <input type="checkbox" 
                   v-model="item.checked" 
                   @change="toggleLayerVisibility(item.layer, item.checked);" />
            <span class="text">{{ item.text }}</span>
          </label>
          <span>{{ item.featureCount || '' }}</span>
          <span
            class="color-swatch"
            :style="{ backgroundColor: item.layer.getStyle().getImage().getFill().getColor() }"
          ></span>
        </li>
      </ul>
    </div>
  </div>
</template>


<style scoped>
.layer-list {
  position: absolute;
  z-index: 2;
  top: 60px;
  left: 60px;
  width: 380px;
  max-height: 70%;
  background-color: white;
  text-align: left;
  border-radius: 15px;
  overflow-y: auto;
}

h2 {
  padding: 10px;
  font-size: 1.2rem;
  background-color: #ebebeb;
  margin: 0;
  width: 100%; /* Ensure it takes the full width */
  box-sizing: border-box; /* Include padding in width calculation */
}

h2 i {
  font-size: 1rem;
}

.collapsible-heading {
  cursor: pointer;
  display: flex;
  justify-content: space-between; /* Ensure space between title and icon */
  align-items: center; /* Center items vertically */
  width: 100%; /* Ensure the heading takes the full width */
}

ul {
  margin: 0; /* Remove margin */
  padding: 0 10px; /* Keep padding for list items */
  list-style-type: none;
}

li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 5px 0;
}

/* Style for the label and text */
.item-label {
  display: flex;
  align-items: center;
  flex: 1;
  overflow: hidden; /* Ensure overflow is clipped within this container */
}

.text {
  margin: 0 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1; /* Allow text to take up remaining space within label */
  min-width: 0; /* Prevents flexbox from forcing full width on text */
}

/* Style for the color swatch */
.color-swatch {
  width: 15px;
  height: 15px;
  border-radius: 50%;
  margin-left: 10px;
  flex-shrink: 0;
}

</style>
