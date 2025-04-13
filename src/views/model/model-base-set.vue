<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import Scene from '@/utils/scene'
import { GLTFLoader, type GLTF } from 'three/examples/jsm/Addons.js'

const modelCanvas = ref<HTMLCanvasElement>()
let _scene: Scene | null = null

onMounted(async () => {
  if (!modelCanvas.value) return
  _scene = new Scene(modelCanvas.value)
  await loadModel()
  _scene?.animate()
})

const loadModel = async () => {
  const loader = new GLTFLoader()
  loader.load('src/assets/model/slothSword/gltf/SlothSword.gltf', (gltf: GLTF) => {
    console.log('模型加载完成--->', gltf)
    const model = gltf.scene

    // 计算模型的包围盒
    const box = new THREE.Box3().setFromObject(model)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())

    // 计算相机视锥体在模型位置的高度
    const fov = _scene!.camera.fov * Math.PI / 180
    const distance = _scene!.camera.position.z
    const height = 2 * Math.tan(fov / 2) * distance

    // 计算缩放比例，让模型高度始终以视口高度展示
    const scale = height / size.y
    model.scale.setScalar(scale)

    // 重新计算缩放后的中心点
    const scaledCenter = center.multiplyScalar(scale)
    model.position.sub(scaledCenter)

    // 遍历所有子模型
    model.traverse((child) => {
      // 处理网格材质，添加纹理
      if (child instanceof THREE.Mesh && child.material instanceof THREE.Material) {
        const textureLoader = new THREE.TextureLoader()
        const colorTexture = textureLoader.load('src/assets/model/slothSword/gltf/Material_BaseColor.png')
        const roughnessTexture = textureLoader.load('src/assets/model/slothSword/gltf/Material_metal-Material_Roughness.png')
        const normalTexture = textureLoader.load('src/assets/model/slothSword/gltf/Material_Normal_norm.png')

        // 设置颜色纹理的颜色空间
        colorTexture.colorSpace = THREE.SRGBColorSpace

        // 创建新的标准材质并应用所有纹理
        child.material = new THREE.MeshStandardMaterial({
          map: colorTexture,           // 颜色纹理
          roughnessMap: roughnessTexture, // 粗糙度纹理
          normalMap: normalTexture,    // 法线纹理
        })
      }
    })

    // 将模型添加到场景中
    _scene?.scene.add(model)
  }, (p) => {
    console.log('模型加载进度--->', p)
  }, (e) => {
    console.log('模型加载错误--->', e)
  })
}
onUnmounted(() => {
  _scene?.destroy()
})
</script>

<template>
  <div><canvas ref="modelCanvas" class="canvas"></canvas></div>
</template>

<style lang="scss" scoped></style>
