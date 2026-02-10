import {
  createRouter,
  createWebHashHistory,
  type RouteRecordRaw,
} from "vue-router";

import remainingRouter from "./modules/remaining";
import {
  ascending,
  buildHierarchyTree,
  formatFlatteningRoutes,
  formatTwoStageRoutes,
} from "./utils";

import { cloneDeep } from "lodash-es";

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

// /** 导出处理后的静态路由（三级及以上的路由全部拍成二级） keep-alive 只支持到二级缓存 */
export const constantRoutes: RouteRecordRaw[] = formatTwoStageRoutes(
  formatFlatteningRoutes(
    buildHierarchyTree(ascending(moduleRoutes.flat(Infinity)))
  )
);

/** 初始的静态路由，用于退出登录时重置路由 */
const initConstantRoutes: Array<RouteRecordRaw> = cloneDeep(constantRoutes);

/** 用于渲染菜单，保持原始层级 */
export const constantMenus: Array<RouteConfigsTable> = ascending(
  moduleRoutes.flat(Infinity)
).concat(...remainingRouter);

/** 不参与菜单的路由 */
export const remainingPaths = remainingRouter.map((v) => v.path);

const router = createRouter({
  history: createWebHashHistory(),
  routes: constantRoutes.concat(...remainingRouter),
  strict: true,
});

/** 记录已经加载的页面路径 */
const loadedPaths = new Set<string>();

/** 重置已加载页面记录 */
export function resetLoadedPaths() {
  loadedPaths.clear();
}

/** 重置路由 */
export function resetRouter() {
  router.clearRoutes();
  for (const route of initConstantRoutes.concat(...remainingRouter)) {
    router.addRoute(route);
  }
  router.options.routes = formatTwoStageRoutes(
    formatFlatteningRoutes(
      buildHierarchyTree(ascending(moduleRoutes.flat(Infinity)))
    )
  );
  resetLoadedPaths();
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
  to.meta.loaded = loadedPaths.has(to.path);

  next();
});

router.afterEach((to) => {
  loadedPaths.add(to.path);
});

export default router;
