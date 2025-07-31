<template>
  <button
    class="fullscreen-toggle"
    :class="{ 'is-fullscreen': isFullscreen }"
    @click="toggleFullscreen"
    :aria-label="isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'"
    title="Toggle fullscreen"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path v-if="!isFullscreen" d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2 2v-3M3 16v3a2 2 0 0 0 2 2h3" />
      <path v-else d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
    </svg>
  </button>
</template>

<script>
export default {
  name: 'FullscreenToggle',
  data() {
    return {
      isFullscreen: false
    }
  },
  mounted() {
    this.setupEventListeners();
  },
  beforeDestroy() {
    this.cleanupEventListeners();
  },
  methods: {
    setupEventListeners() {
      document.addEventListener('fullscreenchange', this.handleFullscreenChange);
      document.addEventListener('webkitfullscreenchange', this.handleFullscreenChange);
      document.addEventListener('mozfullscreenchange', this.handleFullscreenChange);
      document.addEventListener('MSFullscreenChange', this.handleFullscreenChange);
    },
    cleanupEventListeners() {
      document.removeEventListener('fullscreenchange', this.handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', this.handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', this.handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', this.handleFullscreenChange);
    },
    toggleFullscreen() {
      if (!this.isFullscreen) {
        this.enterFullscreen();
      } else {
        this.exitFullscreen();
      }
    },
    enterFullscreen() {
      const element = document.documentElement;
      
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
      } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
      } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
      }
    },
    exitFullscreen() {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    },
    handleFullscreenChange() {
      this.isFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
      
      this.$emit('fullscreen-change', this.isFullscreen);
      this.updateLeafletMapSize();
    },
    updateLeafletMapSize() {
      if (window.L && window.L.Map) {
        setTimeout(() => {
          const map = this.$parent?.$refs?.map?.leafletObject;
          if (map) {
            map.invalidateSize();
          }
        }, 300);
      }
    }
  }
}
</script>

<style scoped>
.fullscreen-toggle {
  position: absolute;
  top: 26vh;
  right: 1vw;
  z-index: 1000;
  background: white;
  border: 2px solid rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  padding: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.1);
}

.fullscreen-toggle:hover {
  background: #f5f5f5;
  border-color: rgba(0, 0, 0, 0.3);
}

.fullscreen-toggle svg {
  width: 20px;
  height: 20px;
}

.fullscreen-toggle.is-fullscreen {
  background: #f0f0f0;
  border-color: rgba(0, 0, 0, 0.4);
}

@media (prefers-color-scheme: dark) {
  .fullscreen-toggle {
    background: #333;
    color: white;
    border-color: rgba(255, 255, 255, 0.2);
  }
  
  .fullscreen-toggle:hover {
    background: #444;
  }
  
  .fullscreen-toggle.is-fullscreen {
    background: #555;
  }
}
</style>