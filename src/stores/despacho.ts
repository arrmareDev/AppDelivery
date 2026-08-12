import { defineStore } from "pinia";
import { computed, ref } from "vue";
import api from "../api/axios";

export interface DespachoItem {
  id: number;
  negocio?: string;
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
    pagado?: boolean | null;
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

// Debe coincidir con MAX_DESPACHOS_SIMULTANEOS del backend (Central).
// El backend es quien de verdad lo hace cumplir — esto es solo para
// no dejar que la persona intente aceptar un 4to de más y se lleve
// un error recién al final.
export const MAX_DESPACHOS_SIMULTANEOS = 3;

export const useDespachosStore = defineStore("despachos", () => {
  const disponibles = ref<DespachoItem[]>([]);
  const activos = ref<DespachoItem[]>([]);
  const historial = ref<DespachoItem[]>([]);
  const loading = ref(false);
  const totalHoy = ref(0);
  const nuevoPedido = ref(false); // flag para alerta sonido

  const puedeAceptarMas = computed(
    () => activos.value.length < MAX_DESPACHOS_SIMULTANEOS,
  );
  const cuposDisponibles = computed(() =>
    Math.max(0, MAX_DESPACHOS_SIMULTANEOS - activos.value.length),
  );

  async function fetchDisponibles() {
    try {
      const { data } = await api.get("/motorizado/pedidos");
      disponibles.value = data.data;
    } catch {}
  }

  async function fetchActivos() {
    try {
      const { data } = await api.get("/motorizado/despachos/activos");
      activos.value = data.data;
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
      // Se agrega a la lista de activos, no la reemplaza — puede haber
      // otros 1 o 2 pedidos ya en curso.
      const idx = activos.value.findIndex((d) => d.id === data.data.id);
      if (idx !== -1) activos.value[idx] = data.data;
      else activos.value.push(data.data);

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

      if (estado === "entregado") {
        // Sale de la lista de activos — los otros 1 o 2 pedidos en
        // curso siguen ahí, intactos.
        activos.value = activos.value.filter((d) => d.id !== despachoId);
        await fetchHistorial();
      } else {
        const idx = activos.value.findIndex((d) => d.id === despachoId);
        if (idx !== -1) activos.value[idx] = data.data;
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
    activos,
    historial,
    loading,
    totalHoy,
    nuevoPedido,
    puedeAceptarMas,
    cuposDisponibles,
    fetchDisponibles,
    fetchActivos,
    fetchHistorial,
    aceptar,
    updateEstado,
    addDisponible,
    removeDisponible,
  };
});
