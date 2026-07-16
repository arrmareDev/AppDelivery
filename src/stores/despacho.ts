import { defineStore } from "pinia";
import { ref } from "vue";
import api from "../api/axios";

export interface DespachoItem {
  id: number;
  restaurant?: string;
  order_id: number;
  estado: string;
  comision_motorizado: number;
  monto_cobrado?: number | null;
  nota_motorizado: string | null;
  solicitado_at: string | null;
  aceptado_at: string | null;
  recogido_at: string | null;
  entregado_at: string | null;
  order: {
    client_name: string;
    client_phone: string;
    address: string;
    district?: string | null;
    reference?: string | null;
    subtotal?: number;
    delivery_fee?: number;
    total: number;
    metodo_pago?: string | null;
    lat?: number | null;
    lng?: number | null;
    note?: string | null;
    items: Array<{
      name: string;
      qty: number;
      unit_price?: number;
      subtotal?: number;
      custom_summary?: string | null;
    }>;
  } | null;
  motorizado: {
    id: number;
    nombre: string;
    telefono: string;
  } | null;
}

export const useDespachosStore = defineStore("despachos", () => {
  const disponibles = ref<DespachoItem[]>([]);
  const activo = ref<DespachoItem | null>(null);
  const historial = ref<DespachoItem[]>([]);
  const loading = ref(false);
  const totalHoy = ref(0);
  const nuevoPedido = ref(false); // flag para alerta sonido

  async function fetchDisponibles() {
    try {
      const { data } = await api.get("/motorizado/pedidos");
      disponibles.value = data.data;
    } catch {}
  }

  async function fetchActivo() {
    try {
      const { data } = await api.get("/motorizado/despachos/activo");
      activo.value = data.data;
    } catch {}
  }

  async function fetchHistorial() {
    loading.value = true;
    try {
      const { data } = await api.get("/motorizado/historial");
      historial.value = data.data.despachos ?? data.data;
      totalHoy.value = data.data.total_hoy ?? 0;
    } catch {
    } finally {
      loading.value = false;
    }
  }

  async function aceptar(despachoId: number): Promise<boolean> {
    try {
      const { data } = await api.post(
        `/motorizado/despachos/${despachoId}/aceptar`,
      );
      activo.value = data.data;
      // Quitar de disponibles
      disponibles.value = disponibles.value.filter((d) => d.id !== despachoId);
      return true;
    } catch (e: any) {
      throw new Error(
        e.response?.data?.message ?? "Error al aceptar el pedido",
      );
    }
  }

  async function updateEstado(
    despachoId: number,
    estado: "recogido" | "entregado",
    nota?: string,
    montoCobrado?: number,
  ): Promise<boolean> {
    try {
      const { data } = await api.patch(
        `/motorizado/despachos/${despachoId}/estado`,
        { estado, nota, monto_cobrado: montoCobrado },
      );
      activo.value = estado === "entregado" ? null : data.data;
      if (estado === "entregado") {
        await fetchHistorial();
      }
      return true;
    } catch {
      return false;
    }
  }

  // Agregar pedido nuevo desde WebSocket
  function addDisponible(despacho: DespachoItem) {
    const existe = disponibles.value.find((d) => d.id === despacho.id);
    if (!existe) {
      disponibles.value.unshift(despacho);
      nuevoPedido.value = true;
      setTimeout(() => {
        nuevoPedido.value = false;
      }, 3_000);
    }
  }

  // Quitar pedido cuando otro lo tomó
  function removeDisponible(despachoId: number) {
    disponibles.value = disponibles.value.filter((d) => d.id !== despachoId);
  }

  return {
    disponibles,
    activo,
    historial,
    loading,
    totalHoy,
    nuevoPedido,
    fetchDisponibles,
    fetchActivo,
    fetchHistorial,
    aceptar,
    updateEstado,
    addDisponible,
    removeDisponible,
  };
});
