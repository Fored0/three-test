<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import Scene from '@/utils/scene';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import * as THREE from "three"
import { useToast, Toast } from 'primevue';
import TWEEN from '@tweenjs/tween.js'

const toast = useToast()
const animationRef = ref<HTMLCanvasElement>()
let _scene: Scene;
let mixer: THREE.AnimationMixer;
let idleAction: THREE.AnimationAction;
let walkAction: THREE.AnimationAction;
let runAction: THREE.AnimationAction;
let model: THREE.Group;
const tweenGroup = new TWEEN.Group();

onMounted(async () => {
  if (!animationRef.value) return
  _scene = new Scene(animationRef.value)

  _scene.camera.position.set(2, 2, -5)
  _scene.camera.lookAt(0, 1, 0)

  // 添加相机调试UI
  _scene.addCameraDebugUI()

  await loadModel()

  _scene.animate(() => {
    tweenGroup.update()
    mixer.update(_scene.clock.getDelta())
  })
})

const loadModel = async () => {
  const loader = new GLTFLoader()
  loader.load('src/assets/model/soldier/soldier.glb',
    (gltf) => {
      model = gltf.scene
      model.scale.set(0, 0, 0)
      _scene.scene.add(model)

      model.traverse(obj => {
        if (obj instanceof THREE.Mesh) {
          obj.castShadow = true
        }
      })

      const animations = gltf.animations
      mixer = new THREE.AnimationMixer(model)
      idleAction = mixer.clipAction(animations[0])
      walkAction = mixer.clipAction(animations[3])
      runAction = mixer.clipAction(animations[1])

      walkAction.clampWhenFinished = true
      walkAction.loop = THREE.LoopOnce
      runAction.clampWhenFinished = true
      runAction.loop = THREE.LoopOnce

      startEntranceAnimation()

      addModelClickHandler()
    },
    (p) => {
      console.log(p.loaded, p.total)
      if (p.loaded === p.total) {
        toast.add({
          severity: "info",
          summary: "Progress",
          detail: "模型加载成功",
          life: 2000
        })
      }
    },
    (err) => {
      console.error(err)
    }
  )
}

const startEntranceAnimation = () => {
  model.scale.set(1, 1, 1)
  model.rotation.y = 0

  const scaleUp = new TWEEN.Tween(model.scale, tweenGroup)
    .to({ x: 1, y: 1, z: 1 }, 1500)
    .easing(TWEEN.Easing.Cubic.Out)

  const rotate = new TWEEN.Tween(model.rotation, tweenGroup)
    .to({ y: Math.PI * 2 }, 1500)
    .easing(TWEEN.Easing.Cubic.Out)

  rotate.onComplete(() => {
    idleAction.reset()
    idleAction.play()
  })

  scaleUp.start()
  rotate.start()
}

const addModelClickHandler = () => {
  const raycaster = new THREE.Raycaster()
  const mouse = new THREE.Vector2()

  window.addEventListener('click', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

    raycaster.setFromCamera(mouse, _scene.camera)
    const intersects = raycaster.intersectObject(model, true)

    if (intersects.length > 0) {
      playAnimationSequence()
    }
  })
}

const playAnimationSequence = () => {
  idleAction.stop()

  walkAction.reset()
  walkAction.play()

  mixer.addEventListener('finished', onWalkFinished)
}

const onWalkFinished = () => {
  mixer.removeEventListener('finished', onWalkFinished)

  runAction.reset()
  runAction.play()
}

onUnmounted(() => {
  _scene.destroy()
})

</script>

<template>
  <canvas ref="animationRef" class="canvas"></canvas>
  <Toast />
</template>

<style lang="scss" scoped></style>
