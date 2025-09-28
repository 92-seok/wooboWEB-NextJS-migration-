<template>

  <v-container>
    <v-row>
      <v-col cols="12" md="6">

        <div>
          <span>Setting</span>
          <div>
            <v-progress-circular :model-value="value" :width="15" :size="100" color="primary" indeterminate>
              {{ value }}
            </v-progress-circular>
          </div>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from "vue";

const value = ref(0);

let interval = -1;
onMounted(() => {
    interval = setInterval(() => {
        if (value.value === 100) {
            return (value.value = 0);
        }
        value.value += 10;
    }, 1000);
});

onUnmounted(() => {
    clearInterval(interval);
});

</script>

<style scoped>
.v-progress-circular {
    margin: 1rem;
    flex: auto;
}
</style>
