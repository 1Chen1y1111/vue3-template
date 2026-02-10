import { cloneDeep } from "lodash-es";
import type { RouteRecordRaw } from "vue-router";

/** 是否为空，针对 数组、对象、字符串、new Map()、new Set()、null、undefined 进行判断，null、undefined 直接返回 true，也就是直接等于空 */
function isAllEmpty(value: any) {
  if (value == null) return true;
  if (typeof value === "string") return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (value instanceof Map || value instanceof Set) return value.size === 0;
  if (typeof value === "object") {
    return Object.keys(value).length === 0;
  }
  return false;
}

export function handRank(routeInfo: any) {
  const { name, path, parentId, meta } = routeInfo;
  return isAllEmpty(parentId)
    ? isAllEmpty(meta?.rank) ||
      (meta?.rank === 0 && name !== "Home" && path !== "/")
      ? true
      : false
    : false;
}

/** 按照路由中meta下的rank等级升序来排序路由 */
export function ascending(arr: any[]) {
  arr.forEach((v, index) => {
    // 当rank不存在时，根据顺序自动创建，首页路由永远在第一位
    if (handRank(v)) v.meta.rank = index + 2;
  });
  return arr.sort(
    (a: { meta: { rank: number } }, b: { meta: { rank: number } }) => {
      return a?.meta.rank - b?.meta.rank;
    }
  );
}

/**
 * 一维数组处理成多级嵌套数组（三级及以上的路由全部拍成二级，keep-alive 只支持到二级缓存）
 * https://github.com/vuejs/router/issues/626
 * https://github.com/vuejs/vue/issues/8819
 * @param routesList 处理后的一维路由菜单数组
 * @returns 返回将一维数组重新处理成规定路由的格式
 */
export function formatTwoStageRoutes(routesList: RouteRecordRaw[]) {
  if (routesList.length === 0) return routesList;
  const newRoutesList: RouteRecordRaw[] = [];
  routesList.forEach((v: RouteRecordRaw) => {
    if (v.path === "/") {
      newRoutesList.push({
        component: v.component,
        name: v.name,
        path: v.path,
        redirect: v.redirect,
        meta: v.meta,
        children: [],
      });
    } else {
      if (newRoutesList[0]?.children) {
        newRoutesList[0].children.push({ ...v });
      }
    }
  });
  return newRoutesList;
}

/**
 * 将多级嵌套路由处理成一维数组
 * @param routesList 传入路由
 * @returns 返回处理后的一维路由
 */
export function formatFlatteningRoutes(routesList: RouteRecordRaw[]) {
  if (routesList.length === 0) return routesList;
  let hierarchyList = buildHierarchyTree(routesList);
  for (let i = 0; i < hierarchyList.length; i++) {
    if (hierarchyList[i].children) {
      hierarchyList = hierarchyList
        .slice(0, i + 1)
        .concat(hierarchyList[i].children, hierarchyList.slice(i + 1));
    }
  }
  return hierarchyList;
}

/**
 * @description 创建层级关系
 * @param tree 树
 * @param pathList 每一项的id组成的数组
 * @returns 创建层级关系后的树
 */
export const buildHierarchyTree = (tree: any[], pathList = []): any => {
  if (!Array.isArray(tree)) {
    console.warn("tree must be an array");
    return [];
  }
  if (!tree || tree.length === 0) return [];
  for (const [key, node] of tree.entries()) {
    node.id = key;
    node.parentId = pathList.length ? pathList[pathList.length - 1] : null;
    node.pathList = [...pathList, node.id];
    const hasChildren = node.children && node.children.length > 0;
    if (hasChildren) {
      buildHierarchyTree(node.children, node.pathList);
    }
  }
  return tree;
};

/** 过滤meta中showLink为false的菜单 */
export function filterTree(data: RouteConfigsTable[]): RouteConfigsTable[] {
  const newTree = cloneDeep(data).filter((v) => v.meta?.showLink !== false);
  newTree.forEach(
    (v) =>
      v.children && (v.children = filterTree(v.children as RouteConfigsTable[]))
  );
  return newTree;
}
