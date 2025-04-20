import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/home/home-page.vue'
import BuildScene from '@/views/scene/build-scene.vue'
import ModelBaseSet from '@/views/model/model-base-set.vue'
import GestureOperation from '@/views/gesture/gesture-operation.vue'
import PlayAnimation from '@/views/animation/play-animation.vue'
import MeterialModify from '@/views/material/meterial-modify.vue'
import GyroscopeControll from '@/views/gyroscope/gyroscope-controll.vue'
import GestureOperationSelect from '@/views/select/gesture-operation-select.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: {
        title: '首页',
      },
    },
    {
      path: '/build-scene',
      name: 'build-scene',
      component: BuildScene,
      meta: {
        title: '场景搭建和坐标系的理解',
      },
    },
    {
      path: '/model-base-set',
      name: 'model-base-set',
      component: ModelBaseSet,
      meta: {
        title: '模型基础设置',
      },
    },
    {
      path: '/gesture-operation',
      name: 'gesture-operation',
      component: GestureOperation,
      meta: {
        title: '手势操作-旋转',
      },
    },
    {
      path: '/gesture-operation-select',
      name: 'gesture-operation-select',
      component: GestureOperationSelect,
      meta: {
        title: '手势操作-选中拖动',
      },
    },
    {
      path: '/play-animation',
      name: 'play-animation',
      component: PlayAnimation,
      meta: {
        title: '播放动画',
      },
    },
    {
      path: '/meterial-modify',
      name: 'meterial-modify',
      component: MeterialModify,
      meta: {
        title: '材质修改',
      },
    },
    {
      path: '/gyroscope-controll',
      name: 'gyroscope-controll',
      component: GyroscopeControll,
      meta: {
        title: '陀螺仪控制',
      },
    },
  ],
})

export default router
