import * as THREE from 'three'

import ThreeManager from '../index.js'
import PostProcessManager from '../postProcess/postProcessManage.js'
import { changeCameraPosition } from '../function.js'
import ModelInNight from './isNight.js'

export default class ModelInDay {
  static instance = null

  constructor() {
    if (ModelInDay.instance) {
      return ModelInDay.instance
    }
    ModelInDay.instance = this

    const threeManager = ThreeManager.getInstance()
    this.threeManager = threeManager
    this.scene = threeManager.getScene()
    this.camera = threeManager.getCamera()
    this.renderer = threeManager.getRenderer()
    this.controls = threeManager.getControls()
    this.modelMesh = null
    this.isNight = false
    this.composer = threeManager.getComposer()
    this.clock = new THREE.Clock()
    this.originalMaterials = new Map() // 用于存储原始材质信息
    this.originalLightMapIntensities = new Map() // 用于存储原始光照贴图强度
    this.postProcessManager = PostProcessManager.getInstance()
    this.springBloom = this.threeManager.getspringBloom()

    // 添加模型引用
    this.roadMesh = null
    this.conventionsMesh = null
    this.otherBuildMesh = null
  }

  // 设置模型引用的方法
  setMeshes(roadMesh, conventionsMesh, otherBuildMesh) {
    this.roadMesh = roadMesh
    this.conventionsMesh = conventionsMesh
    this.otherBuildMesh = otherBuildMesh
  }
  static getInstance() {
    if (!ModelInDay.instance) {
      ModelInDay.instance = new ModelInDay()
    }
    return ModelInDay.instance
  }
  dayEffect() {
    // 获取夜间模式保存的原材质信息
    const modelInNight = ModelInNight.getInstance()
    this.originalMaterials = modelInNight.originalMaterials
    // this.disableTextGroup() // 关闭文字动画
    this.roadMesh.traverse((child) => {
      child.children.length &&
        child.children.forEach((item) => {
          if (item.name.includes('night')) {
            // console.log(item.name)
            item.visible = false
          }
          if (item.name.includes('白天')) {
            // console.log(item.name)
            item.visible = true
          }
        })
    })
    const springBloom = this.threeManager.getspringBloom()
    const colorCorrectionPass = this.threeManager.getColorCorrectionPass()
    // 确保 springBloom和colorCorrectionPass 已经被添加到 composer
    if (colorCorrectionPass && !this.composer.passes.includes(colorCorrectionPass)) {
      this.composer.addPass(colorCorrectionPass)
    }
    if (springBloom && !this.composer.passes.includes(springBloom)) {
      this.composer.addPass(springBloom)
    }
    // 启用效果
    this.postProcessManager.enableEffect('springBloom')
    // this.threeManager.getspringBloom().enabled = true//springBloom是合并通道不能用这种单独控制的
    changeCameraPosition(this.camera, this.controls, {
      position: { x: 421, y: 516, z: 816 }, //421, 516, 816
      target: { x: 0, y: 0, z: 0 },
      type: 'modelView',
    })

    // 处理所有模型的lightMap
    const handleLightMap = (mesh, intensity) => {
      if (!mesh) return
      mesh.traverse((child) => {
        if (child.isMesh && child.material) {
          if (child.material.aoMap) {
            child.material.lightMap = child.material.aoMap.clone()
            child.material.aoMap = null
          }
          if (child.material.lightMap) {
            child.material.lightMapIntensity = intensity
            child.material.lightMap.needsUpdate = true
          }
          child.material.needsUpdate = true

          // 保存原始强度
          if (!this.originalLightMapIntensities.has(child.material)) {
            this.originalLightMapIntensities.set(child.material, intensity)
          }
        }
      })
    }

    // 应用到所有模型

    if (this.roadMesh) {
      handleLightMap(this.roadMesh, 5.5)
    }
    if (this.conventionsMesh) {
      handleLightMap(this.conventionsMesh, 4.5)
    }
    if (this.otherBuildMesh) {
      handleLightMap(this.otherBuildMesh, 6.5)
    }
    // 恢复所有材质的原始颜色
    this.originalMaterials.forEach((originalData, material) => {
      material.emissive.copy(originalData.emissive)
      material.emissiveIntensity = originalData.emissiveIntensity
      material.needsUpdate = true
    })
    this.originalMaterials.clear() // 清空存储
  }

  clearDayBloom() {
    const springBloom = this.threeManager.getspringBloom()
    if (!springBloom) return

    if (this.composer && springBloom) {
      this.composer.removePass(springBloom)
      if (this.threeManager.colorCorrectionPass) {
        this.composer.removePass(this.threeManager.colorCorrectionPass)
      }
    }

    this.postProcessManager.disableEffect('springBloom')
    // this.threeManager.getspringBloom().enabled = false
  }
  //  getAnimationId() {
  //   return this.animationId
  // }
}
