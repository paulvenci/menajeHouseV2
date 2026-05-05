<template>
    <v-container fluid class="pa-4" style="min-height: 100vh;">
        <!-- Debug Information (only show if there's an issue) -->
        <v-row v-if="error || ventasStore.ventas.length === 0">
            <v-col cols="12">
                <v-alert v-if="error" type="error" class="mb-4" :text="error" title="Error al cargar datos"></v-alert>

                <v-alert v-else-if="!loading && ventasStore.ventas.length === 0" type="warning" class="mb-4"
                    title="Sin datos"
                    text="No se encontraron ventas en la base de datos. Verifica que existan registros de ventas."></v-alert>

                <!-- Debug Card -->
                <v-card class="mb-4" elevation="2">
                    <v-card-title>Información de Debug</v-card-title>
                    <v-card-text>
                        <div>Estado de carga iniciado: {{ debugInfo.loadingStarted ? '✅' : '❌' }}</div>
                        <div>Estado de carga completado: {{ debugInfo.loadingCompleted ? '✅' : '❌' }}</div>
                        <div>Error ocurrido: {{ debugInfo.errorOccurred ? '❌' : '✅' }}</div>
                        <div>Cantidad de ventas: {{ debugInfo.ventasCount }}</div>
                        <div>Cargando: {{ loading ? '⏳' : '✅' }}</div>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <v-row>
            <v-col cols="12">
                <v-card class="mb-4" elevation="2">
                    <v-card-title class="text-h4 text-center">
                        Estadística de Compra Cargada
                    </v-card-title>
                    <v-card-subtitle class="text-center">
                        Totales ({{ ventasStore.ventas.length }} registros)
                    </v-card-subtitle>
                </v-card>
            </v-col>
        </v-row>

        <!-- Statistics Cards -->
        <v-row class="mb-4">
            <v-col cols="12" sm="6" md="3">
                <v-card elevation="2">
                    <v-card-item>
                        <v-card-title>Total Compras</v-card-title>
                        <v-card-subtitle>Cantidad total de compras</v-card-subtitle>
                    </v-card-item>
                    <v-card-text class="text-h4">
                        {{ stats.totalCompras }}
                    </v-card-text>
                </v-card>
            </v-col>
            <v-col cols="12" sm="6" md="3">
                <v-card elevation="2">
                    <v-card-item>
                        <v-card-title>Monto Total Gastado</v-card-title>
                        <v-card-subtitle>Suma de todos los montos</v-card-subtitle>
                    </v-card-item>
                    <v-card-text class="text-h4">
                        ${{ stats.montoTotal.toLocaleString('es-CL') }}
                    </v-card-text>
                </v-card>
            </v-col>
            <v-col cols="12" sm="6" md="3">
                <v-card elevation="2">
                    <v-card-item>
                        <v-card-title>Promedio por Compra</v-card-title>
                        <v-card-subtitle>Monto promedio</v-card-subtitle>
                    </v-card-item>
                    <v-card-text class="text-h4">
                        ${{ stats.promedioCompra.toLocaleString('es-CL') }}
                    </v-card-text>
                </v-card>
            </v-col>
            <v-col cols="12" sm="6" md="3">
                <v-card elevation="2">
                    <v-card-item>
                        <v-card-title>N° Cliente</v-card-title>
                        <v-card-subtitle>Cantidad de clientes únicos</v-card-subtitle>
                    </v-card-item>
                    <v-card-text class="text-h4">
                        {{ stats.numeroClientes }}
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <!-- Chart and Filters Row -->
        <v-row class="mb-4">
            <v-col cols="12" md="6">
                <v-card elevation="2">
                    <v-card-item>
                        <v-card-title>Gráfico de Distribución por Cliente</v-card-title>
                        <v-card-subtitle>Cliente - Cant. - Monto
                            Total</v-card-subtitle>
                    </v-card-item>
                    <v-card-text>
                        <div style="height: 300px;">
                            <Pie ref="pieChartRef" :data="chartData" :options="chartOptions" />
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>
            <v-col cols="12" md="6">
                <v-row>
                    <v-col cols="12">
                        <v-card elevation="2">
                            <v-card-item>
                                <v-card-title>Filtro por Cliente</v-card-title>
                            </v-card-item>
                            <v-card-text>
                                <v-select v-model="selectedClient" :items="clientOptions" label="Seleccionar Cliente"
                                    variant="outlined"></v-select>
                            </v-card-text>
                        </v-card>
                    </v-col>
                    <v-col cols="12">
                        <v-card elevation="2">
                            <v-card-item>
                                <v-card-title>Periodo</v-card-title>
                            </v-card-item>
                            <v-card-text>
                                <v-select v-model="selectedPeriod" :items="periodOptions" label="Seleccionar Periodo"
                                    variant="outlined"></v-select>
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>
            </v-col>
        </v-row>

        <!-- Purchase Summary -->
        <v-row class="mb-4">
            <v-col cols="12">
                <v-card elevation="2">
                    <v-card-title>Resumen de Compras</v-card-title>
                    <v-card-text>
                        <v-row>
                            <v-col cols="12" md="4">
                                <div class="text-center">
                                    <div class="text-h6">Total Compras</div>
                                    <div class="text-h4 text-primary">{{ filteredVentas.length }}</div>
                                </div>
                            </v-col>
                            <v-col cols="12" md="4">
                                <div class="text-center">
                                    <div class="text-h6">Monto Total Gastado</div>
                                    <div class="text-h4 text-success">${{
                                        filteredStats.montoTotal.toLocaleString('es-CL') }}</div>
                                </div>
                            </v-col>
                            <v-col cols="12" md="4">
                                <div class="text-center">
                                    <div class="text-h6">Promedio por Compra</div>
                                    <div class="text-h4 text-warning">${{
                                        filteredStats.promedioCompra.toLocaleString('es-CL') }}</div>
                                </div>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <!-- Detailed Table -->
        <v-row>
            <v-col cols="12">
                <v-card elevation="2">
                    <v-card-title>Detalle de Compras</v-card-title>
                    <v-card-text>
                        <v-data-table :headers="headers" :items="filteredVentas" :loading="loading">
                            <template v-slot:item.fecha="{ item }">
                                <span>{{ formatDate(item.fecha) }}</span>
                            </template>
                            <template v-slot:item.cliente="{ item }">
                                <span>{{ item.cliente || 'N/A' }}</span>
                            </template>
                            <template v-slot:item.codigo="{ item }">
                                <span>{{ item.codigo }}</span>
                            </template>
                            <template v-slot:item.monto="{ item }">
                                <span>${{ (item.monto || 0).toLocaleString('es-CL') }}</span>
                            </template>
                        </v-data-table>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useVentasStore } from '../stores/ventasStores';
import { Pie } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale } from 'chart.js';
import { useTheme } from 'vuetify';

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale);

const theme = useTheme();

const ventasStore = useVentasStore();
const loading = ref(true);
const selectedClient = ref('Todos');
const selectedPeriod = ref('Todo el período');
const error = ref(null);
const pieChartRef = ref(null);
const debugInfo = ref({
    ventasCount: 0,
    loadingStarted: false,
    loadingCompleted: false,
    errorOccurred: false
});

const headers = [
    { title: 'Fecha', key: 'fecha', width: '150px' },
    { title: 'Cliente', key: 'cliente', width: '200px' },
    { title: 'Código', key: 'codigo', width: '150px' },
    { title: 'Monto', key: 'monto', width: '150px', align: 'end' }
];

const clientOptions = computed(() => {
    const clients = [...new Set(ventasStore.ventas.map(v => v.cliente).filter(Boolean))];
    return ['Todos', ...clients];
});

const periodOptions = [
    'Todo el período',
    'Hoy',
    'Esta semana',
    'Este mes',
    'Últimos 30 días',
    'Últimos 90 días'
];

const stats = computed(() => {
    const ventas = ventasStore.ventas;
    const totalCompras = ventas.length;
    const montoTotal = ventas.reduce((sum, v) => sum + (Number(v.monto) || 0), 0);
    const promedioCompra = totalCompras > 0 ? montoTotal / totalCompras : 0;
    const numeroClientes = new Set(ventas.map(v => v.cliente).filter(Boolean)).size;

    return {
        totalCompras,
        montoTotal,
        promedioCompra,
        numeroClientes
    };
});

const filteredVentas = computed(() => {
    let filtered = [...ventasStore.ventas];

    // Filter by client
    if (selectedClient.value !== 'Todos') {
        filtered = filtered.filter(venta => venta.cliente === selectedClient.value);
    }

    // Filter by period
    if (selectedPeriod.value !== 'Todo el período') {
        filtered = filtered.filter(venta => {
            const ventaDate = new Date(venta.fecha);
            const now = new Date();

            switch (selectedPeriod.value) {
                case 'Hoy':
                    return ventaDate.toDateString() === now.toDateString();
                case 'Esta semana': {
                    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
                    return ventaDate >= weekStart;
                }
                case 'Este mes':
                    return ventaDate.getMonth() === now.getMonth() &&
                        ventaDate.getFullYear() === now.getFullYear();
                case 'Últimos 30 días': {
                    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    return ventaDate >= thirtyDaysAgo;
                }
                case 'Últimos 90 días': {
                    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                    return ventaDate >= ninetyDaysAgo;
                }
                default:
                    return true;
            }
        });
    }

    return filtered.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
});

const filteredStats = computed(() => {
    const ventas = filteredVentas.value;
    const totalCompras = ventas.length;
    const montoTotal = ventas.reduce((sum, v) => sum + (Number(v.monto) || 0), 0);
    const promedioCompra = totalCompras > 0 ? montoTotal / totalCompras : 0;

    return {
        totalCompras,
        montoTotal,
        promedioCompra
    };
});

const chartData = computed(() => {
    const salesByClient = {};

    filteredVentas.value.forEach(venta => {
        if (venta.cliente) {
            salesByClient[venta.cliente] = (salesByClient[venta.cliente] || 0) + (Number(venta.monto) || 0);
        }
    });

    const clients = Object.keys(salesByClient);
    const amounts = Object.values(salesByClient);

    // Generate colors for each client
    const colors = clients.map((_, index) => {
        const hue = (index * 137.5) % 360;
        return `hsl(${hue}, 70%, 50%)`;
    });

    return {
        labels: clients,
        datasets: [
            {
                label: 'Ventas por Cliente',
                backgroundColor: colors,
                data: amounts,
                borderWidth: 2,
                borderColor: '#fff'
            }
        ]
    };
});

const chartOptions = computed(() => {
    const isDark = theme.global.current.value.dark;
    const textColor = isDark ? '#fff' : '#000';

    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: {
                display: true,
                text: 'Distribución de Ventas por Cliente',
                color: textColor,
                font: {
                    size: 16
                }
            },
            legend: {
                labels: {
                    color: textColor,
                    font: {
                        size: 12
                    }
                }
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        let label = context.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed !== null) {
                            label += new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(context.parsed);
                        }
                        return label;
                    }
                }
            }
        }
    };
});

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    let d;
    if (typeof dateString === 'string' && dateString.length === 10 && !dateString.includes('T')) {
        d = new Date(dateString.replace(/-/g, '/'));
    } else {
        d = new Date(dateString);
    }
    return d.toLocaleDateString('es-CL', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
};

onMounted(async () => {
    try {
        loading.value = true;
        debugInfo.value.loadingStarted = true;
        console.log('🔄 Iniciando carga de ventas...');

        await ventasStore.cargarTodasLasVentas();

        debugInfo.value.ventasCount = ventasStore.ventas.length;
        debugInfo.value.loadingCompleted = true;

        console.log('✅ Ventas cargadas:', ventasStore.ventas.length);
        console.log('📊 Datos de ventas:', ventasStore.ventas);

        if (ventasStore.ventas.length === 0) {
            console.warn('⚠️ No se encontraron ventas en la base de datos');
        }

    } catch (err) {
        console.error('❌ Error al cargar ventas:', err);
        error.value = err.message || 'Error desconocido al cargar las ventas';
        debugInfo.value.errorOccurred = true;
    } finally {
        loading.value = false;
    }
});

onBeforeUnmount(() => {
    // Destruir el chart antes de que Vue remueva el DOM
    if (pieChartRef.value?.chart) {
        pieChartRef.value.chart.destroy();
    }
});
</script>