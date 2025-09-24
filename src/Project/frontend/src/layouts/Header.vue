<template v-slot:append>
    <v-system-bar color="indigo-darken-2">
        <span>{{ time }}</span>
    </v-system-bar>

    <v-app-bar color="primary" :elevation="5" density="compact">
        <!-- 네비게이션 바 아이콘
        <template v-slot:prepend>
            <v-app-bar-nav-icon></v-app-bar-nav-icon>
        </template>
-->
        <v-app-bar-title>
            <v-btn @click="onDownload">우보 온라인 - 운영지원시스템</v-btn>
        </v-app-bar-title>
        <template v-slot:append>
            <v-btn :prepend-icon="theme === 'light' ? 'mdi-weather-sunny' : 'mdi-weather-night'" text=""
                @click="onClick" />
        </template>
    </v-app-bar>

    <!-- 사이드 메뉴
    <v-navigation-drawer>
        <v-list>
            <v-list-item title="1" />
            <v-list-item title="1" />
            <v-list-item title="1" />
            <v-list-item title="1" />
        </v-list>
    </v-navigation-drawer>
    -->
</template>

<script setup>
import { ref, onMounted, defineEmits } from 'vue';
import axios from "axios";
import dayjs from 'dayjs'

////////////////////////////////////////
// 이벤트
////////////////////////////////////////
onMounted(() => {
    console.log('Header.vue::onMounted()');
});

////////////////////////////////////////
// 현재 시간
////////////////////////////////////////
let time = ref('');
setInterval(() => {
    time.value = dayjs().format('YYYY-MM-DD HH:mm:ss');
}, 1000);

////////////////////////////////////////
// 테마
////////////////////////////////////////
const theme = ref('light')
const emit = defineEmits(['click:btnClick'])

function onClick() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
    emit('click:btnClick', theme.value);
}

////////////////////////////////////////
// 다운로드
////////////////////////////////////////
const onDownload = async () => {
    console.log("다운로드시작");

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
    catch (err) {
        console.error(err);
    }
}
</script>

<style scoped></style>