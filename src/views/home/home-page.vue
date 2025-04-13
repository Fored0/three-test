<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter, type RouteRecordRaw } from 'vue-router'
import Button from 'primevue/button'

const router = useRouter()
const routes = ref<RouteRecordRaw[]>([])

onMounted(() => {
  const _routes = router.options.routes
  routes.value = _routes.filter((item) => item.path !== '/')
})
</script>

<template>
  <div class="home-warpper">
    <Button v-for="item in routes" :key="item.path">
      <router-link :to="item.path">{{ item.meta?.title }}</router-link>
    </Button>
  </div>
</template>

<style lang="scss" scoped>
.home-warpper {
  display: flex;
  align-items: center;
  gap: 12px;
  a {
    color: #fff;
    text-decoration: none;
  }
}
</style>
