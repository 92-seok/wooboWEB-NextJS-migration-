<template v-slot:append>
    <v-system-bar color="#0D47A1">
        <!--<label align="left">우보온라인</label>-->
        <!--
            <v-icon class="ms-2" icon="@../public/favicon.ico"></v-icon>
            <v-icon class="ms-2" icon="mdi-signal-cellular-outline"></v-icon>
        <v-icon class="ms-2" icon="mdi-battery"></v-icon>
        -->

        <span class="ms-2">{{ time }}</span>
    </v-system-bar>

    <v-app-bar color="primary" title="">
        <!--
            <v-app-bar-nav-icon></v-app-bar-nav-icon>
            -->
        <v-app-bar-title>
            <button>메뉴(강우,변위,경사,적설,침수)</button>
            <button>수위</button>
        </v-app-bar-title>

        <v-btn :prepend-icon="theme === 'light' ? 'mdi-weather-sunny' : 'mdi-weather-night'" text="" slim
            @click="onClick"></v-btn>
    </v-app-bar>
    <v-navigation-drawer>
        <v-list>
            <v-list-item title="" />
        </v-list>
    </v-navigation-drawer>
</template>

<script setup>
import { ref, onMounted, defineEmits } from 'vue';
import moment from 'moment-timezone'

let time = ref('');
const emit = defineEmits(['click:btnClick'])

setInterval(() => {
    time.value = moment().format('YYYY-MM-DD HH:mm:ss');
}, 1000);

onMounted(() => {
    console.log('Header.vue::onMounted()');
});

// theme
const theme = ref('light')

function onClick() {
    console.log('Header.vue::onClick()');
    theme.value = theme.value === 'light' ? 'dark' : 'light'
    emit('click:btnClick', theme.value);
}

</script>

<style lang="scss" scoped></style>