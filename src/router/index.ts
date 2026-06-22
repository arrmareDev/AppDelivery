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
      meta: { requiresAuth: true },
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
});

export default router;
