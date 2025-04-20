<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import Scene from '@/utils/scene'
import { GLTFLoader, type GLTF } from 'three/examples/jsm/Addons.js'

const modelCanvas = ref<HTMLCanvasElement>()
let _scene: Scene

onMounted(async () => {
  if (!modelCanvas.value) return
  _scene = new Scene(modelCanvas.value)
  await loadModel()
  _scene?.animate()
})

const loadModel = async () => {
  const loader = new GLTFLoader()
  const modelCount = 3;
  const models: THREE.Group[] = [];

  const loadSingleModel = () => {
    return new Promise<THREE.Group>((resolve, reject) => {
      loader.load(
        'src/assets/model/slothSword/gltf/SlothSword.gltf',
        (gltf: GLTF) => {
          const model = gltf.scene.clone(); // 克隆模型
          resolve(model);
        },
        (p) => {
          console.log('模型加载进度--->', p);
        },
        (e) => {
          console.log('模型加载错误--->', e);
          reject(e);
        }
      );
    });
  };

  try {
    for (let i = 0; i < modelCount; i++) {
      const model = await loadSingleModel();
      models.push(model);
    }

    // 处理所有加载的模型
    let totalWidth = 0;
    const modelInfos = models.map(model => {
      // 计算模型的包围盒
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());

      // 计算相机视锥体在模型位置的高度
      const fov = _scene!.camera.fov * Math.PI / 180;
      const distance = _scene!.camera.position.z;
      const height = 2 * Math.tan(fov / 2) * distance;

      // 计算缩放比例
      const scale = height / size.y;
      model.scale.setScalar(scale);

      // 计算缩放后的中心点
      const scaledCenter = center.multiplyScalar(scale)
      model.position.sub(scaledCenter)

      // 更新包围盒和尺寸（因为已经缩放）
      const scaledBox = new THREE.Box3().setFromObject(model);
      const scaledSize = scaledBox.getSize(new THREE.Vector3());

      totalWidth += scaledSize.x;
      return { model, scaledSize, scale };
    });

    // 计算起始位置（使模型组居中）
    let currentX = -totalWidth / 2;
    const spacing = 0.5; // 模型之间的间距

    // 设置每个模型的位置
    modelInfos.forEach(({ model, scaledSize }) => {
      // 设置模型的X位置，使其并排放置
      model.position.x = currentX + scaledSize.x / 2;
      currentX += scaledSize.x + spacing;

      // 处理模型材质
      model.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.Material) {
          const textureLoader = new THREE.TextureLoader();
          const colorTexture = textureLoader.load('src/assets/model/slothSword/gltf/Material_BaseColor.png');
          const roughnessTexture = textureLoader.load('src/assets/model/slothSword/gltf/Material_metal-Material_Roughness.png');
          const normalTexture = textureLoader.load('src/assets/model/slothSword/gltf/Material_Normal_norm.png');

          colorTexture.colorSpace = THREE.SRGBColorSpace;

          child.material = new THREE.MeshStandardMaterial({
            map: colorTexture,
            roughnessMap: roughnessTexture,
            normalMap: normalTexture,
          });
        }
      });

      // 将模型添加到场景中
      _scene?.scene.add(model);
    });

  } catch (error) {
    console.error('加载模型时出错:', error);
  }
}
onUnmounted(() => {
  _scene?.destroy()
})
</script>

<template>
  <div><canvas ref="modelCanvas" class="canvas"></canvas></div>
</template>

<style lang="scss" scoped></style>
