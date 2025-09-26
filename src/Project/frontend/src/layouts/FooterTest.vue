<template>
    <v-bottom-navigation :active="active" color="indigo" >
        <v-btn>
            <font-awesome-icon icon="location" style="font-size:22px; padding-bottom: 3px;" />
            지도
        </v-btn>
        <v-btn>
            <font-awesome-icon class="fontAwesom" icon="tv" style="font-size:22px; padding-bottom: 3px;" />
            모니터링
        </v-btn>
        <v-btn>
            <font-awesome-icon icon="repeat" style="font-size:22px; padding-bottom: 3px;" />
            테스트
        </v-btn>
        <v-btn>
            <font-awesome-icon icon="gear" style="font-size:22px; padding-bottom: 3px;" />
            셋팅
        </v-btn>
    </v-bottom-navigation>
</template>

<script setup>
import { ref } from 'vue'

const active = ref(true)



</script>

<style lang="scss" scoped>

</style>