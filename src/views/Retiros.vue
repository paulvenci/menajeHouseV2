<template>
    <v-container fluid class="fill-height bg-grey-lighten-4 pa-4 pa-md-6">
        <v-row class="fill-height" justify="center">
            <v-col cols="12" xl="10">
                <v-card elevation="2" class="rounded-xl overflow-hidden d-flex flex-column h-100">
                    <v-card-title class="bg-primary text-white pa-4 pa-md-6 d-flex align-center">
                        <v-icon size="large" class="mr-3">mdi-package-variant-closed</v-icon>
                        <span class="text-h5 font-weight-bold">Gestión de Retiros Pendientes</span>
                        <v-spacer></v-spacer>
                        <v-btn icon="mdi-refresh" variant="text" @click="cargarRetirosPendientes"
                            :loading="cargando"></v-btn>
                    </v-card-title>

                    <v-card-text class="pa-4 pa-md-6 flex-grow-1 bg-grey-lighten-5">
                        <v-text-field v-model="busqueda" prepend-inner-icon="mdi-magnify"
                            label="Buscar por cliente o código de venta" variant="outlined" density="comfortable"
                            hide-details class="mb-6 bg-white"></v-text-field>

                        <v-list class="bg-transparent" v-if="retirosFiltrados.length > 0">
                            <v-slide-y-transition group>
                                <v-list-item v-for="retiro in retirosFiltrados" :key="retiro.id"
                                    class="mb-4 rounded-xl border bg-white elevation-1">
                                    <div class="d-flex flex-column flex-md-row align-start align-md-center w-100 pa-2">
                                        <!-- Info Principal -->
                                        <div class="d-flex align-center mb-3 mb-md-0 flex-grow-1">
                                            <v-avatar color="orange-lighten-4" size="48" class="mr-4">
                                                <v-icon color="orange-darken-3">mdi-clock-outline</v-icon>
                                            </v-avatar>
                                            <div>
                                                <div class="text-h6 font-weight-bold mb-1">
                                                    {{ retiro.ventas?.clientes?.nombre || 'Cliente Desconocido' }}
                                                </div>
                                                <div class="text-subtitle-2 text-medium-emphasis d-flex align-center">
                                                    <v-icon size="small" class="mr-1">mdi-barcode</v-icon>
                                                    {{ retiro.ventas?.codigo || 'Código no disponible' }}
                                                    <v-chip size="x-small" color="info" variant="flat" class="ml-2">
                                                        Venta: {{ formatoMoneda(retiro.monto) }}
                                                    </v-chip>
                                                </div>
                                                <div class="text-caption text-grey mt-1">
                                                    Fecha de Venta: {{ new Date(retiro.fecha).toLocaleDateString('es-CL') }}
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Acciones -->
                                        <div class="d-flex align-center mt-2 mt-md-0 ml-md-auto">
                                            <v-btn color="success" prepend-icon="mdi-check-circle"
                                                @click="abrirDialogoEntregar(retiro)" class="text-none">
                                                Marcar Entregado
                                            </v-btn>
                                        </div>
                                    </div>
                                </v-list-item>
                            </v-slide-y-transition>
                        </v-list>
                        
                        <v-empty-state v-else icon="mdi-package-check" title="Todo al día"
                            text="No hay retiros pendientes en este momento." class="my-10"></v-empty-state>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <!-- Diálogo Confirmar Entrega -->
        <v-dialog v-model="dialogoEntregar" max-width="500">
            <v-card class="rounded-xl">
                <v-card-title class="bg-success text-white pa-4">
                    <v-icon start>mdi-package-up</v-icon>
                    Confirmar Entrega
                </v-card-title>
                <v-card-text class="pa-6">
                    <p class="text-body-1 mb-4">
                        ¿Estás seguro que deseas marcar este producto como entregado al cliente <strong>{{
                            retiroSeleccionado?.ventas?.clientes?.nombre }}</strong>?
                    </p>
                    <v-text-field v-model="retiradoPor" label="Nombre de quien retira (Opcional)" variant="outlined"
                        prepend-inner-icon="mdi-account"
                        hint="Si lo retira otra persona, anota su nombre aquí."></v-text-field>
                </v-card-text>
                <v-card-actions class="pa-4 bg-grey-lighten-4">
                    <v-spacer></v-spacer>
                    <v-btn color="grey-darken-1" variant="text" @click="dialogoEntregar = false">Cancelar</v-btn>
                    <v-btn color="success" variant="elevated" @click="confirmarEntrega" :loading="procesando">Confirmar
                        Entrega</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Snackbar Notificaciones -->
        <v-snackbar v-model="snackbar" :color="colorSnackbar" :timeout="3000" location="top right" class="mt-16">
            <div class="d-flex align-center">
                <v-icon start color="white">{{ iconSnackbar }}</v-icon>
                <span class="text-white font-weight-medium">{{ mensajeSnackbar }}</span>
            </div>
            <template v-slot:actions>
                <v-btn color="white" variant="text" @click="snackbar = false">Cerrar</v-btn>
            </template>
        </v-snackbar>
    </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../supabase'

// Estado numérico/tabla
const retirosPendientes = ref<any[]>([])
const cargando = ref(false)
const busqueda = ref('')

// Estado UI Diálogos y Notificaciones
const dialogoEntregar = ref(false)
const retiroSeleccionado = ref<any>(null)
const retiradoPor = ref('')
const procesando = ref(false)

const snackbar = ref(false)
const mensajeSnackbar = ref('')
const colorSnackbar = ref('success')
const iconSnackbar = ref('mdi-check-circle')

function mostrarNotificacion(mensaje: string, tipo: 'success' | 'error' = 'success') {
    mensajeSnackbar.value = mensaje
    colorSnackbar.value = tipo === 'success' ? 'success' : 'error'
    iconSnackbar.value = tipo === 'success' ? 'mdi-check-circle' : 'mdi-alert-circle'
    snackbar.value = true
}

const formatoMoneda = (valor: number | null | undefined) => {
    if (valor == null) return '$0'
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0
    }).format(valor)
}

// Cargar Datos
async function cargarRetirosPendientes() {
    cargando.value = true
    try {
        const { data, error } = await supabase
            .from('retiros')
            .select(`
                *,
                ventas (
                    codigo,
                    clientes ( nombre )
                )
            `)
            .eq('estado', 'pendiente')
            .order('fecha', { ascending: false })

        if (error) throw error
        retirosPendientes.value = data || []
    } catch (error) {
        console.error("Error al cargar retiros:", error)
        mostrarNotificacion('Error al cargar la lista de retiros.', 'error')
    } finally {
        cargando.value = false
    }
}

// Búsqueda
const retirosFiltrados = computed(() => {
    if (!busqueda.value) return retirosPendientes.value
    
    const termino = busqueda.value.toLowerCase()
    return retirosPendientes.value.filter(retiro => {
        const nombreCliente = retiro.ventas?.clientes?.nombre?.toLowerCase() || ''
        const codigoVenta = retiro.ventas?.codigo?.toLowerCase() || ''
        return nombreCliente.includes(termino) || codigoVenta.includes(termino)
    })
})

// Acciones Diálogo
function abrirDialogoEntregar(retiro: any) {
    retiroSeleccionado.value = retiro
    retiradoPor.value = retiro.ventas?.clientes?.nombre || '' // Por defecto el mismo cliente
    dialogoEntregar.value = true
}

async function confirmarEntrega() {
    if (!retiroSeleccionado.value) return
    
    procesando.value = true
    try {
        const { error } = await supabase
            .from('retiros')
            .update({ 
                estado: 'entregado',
                fecha_retiro: new Date().toISOString(),
                retirado_por: retiradoPor.value
            })
            .eq('id', retiroSeleccionado.value.id)

        if (error) throw error

        mostrarNotificacion('Producto marcado como entregado con éxito.')
        dialogoEntregar.value = false
        await cargarRetirosPendientes() // Recargar tabla
    } catch (error) {
        console.error("Error al confirmar entrega:", error)
        mostrarNotificacion('Ocurrió un error al actualizar el estado.', 'error')
    } finally {
        procesando.value = false
    }
}

onMounted(() => {
    cargarRetirosPendientes()
})
</script>

<style scoped>
.v-list-item {
    transition: all 0.3s ease;
}

.v-list-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.08) !important;
}
</style>
