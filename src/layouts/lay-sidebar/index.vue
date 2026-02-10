<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import type { SidebarProps } from "@/shadcn/ui/sidebar";

import { AudioWaveform, Command, GalleryVerticalEnd } from "lucide-vue-next";
import NavMain from "../lay-nav/NavMain.vue";
import NavUser from "../lay-nav/NavUser.vue";
import TeamSwitcher from "../lay-nav/TeamSwitcher.vue";
import { constantMenus } from "@/routes";
import { ascending, filterTree } from "@/routes/utils";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/shadcn/ui/sidebar";

const props = withDefaults(defineProps<SidebarProps>(), {
  collapsible: "icon",
});

interface NavItem {
  title: string;
  url: string;
  isActive?: boolean;
  items?: NavItem[];
}

const route = useRoute();

function resolvePath(parentPath: string, path: string) {
  if (!path) return parentPath || "/";
  if (path.startsWith("/")) return path;

  const parent = parentPath.endsWith("/")
    ? parentPath.slice(0, -1)
    : parentPath;
  return `${parent}/${path}`.replace(/\/+/g, "/") || "/";
}

function mapToItems(routes: RouteConfigsTable[], parentPath = ""): NavItem[] {
  return routes
    .map((routeItem) => {
      const fullPath = resolvePath(parentPath, routeItem.path || "");
      const children = routeItem.children?.length
        ? mapToItems(routeItem.children as RouteConfigsTable[], fullPath)
        : undefined;

      const url =
        typeof routeItem.redirect === "string" && routeItem.redirect.length > 0
          ? routeItem.redirect
          : children?.[0]?.url || fullPath;

      const isSelfActive = route.path === url;
      const isChildActive = children?.some((child) => child.isActive) ?? false;

      return {
        title: routeItem.meta?.title || String(routeItem.name || url),
        icon: routeItem.meta?.icon,
        url,
        isActive: isSelfActive || isChildActive,
        items: children,
      } as NavItem;
    })
    .filter((item) => item.title && !item.url.includes(":pathMatch"));
}

const filterMenuTree = computed<NavItem[]>(() => {
  const tree = filterTree(ascending(constantMenus));
  return mapToItems(tree);
});

const data = {
  user: {
    name: "admin",
    email: "admin@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "CY Admin",
      logo: GalleryVerticalEnd,
      plan: "Starter",
    },
    {
      name: "Workspace",
      logo: AudioWaveform,
      plan: "Team",
    },
    {
      name: "Tools",
      logo: Command,
      plan: "Free",
    },
  ],
};
</script>

<template>
  <Sidebar v-bind="props">
    <SidebarHeader>
      <TeamSwitcher :teams="data.teams" />
    </SidebarHeader>

    <SidebarContent>
      <NavMain :items="filterMenuTree" />
    </SidebarContent>

    <SidebarFooter>
      <NavUser :user="data.user" />
    </SidebarFooter>

    <SidebarRail />
  </Sidebar>
</template>
