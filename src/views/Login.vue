<template>
    <v-container fluid class="login-background pa-0">
        <!-- Overlay con degradado -->
        <div class="overlay"></div>

        <!-- Contenido centrado -->
        <v-container fluid class="d-flex align-center justify-center flex-column login-container">
            <!-- Mensaje de bienvenida con animación -->
            <h1 class="welcome-text mb-6 animate-fade">
                Bienvenido <br />
                <span class="highlight">Menaje House | Gestión</span>
            </h1>

            <!-- Card de login -->
            <v-card class="pa-6 login-card" max-width="420">
                <h2 class="text-center mb-4">Iniciar Sesión</h2>

                <v-text-field v-model="email" label="Correo electrónico" type="email" outlined dense />
                <v-text-field v-model="password" label="Contraseña" type="password" outlined dense />

                <v-btn block color="primary" class="mt-4" @click="login" :loading="loading">
                    Ingresar
                </v-btn>

                <p v-if="error" class="text-red-600 mt-2">{{ error }}</p>

                <v-btn text block color="secondary" class="mt-2" to="/register">
                    ¿No tienes cuenta? Regístrate
                </v-btn>
            </v-card>
        </v-container>
    </v-container>
</template>

<script setup lang="ts">
    import { ref } from 'vue'
    import { useRouter } from 'vue-router'
    import { supabase } from '../supabase'
    import { useAuthStore } from '../stores/authStore'

    // Importa la imagen de fondo si quieres usar Vite
    // import background from '../assets/image1.png'

    const router = useRouter()
    const email = ref('')
    const password = ref('')
    const error = ref<string | null>(null)
    const loading = ref(false)

    const login = async () => {
        error.value = null
        loading.value = true
        try {
            const { data, error: signInError } = await supabase.auth.signInWithPassword({
                email: email.value,
                password: password.value,
            })
            
            if (signInError) throw signInError
            
            console.log("Usuario logueado:", data.user)
            
            const authStore = useAuthStore()
            authStore.user = data.user
            
            router.push('/dashboard')
        } catch (err: any) {
            error.value = "Error: " + err.message
        } finally {
            loading.value = false
        }
    }
</script>

<style scoped>
.login-background {
    position: relative;
    height: 100%;
    width: 100%;
    background-image: url("../assets/image1.png");

    background-size: cover;
    background-position: center;
    overflow: hidden;
    /* evita scroll dentro del container */
}

.login-container {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: relative;
    z-index: 2;
    overflow: hidden;
    /* evita scroll interno */
}

.overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(rgba(0, 0, 0, 0.136), rgba(0, 0, 0, 0.253));
    z-index: 1;
}

/* Card */
.login-card {
    position: relative;
    z-index: 2;
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(12px);
    border-radius: 20px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
    color: #fff;
}

/* Mensaje de bienvenida */
.welcome-text {
    font-size: 2rem;
    font-weight: 600;
    text-align: center;
    color: #fff;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
}

.highlight {
    color: #4FC3F7;
}

/* Animación */
.animate-fade {
    opacity: 0;
    transform: translateY(20px);
    animation: fadeInUp 0.8s ease forwards;
}

@keyframes fadeInUp {
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
