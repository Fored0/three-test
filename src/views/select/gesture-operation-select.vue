<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import Scene from '@/utils/scene';
import * as THREE from 'three';
import { gsap } from 'gsap';

const gestureCanvas = ref<HTMLCanvasElement>();
const guideRef = ref<HTMLDivElement>();
let _scene: Scene;
let selectedObject: THREE.Mesh | null = null;
const showGuide = ref(true);

onMounted(() => {
  if (!gestureCanvas.value) return;
  _scene = new Scene(gestureCanvas.value);
  addRandomSpheres();
  setupInteraction();
  _scene.animate();
});

// 添加随机球体
const addRandomSpheres = () => {
  const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);

  for (let i = 0; i < 10; i++) {
    const material = new THREE.MeshPhongMaterial({
      color: Math.random() * 0xffffff,
    });
    const sphere = new THREE.Mesh(sphereGeometry, material);

    sphere.position.x = (Math.random() - 0.5) * 10;
    sphere.position.y = (Math.random() - 0.5) * 10;
    sphere.position.z = (Math.random() - 0.5) * 10;

    _scene.scene.add(sphere);
  }
};

// 交互
const setupInteraction = () => {
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let isDragging = false;

  // 转换触摸/鼠标坐标为标准化设备坐标
  const updatePointer = (clientX: number, clientY: number) => {
    const rect = gestureCanvas.value!.getBoundingClientRect();
    pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
  };

  // 选中物体
  const selectObject = (event: MouseEvent | TouchEvent) => {
    const clientX = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
    const clientY = event instanceof MouseEvent ? event.clientY : event.touches[0].clientY;

    updatePointer(clientX, clientY);
    raycaster.setFromCamera(pointer, _scene.camera);

    const intersects = raycaster.intersectObjects(_scene.scene.children);
    if (intersects.length > 0) {
      selectedObject = intersects[0].object as THREE.Mesh;

      // 动画效果
      gsap.to(selectedObject.scale, {
        x: 1.5,
        y: 1.5,
        z: 1.5,
        duration: 0.3,
        ease: "back.out"
      });

      gsap.to(selectedObject.rotation, {
        y: selectedObject.rotation.y + Math.PI * 2,
        duration: 1,
        ease: "power2.inOut"
      });
    }
  };

  // 拖动物体
  const moveObject = (event: MouseEvent | TouchEvent) => {
    if (!selectedObject || !isDragging) return;

    const clientX = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
    const clientY = event instanceof MouseEvent ? event.clientY : event.touches[0].clientY;

    updatePointer(clientX, clientY);
    raycaster.setFromCamera(pointer, _scene.camera);

    const intersectPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1));
    const intersectPoint = new THREE.Vector3();
    raycaster.ray.intersectPlane(intersectPlane, intersectPoint);

    selectedObject.position.copy(intersectPoint);
  };

  // 结束拖动
  const endDrag = () => {
    isDragging = false;
    if (selectedObject) {
      gsap.to(selectedObject.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 0.3
      });
    }
    selectedObject = null;
  };

  const checkHideGuide = () => {
    if (!showGuide.value) return;
    showGuide.value = false;
  };

  gestureCanvas.value?.addEventListener('mousedown', (e) => {
    isDragging = true;
    selectObject(e);
  });
  gestureCanvas.value?.addEventListener('mousemove', moveObject);
  gestureCanvas.value?.addEventListener('mouseup', endDrag);

  gestureCanvas.value?.addEventListener('touchstart', (e) => {
    isDragging = true;
    selectObject(e);
    checkHideGuide();
  });
  gestureCanvas.value?.addEventListener('touchmove', (e) => {
    moveObject(e);
  });
  gestureCanvas.value?.addEventListener('touchend', endDrag);
};

onUnmounted(() => {
  _scene.destroy()
})
</script>

<template>
  <div class="gesture-container">
    <canvas ref="gestureCanvas" class="canvas"></canvas>
    <!-- 引导层 -->
    <div v-if="showGuide" ref="guideRef" class="guide-overlay">
      <div class="guide-content">
        <div class="guide-icon">👆</div>
        <div class="guide-text">向左滑动以开始</div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.gesture-container {
  position: relative;
  width: 100%;
  height: 100vh;
}

.canvas {
  width: 100%;
  height: 100%;
}

.guide-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  touch-action: none;
  pointer-events: none;
  user-select: none;

  .guide-content {
    text-align: center;
    color: white;

    .guide-icon {
      font-size: 48px;
      animation: swipe 1.5s infinite;
    }

    .guide-text {
      margin-top: 16px;
      font-size: 18px;
    }
  }
}

@keyframes swipe {
  0% {
    transform: translateX(0);
  }

  50% {
    transform: translateX(-20px);
  }

  100% {
    transform: translateX(0);
  }
}
</style>
