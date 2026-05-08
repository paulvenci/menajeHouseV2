<template>
    <v-container fluid>
        <v-row>
            <v-col cols="12" sm="6" md="4" lg="2">
                <v-card :loading="loading" elevation="4" class="rounded-xl overflow-hidden stat-card">
                    <div class="card-gradient bg-primary"></div>
                    <v-card-item class="relative">
                        <template v-slot:prepend>
                            <v-icon color="primary" size="32" class="mr-2">mdi-cash-multiple</v-icon>
                        </template>
                        <v-card-title class="text-overline">Ventas Totales</v-card-title>
                        <v-card-text class="text-h5 font-weight-bold pa-0 mt-2">
                            ${{ stats.totalVentas.toLocaleString('es-CL') }}
                        </v-card-text>
                    </v-card-item>
                </v-card>
            </v-col>

            <v-col cols="12" sm="6" md="4" lg="2">
                <v-card :loading="loading" elevation="4" class="rounded-xl overflow-hidden stat-card">
                    <div class="card-gradient bg-purple"></div>
                    <v-card-item class="relative">
                        <template v-slot:prepend>
                            <v-icon color="purple" size="32" class="mr-2">mdi-video</v-icon>
                        </template>
                        <v-card-title class="text-overline">Ventas Live</v-card-title>
                        <v-card-text class="text-h5 font-weight-bold pa-0 mt-2">
                            ${{ stats.totalVentasLive.toLocaleString('es-CL') }}
                        </v-card-text>
                    </v-card-item>
                </v-card>
            </v-col>

            <v-col cols="12" sm="6" md="4" lg="2">
                <v-card :loading="loading" elevation="4" class="rounded-xl overflow-hidden stat-card">
                    <div class="card-gradient bg-blue"></div>
                    <v-card-item class="relative">
                        <template v-slot:prepend>
                            <v-icon color="blue" size="32" class="mr-2">mdi-calendar-check</v-icon>
                        </template>
                        <v-card-title class="text-overline">Ventas Diarias</v-card-title>
                        <v-card-text class="text-h5 font-weight-bold pa-0 mt-2">
                            ${{ stats.totalVentasDiarias.toLocaleString('es-CL') }}
                        </v-card-text>
                    </v-card-item>
                </v-card>
            </v-col>

            <v-col cols="12" sm="6" md="4" lg="2">
                <v-card :loading="loading" elevation="4" class="rounded-xl overflow-hidden stat-card">
                    <div class="card-gradient bg-warning"></div>
                    <v-card-item class="relative">
                        <template v-slot:prepend>
                            <v-icon color="warning" size="32" class="mr-2">mdi-cash-clock</v-icon>
                        </template>
                        <v-card-title class="text-overline">Live Pend. Pago</v-card-title>
                        <v-card-text class="text-h5 font-weight-bold pa-0 mt-2">
                            ${{ stats.totalLivePendientePago.toLocaleString('es-CL') }}
                        </v-card-text>
                    </v-card-item>
                </v-card>
            </v-col>

            <v-col cols="12" sm="6" md="4" lg="2">
                <v-card :loading="loading" elevation="4" class="rounded-xl overflow-hidden stat-card">
                    <div class="card-gradient bg-error"></div>
                    <v-card-item class="relative">
                        <template v-slot:prepend>
                            <v-icon color="error" size="32" class="mr-2">mdi-package-variant-closed</v-icon>
                        </template>
                        <v-card-title class="text-overline">Live Pend. Retiro</v-card-title>
                        <v-card-text class="text-h5 font-weight-bold pa-0 mt-2">
                            {{ stats.totalLivePendienteRetiro }} retiros
                        </v-card-text>
                    </v-card-item>
                </v-card>
            </v-col>

            <v-col cols="12" sm="6" md="4" lg="2">
                <v-card :loading="loading" elevation="4" class="rounded-xl overflow-hidden stat-card">
                    <div class="card-gradient bg-success"></div>
                    <v-card-item class="relative">
                        <template v-slot:prepend>
                            <v-icon color="success" size="32" class="mr-2">mdi-chart-line</v-icon>
                        </template>
                        <v-card-title class="text-overline">Cant. Ventas</v-card-title>
                        <v-card-text class="text-h5 font-weight-bold pa-0 mt-2">
                            {{ stats.cantidadVentas }}
                        </v-card-text>
                    </v-card-item>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup
    lang="ts">
    interface Stats {
        totalVentas: number;
        totalVentasLive: number;
        totalVentasDiarias: number;
        totalLivePendientePago: number;
        totalLivePendienteRetiro: number;
        cantidadVentas: number;
    }
    
    
    defineProps<{
        stats: Stats;
        loading: boolean;
    }>();
</script>

<style scoped>
.stat-card {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    border: none;
    background: #fff;
}
.stat-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 20px rgba(0,0,0,0.12) !important;
}
.card-gradient {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    opacity: 0.8;
}
.relative {
    position: relative;
}
.bg-primary { background: linear-gradient(90deg, #1867C0, #5CBBF6); }
.bg-purple { background: linear-gradient(90deg, #9C27B0, #E040FB); }
.bg-blue { background: linear-gradient(90deg, #2196F3, #00BCD4); }
.bg-warning { background: linear-gradient(90deg, #FB8C00, #FFD54F); }
.bg-error { background: linear-gradient(90deg, #FF5252, #FF8A80); }
.bg-success { background: linear-gradient(90deg, #4CAF50, #81C784); }
</style>