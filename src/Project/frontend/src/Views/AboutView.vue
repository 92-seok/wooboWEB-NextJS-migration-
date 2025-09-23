<template>
    <v-container>
        <v-layout>
            <v-flex>
                <v-card>
                    <div class="pa-10">
                        <h1 style="text-align: center" class="mb-10">Login</h1>
                        <form>
                            <v-text-field label="ID" prepend-inner-icon="mdi-account"></v-text-field>
                            <v-text-field prepend-inner-icon="mdi-lock" type="password" label="Password">
                            </v-text-field>
                            <v-btn type="submit" color="blue lighten-1 text-capitalize" depressed large block dark
                                class="mb-3">
                                로그인
                            </v-btn>

                        </form>
                    </div>
                </v-card>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script setup>
//import { version } from 'vue'; // version 전역변수 사용

</script>

<style lang="css" scoped>
div {
    justify-content: center;
}
</style>
