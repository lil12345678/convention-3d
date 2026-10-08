import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/home.vue'),
    meta: { title: '数据中心' },
    children: [
      {
        path: '/',
        name: 'ComSituation',
        component: () => import('@/views/comSituation/index.vue'),
        meta: { title: '综合态势' },
      },
      {
        path: '/SecSituation',
        name: 'SecSituation',
        component: () => import('@/views/secSituation/index.vue'),
        meta: { title: '安防态势' },
      },
      {
        path: '/device',
        name: 'device',
        component: () => import('@/views/device/index.vue'),
        meta: { title: '设备管理' },
      },
      {
        path: '/energy',
        name: 'energy',
        component: () => import('@/views/energy/index.vue'),
        meta: { title: '能量管理' },
      },
      {
        path: '/convention',
        name: 'convention',
        component: () => import('@/views/convention/index.vue'),
        meta: { title: '会展信息' },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 添加权限控制逻辑
  next()
})
export default router
