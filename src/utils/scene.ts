import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import dat from 'dat.gui'

export default class Scene {
  /**
   * 场景对象
   */
  public scene: THREE.Scene
  /**
   * 相机对象
   */
  public camera: THREE.PerspectiveCamera
  /**
   * 渲染器对象
   */
  public renderer: THREE.WebGLRenderer
  /**
   * 轨道控制器对象
   */
  public controls: OrbitControls
  /**
   * UI调试器对象
   */
  public datUI: dat.GUI
  /**
   * 环境光
   */
  public ambientLight: THREE.AmbientLight
  /**
   * 平行光
   */
  public directionalLight: THREE.DirectionalLight
  /**
   * 自定义控制器清理函数
   */
  public customControlsCleanup: (() => void) | undefined
  /**
   * 时钟
   */
  public clock: THREE.Clock

  constructor(canvas: HTMLCanvasElement) {
    // 创建场景
    this.scene = new THREE.Scene()

    // 创建透视相机，设置参数
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000)
    this.camera.position.set(0, 2, 10)

    // 创建 WebGL 渲染器并绑定 canvas
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true, // 开启抗锯齿
    })
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap

    // 创建轨道控制器
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enableDamping = true // 添加阻尼效果
    this.controls.dampingFactor = 0.05

    // 创建天空盒
    this.createSkyBox()

    // 初始渲染场景
    this.renderer.render(this.scene, this.camera)

    // 初始化环境光
    this.ambientLight = new THREE.AmbientLight(0x404040)
    this.scene.add(this.ambientLight)

    // 初始化平行光
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)
    this.scene.add(this.directionalLight)

    // 初始化UIdebug
    this.datUI = new dat.GUI()
    this.addAmbientLightDebugUI()
    this.addDirectionalLightDebugUI()

    // 初始化时钟
    this.clock = new THREE.Clock()

    // 监听窗口 resize 事件
    window.addEventListener('resize', this.handleWindowResize.bind(this))
    window.addEventListener('dblclick', this.handleDoubleClick.bind(this))
    return this
  }

  /**
   * 处理窗口大小变化
   */
  private handleWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight
    // 更新相机投影矩阵
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.render(this.scene, this.camera)
  }

  /**
   * 处理双击
   */
  private handleDoubleClick() {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      this.renderer.domElement.requestFullscreen()
    }
  }

  /**
   * 添加环境光debugUI
   */
  private addAmbientLightDebugUI() {
    const folder = this.datUI.addFolder('ambientLight')
    folder.add(this.ambientLight, 'intensity').min(0).max(1).step(0.01)
    folder.addColor(this.ambientLight, 'color')
  }

  /**
   * 添加平行光debugUI
   */
  private addDirectionalLightDebugUI() {
    this.directionalLight.castShadow = true
    this.directionalLight.shadow.mapSize.width = 1024
    this.directionalLight.shadow.mapSize.height = 1024
    this.directionalLight.shadow.camera.near = 0.5
    this.directionalLight.shadow.camera.far = 10
    const folder = this.datUI.addFolder('directionalLight')
    folder.add(this.directionalLight, 'intensity').min(0).max(1).step(0.01)
    folder.addColor(this.directionalLight, 'color')
    folder.add(this.directionalLight.position, 'x').min(-5).max(5).step(0.01)
    folder.add(this.directionalLight.position, 'y').min(-5).max(5).step(0.01)
    folder.add(this.directionalLight.position, 'z').min(-5).max(5).step(0.01)
    folder.add(this.directionalLight.shadow.camera, 'near').min(0).max(10).step(0.01)
    folder.add(this.directionalLight.shadow.camera, 'far').min(0).max(10).step(0.01)
    folder.add(this.directionalLight.shadow.mapSize, 'width').min(0).max(1024).step(2)
    folder.add(this.directionalLight.shadow.mapSize, 'height').min(0).max(1024).step(2)
  }

  /**
   * 创建天空盒
   */
  private createSkyBox() {
    // 设置一个天空盒背景图，将相机包裹在内
    const geometry = new THREE.SphereGeometry(300, 50, 50)
    const texture = new THREE.TextureLoader().load('./src/assets/model/skybox/skybox.jpg')
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide, //默认前面可见，设置为背面可见即可
    })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.name = 'custom_sky_box'
    this.scene.add(mesh)
  }

  /**
   * 移除自定义的假天空盒
   */
  public removeCustomSkyBox() {
    const customSkyBox = this.scene.getObjectByName('custom_sky_box')
    if (customSkyBox) {
      this.scene.remove(customSkyBox)
    }
  }

  /**
   * 动画循环
   */
  public animate(callback?: () => void) {
    const animate = () => {
      requestAnimationFrame(animate)
      this.controls.update()
      if (callback) {
        callback()
      }
      this.renderer.render(this.scene, this.camera)
    }
    animate()
  }

  /**
   * 获取模型包围盒
   */
  public getBoundingBox(model: THREE.Object3D): THREE.Box3 {
    return new THREE.Box3().setFromObject(model)
  }

  /**
   * 添加相机调试UI
   */
  public addCameraDebugUI() {
    const cameraFolder = this.datUI.addFolder('Camera')

    // 相机位置控制
    const positionFolder = cameraFolder.addFolder('Position')
    positionFolder.add(this.camera.position, 'x', -20, 20, 0.1).name('Position X')
    positionFolder.add(this.camera.position, 'y', -20, 20, 0.1).name('Position Y')
    positionFolder.add(this.camera.position, 'z', -20, 20, 0.1).name('Position Z')

    // 相机旋转控制
    const rotationFolder = cameraFolder.addFolder('Rotation')
    rotationFolder.add(this.camera.rotation, 'x', -Math.PI, Math.PI, 0.01).name('Rotation X')
    rotationFolder.add(this.camera.rotation, 'y', -Math.PI, Math.PI, 0.01).name('Rotation Y')
    rotationFolder.add(this.camera.rotation, 'z', -Math.PI, Math.PI, 0.01).name('Rotation Z')

    // 相机视角控制
    const fovFolder = cameraFolder.addFolder('Field of View')
    fovFolder
      .add(this.camera, 'fov', 20, 120, 1)
      .name('FOV')
      .onChange(() => {
        this.camera.updateProjectionMatrix()
      })

    // 相机近平面和远平面控制
    const clippingFolder = cameraFolder.addFolder('Clipping Planes')
    clippingFolder
      .add(this.camera, 'near', 0.1, 50, 0.1)
      .name('Near')
      .onChange(() => {
        this.camera.updateProjectionMatrix()
      })
    clippingFolder
      .add(this.camera, 'far', 100, 5000, 100)
      .name('Far')
      .onChange(() => {
        this.camera.updateProjectionMatrix()
      })

    // 重置按钮
    const resetCamera = {
      reset: () => {
        this.camera.position.set(2, 2, 5)
        this.camera.lookAt(0, 1, 0)
        this.camera.fov = 45
        this.camera.near = 0.1
        this.camera.far = 2000
        this.camera.updateProjectionMatrix()
        // 更新控制器
        this.controls.target.set(0, 1, 0)
        this.controls.update()
      },
    }
    cameraFolder.add(resetCamera, 'reset').name('Reset Camera')
  }

  /**
   * 销毁场景
   */
  public destroy() {
    window.removeEventListener('resize', this.handleWindowResize.bind(this))
    window.removeEventListener('dblclick', this.handleDoubleClick.bind(this))
    this.scene.clear()
    this.renderer.dispose()
    this.controls.dispose()
    this.datUI.destroy()
  }
}
