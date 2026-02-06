import {
  createRouter,
  createWebHashHistory,
  type RouteRecordRaw,
} from "vue-router";

import remainingRouter from "./modules/remaining";

// 自动加载 modules 下的路由模块（remaining.ts 单独处理）
const modules = import.meta.glob("./modules/**/*.ts", {
  eager: true,
}) as Record<string, { default: RouteConfigsTable | RouteConfigsTable[] }>;

// 承载业务模块路由（通常是需要 Layout 的页面）
const moduleRoutes: RouteRecordRaw[] = [];

Object.entries(modules).forEach(([key, mod]) => {
  if (key.includes("remaining.ts")) return;

  const route = mod.default;

  // 支持模块默认导出单个路由对象或路由数组
  if (Array.isArray(route)) {
    moduleRoutes.push(...(route as RouteRecordRaw[]));
  } else {
    moduleRoutes.push(route as RouteRecordRaw);
  }
});

// 静态路由：全屏页面 + 业务模块路由
export const constantRoutes: RouteRecordRaw[] = [
  ...(remainingRouter as RouteRecordRaw[]),
  ...moduleRoutes,
];

const router = createRouter({
  history: createWebHashHistory(),
  routes: constantRoutes,
  strict: true,
});

// 标记动态路由是否已注入，避免重复注册
let isAsyncRoutesReady = false;

/**
 * 动态路由来源占位函数
 * 后续接后端权限接口后，在此返回过滤后的可访问路由
 */
async function getAsyncRoutes(): Promise<RouteRecordRaw[]> {
  return [];
}

/**
 * 动态路由注入后再追加 catch-all 404
 * 目的是避免刷新动态路由页面时先落到 404
 */
function addPathMatch() {
  const routeName = "PageNotFound";

  if (!router.hasRoute(routeName)) {
    router.addRoute({
      path: "/:pathMatch(.*)*",
      name: routeName,
      component: () => import("@/views/error/404.vue"),
      meta: {
        title: "404",
        showLink: false,
      },
    });
  }
}

/** 路由白名单 */
const whiteList = ["/login"];

router.beforeEach(async (to: ToRouteType, _from, next) => {
  const token = localStorage.getItem("token");

  // 未登录访问非白名单页面，跳登录并记录回跳地址
  if (!token && !whiteList.includes(to.path)) {
    next({
      path: "/login",
    });
    return;
  }

  // 已登录访问登录页，直接回首页
  if (token && to.path === "/login") {
    next({ path: "/" });
    return;
  }

  // 首次进入（有 token）时注入动态路由
  if (token && !isAsyncRoutesReady) {
    const asyncRoutes = await getAsyncRoutes();

    asyncRoutes.forEach((route) => {
      router.addRoute(route);
    });

    addPathMatch();
    isAsyncRoutesReady = true;

    // 重新进入当前地址，确保本次匹配命中刚注入的路由
    next({ ...to, replace: true });
    return;
  }

  next();
});

// 路由切换后同步页面标题
router.afterEach((to) => {
  document.title = to.meta?.title ? `${to.meta.title} - Admin` : "Admin";
});

/**
 * 退出登录时可调用：
 * 当前版本先重置动态路由状态位，后续可按 name 批量 removeRoute
 */
export function resetRouter() {
  isAsyncRoutesReady = false;
}

export default router;
