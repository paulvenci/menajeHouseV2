<template>
    <v-container fluid>
        <v-card elevation="2">
            <v-card-title class="d-flex align-center pa-4 pa-md-6 pb-4">
                <v-icon color="warning" size="24" size-md="28" class="mr-2 mr-md-3">mdi-cash-clock</v-icon>
                <span class="text-subtitle-1 text-md-h6 font-weight-medium">Pagos Pendientes</span>
                <v-spacer></v-spacer>
                <v-chip color="warning" variant="tonal">
                    {{ ventasPendientes.length }} pendientes
                </v-chip>
            </v-card-title>
            <v-card-text>
                <!-- Barra de acciones para selección múltiple -->
                <v-expand-transition>
                    <v-alert v-if="seleccionados.length > 0" type="info" variant="tonal" class="mb-4">
                        <div class="d-flex align-center justify-space-between">
                            <span class="font-weight-bold">{{ seleccionados.length }} venta(s) seleccionada(s)</span>
                            <div class="d-flex gap-2">
                                <v-btn color="success" variant="elevated" size="small" @click="registrarPagosMultiples"
                                    prepend-icon="mdi-cash-multiple">
                                    Registrar Pagos
                                </v-btn>
                                <v-btn color="error" variant="text" size="small" @click="limpiarSeleccion">
                                    Limpiar
                                </v-btn>
                            </div>
                        </div>
                    </v-alert>
                </v-expand-transition>

                <v-data-table v-model="seleccionados" :headers="headers" :items="ventasPendientes" :loading="loading"
                    no-data-text="No hay pagos pendientes" items-per-page-text="Ventas por página" show-select
                    item-value="id" class="elevation-1">

                    <template v-slot:item.codigo="{ item }">
                        <span class="font-weight-bold">{{ item.codigo }}</span>
                    </template>

                    <template v-slot:item.monto="{ item }">
                        <span class="text-success font-weight-bold">{{ formatoMoneda(item.monto) }}</span>
                    </template>

                    <template v-slot:item.tipo="{ item }">
                        <v-chip :color="item.tipo === 'live' ? 'purple' : 'blue'" size="small" variant="tonal">
                            <v-icon size="small" class="mr-1">{{ item.tipo === 'live' ? 'mdi-video' : 'mdi-calendar'
                            }}</v-icon>
                            {{ item.tipo === 'live' ? 'Live' : 'Diaria' }}
                        </v-chip>
                    </template>

                    <template v-slot:item.fecha="{ item }">
                        {{ formatFecha(item.fecha) }}
                    </template>

                    <template v-slot:item.actions="{ item }">
                        <v-btn color="success" size="small" variant="elevated" @click="abrirDialogoPago(item)">
                            <v-icon size="small" class="mr-1">mdi-cash-check</v-icon>
                            Registrar Pago
                        </v-btn>
                    </template>
                </v-data-table>
            </v-card-text>
        </v-card>

        <!-- Diálogo para registrar pago -->
        <v-dialog v-model="dialogPago" max-width="500" persistent>
            <v-card>
                <v-card-title class="d-flex align-center pa-4 pa-md-6 pb-4">
                    <v-icon color="success" size="24" class="mr-2">mdi-cash-check</v-icon>
                    <span class="text-subtitle-1 text-md-h6 font-weight-medium">Registrar Pago</span>
                </v-card-title>

                <v-card-text class="pa-4 pa-md-6 pt-0">
                    <v-alert type="info" variant="tonal" class="mb-4">
                        <div><strong>Código:</strong> {{ ventaSeleccionada?.codigo }}</div>
                        <div><strong>Cliente:</strong> {{ ventaSeleccionada?.cliente || 'Sin cliente' }}</div>
                        <div><strong>Monto:</strong> {{ formatoMoneda(ventaSeleccionada?.monto) }}</div>
                    </v-alert>

                    <v-select v-model="pagoData.modoPago" :items="modosPago" item-title="text" item-value="value"
                        label="Modo de Pago *" variant="outlined" density="comfortable"
                        prepend-inner-icon="mdi-credit-card" :rules="[v => !!v || 'El modo de pago es obligatorio']"
                        class="mb-4">
                        <template v-slot:item="{ props, item }">
                            <v-list-item v-bind="props">
                                <template v-slot:prepend>
                                    <v-icon :icon="item.raw.icon" color="primary"></v-icon>
                                </template>
                            </v-list-item>
                        </template>
                    </v-select>

                    <v-text-field v-model="pagoData.fechaPago" label="Fecha de Pago *" type="date" variant="outlined"
                        density="comfortable" prepend-inner-icon="mdi-calendar"
                        :rules="[v => !!v || 'La fecha es obligatoria']" class="mb-4" />

                    <v-text-field v-model="pagoData.usuario" label="Usuario (opcional)" variant="outlined"
                        density="comfortable" prepend-inner-icon="mdi-account"
                        placeholder="Nombre del usuario que registra" />
                </v-card-text>

                <v-card-actions class="pa-4 pa-md-6 pt-0">
                    <v-spacer></v-spacer>
                    <v-btn variant="outlined" @click="cerrarDialogoPago" class="text-none">
                        Cancelar
                    </v-btn>
                    <v-btn color="success" variant="elevated" @click="registrarPago" class="text-none"
                        :disabled="!pagoData.modoPago || !pagoData.fechaPago" :loading="guardandoPago">
                        <v-icon class="mr-1">mdi-check</v-icon>
                        Confirmar Pago
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Diálogo para registro masivo de pagos -->
        <v-dialog v-model="dialogPagoMultiple" max-width="500" persistent>
            <v-card>
                <v-card-title class="d-flex align-center pa-4 pa-md-6 pb-4">
                    <v-icon color="success" size="24" class="mr-2">mdi-cash-multiple</v-icon>
                    <span class="text-subtitle-1 text-md-h6 font-weight-medium">Registrar Pagos Múltiples</span>
                </v-card-title>

                <v-card-text class="pa-4 pa-md-6 pt-0">
                    <v-alert type="info" variant="tonal" class="mb-4">
                        <div><strong>Ventas seleccionadas:</strong> {{ seleccionados.length }}</div>
                        <div><strong>Total:</strong> {{ formatoMoneda(calcularTotalSeleccionados()) }}</div>
                    </v-alert>

                    <v-select v-model="pagoData.modoPago" :items="modosPago" item-title="text" item-value="value"
                        label="Modo de Pago *" variant="outlined" density="comfortable"
                        prepend-inner-icon="mdi-credit-card" :rules="[v => !!v || 'El modo de pago es obligatorio']"
                        class="mb-4">
                        <template v-slot:item="{ props, item }">
                            <v-list-item v-bind="props">
                                <template v-slot:prepend>
                                    <v-icon :icon="item.raw.icon" color="primary"></v-icon>
                                </template>
                            </v-list-item>
                        </template>
                    </v-select>

                    <v-text-field v-model="pagoData.fechaPago" label="Fecha de Pago *" type="date" variant="outlined"
                        density="comfortable" prepend-inner-icon="mdi-calendar"
                        :rules="[v => !!v || 'La fecha es obligatoria']" class="mb-4" />

                    <v-text-field v-model="pagoData.usuario" label="Usuario (opcional)" variant="outlined"
                        density="comfortable" prepend-inner-icon="mdi-account"
                        placeholder="Nombre del usuario que registra" />
                </v-card-text>

                <v-card-actions class="pa-4 pa-md-6 pt-0">
                    <v-spacer></v-spacer>
                    <v-btn variant="outlined" @click="dialogPagoMultiple = false" class="text-none">
                        Cancelar
                    </v-btn>
                    <v-btn color="success" variant="elevated" @click="confirmarPagosMultiples" class="text-none"
                        :disabled="!pagoData.modoPago || !pagoData.fechaPago" :loading="guardandoPago">
                        <v-icon class="mr-1">mdi-check-all</v-icon>
                        Confirmar {{ seleccionados.length }} Pago(s)
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Snackbar para notificaciones -->
        <v-snackbar v-model="snackbar" :timeout="2000" :color="snackbarColor" location="top" class="text-none">
            <div class="d-flex align-center">
                <v-icon class="mr-3">{{ snackbarColor === 'success' ? 'mdi-check-circle' : 'mdi-alert-circle'
                }}</v-icon>
                <span>{{ snackbarMessage }}</span>
            </div>
        </v-snackbar>
    </v-container>
</template>

<script setup
    lang="ts">
    import { ref, onMounted } from 'vue';
    import { supabase } from '../supabase';

    interface Venta {
        id: string;
        codigo: string;
        monto: number;
        cliente?: string;
        tipo: string;
        fecha: string;
        estadoPago?: string;
        modoPago?: string;
    }

    const ventasPendientes = ref<Venta[]>([]);
    const loading = ref(false);
    const dialogPago = ref(false);
    const dialogPagoMultiple = ref(false);
    const ventaSeleccionada = ref<Venta | null>(null);
    const seleccionados = ref<string[]>([]);
    const guardandoPago = ref(false);
    const snackbar = ref(false);
    const snackbarMessage = ref('');
    const snackbarColor = ref('success');

    const pagoData = ref({
        modoPago: '',
        fechaPago: new Date().toISOString().split('T')[0],
        usuario: ''
    });

    const modosPago = [
        { text: 'Transferencia', value: 'transferencia', icon: 'mdi-bank-transfer' },
        { text: 'Efectivo', value: 'efectivo', icon: 'mdi-cash' },
        { text: 'Débito/Crédito', value: 'debito-credito', icon: 'mdi-credit-card' }
    ];

    const headers = ref([
        { title: 'Código', key: 'codigo', sortable: true },
        { title: 'Cliente', key: 'cliente', sortable: true },
        { title: 'Monto', key: 'monto', sortable: true },
        { title: 'Tipo', key: 'tipo', sortable: true },
        { title: 'Fecha Venta', key: 'fecha', sortable: true },
        { title: 'Acciones', key: 'actions', sortable: false },
    ]);

    onMounted(() => {
        cargarVentasPendientes();
    });

    async function cargarVentasPendientes() {
        loading.value = true;
        try {
            const { data, error } = await supabase.from('ventas').select('*, clientes(nombre)').eq('estado_pago', 'pendiente');
            if (error) throw error;

            ventasPendientes.value = [];
            data.forEach((v: any) => {
                ventasPendientes.value.push({
                    id: v.id,
                    codigo: v.codigo,
                    monto: v.monto,
                    cliente: v.clientes?.nombre || v.cliente_id || 'Cliente desconocido',
                    tipo: v.tipo,
                    fecha: v.fecha,
                    estadoPago: v.estado_pago,
                    modoPago: v.modo_pago
                } as Venta);
            });

            console.log(`✅ Cargadas ${ventasPendientes.value.length} ventas pendientes de pago`);
        } catch (error) {
            console.error('Error cargando ventas pendientes:', error);
            mostrarNotificacion('Error al cargar ventas pendientes', 'error');
        } finally {
            loading.value = false;
        }
    }

    function abrirDialogoPago(venta: Venta) {
        ventaSeleccionada.value = venta;
        pagoData.value = {
            modoPago: '',
            fechaPago: new Date().toISOString().split('T')[0],
            usuario: ''
        };
        dialogPago.value = true;
    }

    function cerrarDialogoPago() {
        dialogPago.value = false;
        ventaSeleccionada.value = null;
    }

    async function registrarPago() {
        if (!ventaSeleccionada.value || !pagoData.value.modoPago || !pagoData.value.fechaPago) {
            mostrarNotificacion('Por favor completa todos los campos obligatorios', 'error');
            return;
        }

        guardandoPago.value = true;
        try {
            const { error } = await supabase.from('ventas').update({
                estado_pago: 'pagado',
                modo_pago: pagoData.value.modoPago,
                fecha_pago: pagoData.value.fechaPago,
                usuario_pago: pagoData.value.usuario || 'No especificado'
            }).eq('id', ventaSeleccionada.value.id);
            if (error) throw error;

            mostrarNotificacion('✅ Pago registrado correctamente', 'success');
            cerrarDialogoPago();
            await cargarVentasPendientes();
        } catch (error) {
            console.error('Error registrando pago:', error);
            mostrarNotificacion('❌ Error al registrar el pago', 'error');
        } finally {
            guardandoPago.value = false;
        }
    }

    function mostrarNotificacion(mensaje: string, color: string) {
        snackbarMessage.value = mensaje;
        snackbarColor.value = color;
        snackbar.value = true;
    }

    function formatoMoneda(valor: number | null | undefined) {
        if (valor == null) return '$0';
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            minimumFractionDigits: 0
        }).format(valor);
    }

    function formatFecha(fecha?: string) {
        if (!fecha) return '';
        const d = new Date(fecha);
        return d.toLocaleString('es-CL', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function limpiarSeleccion() {
        seleccionados.value = [];
    }

    function registrarPagosMultiples() {
        if (seleccionados.value.length === 0) {
            mostrarNotificacion('No hay ventas seleccionadas', 'warning');
            return;
        }
        dialogPagoMultiple.value = true;
    }

    async function confirmarPagosMultiples() {
        if (!pagoData.value.modoPago || !pagoData.value.fechaPago) {
            mostrarNotificacion('Por favor completa todos los campos obligatorios', 'error');
            return;
        }

        guardandoPago.value = true;
        try {
            let exitosos = 0;
            let fallidos = 0;

            for (const ventaId of seleccionados.value) {
                try {
                    const { error } = await supabase.from('ventas').update({
                        estado_pago: 'pagado',
                        modo_pago: pagoData.value.modoPago,
                        fecha_pago: pagoData.value.fechaPago,
                        usuario_pago: pagoData.value.usuario || 'No especificado'
                    }).eq('id', ventaId);
                    if (error) throw error;
                    exitosos++;
                } catch (error) {
                    console.error(`Error registrando pago para venta ${ventaId}:`, error);
                    fallidos++;
                }
            }

            if (exitosos > 0) {
                mostrarNotificacion(`✅ ${exitosos} pago(s) registrado(s) correctamente`, 'success');
            }
            if (fallidos > 0) {
                mostrarNotificacion(`⚠️ ${fallidos} pago(s) fallaron`, 'warning');
            }

            dialogPagoMultiple.value = false;
            limpiarSeleccion();
            await cargarVentasPendientes();
        } catch (error) {
            console.error('Error en registro masivo:', error);
            mostrarNotificacion('❌ Error al registrar pagos', 'error');
        } finally {
            guardandoPago.value = false;
        }
    }

    function calcularTotalSeleccionados() {
        return ventasPendientes.value
            .filter(v => seleccionados.value.includes(v.id))
            .reduce((total, v) => total + (v.monto || 0), 0);
    }
</script>