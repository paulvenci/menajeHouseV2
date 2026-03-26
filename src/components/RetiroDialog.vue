<script setup
    lang="ts">
    import { reactive, computed } from 'vue';
    import { useRetirosStore } from '../stores/retirosStore';
    import { useClientesStore } from '../stores/clientesStore';

    const props = defineProps<{
        visible: boolean;
        retiro: any;
    }>();

    const emit = defineEmits(['update:visible']);

    const retirosStore = useRetirosStore();
    const clientesStore = useClientesStore();

    const form = reactive({
        retiradoPor: '',
    });

    // const modosPago = ref([
    //     { text: 'Transferencia', value: 'transferencia' },
    //     { text: 'Efectivo', value: 'efectivo' },
    //     { text: 'Débito/Crédito', value: 'debito-credito' }
    // ]);

    const clientes = computed(() => clientesStore.clientes);

    const dialogVisible = computed({
        get: () => props.visible,
        set: (value) => emit('update:visible', value),
    });

    const procesarRetiro = async () => {
        if (!form.retiradoPor) {
            alert("Por favor completa todos los campos.");
            return;
        }

        if (props.retiro && props.retiro.id) {
            await retirosStore.procesarRetiro(props.retiro.id, {
                retiradoPor: form.retiradoPor

            });
            dialogVisible.value = false;
        }
    };

</script>

<template>
    <v-dialog v-model="dialogVisible" max-width="500px">
        <v-card>
            <v-card-title class="headline">Procesar Retiro</v-card-title>
            <v-card-text>
                <div v-if="retiro">
                    <p><strong>Cliente:</strong> {{ retiro.cliente }}</p>
                    <p><strong>Monto:</strong> ${{ retiro.monto.toLocaleString('es-CL') }}</p>
                    <p><strong>Código de Venta:</strong> {{ retiro.codigoVenta }}</p>
                    <p><strong>Tipo de Venta:</strong>
                        <v-chip :color="retiro.tipoVenta === 'Venta Live' ? 'purple' : 'blue'" size="x-small" variant="tonal"
                            class="ml-2">
                            <v-icon size="x-small" class="mr-1">{{ retiro.tipoVenta === 'Venta Live' ? 'mdi-video' :
                                'mdi-calendar' }}</v-icon>
                            {{ retiro.tipoVenta === 'Venta Live' ? 'Live' : 'Diaria' }}
                        </v-chip>
                    </p>

                    <v-form @submit.prevent="procesarRetiro" class="mt-4">
                        <v-combobox label="Retirado por" v-model="form.retiradoPor" :items="clientes.map(c => c.nombre)"
                            variant="outlined" clearable :rules="[v => !!v || 'Campo obligatorio']">
                        </v-combobox>

                        <!-- <v-select label="Modo de Pago" v-model="form.modoPago" :items="modosPago" item-title="text"
                            item-value="value" variant="outlined" clearable
                            :rules="[v => !!v || 'Campo obligatorio']"></v-select> -->

                        <v-btn type="submit" color="success" block class="mt-4">
                            Marcar como Completado
                        </v-btn>
                    </v-form>
                </div>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="grey" variant="text" @click="dialogVisible = false">Cerrar</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>