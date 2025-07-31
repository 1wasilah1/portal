<template>
  <div id="app">
    <MapApp />
  </div>
</template>
<script setup>
import MapApp from './components/MapApp.vue';

const navigate = (url) => {
  location.href = url;
};
</script>
