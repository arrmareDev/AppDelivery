import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/login",
      name: "login",
      component: () => import("../views/LoginView.vue"),
      meta: { guest: true },
    },
    {
      path: "/register",
      name: "register",
      component: () => import("../views/RegisterView.vue"),
      meta: { guest: true },
    },
    {
      path: "/forgot-password",
      name: "forgot-password",
      component: () => import("../views/ForgotPasswordView.vue"),
      meta: { guest: true },
    },
    {
      path: "/reset-password",
      name: "reset-password",
      component: () => import("../views/ResetPasswordView.vue"),
      meta: { guest: true },
    },
    {
      path: "/verificar-correo",
      name: "verificar-correo",
      component: () => import("../views/VerificarCorreoView.vue"),
      meta: { auth: true },
    },
    {
      path: "/",
      name: "home",
      component: () => import("../views/HomeView.vue"),
      meta: { auth: true },
    },
    {
      path: "/despacho/:id",
      name: "despacho",
      component: () => import("../views/DespachoView.vue"),
      meta: { auth: true },
    },
    {
      path: "/historial",
      name: "historial",
      component: () => import("../views/HistorialView.vue"),
      meta: { auth: true },
    },
    {
      path: "/perfil",
      name: "perfil",
      component: () => import("../views/PerfilView.vue"),
      // ↓ CORREGIDO: antes decía `requiresAuth` (no coincide con el guard
      // de abajo, que lee `auth`), así que esta ruta quedaba SIN protección.
      meta: { auth: true },
    },
    {
      path: "/:pathMatch(.*)*",
      redirect: "/",
    },
  ],
});

router.beforeEach((to) => {
  const auth = useAuthStore();

  if (to.meta.auth && !auth.isAuth) return "/login";
  if (to.meta.guest && auth.isAuth) return "/";

  // Bloquea toda ruta autenticada si el correo no está verificado,
  // salvo la propia pantalla de verificación (para no hacer un loop).
  if (
    to.meta.auth &&
    auth.isAuth &&
    !auth.isEmailVerificado &&
    to.name !== "verificar-correo"
  ) {
    return "/verificar-correo";
  }
});

export default router;
