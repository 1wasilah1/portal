<script setup>
import { onMounted } from 'vue';
import LayerSwitcher from 'ol-layerswitcher';

const props = defineProps({
    map: {
        type: Object,
        required: true
    },
});

// const emit = defineEmits(['sendData']);

onMounted(() => {
    const layerSwitcher = new LayerSwitcher({
        activationMode: 'click',
        startActive: false,
        groupSelectStyle: 'children',
        tipLabel: 'Daftar Layer',
        collapseTipLabel: 'Tutup Daftar Layer',
    });

    props.map.addControl(layerSwitcher);

});
</script>

<template>
    <div class="layer-switcher"></div>
</template>

<style scoped>
/* Add your styles here if needed */
</style>
