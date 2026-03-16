// stores/retirosStore.ts
import { defineStore } from 'pinia';
import { supabase } from '../supabase';
// import { useVentasStore } from './ventasStores';
// import { useClientesStore } from './clientesStore';

export interface Retiro {
    id?: string;
    ventaId: string;
    clienteId: string;
    monto: number;
    estado: 'pendiente' | 'completado' | 'cancelado';
    fecha: string;
    retiradoPor?: string;
    fechaRetiro?: string;
    modoPago?: string;
    clienteNombre?: string;
    codigoVenta?: string;
    tipoVenta?: string;
}

export const useRetirosStore = defineStore('retiros', {
    state: () => ({
        retiros: [] as Retiro[]
    }),
    actions: {
        async cargarRetirosDelMes() {
            try {
                // Obtenemos el primer y último día del mes actual
                const hoy = new Date();
                const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
                const ultimoDiaMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);

                // Consulta a Supabase con Joins (Relaciones)
                const { data, error } = await supabase
                    .from('retiros')
                    .select(`
                        *,
                        ventas ( codigo, tipo ),
                        clientes ( nombre )
                    `)
                    .gte('fecha', primerDiaMes.toISOString())
                    .lte('fecha', ultimoDiaMes.toISOString())
                    .order('fecha');
                    
                if (error) throw error;
                
                console.log("Documentos leídos de Supabase:", data);

                const retirosTemp: Retiro[] = data.map((d: any) => ({
                    id: d.id,
                    ventaId: d.venta_id,
                    clienteId: d.cliente_id,
                    monto: d.monto,
                    estado: d.estado,
                    fecha: d.fecha,
                    retiradoPor: d.retirado_por,
                    fechaRetiro: d.fecha_retiro,
                    // Datos traídos con el JOIN
                    clienteNombre: d.clientes?.nombre || 'Desconocido',
                    codigoVenta: d.ventas?.codigo || 'N/A',
                    tipoVenta: d.ventas?.tipo || 'N/A'
                }));
                
                this.retiros = retirosTemp;

            } catch (error) {
                console.error("Error al cargar retiros:", error);
                throw error;
            }
        },

        async procesarRetiro(retiroId: string, data: { retiradoPor: string }) {
            try {
                const fechaActual = new Date().toISOString()
                const { error } = await supabase
                    .from('retiros')
                    .update({
                        retirado_por: data.retiradoPor,
                        estado: 'completado',
                        fecha_retiro: fechaActual
                    })
                    .eq('id', retiroId)

                if (error) throw error;

                console.log("✅ Retiro procesado exitosamente");
                const index = this.retiros.findIndex(r => r.id === retiroId);
                if (index !== -1) {
                    this.retiros[index].estado = 'completado';
                    this.retiros[index].retiradoPor = data.retiradoPor;
                    // this.retiros[index].modoPago = data.modoPago;
                    this.retiros[index].fechaRetiro = fechaActual;
                }
            } catch (error) {
                console.error("❌ Error al procesar retiro:", error);
                throw error;
            }
        },

        async agregarRetiro(retiro: Omit<Retiro, 'id'>) {
            try {
                // Preparar payload en snake_case para BD
                const retiroPayload = {
                    venta_id: retiro.ventaId,
                    cliente_id: retiro.clienteId,
                    monto: retiro.monto,
                    estado: retiro.estado,
                    fecha: retiro.fecha || new Date().toISOString()
                }

                const { data, error } = await supabase
                    .from('retiros')
                    .insert([retiroPayload])
                    .select()
                    
                if (error) throw error;
                
                if (data && data.length > 0) {
                     this.retiros.unshift({ 
                        ...retiro, 
                        id: data[0].id 
                    });
                    console.log("✅ Retiro pendiente creado");
                }
            } catch (error) {
                console.error("❌ Error al crear retiro:", error);
                throw error;
            }
        }
    }
});