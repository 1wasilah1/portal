<template>
    <div id="map" class="map"></div>
    
    <!-- Authentication Status Alerts -->
    <div v-if="authStatus" class="auth-alert" :class="authStatus">
        <div class="alert-content">
            <span class="alert-icon">{{ getAlertIcon() }}</span>
            <span class="alert-text">{{ getAlertText() }}</span>
            <button @click="closeAuthAlert" class="alert-close">×</button>
        </div>
    </div>
      <MapEditor />
    <div class="tools">
        <button @click="toggleLayerList" id="btn-layer-list" class="btn rounded-circle logo" title="Daftar Data">
            <img v-if="!isLayerListVisible" :src="visibleIcon" alt="Show Layer List" class="icon"/>
            <i v-else class="fas fa-times icon-close"></i>
        </button>
    </div>
    <div>
        <button @click="toggleBasemapList" class="btn-basemap">
            <img :src="selectedBasemapImage" alt="Selected Basemap" />
        </button>
    </div>
    <div>
        <MousePosition v-if="mapInstance" :map="mapInstance" />
        <ZoomButton v-if="mapInstance" :map="mapInstance" />
        <HomeButton v-if="mapInstance" :map="mapInstance" />
        <MapEditor v-if="mapInstance" :map="mapInstance" />
        <FeatureInfo v-if="mapInstance && overlayGroups" :map="mapInstance" :overlaygroup="overlayGroups" />
        <LayerList v-if="mapInstance && overlayGroups && isLayerListVisible" :map="mapInstance" :overlaygroup="overlayGroups" :layers="vectorLayers" />
        <BasemapList v-if="mapInstance && overlayGroups && isBasemapListVisible"
                     :map="mapInstance"
                     :overlaygroup="overlayGroups"
                     :isvisible="isBasemapListVisible"
                     @update:activeBasemapImage="selectedBasemapImage = $event"
                     @close="isBasemapListVisible = false"/>
        <SearchFeature v-if="mapInstance && overlayGroups" :map="mapInstance" :overlaygroup="overlayGroups" :layers="vectorLayers" />
        <FullscreenToggle v-if="mapInstance" />
        <!-- <pdf v-if="mapInstance" :mapContainerId="'map'" :fileName="'map-export.pdf'" :pdfTitle="'Map Export'" /> -->
        <Header v-if="mapInstance" />
        <geolocation v-if="mapInstance"
                     :map="mapInstance"
                     :zoomToLocation="true"
                     :showAccuracy="true"
                     :showMarker="true"
                     :zoomLevel="17"
                     :tracking="false"
                     :trackingOptions="{ maximumAge: 10000, timeout: 6000, enableHighAccuracy: true }"
                     @location-found="emit('location-found', $event)"
                     @location-error="emit('location-error', $event)"
                     @tracking-started="emit('tracking-started')"
                     @tracking-stopped="emit('tracking-stopped')" />
    </div>
        <!-- <Sidebar v-if="mapInstance && overlayGroups" :map="mapInstance" :overlaygroup="overlayGroups" /> -->
</template>

<script setup>
import 'ol/ol.css';

import { ref, onMounted, provide } from 'vue';
import { Map, View } from 'ol';
import { ScaleLine } from 'ol/control.js';
import { Tile as TileLayer } from 'ol/layer.js';
import { fromLonLat } from 'ol/proj.js';
import { TileWMS } from 'ol/source.js';

//add mapeditor
import MapEditor from './mapeditor.vue';


import Header from './Header.vue';
import MousePosition from './MousePosition.vue';
import ZoomButton from './ZoomButton.vue';
import HomeButton from './HomeButton.vue';
import FullscreenToggle from './fullscreen.vue';
// import pdf from './pdf.vue';
import FeatureInfo from './FeatureInfo.vue';
import LayerList from './LayerList.vue';
import BasemapList from './BasemapList.vue';
import SearchFeature from './SearchFeature.vue';
import Geolocation from './geolocation.vue';

import { fetchLayer } from './fetchLayer.js'

import layerGroupIcon from '../assets/layers-group.svg';
import defaultBasemap from '../assets/basemap0.png';
// import Sidebar from './Sidebar.vue';

const mapInstance = ref(null);
const overlayGroups = ref(null);
const vectorLayers = ref(null);
const isLayerListVisible = ref(false);
const isBasemapListVisible = ref(false);
const selectedBasemapImage = ref(defaultBasemap);
const authStatus = ref(null); // 'internal', 'external', 'public'
const userData = ref(null); // Store user data from SSO API
const username = ref(null); // Store username from backend

const visibleIcon = layerGroupIcon

const toggleLayerList = () => {
    isLayerListVisible.value = !isLayerListVisible.value;
};
const toggleBasemapList = () => {
    isBasemapListVisible.value = !isBasemapListVisible.value;
};

// Helper function to get cookie value
const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
};

// Helper function to delete cookie
const deleteCookie = (name) => {
    document.cookie = name + '=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
};

const closeAuthAlert = async () => {
    const currentAuthStatus = authStatus.value;
    authStatus.value = null;
    
    // If internal user, call SSO logout and clear cookies
    if (currentAuthStatus === 'internal') {
        try {
            // Call SSO API logout
            const response = await fetch('https://10.15.38.162:3100/api/sso/v1/auth/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include'
            });

            if (response.ok) {
                console.log('SSO logout successful');
            } else {
                console.log('SSO logout failed:', response.status);
            }
        } catch (error) {
            console.error('SSO logout error:', error);
        }
        
        // Clear client-side cookies
        deleteCookie('admin_login');
        deleteCookie('admin_login_time');
        deleteCookie('refreshToken');
        deleteCookie('accessToken');
        
        // Clear localStorage
        localStorage.removeItem('adminLoginStatus');
        localStorage.removeItem('adminLoginTime');
    }
    
    // If external user, clear localStorage
    if (currentAuthStatus === 'external') {
        localStorage.removeItem('userEmail');
    }
};

const getAlertIcon = () => {
    switch (authStatus.value) {
        case 'internal': return '👤';
        case 'external': return '👥';
        case 'public': return '🌐';
        default: return '👤';
    }
};

const getAlertText = () => {
    console.log('=== ALERT TEXT DEBUG ===');
    console.log('Auth status:', authStatus.value);
    console.log('Username value:', username.value);
    console.log('User data value:', userData.value);
    
    switch (authStatus.value) {
        case 'internal': 
            if (username.value) {
                const text = `Login sebagai internal (${username.value})`;
                console.log('Internal alert text:', text);
                return text;
            }
            console.log('Internal alert text: Login sebagai internal (no username)');
            return 'Login sebagai internal';
        case 'external': 
            console.log('External alert text: Login sebagai external');
            return 'Login sebagai external';
        case 'public': 
            console.log('Public alert text: Akses public');
            return 'Akses public';
        default: 
            console.log('Default alert text: Login sebagai internal');
            return 'Login sebagai internal';
    }
};

onMounted(async () => {
    // Check authentication status
    let isInternal = false;
    let isExternal = false;
    
    // Check for internal authentication (HTTP-only cookies)
    try {
       // console.log('Making request to /admin/verify');
       // console.log('Current location:', window.location.href);
       // console.log('Current origin:', window.location.origin);
        
        // Use proxy URL for admin verification
       // let response;
       // let usedUrl = '/admin/verify';
        
       // console.log('Using proxy URL:', usedUrl);
      //  response = await fetch(usedUrl, {
      //      method: 'GET',
      //      credentials: 'include', // Include cookies
       //     headers: {
        //        'Content-Type': 'application/json'
         //   }
        //});
        
        //console.log('Used URL:', usedUrl);
        
        //console.log('Response status:', response.status);
        //console.log('Response ok:', response.ok);
        //console.log('Response headers:', response.headers);
        
        if (response.ok) {
            const data = await response.json();
            console.log('=== BACKEND RESPONSE DEBUG ===');
            console.log('Backend response:', data);
            console.log('Response data type:', typeof data);
            console.log('Response data keys:', Object.keys(data));
            console.log('Is admin:', data.isAdmin);
            console.log('Username in response:', data.username);
            console.log('User data in response:', data.userData);
            console.log('Development mode:', data.developmentMode);
            console.log('SSO authenticated:', data.ssoAuthenticated);
            console.log('================================');
            
            if (data.isAdmin) {
                isInternal = true;
                userData.value = data.userData; // Store user data from SSO API
                username.value = data.username; // Store username from backend
                console.log('=== INTERNAL USER DEBUG ===');
                console.log('Internal user authenticated:', data);
                console.log('User data stored:', userData.value);
                console.log('Username from backend:', data.username);
                console.log('Username stored in ref:', username.value);
                console.log('Auth status set to:', authStatus.value);
                console.log('================================');
            } else {
                console.log('Not admin, reason:', data.reason);
            }
        } else {
            console.log('Backend response not ok:', response.status);
        }
    } catch (error) {
        console.error('Error checking internal status:', error);
        console.error('Request URL was:', '/admin/verify');
        console.error('Full error details:', error.message);
        // Fallback to client-side cookie check
        const adminLoginStatus = getCookie('admin_login');
        const adminLoginTime = getCookie('admin_login_time');
        const refreshToken = getCookie('refreshToken');
        const accessToken = getCookie('accessToken');
        
        console.log('Client-side cookie check:');
        console.log('- admin_login:', adminLoginStatus);
        console.log('- admin_login_time:', adminLoginTime);
        console.log('- refreshToken:', refreshToken ? 'exists' : 'not found');
        console.log('- accessToken:', accessToken ? 'exists' : 'not found');
        console.log('- All cookies:', document.cookie);
        
        if (adminLoginStatus === 'true' && adminLoginTime) {
            const loginTime = new Date(adminLoginTime);
            const now = new Date();
            const timeDiff = now.getTime() - loginTime.getTime();
            const hoursDiff = timeDiff / (1000 * 60 * 60);
            
            if (hoursDiff < 24) {
                isInternal = true;
            } else {
                deleteCookie('admin_login');
                deleteCookie('admin_login_time');
            }
        }
    }
    
    // Check for external authentication (localStorage)
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
        isExternal = true;
        console.log('External user found:', userEmail);
    }
    
    // Set authentication status
    console.log('=== AUTH STATUS SETTING ===');
    console.log('Is internal:', isInternal);
    console.log('Is external:', isExternal);
    console.log('Username value before setting:', username.value);
    
    if (isInternal) {
        authStatus.value = 'internal';
        console.log('Set auth status to: internal');
    } else if (isExternal) {
        authStatus.value = 'external';
        console.log('Set auth status to: external');
    } else {
        authStatus.value = 'public';
        console.log('Set auth status to: public');
    }
    
    console.log('Final auth status:', authStatus.value);
    console.log('Final username value:', username.value);
    console.log('================================');
    
    mapInstance.value = new Map({
        target: 'map',
        view: new View({
        center: fromLonLat([106.8272, -6.1751]), // Jakarta
        zoom: 11,
        maxZoom: 18,
        minZoom: 8,
        }),
        controls: [],
    });

    // Add click event listener to map
   // mapInstance.value.on('click', (event) => {
    //    // Get coordinates from click event
     //   const coordinates = mapInstance.value.getCoordinateFromPixel(event.pixel);
      //  const lonLat = fromLonLat(coordinates, 'EPSG:4326');
        
      //  // Convert to latitude and longitude
      //  const longitude = coordinates[0];
       // const latitude = coordinates[1];
        
        // Check if user is logged in
       // const userEmail = localStorage.getItem('userEmail');
        
       // if (userEmail) {
            // User is logged in, save coordinates and redirect to progress page
       //     const coordData = {
        //        lat: latitude,
                // lng: longitude
        //    };
         //   localStorage.setItem('coordinates', JSON.stringify(coordData));
         //   window.location.href = '/login/citizen/progress';
        //} else {
            // User is not logged in, redirect to register page with coordinates
         //   const loginUrl = `/login/citizen/register?lat=${latitude}&lng=${longitude}`;
          //  window.location.href = loginUrl;
       // }
    //});

    mapInstance.value.addControl(new ScaleLine({ bar: true, text: false }));
    overlayGroups.value = await fetchLayer();
    overlayGroups.value.forEach(group => mapInstance.value.addLayer(group));
    vectorLayers.value = overlayGroups.value.flatMap(group =>
        group.getLayersArray().filter(layer => !(layer instanceof TileLayer)));
});

</script>

<style scoped>
#map {
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100vh;
    transition: all 500ms ease-out;
}

.auth-alert {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1000;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    animation: slideIn 0.3s ease-out;
    max-width: 300px;
}

.auth-alert.internal {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.auth-alert.external {
    background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
    color: white;
}

.auth-alert.public {
    background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
    color: white;
}

.alert-content {
    display: flex;
    align-items: center;
    gap: 10px;
}

.alert-icon {
    font-size: 18px;
}

.alert-text {
    flex: 1;
    font-weight: 500;
    font-size: 14px;
}

.alert-close {
    background: none;
    border: none;
    color: white;
    font-size: 20px;
    cursor: pointer;
    padding: 0;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background-color 0.2s;
}

.alert-close:hover {
    background-color: rgba(255, 255, 255, 0.2);
}

@keyframes slideIn {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

.btn-basemap {
    border: 0;
    border-radius: 10px;
    width: 10vw;
    max-width: 55px;
    height: 10vw;
    max-height: 55px;
    aspect-ratio: 1 / 1;
    right: 1vw;
    bottom: 1vh;
    z-index: 998;
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: white;
    box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.2);
}

.btn-basemap img {
    border: 2px solid white;
    width: 50px;               /* Keep the image dimensions */
    height: 50px;
    border-radius: 10px;
}

.btn-basemap:hover img {
    border-color: darkslateblue;
    transition: all 500ms;
}

.btn.logo,
.btn.logo:active:focus {
  background-color: white;
  margin-left: 0.5vw;
  width: 10vw;
  height: 10vw;
  max-width: 40px;
  max-height: 40px;
  border-radius: 50%;
  border: 2px solid transparent;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.1);
}

.btn.logo:hover {
  background-color: white;
  border-color: slateblue;
  transition: all 500ms;
}

.icon {
  height: 4vw;
  max-height: 20px;
  width: auto;
}

.tools {
    position: absolute;
    z-index: 1;
    top: 150px;
    left: 0px;
}

/* Responsif tambahan untuk layar kecil */
@media (max-width: 768px) {
  .btn.logo {
    width: 12vw;
    height: 12vw;
  }

  .icon {
    height: 5vw;
  }

  .tools {
    top: 22vh;
    left: 2vw;
  }

  :deep(.ol-zoom-in),
  :deep(.ol-zoom-out) {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .btn.logo {
    width: 14vw;
    height: 14vw;
  }

  .icon {
    height: 6vw;
  }
}
</style>
