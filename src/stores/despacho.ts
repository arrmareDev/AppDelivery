import { defineStore } from "pinia";
import { computed, ref } from "vue";
import api from "../api/axios";

export interface DespachoItem {
  id: number;
  negocio?: string;
  negocio_direccion?: string | null;
  negocio_lat?: number | null;
  negocio_lng?: number | null;
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

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}

// Shape real de lo que transmite Central en el evento WebSocket
// 'despacho.actualizado' (ver DespachoActualizado::broadcastWith en el
// backend) — antes esto se tipaba como `any` en los .listen().
export interface DespachoActualizadoEvent {
  despacho_id: number;
  order_id: number;
  estado: string;
  aceptado_at: string | null;
  recogido_at: string | null;
  entregado_at: string | null;
  monto_cobrado: number | null;
  motorizado: {
    id: number;
    nombre: string;
    telefono: string;
    lat: number | null;
    lng: number | null;
  } | null;
}

// Debe coincidir con MAX_DESPACHOS_SIMULTANEOS del backend (Central).
// El backend es quien de verdad lo hace cumplir — esto es solo para
// no dejar que la persona intente aceptar un 4to de más y se lleve
// un error recién al final.
export const MAX_DESPACHOS_SIMULTANEOS = 3;

// ── Pedidos ya vistos (para el badge "NUEVO") ──────────────
// Persistido en localStorage: un pedido deja de ser "nuevo" apenas el
// motorizado abre su detalle una vez — no se re-marca como nuevo si
// cierra y vuelve a abrir la app.
const VISTOS_KEY = "motorizado_pedidos_vistos";

function cargarVistos(): Set<number> {
  try {
    const raw = localStorage.getItem(VISTOS_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

export const useDespachosStore = defineStore("despachos", () => {
  const disponibles = ref<DespachoItem[]>([]);
  const activos = ref<DespachoItem[]>([]);
  const historial = ref<DespachoItem[]>([]);
  const historialMeta = ref<PaginationMeta | null>(null);
  const loading = ref(false);
  const loadingMore = ref(false);
  const nuevoPedido = ref(false); // flag para alerta sonido
  const vistos = ref<Set<number>>(cargarVistos());

  const puedeAceptarMas = computed(
    () => activos.value.length < MAX_DESPACHOS_SIMULTANEOS,
  );
  const cuposDisponibles = computed(() =>
    Math.max(0, MAX_DESPACHOS_SIMULTANEOS - activos.value.length),
  );
  const hayMasHistorial = computed(
    () =>
      !!historialMeta.value &&
      historialMeta.value.current_page < historialMeta.value.last_page,
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
      historial.value = data.data.data;
      historialMeta.value = data.data.meta;
    } catch {
    } finally {
      loading.value = false;
    }
  }

  async function loadMoreHistorial() {
    if (!hayMasHistorial.value || loadingMore.value) return;
    loadingMore.value = true;
    try {
      const nextPage = (historialMeta.value?.current_page ?? 1) + 1;
      const { data } = await api.get("/motorizado/historial", {
        params: { page: nextPage },
      });
      historial.value.push(...data.data.data);
      historialMeta.value = data.data.meta;
    } catch {
    } finally {
      loadingMore.value = false;
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

  function esNuevo(despachoId: number): boolean {
    return !vistos.value.has(despachoId);
  }

  function marcarVisto(despachoId: number) {
    if (vistos.value.has(despachoId)) return;
    // Set no dispara reactividad de Vue con solo .add() — hay que
    // reemplazar la referencia para que los componentes que usan
    // esNuevo() se vuelvan a evaluar.
    const nuevo = new Set(vistos.value);
    nuevo.add(despachoId);
    vistos.value = nuevo;
    try {
      localStorage.setItem(VISTOS_KEY, JSON.stringify([...nuevo]));
    } catch {}
  }

  return {
    disponibles,
    activos,
    historial,
    historialMeta,
    loading,
    loadingMore,
    hayMasHistorial,
    nuevoPedido,
    puedeAceptarMas,
    cuposDisponibles,
    fetchDisponibles,
    fetchActivos,
    fetchHistorial,
    loadMoreHistorial,
    aceptar,
    updateEstado,
    addDisponible,
    removeDisponible,
    esNuevo,
    marcarVisto,
  };
});
