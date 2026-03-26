<script setup
    lang="ts">
    import { ref, computed } from 'vue';
    import { supabase } from '../supabase';
    import { useRetirosStore } from '../stores/retirosStore';
    import RetiroDialog from './RetiroDialog.vue';
    import type { Retiro } from '../stores/retirosStore';

    // Props
    const props = defineProps<{
        withdrawals: Retiro[];
        loading: boolean;
    }>();

    // Stores
    const retirosStore = useRetirosStore();

    // Estado del diálogo
    const dialog = ref(false);
    const dialogRetiroMultiple = ref(false);
    const selectedRetiro = ref<Retiro | null>(null);
    const seleccionados = ref<string[]>([]);
    const procesandoRetiros = ref(false);
    const snackbar = ref(false);
    const snackbarMessage = ref('');
    const snackbarColor = ref('success');

    const retiroData = ref({
        retiradoPor: '',
        fechaRetiro: new Date().toISOString().split('T')[0]
    });

    // Encabezados de la tabla
    const headers = ref([
        { title: 'Fecha Venta', key: 'fecha' },
        { title: 'Cliente', key: 'cliente' },
        { title: 'Código Venta', key: 'codigoVenta' },
        { title: 'Tipo Venta', key: 'tipoVenta' },
        { title: 'Monto Venta', key: 'monto' },
        { title: 'Estado', key: 'estado' },
        { title: 'Retirado Por', key: 'retiradoPor' },
        { title: 'Fecha Retiro', key: 'fechaRetiro' },

    ]);

    // Ordenar los retiros por fecha y cliente
    const sortedWithdrawals = computed(() => {
        return [...props.withdrawals].sort((a, b) => {
            const dateA = new Date(a.fecha).getTime();
            const dateB = new Date(b.fecha).getTime();
            if (dateA !== dateB) {
                return dateA - dateB;
            }
            return (a.clienteNombre || '').localeCompare(b.clienteNombre || '');
        });
    });

    // Abrir el diálogo para procesar un retiro
    const openDialog = (item: Retiro) => {
        selectedRetiro.value = item;
        dialog.value = true;
    };

    // Cerrar el diálogo
    const closeDialog = () => {
        dialog.value = false;
        selectedRetiro.value = null;
    };

    function limpiarSeleccion() {
        seleccionados.value = [];
    }

    function procesarRetirosMultiples() {
        if (seleccionados.value.length === 0) {
            mostrarNotificacion('No hay retiros seleccionados', 'warning');
            return;
        }
        dialogRetiroMultiple.value = true;
    }

    async function confirmarRetirosMultiples() {
        if (!retiroData.value.retiradoPor || !retiroData.value.fechaRetiro) {
            mostrarNotificacion('Por favor completa todos los campos obligatorios', 'error');
            return;
        }

        procesandoRetiros.value = true;
        try {
            let exitosos = 0;
            let fallidos = 0;

            for (const retiroId of seleccionados.value) {
                try {
                    const { error } = await supabase.from('retiros').update({
                        estado: 'retirado',
                        retirado_por: retiroData.value.retiradoPor,
                        fecha_retiro: retiroData.value.fechaRetiro
                    }).eq('id', retiroId);
                    if (error) throw error;
                    exitosos++;
                } catch (error) {
                    console.error(`Error procesando retiro ${retiroId}:`, error);
                    fallidos++;
                }
            }

            if (exitosos > 0) {
                mostrarNotificacion(`✅ ${exitosos} retiro(s) procesado(s) correctamente`, 'success');
            }
            if (fallidos > 0) {
                mostrarNotificacion(`⚠️ ${fallidos} retiro(s) fallaron`, 'warning');
            }

            dialogRetiroMultiple.value = false;
            limpiarSeleccion();
            await retirosStore.cargarRetirosDelMes();
        } catch (error) {
            console.error('Error en procesamiento masivo:', error);
            mostrarNotificacion('❌ Error al procesar retiros', 'error');
        } finally {
            procesandoRetiros.value = false;
        }
    }

    function mostrarNotificacion(mensaje: string, color: string) {
        snackbarMessage.value = mensaje;
        snackbarColor.value = color;
        snackbar.value = true;
    }

    function calcularTotalSeleccionados() {
        return props.withdrawals
            .filter(r => r.id && seleccionados.value.includes(r.id))
            .reduce((total, r) => total + (r.monto || 0), 0);
    }
</script>
<style scoped>
.v-data-table.hover-effect :deep(.v-data-table__tr):hover {
    background-color: #f5f5f5;
    /* Un color de fondo claro al pasar el mouse */
    cursor: pointer;
    /* Muestra un cursor de puntero para indicar que es clickeable */
    transition: background-color 0.2s ease-in-out;
    /* Transición suave solo para el color */
}

/* Opcional: Estilo para las filas al hacer clic */
.v-data-table.hover-effect :deep(.v-data-table__tr.v-data-table__tr--active) {
    background-color: #e0e0e0;
    /* Color al seleccionar la fila */
}
</style>
<template>
    <v-container fluid>
        <v-card elevation="2">
            <v-card-title class="d-flex align-center">
                Listado de Retiros del Mes
                <v-spacer></v-spacer>
                <v-btn color="primary" variant="text" prepend-icon="mdi-refresh"
                    @click="retirosStore.cargarRetirosDelMes()">
                    Actualizar
                </v-btn>
            </v-card-title>
            <v-card-text>
                <!-- Barra de acciones para selección múltiple -->
                <v-expand-transition>
                    <v-alert v-if="seleccionados.length > 0" type="info" variant="tonal" class="mb-4">
                        <div class="d-flex align-center justify-space-between">
                            <span class="font-weight-bold">{{ seleccionados.length }} retiro(s) seleccionado(s)</span>
                            <div class="d-flex gap-2">
                                <v-btn color="success" variant="elevated" size="small" @click="procesarRetirosMultiples"
                                    prepend-icon="mdi-cash-check">
                                    Procesar Retiros
                                </v-btn>
                                <v-btn color="error" variant="text" size="small" @click="limpiarSeleccion">
                                    Limpiar
                                </v-btn>
                            </div>
                        </div>
                    </v-alert>
                </v-expand-transition>

                <v-data-table v-model="seleccionados" :headers="headers" :items="sortedWithdrawals" :loading="loading"
                    no-data-text="No hay retiros registrados este mes" class="elevation-1 hover-effect" item-key="id"
                    show-select item-value="id" @click:row="(_: any, { item }: { item: Retiro }) => openDialog(item)">
                    <template v-slot:item.fecha="{ item }">
                        {{ new Date(item.fecha).toLocaleDateString('es-CL', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        }) }}
                    </template>
                    <template v-slot:item.estado="{ item }">
                        <v-chip :color="item.estado === 'pendiente' ? 'orange' : 'green'">
                            {{ item.estado === 'pendiente' ? 'Pendiente' : 'Retirado' }}
                        </v-chip>
                    </template>
                    <template v-slot:item.fechaRetiro="{ item }">
                        {{ item.fechaRetiro ? new Date(item.fechaRetiro).toLocaleDateString('es-CL', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        }) : 'Sin Fecha' }}
                    </template>
                    <template v-slot:item.tipoVenta="{ item }">
                        <v-chip :color="item.tipoVenta === 'Venta Live' ? 'purple' : 'blue'" size="x-small" variant="tonal">
                            <v-icon size="x-small" class="mr-1">{{ item.tipoVenta === 'Venta Live' ? 'mdi-video' :
                                'mdi-calendar' }}</v-icon>
                            {{ item.tipoVenta === 'Venta Live' ? 'Live' : 'Diaria' }}
                        </v-chip>
                    </template>
                    <template v-slot:item.monto="{ item }">
                        ${{ item.monto.toLocaleString('es-CL') }}
                    </template>
                </v-data-table>
            </v-card-text>
        </v-card>
    </v-container>

    <RetiroDialog :visible="dialog" :retiro="selectedRetiro" @update:visible="closeDialog" />

    <!-- Diálogo para procesamiento masivo de retiros -->
    <v-dialog v-model="dialogRetiroMultiple" max-width="500" persistent>
        <v-card>
            <v-card-title class="d-flex align-center pa-4 pa-md-6 pb-4">
                <v-icon color="success" size="24" class="mr-2">mdi-cash-multiple</v-icon>
                <span class="text-subtitle-1 text-md-h6 font-weight-medium">Procesar Retiros Múltiples</span>
            </v-card-title>

            <v-card-text class="pa-4 pa-md-6 pt-0">
                <v-alert type="info" variant="tonal" class="mb-4">
                    <div><strong>Retiros seleccionados:</strong> {{ seleccionados.length }}</div>
                    <div><strong>Total:</strong> ${{ calcularTotalSeleccionados().toLocaleString('es-CL') }}</div>
                </v-alert>

                <v-text-field v-model="retiroData.retiradoPor" label="Retirado Por *" variant="outlined"
                    density="comfortable" prepend-inner-icon="mdi-account"
                    :rules="[v => !!v || 'Este campo es obligatorio']" class="mb-4"
                    placeholder="Nombre de quien retira" />

                <v-text-field v-model="retiroData.fechaRetiro" label="Fecha de Retiro *" type="date" variant="outlined"
                    density="comfortable" prepend-inner-icon="mdi-calendar"
                    :rules="[v => !!v || 'La fecha es obligatoria']" />
            </v-card-text>

            <v-card-actions class="pa-4 pa-md-6 pt-0">
                <v-spacer></v-spacer>
                <v-btn variant="outlined" @click="dialogRetiroMultiple = false" class="text-none">
                    Cancelar
                </v-btn>
                <v-btn color="success" variant="elevated" @click="confirmarRetirosMultiples" class="text-none"
                    :disabled="!retiroData.retiradoPor || !retiroData.fechaRetiro" :loading="procesandoRetiros">
                    <v-icon class="mr-1">mdi-check-all</v-icon>
                    Confirmar {{ seleccionados.length }} Retiro(s)
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <!-- Snackbar para notificaciones -->
    <v-snackbar v-model="snackbar" :timeout="2000" :color="snackbarColor" location="top" class="text-none">
        <div class="d-flex align-center">
            <v-icon class="mr-3">{{ snackbarColor === 'success' ? 'mdi-check-circle' : 'mdi-alert-circle' }}</v-icon>
            <span>{{ snackbarMessage }}</span>
        </div>
    </v-snackbar>
</template>