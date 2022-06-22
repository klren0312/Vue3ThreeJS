import type { RouteRecordRaw } from 'vue-router'
import type { App } from 'vue'

import { createRouter, createWebHashHistory } from 'vue-router'
const basicRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Index',
    component: () => import('/@/views/Airport.vue')
  },
  // {
  //   path: '/ar',
  //   name: 'arPage',
  //   component: () => import('/@/views/AR.vue')
  // },
  {
    path: '/custom',
    name: 'custom',
    component: () => import('/@/views/Custom.vue')
  },
  {
    path: '/people',
    name: 'people',
    component: () => import('/@/views/AnimatePeople.vue')
  }
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes: basicRoutes,
  strict: true,
  scrollBehavior: () => ({ left: 0, top: 0 }),
})

export function setupRouter(app: App<Element>) {
  app.use(router)
}
