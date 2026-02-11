# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在此代码库中工作时提供指导。

## 项目概述

这是一个 Vue 3 + TypeScript + Vite 模板项目，集成了 Tailwind CSS 和 shadcn-vue 组件。项目使用 Composition API 配合 `<script setup>` 语法，遵循基于功能的架构设计。

## 常用命令

### 开发命令
- `pnpm dev` - 启动开发服务器
- `pnpm build` - 使用 vue-tsc 进行类型检查并构建生产版本
- `pnpm preview` - 本地预览生产构建

### 包管理器
本项目使用 **pnpm**（版本 10.28.2），如 package.json 中所指定。请始终使用 pnpm 进行依赖管理。

## 架构设计

### 路由系统

路由系统采用复杂的多级结构，会自动扁平化路由以兼容 keep-alive：

- **路由模块**：位于 `src/routes/modules/`，每个模块导出一个 `RouteConfigsTable` 对象
- **自动加载**：`src/routes/modules/` 下的所有模块（除了 `remaining.ts`）通过 `import.meta.glob` 自动加载
- **路由处理流程**：
  1. `ascending()` - 按 `meta.rank` 排序路由（如果缺失则自动分配 rank）
  2. `buildHierarchyTree()` - 创建父子关系，添加 `id`、`parentId` 和 `pathList`
  3. `formatFlatteningRoutes()` - 将嵌套路由扁平化为一维数组
  4. `formatTwoStageRoutes()` - 转换为两级结构（keep-alive 仅支持 2 级）

- **路由类型**：在 `src/types/router.d.ts` 中定义，包含丰富的 meta 选项：
  - `title`、`icon`、`showLink`、`rank` - 菜单显示
  - `keepAlive` - 组件缓存
  - `roles`、`auths` - 权限控制
  - `transition` - 页面动画
  - `frameSrc` - iframe 嵌入

- **特殊路由**：`remaining.ts` 包含不参与菜单系统的路由

### 目录结构

```
src/
├── assets/          # 静态资源
├── components/      # 共享组件
├── composables/     # Vue 组合式函数（VueUse 模式）
├── directives/      # 自定义 Vue 指令
├── features/        # 功能模块
├── layouts/         # 布局组件（index.vue、lay-nav、lay-sidebar）
├── routes/          # 路由配置
│   ├── modules/     # 路由模块（自动加载）
│   ├── index.ts     # 路由设置和处理
│   └── utils.ts     # 路由转换工具函数
├── services/        # API 服务
├── shadcn/          # shadcn-vue 组件
│   ├── lib/         # 工具函数（cn() 用于类名合并）
│   └── ui/          # UI 组件
├── shared/          # 共享工具
├── stores/          # Pinia 状态管理
├── styles/          # 全局样式（Tailwind CSS）
├── types/           # TypeScript 类型定义
├── utils/           # 工具函数
└── views/           # 页面组件
```

### UI 组件系统

- **shadcn-vue**：基于 Reka UI（Radix Vue）的组件库
- **配置**：`components.json` 定义别名和路径
- **样式**：Tailwind CSS v4，通过 `@tailwindcss/vite` 提供自定义工具类
- **类名工具**：`src/shadcn/lib/utils.ts` 中的 `cn()` 函数使用 `clsx` 和 `tailwind-merge` 合并类名
- **图标**：使用 lucide-vue-next 图标组件

### 路径别名

- `@/` → `src/`
- `@/shadcn/` → `src/shadcn/`

在 `vite.config.ts` 和 `tsconfig.json` 中均有配置。

### SVG 处理

SVG 可以通过 `vite-svg-loader` 作为 Vue 组件导入。该插件配置了 SVGO 的 `prefixIds` 插件以避免 ID 冲突。

## 关键模式

### 添加新路由

1. 在 `src/routes/modules/` 中创建新文件（例如 `feature.ts`）
2. 导出一个包含 Layout 组件和子路由的 `RouteConfigsTable` 对象
3. 使用 `meta.rank` 控制菜单顺序（数字越小越靠前）
4. 设置 `meta.showLink: false` 可隐藏菜单项
5. 路由会自动加载和处理

示例：
```typescript
import { Icon } from "lucide-vue-next";
const Layout = () => import("@/layouts/index.vue");

export default {
  path: "/feature",
  name: "Feature",
  component: Layout,
  redirect: "/feature/index",
  meta: {
    icon: Icon,
    title: "功能名称",
    rank: 10,
  },
  children: [
    {
      path: "/feature/index",
      name: "FeatureIndex",
      component: () => import("@/views/feature/index.vue"),
      meta: {
        title: "功能页面",
      },
    },
  ],
} satisfies RouteConfigsTable;
```

### 路由 Keep-Alive

由于 Vue Router 的限制，keep-alive 仅适用于 2 级路由。路由系统会自动将所有路由扁平化为 2 级。在子路由上设置 `meta.keepAlive: true` 即可启用缓存。

### 组件开发

- 使用 Composition API 配合 `<script setup lang="ts">`
- 从 `@/shadcn/ui/` 导入 shadcn 组件
- 使用 `cn()` 进行条件类名合并
- 遵循 Vue 3 最佳实践（参见 vue-best-practices skill）

## 依赖项

### 核心依赖
- Vue 3.5.24 with Composition API
- Vue Router 4.6.4 用于路由
- Pinia 3.0.4 用于状态管理（尚未配置）
- VueUse 14.2.0 提供组合式函数

### UI 和样式
- Tailwind CSS 4.1.18 with @tailwindcss/vite
- Reka UI 2.8.0（Radix Vue 原语）
- lucide-vue-next 图标库
- class-variance-authority、clsx、tailwind-merge 样式工具

### 构建工具
- Vite 7.2.4
- TypeScript 5.9.3
- vue-tsc 用于类型检查
- Sass 1.97.3
- vite-svg-loader 用于 SVG 组件

### 工具库
- lodash-es 工具函数库
