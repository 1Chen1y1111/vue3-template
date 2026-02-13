# 权限管理使用指南

## Permission Store

权限管理 Store 位于 `src/stores/permission.ts`，提供角色和权限的管理功能。

### 基本使用

```typescript
import { usePermissionStore } from "@/stores/permission";

const permissionStore = usePermissionStore();

// 设置用户角色
permissionStore.setRoles(["admin", "user"]);

// 设置用户权限
permissionStore.setAuths(["user:add", "user:edit", "user:delete"]);

// 检查角色
const isAdmin = permissionStore.hasRole("admin"); // true
const hasMultipleRoles = permissionStore.hasRole(["admin", "editor"]); // true (some 模式)
const hasAllRoles = permissionStore.hasRole(["admin", "editor"], "every"); // false

// 检查权限
const canAdd = permissionStore.hasAuth("user:add"); // true
const canEdit = permissionStore.hasAuth(["user:edit", "user:delete"]); // true (some 模式)
const hasAllAuths = permissionStore.hasAuth(["user:edit", "user:delete"], "every"); // true

// 检查是否为管理员
const isAdminUser = permissionStore.isAdmin; // true

// 清空权限
permissionStore.clearPermissions();
```

## 权限指令

### v-auth 指令

用于根据权限控制元素的显示/隐藏。

```vue
<template>
  <!-- 单个权限 -->
  <button v-auth="'user:add'">添加用户</button>

  <!-- 多个权限（some 模式：拥有任一权限即显示） -->
  <button v-auth="['user:edit', 'user:delete']">编辑或删除</button>

  <!-- 多个权限（every 模式：需要拥有所有权限才显示） -->
  <button v-auth.every="['user:edit', 'user:delete']">编辑并删除</button>
</template>
```

### v-role 指令

用于根据角色控制元素的显示/隐藏。

```vue
<template>
  <!-- 单个角色 -->
  <div v-role="'admin'">管理员专属内容</div>

  <!-- 多个角色（some 模式：拥有任一角色即显示） -->
  <div v-role="['admin', 'editor']">管理员或编辑可见</div>

  <!-- 多个角色（every 模式：需要拥有所有角色才显示） -->
  <div v-role.every="['admin', 'editor']">需要同时是管理员和编辑</div>
</template>
```

## 在组件中使用

```vue
<script setup lang="ts">
import { usePermissionStore } from "@/stores/permission";

const permissionStore = usePermissionStore();

// 在逻辑中检查权限
const handleDelete = () => {
  if (!permissionStore.hasAuth("user:delete")) {
    console.log("没有删除权限");
    return;
  }
  // 执行删除操作
};

// 使用 computed 响应式检查
const canManageUsers = computed(() => {
  return permissionStore.hasAuth(["user:add", "user:edit", "user:delete"], "every");
});
</script>

<template>
  <div>
    <!-- 使用指令 -->
    <button v-auth="'user:add'">添加</button>
    <button v-auth="'user:edit'">编辑</button>
    <button v-auth="'user:delete'" @click="handleDelete">删除</button>

    <!-- 使用 computed -->
    <div v-if="canManageUsers">
      完整的用户管理功能
    </div>
  </div>
</template>
```

## 路由权限控制

在路由配置中使用 `meta.roles` 和 `meta.auths` 字段：

```typescript
// src/routes/modules/user.ts
export default {
  path: "/user",
  name: "User",
  component: Layout,
  meta: {
    title: "用户管理",
    roles: ["admin"], // 需要 admin 角色
  },
  children: [
    {
      path: "/user/list",
      name: "UserList",
      component: () => import("@/views/user/list.vue"),
      meta: {
        title: "用户列表",
        auths: ["user:view"], // 需要 user:view 权限
      },
    },
  ],
} satisfies RouteConfigsTable;
```

然后在路由守卫中检查权限：

```typescript
// src/routes/index.ts
router.beforeEach(async (to, from, next) => {
  const permissionStore = usePermissionStore();

  // 检查路由角色权限
  if (to.meta.roles && to.meta.roles.length > 0) {
    if (!permissionStore.hasRole(to.meta.roles)) {
      next("/403"); // 跳转到无权限页面
      return;
    }
  }

  // 检查路由权限
  if (to.meta.auths && to.meta.auths.length > 0) {
    if (!permissionStore.hasAuth(to.meta.auths)) {
      next("/403");
      return;
    }
  }

  next();
});
```

## 初始化权限

通常在用户登录后初始化权限：

```typescript
// 登录成功后
const login = async (username: string, password: string) => {
  const response = await loginApi(username, password);

  const permissionStore = usePermissionStore();

  // 设置用户角色和权限
  permissionStore.setRoles(response.roles);
  permissionStore.setAuths(response.auths);

  // 跳转到首页
  router.push("/");
};

// 退出登录时清空权限
const logout = () => {
  const permissionStore = usePermissionStore();
  permissionStore.clearPermissions();
  router.push("/login");
};
```
