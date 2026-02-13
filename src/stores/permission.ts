import { ref, computed } from "vue";
import { defineStore } from "pinia";

/**
 * 权限管理 Store
 *
 * 管理用户的角色（roles）和权限（auths），提供权限检查功能
 */
export const usePermissionStore = defineStore("permission", () => {
  // ==================== State ====================

  /** 用户角色列表 */
  const roles = ref<string[]>([]);

  /** 用户权限列表（按钮级别权限） */
  const auths = ref<string[]>([]);

  // ==================== Getters ====================

  /** 是否为超级管理员 */
  const isAdmin = computed(() => roles.value.includes("admin"));

  /** 是否已设置权限 */
  const hasPermissions = computed(() => {
    return roles.value.length > 0 || auths.value.length > 0;
  });

  // ==================== Actions ====================

  /**
   * 设置用户角色
   * @param newRoles 角色列表
   */
  function setRoles(newRoles: string[]) {
    roles.value = newRoles;
  }

  /**
   * 设置用户权限
   * @param newAuths 权限列表
   */
  function setAuths(newAuths: string[]) {
    auths.value = newAuths;
  }

  /**
   * 检查是否拥有指定角色
   * @param roleList 需要检查的角色（单个或数组）
   * @param mode 检查模式：'some' 表示拥有任一角色即可，'every' 表示需要拥有所有角色
   * @returns 是否拥有指定角色
   */
  function hasRole(
    roleList: string | string[],
    mode: "some" | "every" = "some"
  ): boolean {
    if (!roleList || roleList.length === 0) return true;

    const checkRoles = Array.isArray(roleList) ? roleList : [roleList];

    if (mode === "some") {
      return checkRoles.some((role) => roles.value.includes(role));
    } else {
      return checkRoles.every((role) => roles.value.includes(role));
    }
  }

  /**
   * 检查是否拥有指定权限
   * @param authList 需要检查的权限（单个或数组）
   * @param mode 检查模式：'some' 表示拥有任一权限即可，'every' 表示需要拥有所有权限
   * @returns 是否拥有指定权限
   */
  function hasAuth(
    authList: string | string[],
    mode: "some" | "every" = "some"
  ): boolean {
    if (!authList || authList.length === 0) return true;

    const checkAuths = Array.isArray(authList) ? authList : [authList];

    if (mode === "some") {
      return checkAuths.some((auth) => auths.value.includes(auth));
    } else {
      return checkAuths.every((auth) => auths.value.includes(auth));
    }
  }

  /**
   * 重置 store 到初始状态
   */
  function $reset() {
    roles.value = [];
    auths.value = [];
  }

  // ==================== Return ====================

  return {
    // State
    roles,
    auths,

    // Getters
    isAdmin,
    hasPermissions,

    // Actions
    setRoles,
    setAuths,
    hasRole,
    hasAuth,
    $reset,
  };
});
