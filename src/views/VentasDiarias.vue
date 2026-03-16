<template>
    <v-container fluid class="pa-4 pa-md-6">
        <div class="barra-fija">
            <v-card elevation="3" class="barra-combinada">
                <div class="d-none d-md-flex align-center justify-space-between pa-3 pa-md-4">
                    <div class="d-flex align-center gap-4">
                        <v-btn color="primary" variant="elevated" prepend-icon="mdi-folder-open"
                            @click="dialogFiltro = true" class="text-none mr-2" size="default">
                            Cargar
                        </v-btn>
                        <v-btn color="success" variant="elevated" prepend-icon="mdi-content-save" @click="guardarVentas"
                            class="text-none mr-2" size="default" :disabled="ventasAgregadas.length === 0">
                            Guardar
                        </v-btn>
                        <v-btn color="warning" variant="elevated" prepend-icon="mdi-delete-sweep" @click="limpiarVentas"
                            class="text-none mr-2" size="default" :disabled="ventasAgregadas.length === 0">
                            Limpiar
                        </v-btn>
                        <v-btn color="info" variant="elevated" prepend-icon="mdi-group" @click="agruparVentas"
                            class="text-none mr-2" size="default" :disabled="ventasAgregadas.length === 0">
                            Agrupar
                        </v-btn>
                        <v-btn color="primary" variant="tonal" prepend-icon="mdi-account-plus" @click="dialog = true"
                            class="text-none" size="default">
                            Cliente
                        </v-btn>
                    </div>

                    <div class="d-flex align-center gap-4">
                        <v-chip color="primary" variant="tonal" size="small">
                            <v-icon start size="small">mdi-chart-line</v-icon>
                            {{ estadisticasVentas.total }}
                        </v-chip>
                        <v-chip class="ml-2" color="success" variant="tonal" size="small">
                            <v-icon start size="small">mdi-account-check</v-icon>
                            {{ estadisticasVentas.conCliente }}
                        </v-chip>
                        <v-chip class="ml-2" color="warning" variant="tonal" size="small">
                            <v-icon start size="small">mdi-calendar-today</v-icon>
                            {{ estadisticasVentas.hoy }}
                        </v-chip>
                        <v-chip class="ml-2" color="info" variant="tonal" size="small">
                            {{ formatoMoneda(totalVentas) }}
                        </v-chip>
                    </div>
                </div>

                <div class="d-md-none pa-3">
                    <div class="d-flex align-center justify-center gap-4 mb-4">
                        <v-chip color="primary" variant="tonal" size="x-small">
                            {{ estadisticasVentas.total }}
                        </v-chip>
                        <v-chip color="success" variant="tonal" size="x-small">
                            {{ estadisticasVentas.conCliente }}
                        </v-chip>
                        <v-chip color="warning" variant="tonal" size="x-small">
                            {{ estadisticasVentas.hoy }}
                        </v-chip>
                        <v-chip color="info" variant="tonal" size="x-small">
                            {{ formatoMoneda(totalVentas) }}
                        </v-chip>
                    </div>

                    <div class="d-flex flex-column gap-3">
                        <div class="d-flex gap-3">
                            <v-btn color="primary" variant="elevated" prepend-icon="mdi-folder-open"
                                @click="dialogFiltro = true" class="text-none flex-1" size="small">
                                Cargar
                            </v-btn>
                            <v-btn color="success" variant="elevated" prepend-icon="mdi-content-save"
                                @click="guardarVentas" class="text-none flex-1" size="small"
                                :disabled="ventasAgregadas.length === 0">
                                Guardar
                            </v-btn>
                        </div>

                        <div class="d-flex gap-3">
                            <v-btn color="warning" variant="elevated" prepend-icon="mdi-delete-sweep"
                                @click="limpiarVentas" class="text-none flex-1" size="small"
                                :disabled="ventasAgregadas.length === 0">
                                Limpiar
                            </v-btn>
                            <v-btn color="info" variant="elevated" prepend-icon="mdi-group" @click="agruparVentas"
                                class="text-none flex-1" size="small" :disabled="ventasAgregadas.length === 0">
                                Agrupar
                            </v-btn>
                        </div>

                        <v-btn color="primary" variant="tonal" prepend-icon="mdi-account-plus" @click="dialog = true"
                            class="text-none" size="small" block>
                            Nuevo Cliente
                        </v-btn>
                    </div>
                </div>
            </v-card>
        </div>
        <v-row>
            <v-col cols="12" md="6" lg="5" xl="4">
                <v-card density="compact" elevation="2" class="h-100">
                    <v-card-title density="compact" class="d-flex align-center justify-space-between  pa-md-4  ">
                        <div class=" d-flex align-center">
                            <v-icon color="primary" size="24" size-md="28" class="mr-2 mr-md-3">mdi-cart-plus</v-icon>
                            <span class="text-subtitle-1 text-md-h6 font-weight-medium">Registrar Venta</span>
                        </div>
                        <v-btn icon size="small" variant="tonal" @click="modoEdicion = !modoEdicion"
                            :color="modoEdicion ? 'warning' : 'primary'" class="ml-2">
                            <v-icon>{{ modoEdicion ? 'mdi-check' : 'mdi-drag' }}</v-icon>
                        </v-btn>
                    </v-card-title>

                    <v-card-text class="pa-md-6 pt-0">
                        <v-card variant="outlined" class="mb-4 mb-md-6 pa-3 bg-primary-lighten-5">
                            <div class="d-flex align-center">
                                <v-icon color="primary" class="mr-2">mdi-point-of-sale</v-icon>
                                <span class="font-weight-medium">Punto de Venta Rápido (Ventas Diarias)</span>
                            </div>
                        </v-card>

                        <v-form ref="formVenta">
                            <draggable v-model="camposFormulario" :disabled="!modoEdicion" item-key="id"
                                class="campos-draggable" @start="drag = true" @end="onDragEnd">
                                <template #item="{ element: campo }">
                                    <div class="campo-formulario" :class="{ 'modo-edicion': modoEdicion }">
                                        <div v-if="modoEdicion" class="d-flex align-center mb-2">
                                            <v-icon class="mr-2" color="grey" size="small">mdi-drag</v-icon>
                                            <span class="text-caption text-grey">{{ campo.label }}</span>
                                        </div>

                                        <v-text-field v-if="campo.tipo === 'codigo'" :label="campo.label"
                                            v-model="nuevaVenta.codigo"
                                            :rules="[v => !!v || 'El código es obligatorio']" variant="outlined"
                                            density="compact" class="campo-sin-espacio ma-0 pa-0"
                                            prepend-inner-icon="mdi-barcode" required />

                                        <v-number-input v-else-if="campo.tipo === 'monto'" control-variant="hidden"
                                            :label="campo.label" v-model="nuevaVenta.monto" type="number"
                                            :rules="[v => !!v || 'El monto es obligatorio']" variant="outlined"
                                            density="compact" prepend-inner-icon="mdi-currency-usd"
                                            :formatter="formatoMoneda" :min="0" class="ma-0 pa-0 " required
                                            @focus="handleFocusMonto" />

                                        <v-autocomplete v-else-if="campo.tipo === 'cliente'" :label="campo.label"
                                            v-model="nuevaVenta.cliente"
                                            :items="clientesStore.clientes.map(c => c.nombre)" variant="outlined"
                                            density="compact" prepend-inner-icon="mdi-account" class="ma-0 pa-0"
                                            clearable />

                                        <v-select v-else-if="campo.tipo === 'modoPago'" :label="campo.label"
                                            v-model="nuevaVenta.modoPago" :items="modosPago" item-title="text"
                                            item-value="value" variant="outlined" density="compact"
                                            prepend-inner-icon="mdi-credit-card" clearable>
                                            <template v-slot:item="{ props, item }">
                                                <v-list-item v-bind="props">
                                                    <template v-slot:prepend>
                                                        <v-icon :icon="item.raw.icon" color="primary"></v-icon>
                                                    </template>
                                                    <v-list-item-title>{{ item.raw.text }}</v-list-item-title>
                                                </v-list-item>
                                            </template>
                                        </v-select>
                                    </div>
                                </template>
                            </draggable>

                            <v-checkbox v-model="generarRetiro" label="Generar Retiro Pendiente" color="primary"
                                class="mt-0"></v-checkbox>


                            <v-btn color="primary" size="large" block class="mt-6 text-none" prepend-icon="mdi-plus"
                                @click="registrarVenta" :loading="registrando">
                                Registrar Venta
                            </v-btn>
                        </v-form>
                    </v-card-text>
                </v-card>
            </v-col>

            <v-col cols="12" md="6" lg="7" xl="8">
                <v-card elevation="3" class="h-100">
                    <v-card-title class="d-flex align-center justify-space-between pa-4 pa-md-6 pb-4">
                        <div class="d-flex align-center">
                            <v-icon color="success" size="24" size-md="28"
                                class="mr-2 mr-md-3">mdi-format-list-bulleted</v-icon>
                            <span class="text-subtitle-1 text-md-h6 font-weight-medium">
                                Ventas Registradas
                            </span>
                        </div>
                        <v-tooltip location="top">
                            <template v-slot:activator="{ props }">
                                <v-chip color="primary" variant="tonal" v-bind="props">
                                    {{ ventasFiltradas.length }} items
                                </v-chip>
                            </template>
                            <div class="text-center">
                                <div><strong>Total:</strong> {{ estadisticasFiltradas.total }}</div>
                                <div><strong>Con cliente:</strong> {{ estadisticasFiltradas.conCliente }}</div>
                                <div><strong>Hoy:</strong> {{ estadisticasFiltradas.hoy }}</div>
                                <div><strong>Anteriores:</strong> {{ estadisticasFiltradas.anteriores }}</div>
                            </div>
                        </v-tooltip>

                    </v-card-title>

                    <v-card-text class="pa-4 pa-md-6 pt-0">
                        <v-text-field v-model="busquedaVentas" label="Buscar por código o cliente"
                            prepend-inner-icon="mdi-magnify" variant="outlined" density="compact" clearable
                            class="mb-4"></v-text-field>
                        <div v-if="ventasFiltradas.length === 0" class="text-center py-8 py-md-12">
                            <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-cart-off</v-icon>
                            <h3 v-if="busquedaVentas" class="text-h6 text-grey-darken-1 mb-2">
                                No se encontraron ventas con "{{ busquedaVentas }}"
                            </h3>
                            <h3 v-else class="text-h6 text-grey-darken-1 mb-2">
                                No hay ventas de tipo "{{ tipoSeleccionado }}"
                            </h3>
                            <p class="text-body-2 text-grey">
                                {{ busquedaVentas ? 'Intenta con otra búsqueda.' :
                                    'Cambia el tipo de venta o agrega nuevas ventas' }}
                            </p>
                        </div>

                        <v-list class="ventas-fijas pr-2" v-else>
                            <v-slide-y-transition group>
                                <v-list-item v-for="(venta, index) in ventasFiltradas" :key="venta.id || index"
                                    class="mb-3 rounded-lg border border-blue-lighten-4">
                                    <template #prepend>
                                        <v-avatar color="blue" size="40" variant="tonal">
                                            <v-icon>mdi-calendar</v-icon>
                                        </v-avatar>
                                    </template>

                                    <v-list-item-title class="font-weight-medium mb-1">
                                        <div class="d-flex align-center justify-space-between">
                                            <span>{{ venta.cliente || 'Cliente desconocido' }}</span>
                                            <v-chip :color="venta.guardada ? 'success' : 'warning'" size="x-small"
                                                variant="tonal" class="ml-2">
                                                <v-icon size="x-small" class="mr-1">
                                                    {{ venta.guardada ? 'mdi-cloud-check' : 'mdi-cloud-upload' }}
                                                </v-icon>
                                                {{ venta.guardada ? 'Guardada' : 'Sin guardar' }}
                                            </v-chip>
                                        </div>
                                    </v-list-item-title>

                                    <v-list-item-subtitle>
                                        <div class="d-none d-md-flex align-center flex-wrap gap-3">
                                            <span class="d-flex align-center">
                                                <v-icon size="small" class="mr-1">mdi-barcode</v-icon>
                                                <strong>{{ venta.codigo }}</strong>
                                            </span>
                                            <span class="d-flex align-center">
                                                <strong class="ml-2">{{ formatoMoneda(venta.monto) }}</strong>
                                            </span>
                                            <v-chip class="ml-2" color="blue" size="x-small" variant="tonal">
                                                Diaria
                                            </v-chip>
                                            <v-chip class="ml-2"
                                                :color="esVentaDeHoy(venta.fecha) ? 'success' : 'warning'"
                                                size="x-small" variant="tonal">
                                                <v-icon size="x-small" class="mr-1">
                                                    {{ esVentaDeHoy(venta.fecha) ? 'mdi-calendar-today' :
                                                        'mdi-calendar-clock' }}
                                                </v-icon>
                                                {{ esVentaDeHoy(venta.fecha) ? 'Hoy' : 'Anterior' }}
                                            </v-chip>
                                            <span class="text-caption ml-2 text-light-blue-darken-4">
                                                {{ formatFecha(venta.fecha) }}
                                            </span>
                                        </div>

                                        <div class="d-md-none">
                                            <div class="d-flex flex-column gap-1">
                                                <div class="d-flex align-center justify-space-between">
                                                    <span class="d-flex align-center">
                                                        <v-icon size="small" class="mr-1">mdi-barcode</v-icon>
                                                        <strong>{{ venta.codigo }}</strong>
                                                    </span>
                                                    <div class="d-flex align-center gap-1">
                                                        <v-chip color="blue" size="x-small" variant="tonal">
                                                            Diaria
                                                        </v-chip>
                                                        <v-chip
                                                            :color="esVentaDeHoy(venta.fecha) ? 'success' : 'warning'"
                                                            size="x-small" variant="tonal">
                                                            <v-icon size="x-small">
                                                                {{ esVentaDeHoy(venta.fecha) ? 'mdi-calendar-today' :
                                                                    'mdi-calendar-clock' }}
                                                            </v-icon>
                                                        </v-chip>
                                                    </div>
                                                </div>
                                                <div class="d-flex align-center justify-space-between">
                                                    <span class="d-flex align-center">
                                                        <v-icon size="small" class="mr-1">mdi-currency-usd</v-icon>
                                                        <strong>{{ formatoMoneda(venta.monto) }}</strong>
                                                    </span>
                                                    <span class="text-caption text-grey">
                                                        {{ formatFecha(venta.fecha) }}
                                                    </span>
                                                </div>
                                                <div v-if="venta.modoPago"
                                                    class="d-flex align-center justify-space-between">
                                                    <v-chip :color="getModoPagoColor(venta.modoPago)" size="x-small"
                                                        variant="tonal">
                                                        <v-icon size="x-small" class="mr-1">{{
                                                            getModoPagoIcon(venta.modoPago) }}</v-icon>
                                                        {{ getModoPagoText(venta.modoPago) }}
                                                    </v-chip>
                                                </div>
                                            </div>
                                        </div>
                                    </v-list-item-subtitle>

                                    <template #append>
                                        <div class="d-flex align-center">
                                            <v-btn icon size="small" variant="tonal" color="primary"
                                                @click="imprimir(index)" class="mr-6">
                                                <v-icon size="small">mdi-printer</v-icon>
                                            </v-btn>
                                            <v-btn icon size="small" variant="tonal" color="primary"
                                                @click="editarVentaFiltrada(venta)" class="mr-2">
                                                <v-icon size="small">mdi-pencil</v-icon>
                                            </v-btn>
                                            <v-btn icon size="small" variant="tonal" color="error"
                                                @click="eliminarVentaFiltrada(venta)">
                                                <v-icon size="small">mdi-delete</v-icon>
                                            </v-btn>
                                        </div>
                                    </template>
                                </v-list-item>
                            </v-slide-y-transition>
                        </v-list>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <v-row class="mt-4 mt-md-4" v-if="resumenVentas.length > 0">
            <v-col cols="12">
                <v-card elevation="3">
                    <v-card-title class="d-flex align-center pa-4 pa-md-6 pb-4">
                        <v-icon color="info" size="24" size-md="28" class="mr-2 mr-md-3">mdi-chart-pie</v-icon>
                        <span class="text-subtitle-1 text-md-h6 font-weight-medium">Resumen por Cliente</span>
                    </v-card-title>
                    <v-card-text class="">
                        <v-expansion-panels variant="accordion">
                            <v-expansion-panel v-for="(resumen, index) in resumenVentas" :key="index" class="mb-3">
                                <v-expansion-panel-title class="pa-4">
                                    <div class="d-flex align-center justify-space-between w-full">
                                        <div class="d-flex align-center">
                                            <v-avatar color="info" size="32" variant="tonal" class="mr-3">
                                                <v-icon size="small">mdi-account</v-icon>
                                            </v-avatar>
                                            <span class="mr-2 text-h6">{{ resumen.cliente }}</span>
                                        </div>
                                        <div class="d-flex align-center">
                                            <span class="text-h6 font-weight-bold text-success mr-4">
                                                {{ formatoMoneda(resumen.total) }}
                                            </span>
                                            <v-chip color="info" size="small" variant="tonal">
                                                {{ resumen.ventas.length }} ventas
                                            </v-chip>
                                        </div>
                                    </div>
                                </v-expansion-panel-title>

                                <v-expansion-panel-text class="pa-4 pt-0">
                                    <v-textarea v-model="resumen.texto" label="Mensaje para el cliente" auto-grow
                                        variant="outlined" rows="8" class="mb-4" />
                                    <div class="d-flex justify-end">
                                        <v-btn color="primary" variant="elevated" prepend-icon="mdi-content-copy"
                                            @click="copiarTexto(resumen.texto)" class="text-none">
                                            Copiar Mensaje
                                        </v-btn>
                                    </div>
                                </v-expansion-panel-text>
                            </v-expansion-panel>
                        </v-expansion-panels>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <v-snackbar v-model="snackbar" :timeout="3000" color="success" location="top" class="text-none">
            <div class="d-flex align-center">
                <v-icon class="mr-3">mdi-check-circle</v-icon>
                <span>Resumen actualizado correctamente</span>
            </div>
            <template v-slot:actions>
                <v-btn color="white" variant="text" @click="snackbar = false">
                    Cerrar
                </v-btn>
            </template>
        </v-snackbar>

        <v-snackbar v-model="snackbarGuardado" :timeout="2000"
            :color="mensajeSnackbar.includes('✅') ? 'success' : 'error'" location="top" class="text-none">
            <div class="d-flex align-center">
                <v-icon class="mr-3">{{ mensajeSnackbar.includes('✅') ? 'mdi-check-circle' : 'mdi-alert-circle'
                }}</v-icon>
                <span>{{ mensajeSnackbar }}</span>
            </div>
        </v-snackbar>

        <v-dialog v-model="dialog" max-width="500" persistent>
            <v-card>
                <v-card-title class="d-flex align-center pa-4 pa-md-6 pb-4">
                    <v-icon color="primary" size="24" size-md="28" class="mr-2 mr-md-3">mdi-account-plus</v-icon>
                    <span class="text-subtitle-1 text-md-h6 font-weight-medium">Agregar Nuevo Cliente</span>
                </v-card-title>
                <v-card-text class="pa-4 pa-md-6 pt-0">
                    <v-text-field v-model="nuevoCliente.nombre" label="Nombre del cliente" variant="outlined"
                        density="comfortable" prepend-inner-icon="mdi-account"
                        :rules="[v => !!v || 'El nombre es obligatorio']" autofocus />
                </v-card-text>
                <v-card-text class="pa-4 pa-md-6 pt-0">
                    <v-text-field v-model="nuevoCliente.telefono" label="Telefono del cliente" variant="outlined"
                        density="comfortable" prepend-inner-icon="mdi-phone" autofocus />
                </v-card-text>
                <v-card-text class="pa-4 pa-md-6 pt-0">
                    <v-text-field v-model="nuevoCliente.email" label="Email del cliente" variant="outlined"
                        density="comfortable" prepend-inner-icon="mdi-email" autofocus />
                </v-card-text>
                <v-card-actions class="pa-4 pa-md-6 pt-0">
                    <v-spacer></v-spacer>
                    <v-btn variant="outlined" @click="cerrarDialog" class="text-none">
                        Cancelar
                    </v-btn>
                    <v-btn color="primary" variant="elevated" @click="guardarCliente" class="text-none"
                        :disabled="!nuevoCliente">
                        Guardar Cliente
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="dialogFiltro" max-width="500" persistent>
            <v-card>
                <v-card-title class="d-flex align-center  pa-md-6 pb-4">
                    <v-icon color="primary" size="24" size-md="28" class="mr-2 mr-md-3">mdi-filter</v-icon>
                    <span class="text-subtitle-1 text-md-h6 font-weight-medium">Filtrar Ventas</span>
                </v-card-title>
                <v-card-text class="  pt-0">
                    <v-date-picker v-model="filtroFecha" class="" color="primary" />

                </v-card-text>
                <v-card-actions class="pa-4  pt-0">

                    <v-btn variant="outlined" @click="dialogFiltro = false" class="text-none">
                        Cancelar
                    </v-btn>
                    <v-btn color="primary" variant="elevated" @click="abrirVentasFiltradas" class="text-none">
                        Cargar Ventas
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>
</template>

<script setup lang="ts">
    import { ref, reactive, onMounted, computed } from 'vue'
    import { useClientesStore } from '../stores/clientesStore'
    import { supabase } from '../supabase'
    import draggable from 'vuedraggable'

    // Interfaces
    interface Venta {
        id?: string
        codigo: string
        monto: number | null
        cliente?: string
        tipo?: string
        fecha?: string
        modoPago?: string
        guardada?: boolean
        estadoPago?: string
    }

    interface Resumen {
        cliente: string
        total: number
        ventas: Venta[]
        texto: string
    }

    // Configuración de la aplicación
    // Store y estado
    const clientesStore = useClientesStore()
    const registrando = ref(false)
    // const retirosStore = useRetirosStore();
    const generarRetiro = ref(true); // Variable para el checkbox

    // Estado reactivo
    const ventasAgregadas = ref<Venta[]>([])
    const resumenVentas = ref<Resumen[]>([])
    const nuevaVenta = reactive<Venta>({ codigo: '', monto: null, cliente: '', tipo: 'diaria', fecha: '', modoPago: '' })

    // Opciones de modo de pago
    const modosPago = [
        { text: 'Transferencia', value: 'transferencia', icon: 'mdi-bank-transfer' },
        { text: 'Efectivo', value: 'efectivo', icon: 'mdi-cash' },
        { text: 'Débito/Crédito', value: 'debito-credito', icon: 'mdi-credit-card' }
    ]

    const dialog = ref(false)
    const nuevoCliente = ref({
        nombre: '',
        email: '',
        telefono: ''
    })
    const snackbar = ref(false)
    const snackbarGuardado = ref(false)
    const mensajeSnackbar = ref('')
    const tipoSeleccionado = ref('diaria')
    const dialogFiltro = ref(false)
    const filtroFecha = ref('')
    const modoEdicion = ref(false)
    const busquedaVentas = ref('')
    const camposFormulario = ref([
        { id: 'codigo', label: 'Código', tipo: 'codigo' },
        { id: 'monto', label: 'Monto', tipo: 'monto' },
        { id: 'cliente', label: 'Cliente (opcional)', tipo: 'cliente' },
        { id: 'modoPago', label: 'Modo de Pago (opcional)', tipo: 'modoPago' },
    ])
    const drag = ref(false)

    // Computed properties
    const totalVentas = computed(() => {
        return ventasAgregadas.value.reduce((acc, venta) => acc + (venta.monto || 0), 0)
    })

    const ventasConCliente = computed(() => {
        return ventasAgregadas.value.filter(venta => venta.cliente && venta.cliente.trim() !== '')
    })

    const esVentaDeHoy = (fecha?: string) => {
        if (!fecha) return false
        const hoy = new Date().toDateString()
        const fechaVenta = new Date(fecha).toDateString()
        return hoy === fechaVenta
    }

    const estadisticasVentas = computed(() => {
        const ventasHoy = ventasAgregadas.value.filter(v => esVentaDeHoy(v.fecha))
        const ventasAnteriores = ventasAgregadas.value.filter(v => !esVentaDeHoy(v.fecha))
        const ventasHoyConCliente = ventasHoy.filter(v => v.cliente && v.cliente.trim() !== '')
        const ventasAnterioresConCliente = ventasAnteriores.filter(v => v.cliente && v.cliente.trim() !== '')

        return {
            total: ventasAgregadas.value.length,
            conCliente: ventasConCliente.value.length,
            hoy: ventasHoy.length,
            hoyConCliente: ventasHoyConCliente.length,
            anteriores: ventasAnteriores.length,
            anterioresConCliente: ventasAnterioresConCliente.length
        }
    })

    // Ventas filtradas por tipo seleccionado
    const ventasFiltradas = computed(() => {
        let ventas = ventasAgregadas.value.filter(venta => venta.tipo === tipoSeleccionado.value)

        if (busquedaVentas.value && busquedaVentas.value.trim() !== '') {
            const terminoBusqueda = busquedaVentas.value.toLowerCase()
            ventas = ventas.filter(venta =>
                (venta.codigo?.toLowerCase().includes(terminoBusqueda)) ||
                (venta.cliente?.toLowerCase().includes(terminoBusqueda))
            )
        }

        return ventas
    })

    // Estadísticas de las ventas filtradas
    const estadisticasFiltradas = computed(() => {
        const ventasHoy = ventasFiltradas.value.filter(v => esVentaDeHoy(v.fecha))
        const ventasAnteriores = ventasFiltradas.value.filter(v => !esVentaDeHoy(v.fecha))
        const ventasHoyConCliente = ventasHoy.filter(v => v.cliente && v.cliente.trim() !== '')
        const ventasAnterioresConCliente = ventasAnteriores.filter(v => v.cliente && v.cliente.trim() !== '')

        return {
            total: ventasFiltradas.value.length,
            conCliente: ventasFiltradas.value.filter(v => v.cliente && v.cliente.trim() !== '').length,
            hoy: ventasHoy.length,
            hoyConCliente: ventasHoyConCliente.length,
            anteriores: ventasAnteriores.length,
            anterioresConCliente: ventasAnterioresConCliente.length
        }
    })

    // Lifecycle
    onMounted(() => {
        clientesStore.cargarClientes()
        cargarOrdenCampos()
        cargarVentasDelDia() // Cargar automáticamente las ventas del día actual
    })

    // Funciones de utilidad
    const formatoMoneda = (valor: number | null) => {
        if (valor === null) return '$0'
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(valor)
    }

    function formatFecha(fecha?: string | Date) {
        if (!fecha) return ''
        const d = typeof fecha === 'string' ? new Date(fecha) : fecha
        return d.toLocaleDateString('es-CL', { year: 'numeric', month: '2-digit', day: '2-digit' })
    }


    // Funciones de drag and drop
    function cargarOrdenCampos() {
        const ordenGuardado = localStorage.getItem('ordenCamposVentas')
        if (ordenGuardado) {
            try {
                camposFormulario.value = JSON.parse(ordenGuardado)
            } catch (e) {
                console.log('Error al cargar orden de campos, usando orden por defecto')
            }
        }
    }

    function guardarOrdenCampos() {
        localStorage.setItem('ordenCamposVentas', JSON.stringify(camposFormulario.value))
    }

    function onDragEnd() {
        drag.value = false
        guardarOrdenCampos()
    }

    // Funciones de ventas
    function handleFocusMonto() {
        if (nuevaVenta.monto === 0) {
            nuevaVenta.monto = null;
        }
    }
    // Nueva función para imprimir un item de la venta
    function imprimir(index: any) {
        const venta = ventasAgregadas.value[index]
        // Crea el contenido HTML para la ventana de impresión
        const contenidoImprimir = `
        <html>
        <head>
            <title>Imprimir Venta</title>
            <style>
                body {
                    font-family: 'Inter', sans-serif;
                    padding: 0px;
                }
                
                p {
                    font-size: 14px;
                    line-height: 1;
                }
                .label {
                    font-weight: bold;
                }
            </style>
        </head>
        <body>
            <p><span class="label">Fecha:</span> ${formatFecha(venta.fecha)}</p>
            <p><span class="label">Código:</span> ${venta.codigo}</p>
            <p><span class="label">Monto:</span> ${formatoMoneda(venta.monto)}</p>
            ${venta.cliente ? `<p><span class="label">Cliente:</span> ${venta.cliente}</p>` : ''}
            <br>
        </body>
        </html>
    `;

        // Abre una nueva ventana y escribe el contenido
        const ventanaImpresion = window.open('', '_blank');
        if (ventanaImpresion) {
            ventanaImpresion.document.open();
            ventanaImpresion.document.write(contenidoImprimir);
            ventanaImpresion.document.close();

            // Espera a que el contenido se cargue antes de imprimir
            ventanaImpresion.onload = () => {
                ventanaImpresion.print();
                ventanaImpresion.close();
                // alert('Venta enviada a la impresora.');
            };
        } else {
            alert('No se pudo abrir la ventana de impresión. Verifique que los popups no estén bloqueados.');
        }
    };

    async function registrarVenta() {
        if (!nuevaVenta.codigo || nuevaVenta.monto === null) {
            alert('Por favor completa los campos obligatorios')
            return
        }

        registrando.value = true
        try {
            ventasAgregadas.value.unshift({
                ...nuevaVenta,
                tipo: tipoSeleccionado.value,
                fecha: new Date().toISOString(),
                guardada: false
            })
            nuevaVenta.codigo = ''
            nuevaVenta.monto = null
            nuevaVenta.cliente = ''
            nuevaVenta.modoPago = ''
        } finally {
            registrando.value = false
        }
    }

    function editarVenta(index: number) {
        const c = ventasAgregadas.value[index]
        nuevaVenta.codigo = c.codigo
        nuevaVenta.monto = c.monto
        nuevaVenta.cliente = c.cliente
        nuevaVenta.modoPago = c.modoPago || ''
        tipoSeleccionado.value = c.tipo || 'diaria'
        ventasAgregadas.value.splice(index, 1)
    }

    function eliminarVenta(index: number) {
        ventasAgregadas.value.splice(index, 1)
    }

    function editarVentaFiltrada(ventaAEditar: Venta) {
        const indexReal = ventasAgregadas.value.findIndex(v => v === ventaAEditar);

        if (indexReal !== -1) {
            editarVenta(indexReal)
        }
    }

    function eliminarVentaFiltrada(ventaAEliminar: Venta) {
        const indexReal = ventasAgregadas.value.findIndex(v => v === ventaAEliminar);

        if (indexReal !== -1) {
            eliminarVenta(indexReal)
        }
    }

    function agruparVentas() {
        const grupos: Record<string, Venta[]> = {}
        ventasAgregadas.value.forEach((c) => {
            const cliente = c.cliente || 'Cliente desconocido'
            if (!grupos[cliente]) grupos[cliente] = []
            grupos[cliente].push(c)
        })

        resumenVentas.value = Object.entries(grupos).map(([cliente, ventas]) => {
            const total = ventas.reduce((acc, c) => acc + (c.monto || 0), 0)
            const detalle = ventas.map(c => {
                const modoPagoInfo = c.modoPago ? `, Pago: ${getModoPagoText(c.modoPago)}` : ''
                return `- Código: ${c.codigo}, Monto: ${formatoMoneda(c.monto || 0)}${modoPagoInfo}`
            }).join('\n')
            const texto = `Estimado(a) ${cliente},

Este es el detalle de sus compras:

${detalle}

TOTAL: ${formatoMoneda(total)}

Por favor transferir a la siguiente cuenta: 
Nombre: Alicia Yolhet Arias Cea
Banco: Mercado Pago
Tipo de Cuenta: Vista
N° de cuenta: 1038060282
Rut: 10376458-0

¡¡Gracias!! 😊
Equipo de Menaje House`
            return { cliente, total, ventas, texto }
        })

        snackbar.value = true
    }

    function copiarTexto(texto: string) {
        navigator.clipboard.writeText(texto).then(() => {
            alert('Texto copiado al portapapeles ✅')
        })
    }

    function cerrarDialog() {
        dialog.value = false
        nuevoCliente.value.nombre = ''
        nuevoCliente.value.email = ''
        nuevoCliente.value.telefono = ''
    }

    function guardarCliente() {
        if (!nuevoCliente.value) return
        clientesStore.agregarCliente(nuevoCliente.value.nombre, nuevoCliente.value.email, nuevoCliente.value.telefono)
        nuevaVenta.cliente = nuevoCliente.value.nombre
        cerrarDialog()
    }

    function limpiarVentas() {
        ventasAgregadas.value = []
        resumenVentas.value = []
    }

    // Guardar ventas en Supabase con UPSERT (actualizar existentes o crear nuevas)
    async function guardarVentas() {
        registrando.value = true;
        try {
            for (const venta of ventasAgregadas.value) {
                let clienteId = null;
                if (venta.cliente && venta.cliente !== "Cliente desconocido") {
                    const c = clientesStore.clientes.find(c => c.nombre === venta.cliente);
                    if (c) clienteId = c.id;
                }

                const ventaData = {
                    codigo: venta.codigo,
                    monto: venta.monto,
                    cliente_id: clienteId,
                    tipo: venta.tipo || 'diaria',
                    fecha: venta.fecha || new Date().toISOString(),
                    modo_pago: venta.modoPago || null,
                };

                let ventaId = venta.id;
                const esVentaNueva = !venta.id;

                if (venta.id) {
                    // ACTUALIZAR venta existente
                    const { error } = await supabase.from('ventas').update(ventaData).eq('id', venta.id);
                    if (error) throw error;
                    venta.guardada = true;
                    console.log(`✏️ Venta actualizada: ${venta.id}`);
                } else {
                    // CREAR nueva venta
                    const { data, error } = await supabase.from('ventas').insert([ventaData]).select();
                    if (error) throw error;
                    if (data && data.length > 0) {
                        ventaId = data[0].id;
                        venta.id = ventaId;
                    }
                    venta.guardada = true;
                    console.log(`✅ Venta nueva creada: ${ventaId}`);
                }

                // Si el checkbox de retiro está marcado y es una venta NUEVA
                if (generarRetiro.value && esVentaNueva && ventaId) {
                    const retiroData = {
                        venta_id: ventaId,
                        cliente_id: clienteId,
                        monto: venta.monto,
                        estado: 'pendiente',
                        fecha: new Date().toISOString()
                    };

                    const { error: retiroError } = await supabase.from('retiros').insert([retiroData]);
                    if (retiroError) throw retiroError;
                    
                    console.log(`✅ Retiro creado para venta: ${ventaId}`);
                }
            }
            mensajeSnackbar.value = "✅ Ventas guardadas/actualizadas correctamente";
            snackbarGuardado.value = true;
        } catch (err) {
            console.error("Error guardando ventas:", err);
            mensajeSnackbar.value = "❌ Ocurrió un error al guardar ventas";
            snackbarGuardado.value = true;
        } finally {
            registrando.value = false;
        }
    }


    async function abrirVentasFiltradas() {
        try {
            ventasAgregadas.value = []
            let query = supabase.from('ventas').select('*, clientes(nombre)').eq('tipo', 'diaria'); // Forzando diaria

            const { data, error } = await query;
            if (error) throw error;

            data.forEach((v: any) => {
                let mostrar = true
                const ventaConId: Venta = {
                    id: v.id,
                    codigo: v.codigo,
                    monto: v.monto,
                    tipo: v.tipo,
                    fecha: v.fecha,
                    modoPago: v.modo_pago,
                    cliente: v.clientes?.nombre || v.cliente_id || 'Cliente desconocido',
                    guardada: true
                };

                // Si hay fecha seleccionada, cargar TODAS las ventas de ese día
                if (filtroFecha.value) {
                    const ventaFecha = new Date(v.fecha || '').toLocaleDateString('es-CL')
                    const filtro = new Date(filtroFecha.value).toLocaleDateString('es-CL')
                    if (ventaFecha !== filtro) mostrar = false
                }

                if (mostrar) ventasAgregadas.value.push(ventaConId)
            })

            dialogFiltro.value = false
        } catch (err) {
            console.error("Error abriendo ventas:", err)
            alert("❌ Error cargando ventas")
        }
    }

    // Función para cargar automáticamente las ventas del día actual
    async function cargarVentasDelDia() {
        try {
            const hoy = new Date()
            const inicioDelDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()).toISOString();

            const { data, error } = await supabase
                .from('ventas')
                .select('*, clientes(nombre)')
                .eq('tipo', 'diaria') // FORZAR TIPO DIARIA
                .gte('fecha', inicioDelDia)
                .order('fecha', { ascending: false });

            if (error) throw error;

            const ventasDelDia: Venta[] = []

            data.forEach((v: any) => {
                ventasDelDia.push({
                    id: v.id,
                    codigo: v.codigo,
                    monto: v.monto,
                    tipo: v.tipo,
                    fecha: v.fecha,
                    modoPago: v.modo_pago,
                    cliente: v.clientes?.nombre || v.cliente_id || 'Cliente desconocido',
                    guardada: true
                });
            })

            ventasAgregadas.value = ventasDelDia
            console.log(`✅ Cargadas ${ventasDelDia.length} ventas del día actual`)
        } catch (err) {
            console.error("Error cargando ventas del día:", err)
        }
    }



    // Funciones para modo de pago
    function getModoPagoColor(modoPago?: string) {
        switch (modoPago) {
            case 'transferencia': return 'blue'
            case 'efectivo': return 'green'
            case 'debito-credito': return 'purple'
            default: return 'grey'
        }
    }

    function getModoPagoIcon(modoPago?: string) {
        switch (modoPago) {
            case 'transferencia': return 'mdi-bank-transfer'
            case 'efectivo': return 'mdi-cash'
            case 'debito-credito': return 'mdi-credit-card'
            default: return 'mdi-credit-card'
        }
    }

    function getModoPagoText(modoPago?: string) {
        switch (modoPago) {
            case 'transferencia': return 'Transferencia'
            case 'efectivo': return 'Efectivo'
            case 'debito-credito': return 'Débito/Crédito'
            default: return 'Sin pago'
        }
    }
</script>

<style scoped>
.ventas-fijas {
    /* Define una altura fija para el contenedor de la tarjeta, por ejemplo, 60% de la altura de la ventana */
    height: 60vh;
}

.ventas-fijas .v-card {
    /* Convierte la tarjeta en un contenedor flexbox para organizar sus elementos internos en columna */
    display: flex;
    flex-direction: column;
    /* Asegura que la tarjeta ocupe toda la altura de su contenedor padre */
    flex-grow: 1;
}

.lista-ventas {
    /* Esta es la clave. Hace que la lista se expanda y ocupe todo el espacio disponible */
    flex-grow: 1;
    /* Y finalmente, habilita el scroll vertical cuando el contenido exceda el espacio */
    overflow-y: auto;
    overflow-x: hidden;
}

.campo-sin-espacio {
    margin-bottom: -26px;
    /* Ajusta el valor según la necesidad */
}

.campos-draggable {
    min-height: 50px;
    margin-bottom: 0;
}

.campo-formulario {
    transition: all 0.3s ease;
    border-radius: 12px;
    padding: 12px;
}

.campo-formulario.modo-edicion {
    background-color: #f8f9fa;
    border: 2px dashed #e9ecef;
    cursor: grab;
}

.campo-formulario.modo-edicion:hover {
    background-color: #e8f5e8;
    border-color: #4caf50;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.campo-formulario.modo-edicion:active {
    cursor: grabbing;
}

.sortable-ghost {
    opacity: 0.5;
    background-color: #e3f2fd !important;
    border: 2px dashed #2196f3 !important;
}

.sortable-chosen {
    background-color: #fff3e0 !important;
    border: 2px solid #ff9800 !important;
    transform: rotate(2deg);
}

/* Mejoras de animación */
.v-list-item {
    transition: all 0.3s ease;
}




.v-list-item:hover {
    transform: translateX(1px);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

/* Estilos para chips */
.v-chip {
    font-weight: 500;
}

/* Mejoras en botones */
.v-btn {
    font-weight: 500;
    letter-spacing: 0.5px;
}

/* Estilos para cards */
.v-card {
    border-radius: 16px;
}

/* Mejoras en inputs */
.v-text-field,
.v-autocomplete,
.v-number-input {
    border-radius: 8px;
}

/* Animaciones suaves */
* {
    transition: all 0.2s ease;
}

/* Mejoras responsive */
@media (max-width: 768px) {
    .v-container {
        padding: 16px !important;
    }

    .v-card {
        border-radius: 12px !important;
    }

    .v-btn {
        font-size: 0.875rem !important;
    }
}

/* Flex utilities */
.flex-1 {
    flex: 1;
}

/* Barra fija */
.barra-fija {
    position: sticky;
    top: 0;
    z-index: 100;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    margin: -16px -16px 16px -16px;
    padding: 16px;
}

.barra-combinada {
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

/* Responsive para la barra fija */
@media (max-width: 768px) {
    .barra-fija {
        margin: -16px -16px 12px -16px;
        padding: 12px;
    }
}
</style>