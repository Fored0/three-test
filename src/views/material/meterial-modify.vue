<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import Scene from '@/utils/scene';
import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';

const materialCanvas = ref<HTMLCanvasElement>();
let _scene: Scene;
let cube: THREE.Mesh;

onMounted(() => {
  if (!materialCanvas.value) return;
  _scene = new Scene(materialCanvas.value);

  // 调整相机位置以便更好地观察动画
  _scene.camera.position.set(5, 5, 10);
  _scene.camera.lookAt(0, 0, 0);

  // 创建立方体
  createCube();

  // 开始动画
  startAnimation();

  // 动画循环 - 使用 TWEEN.Group
  const tweenGroup = new TWEEN.Group();
  _scene.animate(() => {
    tweenGroup.update();
  });
});

const createCube = () => {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshPhongMaterial({
    color: 0x00ff00,
    transparent: true, // 启用透明度
    opacity: 1
  });
  cube = new THREE.Mesh(geometry, material);

  // 设置初始位置在左侧
  cube.position.set(-5, 0, 0);
  _scene.scene.add(cube);
};

const startAnimation = () => {
  // 创建一个TWEEN组
  const tweenGroup = new TWEEN.Group();

  // 1. 平移动画（左 -> 右）
  const moveRight = new TWEEN.Tween(cube.position, tweenGroup)
    .to({ x: 5 }, 2000)
    .easing(TWEEN.Easing.Quadratic.InOut);

  // 2. 旋转动画（360度）
  const rotate = new TWEEN.Tween(cube.rotation, tweenGroup)
    .to({ y: Math.PI * 2 }, 2000)
    .easing(TWEEN.Easing.Quadratic.InOut);

  // 3. 放大动画
  const scaleUp = new TWEEN.Tween(cube.scale, tweenGroup)
    .to({ x: 2, y: 2, z: 2 }, 1000)
    .easing(TWEEN.Easing.Cubic.Out);

  // 4. 缩小动画
  const scaleDown = new TWEEN.Tween(cube.scale, tweenGroup)
    .to({ x: 1, y: 1, z: 1 }, 1000)
    .easing(TWEEN.Easing.Cubic.In);

  // 5. 透明度动画（渐隐）
  const fadeOut = new TWEEN.Tween(cube.material, tweenGroup)
    .to({ opacity: 0.2 }, 1000)
    .easing(TWEEN.Easing.Quadratic.Out);

  // 6. 透明度动画（渐现）
  const fadeIn = new TWEEN.Tween(cube.material, tweenGroup)
    .to({ opacity: 1 }, 1000)
    .easing(TWEEN.Easing.Quadratic.In);

  // 链接动画序列
  moveRight.chain(rotate);
  rotate.chain(scaleUp);
  scaleUp.chain(scaleDown);
  scaleDown.chain(fadeOut);
  fadeOut.chain(fadeIn);

  // 设置动画循环
  fadeIn.onComplete(() => {
    // 重置位置和旋转
    cube.position.set(-5, 0, 0);
    cube.rotation.set(0, 0, 0);
    // 重新开始动画
    moveRight.start();
  });

  // 开始动画
  moveRight.start();
};

onUnmounted(() => {
  _scene.destroy();
});
</script>

<template>
  <canvas ref="materialCanvas" class="canvas"></canvas>
</template>

<style lang="scss" scoped></style>
