<template>
  <div class='header-container'>
    <button id="logo-perumahan" @click="navigate('/')" class="btn rounded-circle logo" title="SIGAP Kumuh">
      <img src="/rumahjakarta.svg" class="icon" alt="Logo"></img>
    </button>
    <!-- <img src="/rumahjakarta.svg" alt="Rumah Jakarta" class="title-container title-image" /> -->
    <span class='title-container'>SIGAP Kumuh</span>
  </div>
  <div id="app">
    <MapApp />
  </div>
</template>

<script setup>
import { reactive } from 'vue';
import MapApp from './components/MapApp.vue';

const navigate = (url) => {
  location.href = url;
};
</script>

<style>
.header-container {
  display: flex;
  position: absolute;
  align-items: center;
  top: 10px;
  left: 10px;
  right: 10px;
  z-index: 1;
  gap: 10px;
}

#logo-perumahan {
  margin-left: 0px;
  z-index: 2;
}

.title-image {
  height: 40px;
  margin-left: -20px;
}

.title-container {
  background-color: rgba(255,255,255,0.82);
  font-size: 20px;
  border-radius: 10px;
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  color: #00cdff;
  padding: 3px 15px 3px 15px;
  margin-left: -20px;
  box-shadow: 3px 3px 6px rgba(0,0,0,0.12);
}

/* .btn i {
  color: darkslateblue;
} */

.btn.logo,
.btn.logo:active:focus {
  background-color: white;
  margin-left: 10px;
  width: 40px; 
  height: 40px;
  border: 2px solid transparent;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 2px 2px 4px rgba(0,0,0,0.1);
}

.btn.logo:hover {
  background-color: white;
  border-color: slateblue;
  transition: all 500ms;
}

.icon {
  height: 25px;
}
</style>
