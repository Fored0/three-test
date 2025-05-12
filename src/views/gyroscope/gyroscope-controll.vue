<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import * as THREE from 'three'
import Scene from '@/utils/scene'

const gyroscopeRef = ref<HTMLCanvasElement>()
const videoRef = ref<HTMLVideoElement>()
const ballon = ref<THREE.Mesh>()
let _scene: Scene

onMounted(() => {
  if (!gyroscopeRef.value) return
  _scene = new Scene(gyroscopeRef.value)
  getPermission()
  addBallon()
  window.addEventListener('resize', updateBallonSize)
  _scene.animate()
})

const getPermission = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
  })
  if (!videoRef.value) return
  videoRef.value.srcObject = stream
  videoRef.value.play()
}

const addBallon = () => {
  if (!gyroscopeRef.value) return
  const geometry = new THREE.SphereGeometry(1, 32, 32)
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
  const mesh = new THREE.Mesh(geometry, material)
  ballon.value = mesh
  updateBallonSize()
  _scene.scene.add(mesh)
}

const updateBallonSize = () => {
  if (!ballon.value) return

  // 获取视口尺寸
  const viewportWidth = document.documentElement.clientWidth
  const viewportHeight = document.documentElement.clientHeight

  // 更新渲染器尺寸
  _scene.renderer.setSize(viewportWidth, viewportHeight)

  // 更新相机宽高比
  _scene.camera.aspect = viewportWidth / viewportHeight
  _scene.camera.updateProjectionMatrix()

  // 计算实际的摄像机视角里的世界空间宽度
  // const fov = _scene.camera.fov * (Math.PI / 180) // 将角度转换为弧度
  // const distance = Math.abs(_scene.camera.position.z)
  // const worldWidth = 2 * distance * Math.tan(fov / 2)

  // 视口宽度变了，但是渲染的世界宽度没变，为了造成视觉效果上的变化，根据视口比例和相机z轴来计算
  const worldWidth = (viewportWidth / viewportHeight) * Math.abs(_scene.camera.position.z) * 0.5

  // 设置气球大小为世界宽度的一半
  const balloonSize = worldWidth / 2

  // 设置气球大小
  ballon.value.scale.set(balloonSize, balloonSize, balloonSize)
  console.log(_scene.camera.position)
}

onUnmounted(() => {
  window.removeEventListener('resize', updateBallonSize)
  _scene.destroy()
})
</script>

<template>
  <div class="container">
    <video ref="videoRef" class="camera-video" autoplay playsinline></video>
    <canvas ref="gyroscopeRef" class="canvas"></canvas>
  </div>
</template>

<style lang="scss" scoped>
.container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  .camera-video {
    position: absolute;
    top: 12px;
    left: 12px;
    width: 150px;
    height: 150px;
    border-radius: 8px;
    object-fit: cover;
    z-index: 1;
  }
}
</style>
