<template>
    <div>
        Setting
        <div>
            <v-progress-circular :model-value="value" :width="15" :size="100" color="primary" indeterminate>
                {{ value }}
            </v-progress-circular>
        </div>
    </div>
</template>

<script setup>

</script>
import { onBeforeUnmount, onMounted, ref } from 'vue'

const value = ref(0)

let interval = -1
onMounted(() => {
interval = setInterval(() => {
if (value.value === 100) {
return (value.value = 0)
}
value.value += 10
}, 1000)
})
onBeforeUnmount(() => {
clearInterval(interval)
})
<style scoped>
.v-progress-circular {
    margin: 1rem;
    flex: auto;
}
</style>
