<template>
    <div id="mouse-position" class="mousePosition"></div>
</template>

<script setup>
import { onMounted } from 'vue';
import { MousePosition } from 'ol/control';
import { format } from 'ol/coordinate.js';

const props = defineProps({
    map: {
        type: Object,
        required: true
    }
});

onMounted(() => {
    const mousePosition = new MousePosition({
        className: 'mousePosition',
        target: document.getElementById('mouse-position'),
        projection: 'EPSG:4326',
        coordinateFormat: function(coordinate) {
            return format(coordinate, '{y} , {x}', 6);
        },
    });
    
    props.map.addControl(mousePosition);
});
</script>

<style scoped>
.mousePosition {
    position: fixed;
    top: auto;
    right: auto;
    bottom: 5px;
    left: 50%;
    transform: translateX(-50%);
    border: 1px solid grey;
    border-radius: 10px;
    padding: 5px;
    background-color: rgba(225, 225, 225, 0.6);
    font-family: inherit;
    font-size: 16px;
    color: black;
}
</style>
