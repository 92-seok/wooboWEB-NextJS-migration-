<template>
    <v-layout class="overflow-visible" style="height: 56px;">
        <v-bottom-navigation v-model="value" :bg-color="color" mode="shift">
            <v-btn>
                <v-icon>mdi-television-play</v-icon>

                <span>모니터링</span>
            </v-btn>

            <v-btn>
                <v-icon>mdi-music-note</v-icon>

                <span>제어</span>
            </v-btn>

            <v-btn>
                <v-icon>mdi-book</v-icon>

                <span>Book</span>
            </v-btn>

            <v-btn>
                <v-icon>mdi-information-outline</v-icon>
                <span>정보</span>
            </v-btn>
        </v-bottom-navigation>
    </v-layout>
</template>

<script setup>
import { computed, ref } from 'vue'

const value = ref(1)
const color = computed(() => {
    switch (value.value) {
        case 0: return 'blue-grey'
        case 1: return 'teal'
        case 2: return 'brown'
        case 3: return 'indigo'
        default: return 'blue-grey'
    }
})
</script>

<style lang="scss" scoped></style>