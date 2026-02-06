<script lang="ts">
export const description = "A sidebar that collapses to icons.";
export const iframeHeight = "800px";
export const containerClass = "w-full h-full";
</script>

<script setup lang="ts">
import AppSidebar from "./lay-sidebar/index.vue";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
</script>

<template>
  <SidebarProvider>
    <AppSidebar />
    <SidebarInset class="h-screen overflow-hidden flex flex-col">
      <header
        class="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12"
      >
        <div class="flex items-center gap-2 px-4">
          <SidebarTrigger class="-ml-1" />
          <Separator
            orientation="vertical"
            class="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem class="hidden md:block">
                <BreadcrumbLink href="#">
                  Building Your Application
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator class="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Data Fetching</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div class="min-h-0 flex-1 overflow-auto">
        <div class="flex flex-1 flex-col gap-4 p-4">
          <router-view></router-view>
          <div class="grid auto-rows-min gap-4 md:grid-cols-3">
            <div class="bg-muted/50 aspect-video rounded-xl" />
            <div class="bg-muted/50 aspect-video rounded-xl" />
            <div class="bg-muted/50 aspect-video rounded-xl" />
          </div>

          <div
            class="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min"
          />

          <div class="bg-muted/50 w-full h-[1000px] rounded-xl"></div>
        </div>
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>

<style lang="scss" scoped>
::-webkit-scrollbar {
  display: none;
}
</style>
