import * as THREE from 'three'
import { daylightFn, dayhdrFn } from './dayLight.js'
import { nightLightFn, nighthdrFn } from './nightLight.js'
import { rainLightFn, rainhdrFn } from './rainLight.js'
import { cloudyLightFn } from './cloudyLight.js'
import ThreeManager from '../index.js'
import { GroundedSkybox } from '@/components/commonJS/GroundedSkybox.js'
import eventHub from '@/utils/eventHub'
import WeatherManager from '../weather/weatherManage.js'
import PostProcessManager from '../postProcess/postProcessManage.js'
class LightManager {
  static instance = null

  constructor() {
    if (LightManager.instance) {
      return LightManager.instance
    }
    LightManager.instance = this

    const threeManager = ThreeManager.getInstance()
    this.threeManager = threeManager
    this.scene = threeManager.getScene()
    this.renderer = threeManager.getRenderer()
    this.skybox = null
    this.lightningSubTimers = []
    this.postProcessManager = PostProcessManager.getInstance()
    this.dayLights()
    this.lightEvent()
  }

  static getInstance() {
    if (!LightManager.instance) {
      LightManager.instance = new LightManager()
    }
    return LightManager.instance
  }
  clearLight() {
    if (this.mainLight) {
      this.scene.remove(
        this.ambientLight,
        this.mainLight,
        this.sunLight,
        this.fillLight1,
        this.fillLight2
      )
    }
    if (this.cloudambientLight) {
      this.scene.remove(this.cloudambientLight, this.cloudmainLight, this.topLight)
    }
    if (this.rainmainLight) {
      this.scene.remove(
        this.rainambientLight,
        this.rainfillLight,
        this.rainmainLight,
        this.rainpointLight
      )
    }
    if (this.moonLight) {
      this.scene.remove(
        this.ambientLight,
        this.moonLight,
        this.streetLight1,
        this.streetLight2,
        this.streetLight3,
        this.streetLight4,
        this.streetLight5,
        this.streetLight6,
        this.streetLight7,
        this.streetLight8,
        this.streetLight9,
        this.streetLight10,
        this.streetLight11,
        this.streetLight12,
        this.nightFill,
        this.additionalFill
      )
    }
    // 清理最外层定时器
    if (this.lightningTimer) {
      clearTimeout(this.lightningTimer)
      this.lightningTimer = null
    }

    // 清理所有嵌套的子定时器
    this.lightningSubTimers.length &&
      this.lightningSubTimers.forEach((timerId) => {
        clearTimeout(timerId)
      })
    this.lightningSubTimers = []

    // 清理 requestAnimationFrame
    if (this.lightningAnimationFrame) {
      cancelAnimationFrame(this.lightningAnimationFrame)
      this.lightningAnimationFrame = null
    }
  }
  // 白天灯光
  dayLights() {
    const { ambientLight, mainLight, sunLight, fillLight1, fillLight2 } = daylightFn()
    this.ambientLight = ambientLight
    this.mainLight = mainLight
    this.sunLight = sunLight
    this.fillLight1 = fillLight1
    this.fillLight2 = fillLight2
    this.scene.add(ambientLight, sunLight, fillLight1, fillLight2, mainLight)
    // console.log(this.skybox)

    //添加环境贴图
    dayhdrFn(this.renderer).then((envMap) => {
      this.scene.environment = envMap
      this.scene.background = envMap
      this.scene.userData.envMap = envMap
      this.addSphereSky(envMap, 128, 100)
      // 添加灯光辅助线
    })
    const mainLightHelper = new THREE.DirectionalLightHelper(this.sunLight, 5)
    // const fillLight1Helper = new THREE.DirectionalLightHelper(this.fillLight1, 5)
    // const fillLight2Helper = new THREE.DirectionalLightHelper(this.fillLight2, 5)
    // this.scene.add(mainLightHelper)

    this.scene.backgroundIntensity = 1
    this.renderer.toneMappingExposure = 3
  }
  nightLight() {
    const {
      ambientLight,
      moonLight,
      streetLight1,
      streetLight2,
      streetLight3,
      streetLight4,
      streetLight5,
      streetLight6,
      streetLight7,
      streetLight8,
      streetLight9,
      streetLight10,
      streetLight11,
      streetLight12,
      // nightFill,
      // additionalFill,
    } = nightLightFn()
    this.ambientLight = ambientLight
    this.moonLight = moonLight
    this.streetLight1 = streetLight1
    this.streetLight2 = streetLight2
    this.streetLight3 = streetLight3
    this.streetLight4 = streetLight4
    this.streetLight5 = streetLight5
    this.streetLight6 = streetLight6
    this.streetLight7 = streetLight7
    this.streetLight8 = streetLight8
    this.streetLight9 = streetLight9
    this.streetLight10 = streetLight10
    this.streetLight11 = streetLight11
    this.streetLight12 = streetLight12
    // this.nightFill = nightFill
    // this.additionalFill = additionalFill
    this.scene.add(
      ambientLight,
      moonLight,
      streetLight1,
      streetLight2,
      streetLight3,
      streetLight4,
      streetLight5,
      streetLight6,
      streetLight7,
      streetLight8,
      streetLight9,
      streetLight10,
      streetLight11,
      streetLight12
      // nightFill,
      // additionalFill
    )
    // const pointLightHelper1 = new THREE.PointLightHelper(streetLight8, 50)
    // const pointLightHelper2 = new THREE.PointLightHelper(streetLight9, 50)
    // this.scene.add(pointLightHelper1, pointLightHelper2)
    // if (this.nightObj) {
    //   outlineObjFn([this.nightObj], this.outlinePass, this.outlineComposer)
    // }
    // nighthdrFn(this.renderer).then((envMap) => {
    //   this.scene.background = envMap
    //   this.scene.environment = envMap
    //   this.addSphereSky(envMap, 128, 0)
    // })
    this.scene.background = new THREE.Color(0x333344) // 深色背景
    this.renderer.toneMappingExposure = 0.1
    this.scene.backgroundIntensity = 0.1
  }
  rainLight() {
    this.clearEnvironment()
    this.clearLight() // 移除现有灯光

    const { rainambientLight, rainmainLight, rainfillLight, rainpointLight } = rainLightFn()
    this.rainmainLight = rainmainLight
    this.rainfillLight = rainfillLight
    this.rainambientLight = rainambientLight
    this.rainpointLight = rainpointLight
    this.scene.add(rainambientLight, rainmainLight, rainfillLight, rainpointLight)
    // const pointLightHelper = new THREE.PointLightHelper(rainpointLight, 50)
    // this.scene.add(pointLightHelper)
    // 初始化闪电定时器
    this.lightningTimer = null // 最外层定时器
    this.lightningSubTimers = [] // 保存嵌套的子定时器
    this.lightningAnimationFrame = null //

    // 定义闪电闪烁函数
    const flashLightning = () => {
      const delay = 2000 + Math.random() * 3000
      this.lightningTimer = setTimeout(() => {
        // console.log('闪电')
        rainpointLight.intensity = 15
        rainpointLight.color.set(0x88ccff)

        // 保存子定时器 ID（第一层嵌套）
        const timer1 = setTimeout(() => {
          // console.log('闪电1')
          rainpointLight.intensity = 0

          // 保存子定时器 ID（第二层嵌套）
          const timer2 = setTimeout(() => {
            // console.log('闪电2')
            rainpointLight.intensity = 10
            rainpointLight.color.set(0xffffff)

            // 保存 requestAnimationFrame ID
            const fadeOut = () => {
              if (rainpointLight.intensity > 0) {
                rainpointLight.intensity -= 0.2
                this.lightningAnimationFrame = requestAnimationFrame(fadeOut)
              } else {
                rainpointLight.color.set(0xffffff)
                flashLightning()
              }
            }
            const timer3 = setTimeout(() => fadeOut(), 100)
            this.lightningSubTimers.push(timer3) // 保存第三层定时器
          }, 50)
          this.lightningSubTimers.push(timer2) // 保存第二层定时器
        }, 100)
        this.lightningSubTimers.push(timer1) // 保存第一层定时器
      }, delay)
    }

    flashLightning()

    // 设置场景背景和环境
    this.scene.background = new THREE.Color(0x333344) // 深色背景
    this.renderer.toneMappingExposure = 0.7
  }
  cloudyLight() {
    this.clearEnvironment()
    this.clearLight() // 移除现有灯光
    const { cloudambientLight, cloudmainLight, topLight } = cloudyLightFn()
    this.cloudambientLight = cloudambientLight
    this.cloudmainLight = cloudmainLight
    this.topLight = topLight
    this.scene.add(cloudambientLight, cloudmainLight, topLight)

    rainhdrFn(this.renderer).then((envMap) => {
      //重新添加新的环境贴图
      this.scene.background = envMap
      this.scene.environment = envMap
      this.addSphereSky(envMap, 128, 20)
    })
    this.renderer.toneMappingExposure = 2 // 降低曝光
  }
  addSphereSky(envMap, size, intensity) {
    // 移除场景中已存在的天空球
    const existingSkybox = this.scene.children.find((child) => child instanceof GroundedSkybox)
    if (existingSkybox) {
      this.scene.remove(existingSkybox)
    }
    const params = {
      height: 500,
      radius: 5000,
      enabled: true,
    }

    let skybox = new GroundedSkybox(envMap, params.height, params.radius, size, intensity)

    // skybox.position.y = -40
    this.skybox = skybox
    // skybox.layers.enable(1)
    this.scene.add(skybox)
  }
  dayCallback(type) {
    this.threeManager.isNight = false

    this.clearLight() // 移除现有灯光
    // 如果是昼夜切换就清除现有环境贴图，否则保留白天的环境贴图
    // if (type == 'dayNightChange') {
    //   this.clearEnvironment()
    // }
    // const weatherManager = WeatherManager.getInstance()
    // weatherManager.setSunny()

    // console.log(this.skybox)

    // this.clearWeather()
    this.dayLights()
  }
  nightCallback() {
    this.clearWeather()
    this.threeManager.isNight = true
    this.postProcessManager.disableEffect('springBloom')
    this.clearLight() // 移除现有灯光
    // this.ambientLight.intensity = 0.1
    // 清除现有环境贴图
    this.clearEnvironment()
    this.nightLight()
  }
  clearEnvironment() {
    if (this.scene.environment) {
      this.scene.environment.dispose()
      this.scene.environment = null
    }
    if (this.scene.background) {
      // this.scene.background.dispose()
      this.scene.background = null
    }
    // 清除天空球的环境贴图
    if (this.skybox) {
      if (this.skybox.material.envMap) {
        this.skybox.material.envMap.dispose()
      }
      this.skybox.material.dispose()
      this.scene.remove(this.skybox)
      this.skybox = null
    }
  }
  clearWeather() {
    console.log('clearWeather')
    const weatherManager = WeatherManager.getInstance()
    if (weatherManager) {
      weatherManager.clearWeather()
      weatherManager.clearCloud1()
      weatherManager.clearAnimation()
    }
  }
  // getter方法
  getAmbientLight() {
    return this.ambientLight
  }

  getMainLight() {
    return this.mainLight
  }

  getFillLight1() {
    return this.fillLight1
  }

  getFillLight2() {
    return this.fillLight2
  }
  lightEvent() {
    eventHub.on('nightCallback', () => {
      this.nightCallback()
    })
    eventHub.on('dayCallback', (type) => {
      this.dayCallback(type)
    })
    eventHub.on('rainyCallback', () => {
      this.rainLight()
    })
    eventHub.on('cloudyCallback', () => {
      this.cloudyLight()
    })
  }
}

export default LightManager
