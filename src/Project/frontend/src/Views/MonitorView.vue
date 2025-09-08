<template>
    <v-card title="센서" flat>
        <template v-slot:text>
            <v-text-field v-model="search" label="센서 검색" prepend-inner-icon="mdi-magnify" variant="outlined">

            </v-text-field>
        </template>

        <v-data-table :headers="headers" :items="desserts" :search="search">

        </v-data-table>
    </v-card>
</template>

<script setup>

</script>

<style lang="scss" scoped></style>