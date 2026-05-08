<template>
    <v-main>
        <StatsCards :stats="stats" :loading="loading" />
        <v-container fluid class="mt-4">
            <v-card elevation="2">
                <v-card-title>Gráfico de Ventas Mensuales</v-card-title>
                <v-card-text>
                    <MonthlySalesChart :monthly-sales="monthlySales" />
                </v-card-text>
            </v-card>
        </v-container>
        <PendingWithdrawals :withdrawals="retirosStore.retiros" :loading="loading" />
        <PendingPayments :payments="pendingPayments" :loading="loading" />
 
        <v-container fluid class="mt-8">
            <v-card elevation="2" border="error" variant="outlined" class="bg-red-lighten-5">
                <v-card-title class="text-error d-flex align-center">
                    <v-icon class="mr-2">mdi-alert</v-icon>
                    Zona de Peligro
                </v-card-title>
                <v-card-text>
                    <p class="text-body-2 mb-4">Estas acciones son irreversibles. Ten precaución.</p>
                    <v-btn color="error" variant="elevated" prepend-icon="mdi-trash-can" @click="confirmarVaciarVentas">
                        Vaciar Base de Datos de Ventas
                    </v-btn>
                </v-card-text>
            </v-card>
        </v-container>
 
        <!-- Diálogo de Confirmación para Vaciar Ventas -->
        <v-dialog v-model="dialogVaciar" max-width="400">
            <v-card>
                <v-card-title class="text-h6 bg-error text-white">
                    ¿Estás absolutamente seguro?
                </v-card-title>
                <v-card-text class="pa-4">
                    Esta acción eliminará <strong>TODAS</strong> las ventas registradas de forma permanente. No se pueden recuperar.
                </v-card-text>
                <v-card-actions class="pa-4">
                    <v-spacer></v-spacer>
                    <v-btn variant="text" @click="dialogVaciar = false">Cancelar</v-btn>
                    <v-btn color="error" variant="elevated" @click="ejecutarVaciarVentas" :loading="vaciando">
                        Sí, eliminar todo
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
 
        <v-snackbar v-model="snackbarAdmin" :timeout="3000" :color="snackbarColor" location="top">
            {{ snackbarMsg }}
        </v-snackbar>
 
    </v-main>
</template>

<script setup
    lang="ts">
    import { ref, onMounted, onUnmounted } from 'vue'
    // Importaciones de Firebase eliminadas. Usaremos los Stores de Supabase.
    import StatsCards from '@/components/StatsCards.vue'
    import PendingWithdrawals from '@/components/PendingWithdrawals.vue'
    import PendingPayments from '@/components/PendingPayments.vue'
    import MonthlySalesChart from '@/components/MonthlySalesChart.vue'; // Importa el nuevo componente
    import { useRetirosStore } from '../stores/retirosStore';
    // Importa el store de Pinia
    import { useClientesStore } from '../stores/clientesStore' // Asegúrate de que la ruta sea correcta
    const retirosStore = useRetirosStore();
    const clientesStore = useClientesStore();
    import { useVentasStore } from '../stores/ventasStores'; // Importa el store de ventas
    const ventasStore = useVentasStore(); // Usa el store de ventas
    const monthlySales = ref({}); // Variable para almacenar los datos del gráfico


    // Interfaces
    // interface Retiro {
    //     id: string;
    //     ventaId: string;
    //     clienteId: string;
    //     monto: number;
    //     estado: string;
    //     fecha: string;
    //     retiradoPor?: string;
    //     fechaRetiro?: string;
    //     modoPago?: string;
    //     clienteNombre?: string;
    //     codigoVenta?: string;
    // }

    interface Pago {
        id: string;
        monto: number;
        estado: 'pendiente' | 'completado';
        cliente?: string;
        fecha?: any;
    }

    interface Stats {
        totalVentas: number;
        totalVentasLive: number;
        totalVentasDiarias: number;
        totalLivePendientePago: number;
        totalLivePendienteRetiro: number;
        cantidadVentas: number;
    }

    // Estado reactivo para almacenar los datos
    const stats = ref<Stats>({ 
        totalVentas: 0, 
        totalVentasLive: 0, 
        totalVentasDiarias: 0, 
        totalLivePendientePago: 0,
        totalLivePendienteRetiro: 0,
        cantidadVentas: 0 
    })
    // const pendingWithdrawals = ref<Retiro[]>([])
    const pendingPayments = ref<Pago[]>([])
    const loading = ref(true)
    const dialogVaciar = ref(false)
    const vaciando = ref(false)
    const snackbarAdmin = ref(false)
    const snackbarMsg = ref('')
    const snackbarColor = ref('success')

    let unsubscribeVentas: (() => void) | undefined;
    let unsubscribePagos: (() => void) | undefined;

    // Función para obtener el inicio y fin del mes actual


    // Nos conectamos a Firestore al montar el componente
    onMounted(async () => {
        try {
            console.log('📈 Iniciando carga de datos...');
            
            // Cargar todos los datos necesarios
            await Promise.all([
                ventasStore.cargarTodasLasVentas(),
                clientesStore.cargarClientes(),
                retirosStore.cargarRetirosDelMes()
            ]);

            const hoy = new Date();
            const mesActual = hoy.getMonth();
            const anioActual = hoy.getFullYear();
            
            let total = 0, totalLive = 0, totalDiaria = 0, cantidad = 0;
            let totalLivePendPago = 0, totalLivePendRetiro = 0;
            
            console.log(`🔍 Analizando ${ventasStore.ventas.length} ventas y ${retirosStore.retiros.length} retiros...`);

            // Calcular estadísticas de ventas
            ventasStore.ventas.forEach(venta => {
               if (venta.fecha) {
                    const ventaDate = new Date(venta.fecha);
                    
                    // Comprobamos si es el mismo mes y año
                    if (ventaDate.getMonth() === mesActual && ventaDate.getFullYear() === anioActual) {
                        const monto = Number(venta.monto) || 0;
                        const esPagada = venta.estado_pago === 'pagado';
                        const tieneCliente = venta.cliente_id !== null;

                        // Solo contamos como "ventas reales" las pagadas con cliente
                        if (esPagada && tieneCliente) {
                            total += monto;
                            cantidad++;
                            if (venta.tipo === 'Venta Live') totalLive += monto;
                            else totalDiaria += monto;
                        }

                        // Pendientes de pago (Solo Live y con cliente conocido)
                        if (venta.tipo === 'Venta Live' && !esPagada && tieneCliente) {
                            totalLivePendPago += monto;
                        }
                    }
                }
            });

            // Calcular retiros pendientes (Solo Live - Cantidad)
            retirosStore.retiros.forEach(retiro => {
                const retiroDate = new Date(retiro.fecha);
                if (retiroDate.getMonth() === mesActual && retiroDate.getFullYear() === anioActual) {
                    if (retiro.tipoVenta === 'Venta Live' && retiro.estado === 'pendiente') {
                        totalLivePendRetiro++;
                    }
                }
            });

            stats.value = { 
                totalVentas: total, 
                totalVentasLive: totalLive, 
                totalVentasDiarias: totalDiaria, 
                totalLivePendientePago: totalLivePendPago,
                totalLivePendienteRetiro: totalLivePendRetiro,
                cantidadVentas: cantidad 
            };
            
            // Carga los datos de ventas mensuales para el gráfico
            monthlySales.value = await ventasStore.cargarVentasMensuales();
            
            console.log('✅ Estadísticas calculadas:', stats.value);
        } catch(error) {
           console.error("❌ Error en Dashboard:", error)
        } finally {
            loading.value = false;
        }
    })

    function confirmarVaciarVentas() {
        dialogVaciar.value = true;
    }

    async function ejecutarVaciarVentas() {
        vaciando.value = true;
        try {
            await ventasStore.vaciarVentas();
            snackbarMsg.value = '✅ Base de datos de ventas vaciada correctamente';
            snackbarColor.value = 'success';
            snackbarAdmin.value = true;
            dialogVaciar.value = false;
            
            // Recargar datos para actualizar la UI
            await ventasStore.cargarTodasLasVentas();
            stats.value = { 
                totalVentas: 0, 
                totalVentasLive: 0, 
                totalVentasDiarias: 0, 
                totalLivePendientePago: 0,
                totalLivePendienteRetiro: 0,
                cantidadVentas: 0 
            };
            monthlySales.value = {};
        } catch (error) {
            console.error('Error al vaciar ventas:', error);
            snackbarMsg.value = '❌ Error al vaciar la base de datos';
            snackbarColor.value = 'error';
            snackbarAdmin.value = true;
        } finally {
            vaciando.value = false;
        }
    }

    // Limpiamos los listeners al desmontar para evitar fugas de memoria
    onUnmounted(() => {
        unsubscribeVentas?.();
        unsubscribePagos?.();
    });
</script>
