import * as THREE from 'three'
import eventHub from '@/utils/eventHub'
import ThreeManager from '../index.js'
import { changeCameraPosition } from '../function.js'
import PostProcessManager from '../postProcess/postProcessManage.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import ParticleFlow from './particleFlow.js'
import LaserBeam from './laserBeam.js'

export default class ModelInNight {
  static instance = null

  constructor() {
    if (ModelInNight.instance) {
      return ModelInNight.instance
    }
    ModelInNight.instance = this

    const threeManager = ThreeManager.getInstance()
    this.threeManager = threeManager
    this.scene = threeManager.getScene()
    this.camera = threeManager.getCamera()
    this.renderer = threeManager.getRenderer()
    this.controls = threeManager.getControls()
    this.modelMesh = null
    this.composer = threeManager.getComposer()
    this.particleFlow = null // 粒子流实例
    this.laserBeam = null // 激光束实例
    this.laseranimateId = null
    this.clock = new THREE.Clock()
    this.postProcessManager = PostProcessManager.getInstance()
    this.radius = 50
    this.originalMaterials = new Map() // 用于存储原始材质信息

    // 添加模型引用
    this.roadMesh = null
    this.conventionsMesh = null
    this.otherBuildMesh = null
  }

  static getInstance() {
    if (!ModelInNight.instance) {
      ModelInNight.instance = new ModelInNight()
    }
    return ModelInNight.instance
  }

  // 设置模型引用的方法
  setMeshes(roadMesh, conventionsMesh, otherBuildMesh) {
    this.roadMesh = roadMesh
    this.conventionsMesh = conventionsMesh
    this.otherBuildMesh = otherBuildMesh
  }
  nightEffect() {
    changeCameraPosition(this.camera, this.controls, {
      position: { x: -1116, y: 373, z: 849 },
      target: { x: 0, y: 0, z: 0 },
      type: 'modelView',
    })
    // const weatherManager = WeatherManager.getInstance()
    // weatherManager.clearWeather()
    this.roadMesh.traverse((child) => {
      child.children.length &&
        child.children.forEach((item) => {
          if (item.name.includes('night')) {
            // console.log(item)
            item.visible = true
            item.children.forEach((el) => {
              el.material.emissive = new THREE.Color(0x28295d)
              el.material.emissiveIntensity = 1.0
            })
          }
          if (item.name.includes('白天')) {
            // console.log(item.name)
            item.visible = false
          }
        })
    })
    // console.log(this.conventionsMesh)
    const hallGroup = new THREE.Group()
    hallGroup.name = 'pointParticlePlane'
    console.log(this.threeManager.isNight)
    this.conventionsMesh.traverse((child) => {
      if (child.name.includes('1号馆')) {
        hallGroup.add(child.clone())
      }
      if (child.name.includes('号馆') || child.name.includes('登录厅')) {
        child.castShadow = false
        child.receiveShadow = false
        if (child.name.includes('号馆') && child.children.length) {
          child.children.forEach((el) => {
            // 保存原始材质信息
            if (!this.originalMaterials.has(el.material)) {
              this.originalMaterials.set(el.material, {
                emissive: el.material.emissive.clone(),
                emissiveIntensity: el.material.emissiveIntensity,
              })
            }
            if (el.name.includes('Roof_6')) {
              el.material.color = new THREE.Color(0x242050)
              el.material.emissive = new THREE.Color(0x242050)
            } else if (el.name.includes('Roof_3')) {
              el.material.color = new THREE.Color(0x4169e1)
              el.material.emissive = new THREE.Color(0x191970)
            } else if (el.name.includes('Roof_5')) {
              el.material.color = new THREE.Color(0xe2d2e7)
              el.material.emissive = new THREE.Color(0xf1e5fa)
            }
            el.material.emissiveIntensity = 1.0
            el.material.needsUpdate = true // 确保材质更新
          })
        }
      }
      if (
        (child.name.includes('东登录厅') || child.name.includes('次登录厅')) &&
        child.children.length
      ) {
        child.children.forEach((el, index) => {
          // 保存原始材质信息
          if (!this.originalMaterials.has(el.material)) {
            this.originalMaterials.set(el.material, {
              emissive: el.material.emissive.clone(),
              emissiveIntensity: el.material.emissiveIntensity,
            })
          }

          if (index === 0) el.material.emissive = new THREE.Color(0xd07676)
          if (index === 1) el.material.emissive = new THREE.Color(0x4b488d)
          if (index === 2) el.material.emissive = new THREE.Color(0xf5ddce)
          el.material.emissiveIntensity = 1.0
          el.material.needsUpdate = true
        })
      }
      if (child.name.includes('主登录厅') && child.children.length) {
        child.children.forEach((el, index) => {
          // 保存原始材质信息
          if (!this.originalMaterials.has(el.material)) {
            this.originalMaterials.set(el.material, {
              emissive: el.material.emissive.clone(),
              emissiveIntensity: el.material.emissiveIntensity,
            })
          }

          if (index === 2) el.material.emissive = new THREE.Color(0x4b488d)
          if (index === 6) el.material.emissive = new THREE.Color(0xf5ddce)
          el.material.emissiveIntensity = 1.0
          el.material.needsUpdate = true
        })
      }
      if (child.name.includes('CiDengLuTing_Wall') && child.children.length) {
        child.children.forEach((el, index) => {
          // 保存原始材质信息
          if (!this.originalMaterials.has(el.material)) {
            this.originalMaterials.set(el.material, {
              emissive: el.material.emissive.clone(),
              emissiveIntensity: el.material.emissiveIntensity,
            })
          }

          if (index === 3) el.material.emissive = new THREE.Color(0xd0c1b9)
          el.material.emissiveIntensity = 1.0
          el.material.needsUpdate = true
        })
      }
      if (child.name.includes('ZhuDengLuTing_Wall') && child.children.length) {
        child.children.forEach((el, index) => {
          // 保存原始材质信息
          if (!this.originalMaterials.has(el.material)) {
            this.originalMaterials.set(el.material, {
              emissive: el.material.emissive.clone(),
              emissiveIntensity: el.material.emissiveIntensity,
            })
          }

          if (index === 4) el.material.emissive = new THREE.Color(0xd0c1b9)
          el.material.emissiveIntensity = 1.0
          el.material.needsUpdate = true
        })
      }
      if (child.name.includes('DongDengLuTing_Wall') && child.children.length) {
        child.children.forEach((el, index) => {
          // 保存原始材质信息
          if (!this.originalMaterials.has(el.material)) {
            this.originalMaterials.set(el.material, {
              emissive: el.material.emissive.clone(),
              emissiveIntensity: el.material.emissiveIntensity,
            })
          }

          if (index === 3) el.material.emissive = new THREE.Color(0xd0c1b9)
          el.material.emissiveIntensity = 1.0
          el.material.needsUpdate = true
        })
      }
      if (child.name.includes('CiDengLuTing_floor') && child.children.length) {
        child.children.forEach((el, index) => {
          // 保存原始材质信息
          if (!this.originalMaterials.has(el.material)) {
            this.originalMaterials.set(el.material, {
              emissive: el.material.emissive.clone(),
              emissiveIntensity: el.material.emissiveIntensity,
            })
          }

          if (index === 1) el.material.emissive = new THREE.Color(0x583e69)
          el.material.emissiveIntensity = 1.0
          el.material.needsUpdate = true
        })
      }
      //中间顶
      if (child.name.includes('Main_Building_zzg') && child.children.length) {
        child.children.forEach((el, index) => {
          // 保存原始材质信息
          if (!this.originalMaterials.has(el.material)) {
            this.originalMaterials.set(el.material, {
              emissive: el.material.emissive.clone(),
              emissiveIntensity: el.material.emissiveIntensity,
            })
          }

          if (index === 0) el.material.emissive = new THREE.Color(0xf975a2)
          if (index === 2) el.material.emissive = new THREE.Color(0xfff7d8)
          el.material.emissiveIntensity = 1.0
          if (index === 1) el.material.color = new THREE.Color(0x644775)
          if (index === 1) el.material.emissive = new THREE.Color(0x644775)
          el.material.needsUpdate = true
        })
      }
      //场馆墙
      if (child.name.includes('_Wall') && child.children.length) {
        child.children.forEach((el, index) => {
          // 保存原始材质信息
          if (!this.originalMaterials.has(el.material)) {
            this.originalMaterials.set(el.material, {
              emissive: el.material.emissive.clone(),
              emissiveIntensity: el.material.emissiveIntensity,
            })
          }

          // if (index === 3) el.material.emissive = new THREE.Color(0xd0c1b9)
          if (index === 6) el.material.emissive = new THREE.Color(0xfff2d9)
          el.material.emissiveIntensity = 1.0
          el.material.needsUpdate = true
        })
        // child.children[0].material.emissive = new THREE.Color(0x644d50)
        // child.children[1].material.emissive = new THREE.Color(0xd8bfbc)
      }
    })
    // 处理所有模型的lightMap
    const handleNightLightMap = (mesh) => {
      if (!mesh) return
      mesh.traverse((child) => {
        if (child.isMesh && child.material && child.material.lightMap) {
          child.material.lightMapIntensity = 0
          child.material.needsUpdate = true
        }
      })
    }

    // 应用到所有模型
    handleNightLightMap(this.roadMesh)
    handleNightLightMap(this.conventionsMesh)
    handleNightLightMap(this.otherBuildMesh)
    // 计算所有号馆的合并包围盒
    const combinedBBox = new THREE.Box3()
    combinedBBox.setFromObject(hallGroup)
    // 获取包围盒的尺寸和中心点
    const size = new THREE.Vector3()
    const position = new THREE.Vector3()
    combinedBBox.getSize(size)
    combinedBBox.getCenter(position)
    const { min, max } = combinedBBox
    const width = Math.abs(max.x - min.x)
    const depth = Math.abs(max.z - min.z)
    // 如果已存在粒子流实例，先清理
    if (this.particleFlow !== null) {
      // console.log(1)
      this.particleFlow.dispose()
    }
    if (hallGroup) {
      // console.log(2)
      // this.particleFlow = new ParticleFlow(this.scene, position, width) // 创建新的粒子流实例并保存引用
      const particleFlow = ParticleFlow.getInstance()
      this.particleFlow = particleFlow
      particleFlow.setProps(position, width)
      particleFlow.addParticles()
    }

    // this.laserBeam = new LaserBeam()
    this.laserBeam = LaserBeam.getInstance()
    this.laserBeam.addLaser()
    // this.addLaser()
    if (!this.nightBloom) {
      console.log(4)
      this.nightBloom = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth * 0.5, window.innerHeight * 0.5),
        0.5,
        0.3,
        0.2
      )
      this.composer.addPass(this.nightBloom)
    }
    if (this.nightBloom) {
      this.nightBloom.enabled = true
    }
    // this.postProcessManager.enableEffect('nightBloom')
    this.threeManager.isNight = true
    this.nightAnimation()
  }
  nightAnimation() {
    // 确保先清理之前的动画
    if (this.laseranimateId) {
      cancelAnimationFrame(this.laseranimateId)
      this.laseranimateId = null
    }
    const animate = () => {
      // console.log('粒子动画、激光动画')
      // 如果不是夜晚模式，停止动画
      if (!this.threeManager.isNight) {
        cancelAnimationFrame(this.laseranimateId)
        this.laseranimateId = null
        return
      }
      this.renderer.clear()
      this.renderer.render(this.scene, this.camera)
      if (this.particleFlow) {
        this.particleFlow.particleAnimation()
      }
      if (this.laserBeam) {
        this.laserBeam.laserAnimation() // 更新激光动画
      }

      this.composer.render()
      this.laseranimateId = requestAnimationFrame(animate)
    }
    animate()
  }
  clearNightAnimation() {
    if (this.laseranimateId) {
      cancelAnimationFrame(this.laseranimateId)
      this.laseranimateId = null
    }

    // 正确清理激光束实例
    if (this.laserBeam) {
      this.laserBeam.dispose()
      this.laserBeam = null
    }

    // 正确清理粒子流实例
    if (this.particleFlow) {
      this.particleFlow.dispose()
      this.particleFlow = null
    }
    this.disableNightBloom()
  }
  disableNightBloom() {
    if (!this.nightBloom) return
    if (this.composer && this.nightBloom) {
      this.composer.removePass(this.nightBloom)
    }
    this.threeManager.isNight = false
    // this.postProcessManager.disableEffect('nightBloom')
    this.nightBloom.enabled = false
    this.nightBloom = null
  }
  getlaseranimateId() {
    return this.laseranimateId
  }
}
