<template>
    <v-app-bar color="primary" app>
        <v-toolbar-title class="d-flex align-center">
            <v-img src="../assets/logo.png" max-width="40" class="mr-2" />
            <span>{{ sectionName }}</span>
        </v-toolbar-title>

        <v-spacer></v-spacer>

        <!-- Toggle de tema oscuro/claro -->
        <v-btn @click="toggleTheme" icon variant="text">
            <v-icon>{{ isDark ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
        </v-btn>

        <v-menu offset-y>
            <template #activator="{ props }">
                <v-avatar v-bind="props" size="40" class="cursor-pointer">
                    <v-img :src="avatar" />
                </v-avatar>
            </template>
            <v-list>
                <v-list-item @click="changeAvatar">Cambiar foto</v-list-item>
                <v-list-item @click="changePassword">Cambiar contraseña</v-list-item>
                <v-list-item @click="logout">Cerrar sesión</v-list-item>
            </v-list>
        </v-menu>
    </v-app-bar>
</template>

<script setup lang="ts">
    import { ref, computed } from 'vue'
    import { useRouter } from 'vue-router'
    import { useAuthStore } from '../stores/authStore'
    import { useTheme } from 'vuetify'

    defineProps<{ sectionName: string }>()

    const avatar = ref('/default-avatar.png')
    const router = useRouter()
    const theme = useTheme()
    const authStore = useAuthStore()

    // Computed para saber si el tema actual es oscuro
    const isDark = computed(() => theme.global.current.value.dark)

    // Función para cambiar el tema
    const toggleTheme = () => {
        theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
        // Guardar preferencia en localStorage
        localStorage.setItem('theme', theme.global.name.value)
    }

    // Cargar tema guardado al iniciar
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
        theme.global.name.value = savedTheme
    }

    const changeAvatar = () => alert('Funcionalidad cambiar avatar')
    const changePassword = () => alert('Funcionalidad cambiar contraseña')
    const logout = async () => {
        await authStore.signOut()
        router.push('/')
    }
</script>
