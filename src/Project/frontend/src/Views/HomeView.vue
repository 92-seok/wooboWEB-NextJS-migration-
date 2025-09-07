<template>
    <div>
        dddd
        {{ Title }}
    </div>
</template>

<script setup>

import { onMounted, inject } from 'vue';
const { Title } = 'HOME';
onMounted(() => {
    console.log('ddd');
    document.title = inject('$title');
});

</script>

<style lang="scss" scoped></style>
