import * as THREE from 'three'
import { InstancedBufferGeometry } from 'three'
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js'
import ThreeManager from '../index.js'
import treePositions from './lodTree2.json'

let highLodTree, mediumLodTree, lowLodTree
class LodTree {
  constructor() {
    const threeManager = ThreeManager.getInstance()
    this.scene = threeManager.getScene()
    this.camera = threeManager.getCamera()
    this.renderer = threeManager.getRenderer()
    this.container = threeManager.getContainer()
    this.controls = threeManager.getControls()
    this.maxCount = 1000
    this.vegetationPositions = []
    this.frustum = new THREE.Frustum()
    this.cameraMatrix = new THREE.Matrix4()
    this.trunkGeometry = new THREE.CylinderGeometry(1, 1.5, 10, 8)
    this.trunkGeometry.translate(0, 5, 0)
    this.treeLOD = threeManager.treeLOD
    this.initScene()
  }
  initScene() {
    // this.scene.add(this.treeLOD)
    this.loadModel()
    // 添加动画循环方法
    // const animate = () => {
    //   requestAnimationFrame(animate)
    //   this.controls.update()
    //   // 更新 LOD
    //   this.updateLodVisibility()
    //   this.renderer.render(this.scene, this.camera)
    // }
    // requestAnimationFrame(animate)
  }
  loadModel() {
    // let kTX2Loader = new KTX2Loader()
    //   .setTranscoderPath('basis/') // Basis解码路径
    //   .detectSupport(this.renderer)

    //  kTX2Loader.loadAsync('textures/123.ktx2').then((texture) => {
    //   const material = new THREE.MeshBasicMaterial({
    //     map: texture,
    //     transparent: true,
    //     side: THREE.DoubleSide,
    //     alphaTest: 0.5,
    //     color: 0x2d5a27,
    //   })
    const textureLoader = new THREE.TextureLoader()
    textureLoader.load('textures/松树.png', (texture) => {
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        side: THREE.DoubleSide,
        alphaTest: 0.5,
        color: 0x2d5a27,
      })
      // 加载高模
      const highGeometry = this.createTreeGeometry(16)
      highLodTree = new THREE.InstancedMesh(highGeometry, material, this.maxCount)
      this._initInstances(highLodTree, 0, 0, 0)
      this.scene.add(highLodTree)

      // 加载中模
      const mediumGeometry = this.createTreeGeometry(8)
      mediumLodTree = new THREE.InstancedMesh(mediumGeometry, material, this.maxCount)
      this._initInstances(mediumLodTree, 20, 0, 0)
      this.scene.add(mediumLodTree)

      // 加载低模
      const geometry = this.createTreeGeometry(2)
      lowLodTree = new THREE.InstancedMesh(geometry, material, this.maxCount)
      this._initInstances(lowLodTree, -20, 0, 0)
      this.scene.add(lowLodTree)
      // 添加到 LOD 系统
      this.treeLOD.addLevel(highLodTree, 100) // 100 单位内显示高模
      this.treeLOD.addLevel(mediumLodTree, 300) // 300 单位内显示中模
      this.treeLOD.addLevel(lowLodTree, 1000) // 1000 单位内显示低模
    })
  }
  //实例化精确位置
  _initInstances(LodTree) {
    this.mesh = LodTree
    this.mesh.castShadow = true
    this.mesh.receiveShadow = true
    const matrix = new THREE.Matrix4()
    const position = new THREE.Vector3()
    const scale = new THREE.Vector3()
    const quaternion = new THREE.Quaternion()

    // 存储位置信息
    if (!this.vegetationPositions) {
      this.vegetationPositions = []
    }
    let instanceCount = 0

    // 使用导入的JSON数据
    treePositions.empties.forEach((tree, index) => {
      if (instanceCount >= this.maxCount) return

      // 设置位置
      position.set(tree.position[0], tree.position[1] - 20, tree.position[2])

      // 设置旋转
      quaternion.setFromEuler(new THREE.Euler(tree.rotation[0], tree.rotation[1], tree.rotation[2]))

      // 设置缩放
      scale.set(tree.scale[0] * 3, tree.scale[1] * 3, tree.scale[2] * 3)
      // 设置旋转
      // quaternion.setFromEuler(new THREE.Euler(0.0, 0.0, -0.0))

      // // 设置缩放
      // scale.set(1 * 3, 1 * 3, 1 * 3)
      // 应用变换
      matrix.compose(position, quaternion, scale)
      this.mesh.setMatrixAt(instanceCount, matrix)
      this.vegetationPositions[instanceCount] = position.clone()

      instanceCount++
    })

    this.mesh.instanceMatrix.needsUpdate = true
  }
  // 生成树的几何体
  createTreeGeometry(planeCount = 2) {
    // 使用已创建的树干几何体
    const trunkGeometry = this.trunkGeometry

    // 创建多个平面作为树冠
    const planes = []
    for (let i = 0; i < planeCount; i++) {
      const plane = new THREE.PlaneGeometry(6, 12) // 调整树冠尺寸
      plane.translate(0, 10, 0) // 调整树冠位置
      plane.rotateY((Math.PI / (planeCount / 2)) * i)
      planes.push(plane)
    }

    // 创建合并后的几何体
    const geometry = new THREE.BufferGeometry()

    // 合并顶点位置（树干 + 所有平面）
    const positions = new Float32Array([
      ...Array.from(trunkGeometry.attributes.position.array),
      ...planes.flatMap((plane) => Array.from(plane.attributes.position.array)),
    ])
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    // 合并法线
    const normals = new Float32Array([
      ...Array.from(trunkGeometry.attributes.normal.array),
      ...planes.flatMap((plane) => Array.from(plane.attributes.normal.array)),
    ])
    geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3))

    // 合并UV
    const uvs = new Float32Array([
      ...new Array(trunkGeometry.attributes.position.count * 2).fill(0), // 树干UV
      ...planes.flatMap((plane) => {
        const planeUVs = Array.from(plane.attributes.uv.array)
        //修正 UV 坐标 翻转每个 UV 坐标的 Y 值
        // for (let i = 1; i < planeUVs.length; i += 2) {
        //   planeUVs[i] = 1 - planeUVs[i]
        // }
        return planeUVs
      }),
    ])
    geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))

    return geometry
  }

  // 几何体压缩方法
  _compressGeometry(geometry) {
    const compressedGeo = new InstancedBufferGeometry()

    // 顶点压缩为半精度浮点
    compressedGeo.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array(geometry.attributes.position.array), 3)
    )

    // 只有在存在索引时才设置
    if (geometry.index) {
      compressedGeo.setIndex(new THREE.BufferAttribute(new Uint16Array(geometry.index.array), 1))
    }

    // 复制其他属性（如法线）
    if (geometry.attributes.normal) {
      compressedGeo.setAttribute(
        'normal',
        new THREE.BufferAttribute(new Float32Array(geometry.attributes.normal.array), 3)
      )
    }

    return compressedGeo
  }
  updateLodVisibility() {
    this.treeLOD.update(this.camera)
    // this.updateFrustumVisibility()//待优化
  }
  updateFrustumVisibility() {
    const cameraPos = camera.position
    // 更新视锥体
    this.cameraMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse)
    this.frustum.setFromProjectionMatrix(this.cameraMatrix)
    let visibleCount = 0
    // 遍历所有植被位置
    this.vegetationPositions.forEach((pos, index) => {
      // 创建包围球进行视锥体检测
      const boundingSphere = new THREE.Sphere(pos, 15) // 半径根据树的大小调整
      const isVisible = this.frustum.intersectsSphere(boundingSphere)
      if (!isVisible) {
        // 如果不在视锥体内，将所有LOD级别都设为不可见
        if (highLodTree) highLodTree.count = 0
        if (mediumLodTree) mediumLodTree.count = 0
        if (lowLodTree) lowLodTree.count = 0
        return
      }

      visibleCount++
    })
    // 显示调试信息
    console.log(`可见实例数量: ${visibleCount}/${this.vegetationPositions.length}`)
  }
}
export default LodTree
