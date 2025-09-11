<template v-slot:append>
    <v-system-bar color="#0D47A1">
        <!--<label align="left">우보온라인</label>-->
        <v-icon class="ms-2" icon="@../public/favicon.ico"></v-icon>
        <!--
            <v-icon class="ms-2" icon="mdi-signal-cellular-outline"></v-icon>
            <v-icon class="ms-2" icon="mdi-battery"></v-icon>
            -->

        <span class="ms-2">{{ time }}</span>
    </v-system-bar>

    <v-app-bar color="primary">
        <!--
            <v-app-bar-nav-icon></v-app-bar-nav-icon>
            -->
        <v-app-bar-title>
            <button>메뉴(강우,수위,변위,경사,적설,침수)</button>
        </v-app-bar-title>

    </v-app-bar>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import moment from 'moment-timezone'

let time = ref('');

setInterval(() => {
    time.value = moment().format('YYYY-MM-DD HH:mm:ss');
}, 1000);

onMounted(() => {
    console.log('onMounted()::Header');
});

</script>

<style lang="scss" scoped></style>