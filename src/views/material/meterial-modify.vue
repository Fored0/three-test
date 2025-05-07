<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import Scene from '@/utils/scene';
import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';
import { RGBELoader } from 'three/examples/jsm/Addons.js';

const materialCanvas = ref<HTMLCanvasElement>();
let _scene: Scene;
let cube: THREE.Mesh;
const tweenGroup = new TWEEN.Group();

// 添加产品配置数据
const products = ref([
  { id: 1, name: '款式1', color: '#00ff00' },
  { id: 2, name: '款式2', color: '#ff0000' },
  { id: 3, name: '款式3', color: '#0000ff' },
]);

const currentProduct = ref(products.value[0]);

// 更新材质颜色的方法
const updateMaterialColor = (color: string) => {
  if (cube && cube.material instanceof THREE.MeshStandardMaterial) {
    cube.material.color.setStyle(color);
  }
};

onMounted(async () => {
  if (!materialCanvas.value) return;
  _scene = new Scene(materialCanvas.value);

  // 调整相机位置
  _scene.camera.position.set(5, 5, 10);
  _scene.camera.lookAt(0, 0, 0);

  // 移除假天空盒
  _scene.removeCustomSkyBox()

  // 加载HDR环境贴图
  const rgbeLoader = new RGBELoader();
  const hdrTexture = await rgbeLoader.loadAsync('src/assets/model/hdr/memorial.hdr');
  hdrTexture.mapping = THREE.EquirectangularReflectionMapping;
  _scene.scene.environment = hdrTexture;
  _scene.scene.background = hdrTexture;

  // 移除默认光源
  _scene.scene.children = _scene.scene.children.filter(
    child => !(child instanceof THREE.DirectionalLight)
  );

  // 添加环境光
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  _scene.scene.add(ambientLight);

  createCube();

  startAnimation();

  _scene.animate(() => {
    tweenGroup.update()
  });
});

const createCube = () => {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshStandardMaterial({
    color: currentProduct.value.color,
    transparent: true,
    opacity: 1,
    envMapIntensity: 1, // 环境贴图强度
    roughness: 0.5,     // 粗糙度
    metalness: 0.5      // 金属度
  });
  cube = new THREE.Mesh(geometry, material);

  cube.position.set(-5, 0, 0);
  _scene.scene.add(cube);
};

const startAnimation = () => {
  // 1. 平移
  const moveRight = new TWEEN.Tween(cube.position, tweenGroup)
    .to({ x: 5 }, 2000)
    .easing(TWEEN.Easing.Quadratic.InOut);

  // 2. 旋转
  const rotate = new TWEEN.Tween(cube.rotation, tweenGroup)
    .to({ y: Math.PI * 2 }, 2000)
    .easing(TWEEN.Easing.Quadratic.InOut);

  // 3. 放大
  const scaleUp = new TWEEN.Tween(cube.scale, tweenGroup)
    .to({ x: 2, y: 2, z: 2 }, 1000)
    .easing(TWEEN.Easing.Cubic.Out);

  // 4. 缩小
  const scaleDown = new TWEEN.Tween(cube.scale, tweenGroup)
    .to({ x: 1, y: 1, z: 1 }, 1000)
    .easing(TWEEN.Easing.Cubic.In);

  // 5. 透明度（渐隐）
  const fadeOut = new TWEEN.Tween(cube.material, tweenGroup)
    .to({ opacity: 0.2 }, 1000)
    .easing(TWEEN.Easing.Quadratic.Out);

  // 6. 透明度（渐现）
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

  moveRight.start();
};

onUnmounted(() => {
  _scene.destroy();
});

// 处理产品切换
const handleProductChange = (product: typeof products.value[0]) => {
  currentProduct.value = product;
  updateMaterialColor(product.color);
};
</script>

<template>
  <div class="material-container">
    <canvas ref="materialCanvas" class="canvas"></canvas>

    <!-- 添加产品SKU切换栏 -->
    <div class="product-controls">
      <div class="sku-list">
        <button v-for="product in products" :key="product.id" :class="{ active: currentProduct.id === product.id }"
          @click="handleProductChange(product)">
          {{ product.name }}
          <span class="color-preview" :style="{ backgroundColor: product.color }"></span>
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.material-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.canvas {
  width: 100%;
  height: 100%;
}

.product-controls {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.9);
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.sku-list {
  display: flex;
  gap: 10px;

  button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
    background: white;
    transition: all 0.3s ease;

    &.active {
      border-color: #1890ff;
      color: #1890ff;
    }

    &:hover {
      border-color: #1890ff;
    }
  }
}

.color-preview {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1px solid #ddd;
}
</style>
