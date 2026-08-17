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
      path: "/estadisticas",
      name: "estadisticas",
      component: () => import("../views/EstadisticasView.vue"),
      meta: { auth: true },
    },
    {
      path: "/perfil",
      name: "perfil",
      component: () => import("../views/PerfilView.vue"),

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
