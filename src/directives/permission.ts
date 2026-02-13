import type { Directive, DirectiveBinding } from "vue";
import { usePermissionStore } from "@/stores/permission";

/**
 * 权限指令
 * 用法：
 * v-auth="'user:add'" - 检查单个权限
 * v-auth="['user:add', 'user:edit']" - 检查多个权限（默认 some 模式）
 * v-auth.every="['user:add', 'user:edit']" - 检查多个权限（every 模式）
 */
export const auth: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const { value, modifiers } = binding;
    const permissionStore = usePermissionStore();

    if (!value) {
      return;
    }

    const mode = modifiers.every ? "every" : "some";
    const hasPermission = permissionStore.hasAuth(value, mode);

    if (!hasPermission) {
      el.remove();
    }
  },
};

/**
 * 角色指令
 * 用法：
 * v-role="'admin'" - 检查单个角色
 * v-role="['admin', 'user']" - 检查多个角色（默认 some 模式）
 * v-role.every="['admin', 'user']" - 检查多个角色（every 模式）
 */
export const role: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const { value, modifiers } = binding;
    const permissionStore = usePermissionStore();

    if (!value) {
      return;
    }

    const mode = modifiers.every ? "every" : "some";
    const hasRole = permissionStore.hasRole(value, mode);

    if (!hasRole) {
      el.remove();
    }
  },
};
