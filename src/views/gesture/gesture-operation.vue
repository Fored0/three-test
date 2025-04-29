<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import Scene from '@/utils/scene';
import { SelectButton, type SelectButtonChangeEvent } from 'primevue';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import * as THREE from 'three';


const gestureCanvas = ref<HTMLCanvasElement>()
let _scene: Scene;
const model = ref("orbitControls")
const options = ["orbitControls", "rotate"]

onMounted(() => {
  if (!gestureCanvas.value) return
  _scene = new Scene(gestureCanvas.value)
  addCube()
  _scene.animate()
})

const handleChange = (e: SelectButtonChangeEvent) => {
  if (e.value === "rotate") {
    _scene.controls.dispose();
    const cleanup = useRotate();
    // 存储清理函数以便后续使用
    _scene.customControlsCleanup = cleanup;
  } else {
    // 清理自定义控制器
    if (_scene.customControlsCleanup) {
      _scene.customControlsCleanup();
    }
    _scene.controls = new OrbitControls(_scene.camera, _scene.renderer.domElement);
  }
}

const addCube = () => {
  const gemotry = new THREE.BoxGeometry(1, 1, 1)
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
  const cube = new THREE.Mesh(gemotry, material)
  _scene.scene.add(cube)
}

const useRotate = () => {
  let isDragging = false;
  let previousMousePosition = { x: 0, y: 0 };
  const spherical = new THREE.Spherical(10, Math.PI / 2, 0);

  const onMouseDown = (event: MouseEvent) => {
    isDragging = true;
    previousMousePosition = {
      x: event.clientX,
      y: event.clientY
    };
  };

  const onMouseMove = (event: MouseEvent) => {
    if (!isDragging) return;

    const deltaMove = {
      x: event.clientX - previousMousePosition.x,
      y: event.clientY - previousMousePosition.y
    };

    // 调整旋转速度
    const rotationSpeed = 0.005;

    // 更新球坐标
    spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi + deltaMove.y * rotationSpeed));
    spherical.theta += deltaMove.x * rotationSpeed;

    // 转换球坐标到笛卡尔坐标
    const sinPhiRadius = spherical.radius * Math.sin(spherical.phi);
    _scene.camera.position.x = sinPhiRadius * Math.sin(spherical.theta);
    _scene.camera.position.y = spherical.radius * Math.cos(spherical.phi);
    _scene.camera.position.z = sinPhiRadius * Math.cos(spherical.theta);

    _scene.camera.lookAt(0, 0, 0);

    previousMousePosition = {
      x: event.clientX,
      y: event.clientY
    };
  };

  const onMouseUp = () => {
    isDragging = false;
  };

  // 添加事件监听器
  window.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);

  // 清理函数
  return () => {
    window.removeEventListener('mousedown', onMouseDown);
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
  };
};

onUnmounted(() => {
  _scene.destroy()
})
</script>

<template>
  <div>
    <canvas ref="gestureCanvas" class="canvas"></canvas>
    <div class="select">
      <SelectButton v-model="model" :options="options" @change="handleChange"></SelectButton>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
