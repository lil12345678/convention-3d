import * as THREE from 'three'
import treePositions1 from './l1.json'
import treePositions2 from './l2.json'
import treePositions3 from './l3.json'
import treePositions4 from './l4.json'
import treePositions5 from './l5.json'
import ThreeManager from '../index.js'
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js'
export default class TreeManager {
  static instance = null

  constructor() {
    if (TreeManager.instance) {
      return TreeManager.instance
    }
    TreeManager.instance = this
    const threeManager = ThreeManager.getInstance()
    this.scene = threeManager.getScene()
    this.camera = threeManager.getCamera()
    this.renderer = threeManager.getRenderer()
    this.container = threeManager.getContainer()
    this.controls = threeManager.getControls()
    this.maxCount = 2000
    this.trees = []
    this.kTX2Loader = new KTX2Loader().setTranscoderPath('basis/').detectSupport(this.renderer)
    this.init()
  }
  static getInstance() {
    return TreeManager.instance
  }
  async init() {
    await this.initmatrial()
    this.initgeo()
    this.addTree()
    this.addFlower()
    // this.addTree2()
  }
  async initmatrial() {
    const text1 = await this.kTX2Loader.loadAsync('textures/pine.ktx2')

    const material1 = new THREE.MeshBasicMaterial({
      map: text1,
      transparent: true,
      side: THREE.DoubleSide,
      alphaTest: 0.5,
      color: 0x6e8b3d,
    })
    const text2 = await this.kTX2Loader.loadAsync('textures/camphor.ktx2')
    const material2 = new THREE.MeshStandardMaterial({
      map: text2,
      transparent: true,
      alphaTest: 0.5,
      side: THREE.DoubleSide,
      roughness: 0.6, // 控制表面粗糙度
      metalness: 0.0, // 设为0表示非金属材质
      color: 0xfffacd,
    })
    const material3 = new THREE.MeshStandardMaterial({
      map: text2, //text3,
      transparent: true,
      side: THREE.DoubleSide,
      alphaTest: 0.5,
      roughness: 0.6,
      metalness: 0.0,
      color: 0x6b8e23, //6e8b3d
    })
    const text4 = await this.kTX2Loader.loadAsync('textures/camphor2.ktx2')
    const material4 = new THREE.MeshStandardMaterial({
      map: text4,
      transparent: true,
      side: THREE.DoubleSide,
      alphaTest: 0.5,
      roughness: 0.6,
      metalness: 0.0,
      color: 0xf4a460, //cc9966
    })
    const textureLoader = new THREE.TextureLoader()
    const texture = await textureLoader.loadAsync('textures/pine.png')

    const pinematerial = new THREE.MeshStandardMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
      alphaTest: 0.5,
      roughness: 0.6,
      metalness: 0.0,
      color: 0x2d5a27, //
    })

    const texture2 = await new Promise((resolve) => {
      textureLoader.load('textures/camphor.png', (tex) => resolve(tex))
    })
    const camphormaterial = new THREE.MeshStandardMaterial({
      map: texture2,
      transparent: true,
      side: THREE.DoubleSide,
      alphaTest: 0.5,
      color: 0x2f4f1e, //0x3a5f1e, //0x2f4f1e//0x2d5a27
    })
    const texture3 = await new Promise((resolve) => {
      textureLoader.load('textures/luan.png', (tex) => resolve(tex))
    })
    const luanmaterial = new THREE.MeshStandardMaterial({
      map: texture3,
      transparent: true,
      side: THREE.DoubleSide,
      alphaTest: 0.5,
      color: 0x3a5f1e, //003300, //0x3a5f1e, //0x2f4f1e
    })

    this.material = {
      pine: pinematerial,
      camphor: camphormaterial,
      luan: luanmaterial,
      red: material4,
    }
    this.lowmaterial = {
      pine: material1, //pinematerial
      camphor: material2,
      luan: material3, //material3
      red: material4,
    }
  }
  initgeo() {
    const pineConfig = {
      planeWidth: 10,
      planeHeight: 12,
      trunkRadius: [1, 1.5],
      trunkHeight: 12,
    }

    const camphorConfig = {
      planeWidth: 8,
      planeHeight: 10,
      trunkRadius: [0.8, 1.2],
      trunkHeight: 10,
    }
    const luanConfig = {
      planeWidth: 10,
      planeHeight: 12,
      trunkRadius: [1, 1.5],
      trunkHeight: 14,
    }

    this.geometry = {
      pine: {
        highGeometry: this.createTreeGeometry(16, pineConfig),
        mediumGeometry: this.createTreeGeometry(8, pineConfig),
        lowGeometry: this.createTreeGeometry(8, pineConfig),
      },
      camphor: {
        highGeometry: this.createTreeGeometry(12, camphorConfig),
        mediumGeometry: this.createTreeGeometry(8, camphorConfig),
        lowGeometry: this.createTreeGeometry(8, camphorConfig),
      },
      luan: {
        highGeometry: this.createTreeGeometry(12, luanConfig),
        mediumGeometry: this.createTreeGeometry(8, luanConfig),
        lowGeometry: this.createTreeGeometry(8, luanConfig),
      },
      red: {
        highGeometry: this.createTreeGeometry(16, pineConfig),
        mediumGeometry: this.createTreeGeometry(8, pineConfig),
        lowGeometry: this.createTreeGeometry(8, pineConfig),
      },
    }
  }
  createTree(position, materialType) {
    const lod = new THREE.LOD()
    const highLodTree = new THREE.InstancedMesh(
      this.geometry[materialType].highGeometry,
      this.material[materialType],
      position.empties.length
    )
    this._initInstances(highLodTree, position, materialType)
    const mediumLodTree = new THREE.InstancedMesh(
      this.geometry[materialType].mediumGeometry,
      this.lowmaterial[materialType],
      position.empties.length //this.maxCount
    )
    this._initInstances(mediumLodTree, position, materialType)
    const lowLodTree = new THREE.InstancedMesh(
      this.geometry[materialType].lowGeometry,
      this.lowmaterial[materialType],
      position.empties.length //this.maxCount
    )
    this._initInstances(lowLodTree, position, materialType)
    lod.addLevel(highLodTree, 100)
    lod.addLevel(mediumLodTree, 300)
    lod.addLevel(lowLodTree, 1000)

    // this.scene.add(lod)
    return lod
  }
  addTree() {
    const pineTree = this.createTree(treePositions1, 'pine')
    const camphortree = this.createTree(treePositions2, 'camphor')
    const luanTree = this.createTree(treePositions3, 'luan')
    const redTree = this.createTree(treePositions4, 'red')
    this.scene.add(pineTree)
    this.scene.add(camphortree)
    this.scene.add(luanTree)
    this.scene.add(redTree)
    this.trees.push(pineTree)
    this.trees.push(camphortree)
    this.trees.push(luanTree)
    this.trees.push(redTree)
  }
  _initInstances(LodTree, treePosition, materialType) {
    this.mesh = LodTree
    // this.mesh.castShadow = true
    // this.mesh.receiveShadow = true
    const matrix = new THREE.Matrix4()
    const position = new THREE.Vector3()
    const scale = new THREE.Vector3()
    const quaternion = new THREE.Quaternion()

    let instanceCount = 0

    // 使用导入的JSON数据
    treePosition.empties.forEach((tree, index) => {
      if (instanceCount >= this.maxCount) return
      // 设置位置
      position.set(tree.position[0], tree.position[1] - 18, tree.position[2])
      if (materialType == 'luan') {
        position.set(tree.position[0], tree.position[1] - 28, tree.position[2])
      }

      // 设置旋转
      quaternion.setFromEuler(
        new THREE.Euler(
          tree.rotation[0],
          tree.rotation[1] + Math.PI * Math.random(),
          tree.rotation[2]
        )
      )

      // 设置缩放
      scale.set(tree.scale[0] * 3, tree.scale[1] * 3, tree.scale[2] * 3)

      // 应用变换
      matrix.compose(position, quaternion, scale)
      this.mesh.setMatrixAt(instanceCount, matrix)

      instanceCount++
    })

    this.mesh.instanceMatrix.needsUpdate = true
  }
  // 生成树的几何体
  createTreeGeometry(planeCount = 2, config) {
    // this.trunkGeometry = new THREE.CylinderGeometry(1, 1.5, 10, 8)

    this.trunkGeometry = new THREE.CylinderGeometry(
      config.trunkRadius[0],
      config.trunkRadius[1],
      config.trunkHeight,
      8
    )

    // this.trunkGeometry.translate(0, config.trunkHeight + 10, 0)
    this.trunkGeometry.translate(0, 5, 0)

    // 使用已创建的树干几何体
    const trunkGeometry = this.trunkGeometry
    // 修改树干的UV映射
    const trunkUvs = this.trunkGeometry.attributes.uv.array
    for (let i = 0; i < trunkUvs.length; i += 2) {
      // 调整UV坐标以适应树皮纹理
      trunkUvs[i] *= 2 // U坐标
      trunkUvs[i + 1] *= 2 // V坐标
    }
    // 创建多个平面作为树冠
    const planes = []
    for (let i = 0; i < planeCount; i++) {
      // const plane = new THREE.PlaneGeometry(6, 12) // 调整树冠尺寸
      // plane.translate(0, 10, 0) // 调整树冠位置
      // plane.rotateY((Math.PI / (planeCount / 2)) * i)
      // planes.push(plane)
      const plane = new THREE.PlaneGeometry(config.planeWidth, config.planeHeight)
      plane.translate(0, config.trunkHeight, 0)
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
      ...Array.from(trunkGeometry.attributes.uv.array), // 使用修改后的树干UV
      ...planes.flatMap((plane) => {
        const planeUVs = Array.from(plane.attributes.uv.array)
        // 修正 UV 坐标 翻转每个 UV 坐标的 Y 值
        // for (let i = 1; i < planeUVs.length; i += 2) {
        //   planeUVs[i] = 1 - planeUVs[i]
        // }
        return planeUVs
      }),
    ])
    geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))

    return geometry
  }
  async addFlower() {
    // 加载花朵纹理
    const textureLoader = new THREE.TextureLoader()
    const flowerTexture = await textureLoader.loadAsync('textures/flower.png')

    // 创建花朵材质
    const flowerMaterial = new THREE.MeshStandardMaterial({
      map: flowerTexture,
      transparent: true,
      side: THREE.DoubleSide,
      alphaTest: 0.5,
    })

    // 创建平面几何体
    const flowerGeometry = new THREE.PlaneGeometry(3, 3)

    // 创建实例化网格
    const flowerInstancedMesh = new THREE.InstancedMesh(
      flowerGeometry,
      flowerMaterial,
      treePositions5.empties.length
    )

    // 设置实例化矩阵
    const matrix = new THREE.Matrix4()
    const position = new THREE.Vector3()
    const quaternion = new THREE.Quaternion()
    const scale = new THREE.Vector3()
    const color = new THREE.Color()

    // 遍历位置数据设置每个实例的变换
    treePositions5.empties.forEach((flower, index) => {
      // 设置位置
      position.set(flower.position[0], flower.position[1] + 0.1, flower.position[2])

      // 设置旋转
      quaternion.setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0))

      // 设置缩放
      const randomScale = 1.8 + Math.random() * 0.4
      scale.set(randomScale, randomScale, randomScale)

      // 应用变换
      matrix.compose(position, quaternion, scale)
      flowerInstancedMesh.setMatrixAt(index, matrix)

      // 为每个实例设置随机红色
      const r = 0.8 + Math.random() * 0.2 // 0.8-1.0 范围的红色
      const g = 0.2 + Math.random() * 0.2 // 0.2-0.4 范围的绿色
      const b = 0.2 + Math.random() * 0.2 // 0.2-0.4 范围的蓝色
      color.setRGB(r, g, b)
      flowerInstancedMesh.setColorAt(index, color)
      // // 为每个实例设置随机颜色
      // const hue = Math.random() // 随机色相 (0-1)
      // const saturation = 0.7 + Math.random() * 0.3 // 饱和度 (0.7-1.0)
      // const lightness = 0.5 + Math.random() * 0.3 // 亮度 (0.5-0.8)
      // color.setHSL(hue, saturation, lightness)
      // flowerInstancedMesh.setColorAt(index, color)
    })

    // 更新实例矩阵
    flowerInstancedMesh.instanceMatrix.needsUpdate = true

    // 添加到场景
    this.scene.add(flowerInstancedMesh)
  }
  updateTreeLOD(camera) {
    // console.log(this.trees)
    this.trees.forEach((tree) => {
      tree.update(camera)
    })
  }
}
