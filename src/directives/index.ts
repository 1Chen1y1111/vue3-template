import type { App } from "vue";
import { auth, role } from "./permission";

/**
 * 注册全局指令
 */
export function setupDirectives(app: App) {
  // 权限指令
  app.directive("auth", auth);
  // 角色指令
  app.directive("role", role);
}
