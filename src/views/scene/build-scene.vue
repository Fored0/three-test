<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import * as THREE from 'three'
import Scene from '@/utils/scene'

const SceneCanvas = ref<HTMLCanvasElement>()
let _scene: Scene

onMounted(() => {
  if (!SceneCanvas.value) return
  _scene = new Scene(SceneCanvas.value)
  _scene.camera.position.set(0, 5, 5)
  addPlane()
  addCube()
  addSphere()
  addAxisHelper()
  _scene.animate()
})

const addPlane = () => {
  const planeGeometry = new THREE.PlaneGeometry(10, 10)
  const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x808080, side: THREE.DoubleSide })
  const plane = new THREE.Mesh(planeGeometry, planeMaterial)
  plane.rotation.x = Math.PI / 2
  plane.receiveShadow = true
  _scene.scene.add(plane)
  _scene.animate()
}

const addCube = () => {
  const cubeGeometry = new THREE.BoxGeometry(1, 1, 1)
  const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 })
  const cube = new THREE.Mesh(cubeGeometry, cubeMaterial)
  cube.position.set(0, 0.5, 0)
  cube.castShadow = true
  _scene.scene.add(cube)
}

const addSphere = () => {
  const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32)
  const sphereMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 })
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
  sphere.position.set(2, 0.5, 0)
  sphere.castShadow = true
  _scene.scene.add(sphere)
}

const addAxisHelper = () => {
  const axisHelper = new THREE.AxesHelper(5)
  _scene.scene.add(axisHelper)
}

onUnmounted(() => {
  _scene.destroy()
})
</script>

<template>
  <canvas ref="SceneCanvas" class="canvas"></canvas>
</template>

<style lang="scss" scoped></style>
