import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

import eventHub from '@/utils/eventHub'
import ThreeManager from '../index.js'
import { loadOneModel } from './loadModel.js'
import { TDHeatMap1, TDHeatMap2 } from '../heatMap/index.js'
import { Water } from 'three/addons/objects/Water2.js'
import ModelInDay from './isDay.js'
import ModelInNight from './isNight.js'
import { TextAnimationManager } from './textGeoManage.js'
import WeatherManager from '../weather/weatherManage.js'

class ModelManager {
  static instance = null

  constructor() {
    if (ModelManager.instance) {
      return ModelManager.instance
    }
    ModelManager.instance = this

    const threeManager = ThreeManager.getInstance()
    this.threeManager = threeManager
    this.scene = threeManager.getScene()
    this.camera = threeManager.getCamera()
    this.renderer = threeManager.getRenderer()
    this.renderer.toneMapping = THREE.ReinhardToneMapping
    this.controls = threeManager.getControls()
    this.gltfLoader = new GLTFLoader()
    this.modelMesh = null
    this.composer = threeManager.getComposer()

    this.initEventListeners()
    this.loadModel()
  }

  static getInstance() {
    if (!ModelManager.instance) {
      ModelManager.instance = new ModelManager()
    }
    return ModelManager.instance
  }
  initEventListeners() {
    eventHub.on('showHeatMapCallback', () => this.showHeatMap())
    eventHub.on('hideHeatMapCallback', () => this.hideHeatMap())
    eventHub.on('nightCallback', () => {
      this.nightCallback()
    })
    eventHub.on('dayCallback', (type) => {
      this.dayCallback(type)
    })
    eventHub.on('rainyCallback', () => this.rainyCallback())
    eventHub.on('cloudyCallback', () => this.cloudyCallback())
    eventHub.on('stadiumLabelCallback', () => this.loadtagpoint())
  }
  async loadModel() {
    console.log('模型加载开始')
    try {
      if (this.otherBuildMesh && this.roadMesh && this.Lod0Mesh) {
        eventHub.emit('modelLoading', 100)
        return
      }
      const totalModels = 3 // 总模型数量
      let loadedModels = 0 // 已加载模型数量

      // 创建包装后的Promise数组
      const wrappedPromises = [
        this.loadRoadModel().then(() => {
          loadedModels++
          const progress = Math.floor((loadedModels / totalModels) * 100)
          eventHub.emit('modelLoading', progress)
        }),
        this.loadLod0Convention().then(() => {
          loadedModels++
          const progress = Math.floor((loadedModels / totalModels) * 100)
          eventHub.emit('modelLoading', progress)
        }),
        this.loadOtherModel().then(() => {
          loadedModels++
          const progress = Math.floor((loadedModels / totalModels) * 100)
          eventHub.emit('modelLoading', progress)
        }),
      ]

      // 初始进度
      eventHub.emit('modelLoading', 0)

      // 等待所有模型加载完成
      await Promise.all(wrappedPromises)

      // 确保最终进度为100%
      eventHub.emit('modelLoading', 100)

      this.loadHighLodConvention()
      // this.dayCallback()
    } catch (error) {
      console.error('模型加载出错:', error)
      eventHub.emit('modelLoading', -1) // 发送错误状态
      throw error
    }
  }
  // 加载路面模型
  async loadRoadModel() {
    try {
      if (this.roadMesh) {
        return this.roadMesh
      }
      const gltf = await loadOneModel('model/v4road.gltf') //v3road

      console.log('road模型加载成功:', gltf)

      const modelMesh = gltf.scene
      this.roadMesh = modelMesh
      modelMesh.traverse((child) => {
        if (child.children.length) {
          child.children.forEach((item) => {
            if (item.isMesh) {
              //河流
              if (item.name.includes('Secondary_terrain_10')) {
                const water = this.addWater(item)

                // 保存water引用以便后续使用
                this.waterMesh = water
              }
              if (
                item.name.includes('Main_terrain_09') ||
                item.name.includes('Main_terrain_10') ||
                item.name.includes('Main_terrain_11')
              ) {
                // if (item.material) {
                //   item.material.dispose()
                //   if (item.material.map) {
                //     item.material.map.dispose()
                //   }
                //   if (item.material.lightMap) {
                //     item.material.lightMap.dispose()
                //   }
                //   // item.material = null
                // }
                // item.visible = false
                // const originalMatrix = item.matrixWorld.clone()
                // const textureLoader = new THREE.TextureLoader()
                // const normalMap0 = textureLoader.load('textures/water.png', (texture) => {
                //   texture.wrapS = texture.wrapT = THREE.RepeatWrapping
                // })
                // const params = {
                //   color: '#ffffff',
                //   scale: 4, //调整水波纹的比例
                //   flowX: 0.5, //调整水流速度
                //   flowY: 0.5,
                // }
                // let water = new Water(item.geometry, {
                //   color: params.color,
                //   scale: params.scale,
                //   flowDirection: new THREE.Vector2(params.flowX, params.flowY),
                //   normalMap0: normalMap0, // 必须手动指定
                //   textureWidth: 1024,
                //   textureHeight: 1024,
                // })
                // // 应用原始变换
                // water.applyMatrix4(originalMatrix)
                // water.rotation.x = -Math.PI / 2
                // water.position.y = -5
                // // 添加到场景
                // this.scene.add(water)
              }
            }
            if (item.name.includes('night')) {
              item.visible = false
            }
          })
        }
        if (child.name == 'Secondary_terrain_11001') {
          // 克隆原有材质以保留所有属性
          const newMaterial = child.material.clone()
          // 设置颜色，保持原有贴图
          newMaterial.color.setHex(0x698b22) // 深绿色
          // 确保颜色能够与贴图混合
          newMaterial.map = child.material.map
          newMaterial.needsUpdate = true
          // 应用新材质
          child.material = newMaterial
        }
        if (child.name == 'Secondary_terrain_01001') {
          // 克隆原有材质以保留所有属性
          const newMaterial = child.material.clone()
          // 设置颜色，保持原有贴图
          // newMaterial.color.setHex(0x999966) // 深绿色
          // 确保颜色能够与贴图混合
          newMaterial.map = child.material.map
          newMaterial.needsUpdate = true
          // 应用新材质
          child.material = newMaterial
        }
      })

      this.scene.add(modelMesh)
      return gltf
    } catch (error) {
      console.error('树模型加载失败:', error)
      throw error
    }
  }
  addWater(item, yofferset = -5) {
    // 保存原始网格的变换信息和尺寸
    const originalMatrix = item.matrixWorld.clone()
    const bbox = new THREE.Box3().setFromObject(item)
    const size = new THREE.Vector3()
    bbox.getSize(size)

    // 清除原有材质
    if (item.material) {
      item.material.dispose()
      if (item.material.map) {
        item.material.map.dispose()
      }
      if (item.material.lightMap) {
        item.material.lightMap.dispose()
      }
    }

    // 从父对象中移除原始网格
    if (item.parent) {
      item.parent.remove(item)
    }

    // 创建新的平面几何体
    const waterGeometry = new THREE.PlaneGeometry(size.x * 2, size.z)
    const textureLoader = new THREE.TextureLoader()
    const normalMap0 = textureLoader.load('textures/water.png', (texture) => {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping
    })
    const params = {
      color: '#ffffff',
      scale: 4, //调整水波纹的比例
      flowX: 0.5, //调整水流速度
      flowY: 0.5,
    }

    let water = new Water(waterGeometry, {
      color: params.color,
      scale: params.scale,
      flowDirection: new THREE.Vector2(params.flowX, params.flowY),
      normalMap0: normalMap0, // 必须手动指定
      textureWidth: 1024,
      textureHeight: 1024,
    })

    // 应用原始变换
    water.applyMatrix4(originalMatrix)
    water.rotation.x = -Math.PI / 2
    water.position.y = yofferset
    // 添加到场景
    this.scene.add(water)
    return water
  }
  //主要建筑
  async loadLod0Convention() {
    if (this.Lod0Mesh) return this.Lod0Mesh

    try {
      const gltf0 = await loadOneModel('model/v3lod0.gltf')
      console.log('低模型加载成功:', gltf0)
      this.Lod0Mesh = gltf0.scene
      this.scene.add(gltf0.scene)

      return this.Lod0Mesh
    } catch (error) {
      console.error('LOD0加载失败:', error)
      throw error
    }
  }
  // 按需加载高精度LOD
  async loadHighLodConvention() {
    if (this.conventionsMesh) return this.conventionsMesh // 已加载

    try {
      const gltfHigh = await loadOneModel('model/v3.gltf')
      this.conventionsMesh = gltfHigh.scene
      // 提取建筑引用
      this.buildingMeshes = []
      gltfHigh.scene.traverse((child) => {
        if (
          (child.name.includes('号馆') || child.name.includes('登录厅')) &&
          child.name.indexOf('_Wall') === -1
        ) {
          this.buildingMeshes.push(child)
        }
      })
      this.scene.add(this.conventionsMesh)
      this.disposeLod0Mesh() // 移除低精度模型
      console.log('高精度LOD加载完成', gltfHigh)
      this.dayCallback()
      return this.conventionsMesh
    } catch (error) {
      console.warn('高精度LOD加载失败:', error)
      return null
    }
  }
  disposeLod0Mesh() {
    if (!this.Lod0Mesh) return

    // 遍历子对象释放材质和几何体
    this.Lod0Mesh.traverse((child) => {
      if (child.isMesh) {
        // 释放材质
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((material) => material.dispose())
          } else {
            child.material.dispose()
          }
        }
        // 释放几何体
        if (child.geometry) {
          child.geometry.dispose()
        }
      }
    })

    // 从场景中移除
    this.scene.remove(this.Lod0Mesh)
    // 清空引用
    this.Lod0Mesh = null
  }
  async loadOtherModel() {
    try {
      if (this.otherBuildMesh) {
        return this.otherBuildMesh
      }
      const gltf = await loadOneModel('model/v3otherBuild.gltf')
      console.log('other模型加载成功:', gltf)

      const modelMesh = gltf.scene
      this.otherBuildMesh = modelMesh
      this.scene.add(modelMesh)
      return gltf
    } catch (error) {
      console.error('模型加载失败:', error)
      throw error
    }
  }
  async loadtagpoint() {
    try {
      // console.log(this.tagpoint) // 检查是否已经加载过，如果是直接返回之前的gltf对象而不重新加载
      if (this.tagpoint) {
        return this.tagpoint
      }
      const gltf = await loadOneModel('model/tagpoint.gltf')
      console.log('tag加载成功:', gltf)
      this.tagpoint = gltf.scene

      this.scene.add(gltf.scene)
      return gltf
    } catch (error) {
      console.error('tag模型1加载失败:', error)
      throw error
    }
  }

  showHeatMap() {
    let heatmapExists = false
    this.scene.traverse((object) => {
      if (object.name === 'heatmap') {
        heatmapExists = true
      }
    })

    // 如果已经存在热力图，则直接返回
    if (heatmapExists) {
      console.log('热力图已存在，无需重复添加')
      return
    }
    this.buildingMeshes.forEach((child) => {
      TDHeatMap1(child, this.scene)
    })
    // const heatMap = TDHeatMap2()
    // this.scene.add(heatMap)
  }
  hideHeatMap() {
    if (!this.scene) {
      return
    }
    const objectsToRemove = []
    this.scene.traverse((object) => {
      if (object.name === 'heatmap') {
        objectsToRemove.push(object)
      }
    })
    // console.log(objectsToRemove)
    // 删除找到的热力图对象
    objectsToRemove.forEach((object) => {
      this.scene.remove(object)
      if (object.material) {
        object.material.dispose()
      }
      if (object.geometry) {
        object.geometry.dispose()
      }
    })
  }
  dayCallback(type) {
    // if (type === 'dayNightChange' || type === 'weatherChange') {
    //   eventHub.emit('animationLoading')
    // }

    this.disableNightAnimation()
    this.disableTextGroup()
    // this.disableDayBloom()
    this.threeManager.isNight = false
    // 获取 ModelInDay 实例并设置模型引用
    const modelInDay = ModelInDay.getInstance()
    modelInDay.setMeshes(this.roadMesh, this.conventionsMesh, this.otherBuildMesh)
    // 调用白天效果
    modelInDay.dayEffect()
    if (type === 'dayNightChange') {
      setTimeout(() => {
        eventHub.emit('animationLoaded')
      }, 500)
    }
  }
  disableDayBloom() {
    const modelInDay = ModelInDay.getInstance()
    modelInDay.clearDayBloom()
  }
  nightCallback() {
    // eventHub.emit('animationLoading')
    this.threeManager.isNight = true
    this.disableNightAnimation()
    this.disableTextGroup()
    this.disableDayBloom() // 关闭白天滤镜辉光效果
    const modelInNight = ModelInNight.getInstance()
    modelInNight.setMeshes(this.roadMesh, this.conventionsMesh, this.otherBuildMesh)

    // 调用夜晚效果
    modelInNight.nightEffect()

    const textAnimationManager = TextAnimationManager.getInstance()
    this.textAnimationManager = textAnimationManager
    textAnimationManager.setMeshes(this.conventionsMesh)
    textAnimationManager.addtext1() //文字粒子（不添加动画）
    textAnimationManager.addtext2() //文字粒子（添加动画）
    setTimeout(() => {
      eventHub.emit('animationLoaded')
    }, 500)
  }
  disableNightAnimation() {
    const modelInNight = ModelInNight.getInstance()
    modelInNight.clearNightAnimation()
  }
  rainyCallback() {
    this.roadMesh.traverse((child) => {
      if (child.isMesh && child.material && child.material.lightMap) {
        child.material.lightMapIntensity = 0.2
        child.material.needsUpdate = true
      }
    })
  }
  cloudyCallback() {
    this.roadMesh.traverse((child) => {
      if (child.isMesh && child.material && child.material.lightMap) {
        child.material.lightMapIntensity = 0.8
        child.material.needsUpdate = true
      }
    })
  }
  disableTextGroup() {
    if (this.textAnimationManager) {
      this.textAnimationManager.dispose()
      this.textAnimationManager = null
    }
    if (this.textAnimationId) {
      cancelAnimationFrame(this.textAnimationId)
      this.textAnimationId = null
    }
  }
  getModelMesh() {
    return this.conventionsMesh
  }
  getModelLOD0Mesh() {
    return this.Lod0Mesh
  }
  getRoadMesh() {
    return this.roadMesh
  }
  getOtherBuildMesh() {
    return this.otherBuildMesh
  }
  getTagPoint() {
    return this.tagpoint
  }
}

export default ModelManager
