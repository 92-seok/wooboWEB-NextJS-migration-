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
            <v-btn @click="onDownload">우보 온라인 - 운영지원시스템</v-btn>
        </v-app-bar-title>

        <v-btn :prepend-icon="theme === 'light' ? 'mdi-weather-sunny' : 'mdi-weather-night'" text="" @click="onClick"
            slim />
    </v-app-bar>
    <!--
        <v-navigation-drawer>
            <v-list>
                <v-list-item title="" />
            </v-list>
        </v-navigation-drawer>
        -->
</template>

<script setup>
import { ref, onMounted, defineEmits } from 'vue';
import axios from "axios";
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

const onDownload = async () =>
{
    try {
        const response = await axios.get("/api/download", {
            responseType: "blob"
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "우보 온라인.apk");
        document.body.appendChild(link);
        link.click();
    }
    catch(err){
        console.error(err);
    }
}

</script>

<style lang="scss" scoped></style>