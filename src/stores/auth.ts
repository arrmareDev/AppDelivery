import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "../api/axios";

export interface Motorizado {
  id: number;
  nombre: string;
  telefono: string;
  email: string;
  foto: string | null;
  estado: "disponible" | "ocupado" | "inactivo";
  verificado: boolean;
  activo: boolean;
  lat: number | null;
  lng: number | null;
}

export const useAuthStore = defineStore("auth", () => {
  const token = ref<string | null>(localStorage.getItem("motorizado_token"));
  const user = ref<Motorizado | null>(
    JSON.parse(localStorage.getItem("motorizado_user") ?? "null"),
  );
  const loading = ref(false);

  const isAuth = computed(() => !!token.value);
  const isDisponible = computed(() => user.value?.estado === "disponible");
  const isOcupado = computed(() => user.value?.estado === "ocupado");

  async function login(email: string, password: string): Promise<boolean> {
    loading.value = true;
    try {
      const { data } = await api.post("/motorizado/auth/login", {
        email,
        password,
      });
      token.value = data.data.token;
      user.value = data.data.motorizado;
      localStorage.setItem("motorizado_token", data.data.token);
      localStorage.setItem(
        "motorizado_user",
        JSON.stringify(data.data.motorizado),
      );
      return true;
    } catch {
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function register(form: {
    nombre: string;
    telefono: string;
    email: string;
    password: string;
  }): Promise<{ ok: boolean; message: string }> {
    loading.value = true;
    try {
      const { data } = await api.post("/motorizado/auth/register", form);
      token.value = data.data.token;
      user.value = data.data.motorizado;
      localStorage.setItem("motorizado_token", data.data.token);
      localStorage.setItem(
        "motorizado_user",
        JSON.stringify(data.data.motorizado),
      );
      return { ok: true, message: data.message };
    } catch (e: any) {
      return {
        ok: false,
        message: e.response?.data?.message ?? "Error al registrarse",
      };
    } finally {
      loading.value = false;
    }
  }

  async function logout() {
    try {
      await api.post("/motorizado/auth/logout");
    } catch {}
    token.value = null;
    user.value = null;
    localStorage.removeItem("motorizado_token");
    localStorage.removeItem("motorizado_user");
  }

  async function fetchMe() {
    try {
      const { data } = await api.get("/motorizado/me");
      user.value = data.data;
      localStorage.setItem("motorizado_user", JSON.stringify(data.data));
    } catch {
      await logout();
    }
  }

  async function updateEstado(estado: "disponible" | "inactivo") {
    try {
      // Verificar que esté verificado antes de ponerse disponible
      if (estado === "disponible" && !user.value?.verificado) {
        throw new Error(
          "Tu cuenta aún no ha sido verificada por el administrador",
        );
      }

      await api.patch("/motorizado/estado", { estado });

      if (user.value) {
        user.value = { ...user.value, estado };
        localStorage.setItem("motorizado_user", JSON.stringify(user.value));
      }
    } catch (e: any) {
      throw new Error(e.message ?? "Error al actualizar estado");
    }
  }

  async function updatePerfil(payload: {
    nombre?: string;
    telefono?: string;
    email?: string;
    password_actual?: string;
    password?: string;
    password_confirmation?: string;
  }): Promise<{ ok: boolean; message: string }> {
    try {
      const { data } = await api.put("/motorizado/perfil", payload);
      user.value = data.data;
      localStorage.setItem("motorizado_user", JSON.stringify(data.data));
      return { ok: true, message: data.message };
    } catch (e: any) {
      return {
        ok: false,
        message: e.response?.data?.message ?? "Error al actualizar el perfil",
      };
    }
  }

  async function updateUbicacion(lat: number, lng: number) {
    try {
      await api.patch("/motorizado/ubicacion", { lat, lng });
      if (user.value) {
        user.value = { ...user.value, lat, lng };
      }
    } catch {}
  }

  return {
    token,
    user,
    loading,
    isAuth,
    isDisponible,
    isOcupado,
    login,
    register,
    logout,
    fetchMe,
    updateEstado,
    updateUbicacion,
    updatePerfil,
  };
});
