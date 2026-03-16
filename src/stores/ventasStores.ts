import { defineStore } from 'pinia'
import { supabase } from '../supabase'

interface Venta {
    id?: string
    codigo: string
    monto: number
    cliente_id?: string // Renombrado a cliente_id para coincidir con SQL
    cliente?: string // Mantener compatibilidad temporal para el frontend si se usaba
    tipo?: string
    fecha?: string
    modo_pago?: string // Renombrado a modo_pago para coincidir con SQL
    modoPago?: string // Mantener compatibilidad temporal
}

export const useVentasStore = defineStore('ventas', {
    state: () => ({
        ventas: [] as Venta[]
    }),
    actions: {
        async cargarVentas() {
            const { data, error } = await supabase.from('ventas').select('*')
            if (error) {
                console.error("Error al cargar ventas:", error)
                return
            }
            this.ventas = data.map(v => ({
                id: v.id,
                codigo: v.codigo,
                monto: v.monto,
                cliente_id: v.cliente_id,
                tipo: v.tipo,
                fecha: v.fecha,
                modo_pago: v.modo_pago,
                // Mapear a variables camelCase para retrocompatibilidad en componentes
                cliente: v.cliente_id, 
                modoPago: v.modo_pago 
            })) as Venta[]
        },

        async agregarVenta(venta: Venta) {
            // Preparar datos para BD (snake_case)
            const ventaToInsert = {
                codigo: venta.codigo,
                monto: venta.monto,
                cliente_id: venta.cliente_id || venta.cliente,
                tipo: venta.tipo,
                fecha: venta.fecha || new Date().toISOString(),
                modo_pago: venta.modoPago || venta.modo_pago
            }

            const { data, error } = await supabase
                .from('ventas')
                .insert([ventaToInsert])
                .select()
                
            if (error) {
                console.error("Error al agregar venta:", error)
                throw error
            }
            
            if (data && data.length > 0) {
                const newVenta = {
                    ...data[0],
                    cliente: data[0].cliente_id,
                    modoPago: data[0].modo_pago
                }
                this.ventas.unshift(newVenta)
            }
        },

        async eliminarVenta(id: string) {
            const { error } = await supabase
                .from('ventas')
                .delete()
                .eq('id', id)
                
            if (error) {
                console.error("Error al eliminar venta:", error)
                throw error
            }
            
            this.ventas = this.ventas.filter((v) => v.id !== id)
        },

        async actualizarVenta(id: string, updateData: Partial<Venta>) {
            // Mapeo seguro a snake_case para la base de datos
            const dataToUpdate: any = { ...updateData }
            if (dataToUpdate.cliente) {
                dataToUpdate.cliente_id = dataToUpdate.cliente
                delete dataToUpdate.cliente
            }
            if (dataToUpdate.modoPago) {
                dataToUpdate.modo_pago = dataToUpdate.modoPago
                delete dataToUpdate.modoPago
            }

            const { error } = await supabase
                .from('ventas')
                .update(dataToUpdate)
                .eq('id', id)
                
            if (error) {
                console.error("Error al actualizar venta:", error)
                throw error
            }

            const index = this.ventas.findIndex((v) => v.id === id)
            if (index !== -1) {
                this.ventas[index] = { ...this.ventas[index], ...updateData }
            }
        },

        async cargarVentasMensuales() {
            try {
                const hoy = new Date();
                const primerDiaAnio = new Date(hoy.getFullYear(), 0, 1);
                const ultimoDiaAnio = new Date(hoy.getFullYear(), 11, 31);

                const { data, error } = await supabase
                    .from('ventas')
                    .select('monto, fecha')
                    .gte('fecha', primerDiaAnio.toISOString())
                    .lte('fecha', ultimoDiaAnio.toISOString())

                if (error) throw error

                const ventasPorMes: { [key: number]: number } = {};

                data.forEach((venta: any) => {
                    const fecha = new Date(venta.fecha);
                    const mes = fecha.getMonth(); // 0 = Enero, 1 = Febrero, etc.
                    ventasPorMes[mes] = (ventasPorMes[mes] || 0) + Number(venta.monto);
                });

                return ventasPorMes; // Retorna los datos agregados
            } catch (error) {
                console.error("Error al cargar ventas mensuales:", error);
                return {};
            }
        },
        
        // Acción para cargar ventas del día actual (ideal para Ventas.vue)
        async cargarVentasDelDia() {
            const hoy = new Date();
            const inicioDelDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()).toISOString();

            const { data, error } = await supabase
                .from('ventas')
                .select('*')
                .gte('fecha', inicioDelDia)
                .order('fecha', { ascending: false })

            if (error) {
                console.error("Error cargando ventas del día:", error)
                return
            }

            this.ventas = data.map((v: any) => ({
                id: v.id,
                ...v,
                cliente: v.cliente_id,
                modoPago: v.modo_pago
            })) as Venta[];
        },

        // Nueva acción para cargar todas las ventas (ideal para una nueva vista de historial)
        async cargarTodasLasVentas() {
            try {
                console.log('🔄 VentasStore: Iniciando carga de todas las ventas...');

                const { data, error } = await supabase
                    .from('ventas')
                    .select('*')
                    .order('fecha', { ascending: false })

                if (error) throw error

                console.log('📊 VentasStore: Documentos obtenidos:', data.length);

                this.ventas = data.map((v: any) => ({
                    id: v.id,
                    ...v,
                    cliente: v.cliente_id,
                    modoPago: v.modo_pago
                })) as Venta[];

                console.log('✅ VentasStore: Ventas cargadas exitosamente:', this.ventas.length);

            } catch (error) {
                console.error('❌ VentasStore: Error al cargar todas las ventas:', error);

                // Manejo seguro del error para TypeScript
                const errorDetails = error instanceof Error ? {
                    message: error.message,
                    stack: error.stack
                } : {
                    message: String(error),
                    stack: 'No disponible'
                };

                console.error('❌ Detalles del error:', errorDetails);
                throw error; // Re-lanzar el error para que lo maneje el componente
            }
        },
    }
})