const Layout = () => import("@/layouts/index.vue");

export default {
  path: "/",
  name: "Dashboard",
  component: Layout,
  redirect: "/home",
  meta: {
    icon: "ep/home-filled",
    title: "首页",
    rank: 0,
  },
  children: [
    {
      path: "/home",
      name: "Home",
      component: () => import("@/views/home/index.vue"),
      meta: {
        title: "首页",
      },
    },
  ],
} satisfies RouteConfigsTable;
