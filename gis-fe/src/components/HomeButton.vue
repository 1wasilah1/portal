<script setup>
import { ref, onMounted, nextTick } from 'vue';
import Control from 'ol/control/Control';
import { fromLonLat } from 'ol/proj';

const props = defineProps({
  map: {
    type: Object,
    required: true
  }
});

const homeButton = ref(null);

const goToHome = () => {
  const defaultCenter = fromLonLat([106.8272, -6.1751]);
  const defaultZoom = 11;

  const view = props.map.getView();
  view.animate({
    center: defaultCenter,
    zoom: defaultZoom,
    duration: 1000
  });
};

onMounted(() => {
  nextTick(() => {
    const homeControl = new Control({
      element: homeButton.value,
    });
    props.map.addControl(homeControl);
  });
});
</script>

<template>
  <div ref="homeButton" class="myButtonDiv">
    <button class="myButton" @click="goToHome" title="Home"></button>
  </div>
</template>

<style scoped>
.myButton {
  background-color: white;
  background-image: url('../assets/home.svg');
  height: 40px;
  width: 40px;
  /* border-radius: 100%; */
  border: 2px solid transparent;
  background-position: center;
  background-repeat: no-repeat;
  background-size: 20px 20px;
  cursor: pointer;
}

.myButton:hover {
  border-color: slateblue;
  transition: border-color 500ms;
}

.myButtonDiv {
  top: 100px;
  left: 10px;
  position: absolute;
}
</style>
