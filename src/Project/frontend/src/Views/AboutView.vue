<template>
    Vue Version: {{ version }}
    <div class="img_frame">
        <img src="@/../public/about_ing.jpg" />
    </div>
</template>

<script setup>
import { version } from 'vue'; // version 전역변수 사용

</script>

<style lang="css" scoped>
div {
    display: flex;
    justify-content: center;
    height: 1000px;
}

img {
    margin: auto;
    display: block;
}
</style>
