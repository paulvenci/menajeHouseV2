import { defineStore } from 'pinia'
import { supabase } from '../supabase'

interface Venta {
    id?: string
    codigo: string
    monto: number
    cliente_id?: string
    cliente?: string
    tipo?: string
    fecha?: string
    modo_pago?: string
    modoPago?: string
    estado_pago?: string
    fecha_pago?: string
    usuario_pago?: string
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
                monto: Number(v.monto) || 0,
                cliente_id: v.cliente_id,
                tipo: v.tipo,
                fecha: v.fecha,
                modo_pago: v.modo_pago,
                estado_pago: v.estado_pago,
                fecha_pago: v.fecha_pago,
                usuario_pago: v.usuario_pago,
                cliente: v.cliente_id, 
                modoPago: v.modo_pago 
            })) as Venta[]
        },

        async agregarVenta(venta: Venta) {
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
                    const mes = fecha.getMonth();
                    ventasPorMes[mes] = (ventasPorMes[mes] || 0) + Number(venta.monto);
                });

                return ventasPorMes;
            } catch (error) {
                console.error("Error al cargar ventas mensuales:", error);
                return {};
            }
        },
        
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
                monto: Number(v.monto) || 0,
                cliente: v.cliente_id,
                modoPago: v.modo_pago,
                estado_pago: v.estado_pago,
                fecha_pago: v.fecha_pago,
                usuario_pago: v.usuario_pago
            })) as Venta[];
        },

        async cargarTodasLasVentas() {
            try {
                const { data, error } = await supabase
                    .from('ventas')
                    .select('*')
                    .order('fecha', { ascending: false })

                if (error) throw error

                this.ventas = data.map((v: any) => ({
                    id: v.id,
                    ...v,
                    monto: Number(v.monto) || 0,
                    cliente: v.cliente_id,
                    modoPago: v.modo_pago,
                    estado_pago: v.estado_pago,
                    fecha_pago: v.fecha_pago,
                    usuario_pago: v.usuario_pago
                })) as Venta[];

            } catch (error) {
                console.error('Error al cargar todas las ventas:', error);
                throw error;
            }
        },
        
        async cargarVentasDelMes() {
            console.log('📊 Cargando ventas del mes...');
            const hoy = new Date();
            const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString();
            const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0, 23, 59, 59, 999).toISOString();

            const { data, error } = await supabase
                .from('ventas')
                .select('*')
                .gte('fecha', inicioMes)
                .lte('fecha', finMes)
                .order('fecha', { ascending: false })

            if (error) {
                console.error("Error cargando ventas del mes:", error)
                return
            }

            this.ventas = data.map((v: any) => ({
                id: v.id,
                ...v,
                monto: Number(v.monto) || 0,
                cliente: v.cliente_id,
                modoPago: v.modo_pago,
                estado_pago: v.estado_pago,
                fecha_pago: v.fecha_pago,
                usuario_pago: v.usuario_pago
            })) as Venta[];
            console.log(`✅ ${this.ventas.length} ventas del mes cargadas.`);
        },

        async vaciarVentas() {
            const { error } = await supabase
                .from('ventas')
                .delete()
                .neq('id', '00000000-0000-0000-0000-000000000000') // Truco para borrar todo en Supabase sin filtro exacto

            if (error) {
                console.error("Error al vaciar ventas:", error)
                throw error
            }

            this.ventas = []
        },
    }
})