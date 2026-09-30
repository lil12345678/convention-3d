import * as THREE from 'three'
import ThreeManager from '../index.js'
import eventHub from '@/utils/eventHub'
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js'
import { createRain, updaterainDrops, rainConfig, getShaderMesh } from './rain.js'
import { rainLightFn } from '../light/rainLight.js'
import { createSnow, updateDrops, snowConfig } from './snow.js'
import { createFog } from './fog.js' //雾
import { GroundedSkybox } from '@/components/commonJS/GroundedSkybox.js'
import { createFogClouds1, animateClouds1, createFogClouds2, animateClouds2 } from './cloud.js'
import { createCloudLayer, cloudAnimation } from './cloudy.js'
// import { cloudyLighting } from '../light/cloudyLight.js'
// import Cloudy from './cloudy.js'
import PostProcessManager from '../postProcess/postProcessManage.js'
import ModelInNight from '../modelAction/isNight.js'
import ModelInDay from '../modelAction/isDay.js'

class WeatherManager {
  static instance = null

  constructor() {
    if (WeatherManager.instance) {
      return WeatherManager.instance
    }
    WeatherManager.instance = this

    const threeManager = ThreeManager.getInstance()
    this.threeManager = threeManager
    this.scene = threeManager.getScene()
    this.camera = threeManager.getCamera()
    this.renderer = threeManager.getRenderer()
    this.group = new THREE.Group()
    this.rainAnimationId = null
    this.cloudyAnimationId = null
    this.cloudAnimationId1 = null
    this.cloudAnimationId2 = null
    this.setSunny()
    this.initEventListeners()
    this.animationEnabled = true
  }

  static getInstance() {
    if (!WeatherManager.instance) {
      WeatherManager.instance = new WeatherManager()
    }
    return WeatherManager.instance
  }

  initEventListeners() {
    eventHub.on('weatherCallback', (weather) => this.weatherChange(weather))
  }

  weatherChange(weather) {
    this.animationEnabled = false // 停止当前动画
    this.clearWeather()

    switch (weather.weather) {
      case 'sunny':
        this.setSunny(weather)
        break
      case 'cloudy':
        this.setCloudy()
        break
      case 'rainy':
        this.setRainy()
        break
    }

    this.animationEnabled = true // 启用新的动画
  }
  clearWeather() {
    // 移除场景中已存在的天气效果组
    const existingWeatherGroup = this.scene.children.find(
      (child) => child.name === 'sunny' || child.name === 'rainy' || child.name === 'cloudy'
    )
    if (existingWeatherGroup) {
      this.scene.remove(existingWeatherGroup)
      // 清除group中的所有内容
      while (existingWeatherGroup.children.length > 0) {
        existingWeatherGroup.remove(existingWeatherGroup.children[0])
      }
    }

    // 清除非实例化的云朵
    if (this.cloudObj && this.cloudObj.meshes) {
      this.cloudObj.meshes.forEach((mesh) => {
        this.scene.remove(mesh)
        mesh.geometry.dispose()
        mesh.material.dispose()
      })
      this.cloudObj = null
    }
    if (this.scene.fog) {
      this.scene.fog = null
    }
    this.clearAnimation()
  }
  clearAnimation() {
    // 取消雨滴动画
    if (this.rainAnimationId) {
      cancelAnimationFrame(this.rainAnimationId)
      this.rainAnimationId = null
    }

    // 取消云朵动画
    if (this.cloudAnimationId1) {
      cancelAnimationFrame(this.cloudAnimationId1)
      this.cloudAnimationId1 = null
    }

    if (this.cloudAnimationId2) {
      cancelAnimationFrame(this.cloudAnimationId2)
      this.cloudAnimationId2 = null
    }
    //取消阴天动画
    if (this.cloudyAnimationId) {
      cancelAnimationFrame(this.cloudyAnimationId)
      this.cloudyAnimationId = null
    }
  }
  // 清除实例化的云朵
  clearCloud1() {
    if (this.cloudObj && this.cloudObj.mesh) {
      this.scene.remove(this.cloudObj.mesh)
      this.cloudObj.mesh.geometry.dispose()
      this.cloudObj.mesh.material.dispose()
      this.cloudObj = null
    }
  }
  clearComposer() {
    //清除滤镜
    if (this.threeManager.isNight) {
      const modelInNight = ModelInNight.getInstance()
      modelInNight.clearNightAnimation()
    } else {
      const modelInDay = ModelInDay.getInstance()
      modelInDay.clearDayBloom()
    }
  }
  setSunny(weather) {
    this.clearCloud1()
    // if (this.threeManager.isNight) {
    this.clearWeather()
    // console.log(this.cloudObj)
    // console.log(this.scene.children)

    this.group.name = 'sunny'

    // 晴天设置
    const skybox = this.scene.children.find((child) => child instanceof GroundedSkybox)
    if (skybox) {
      skybox.material.lightMapIntensity = 100
    }
    this.renderer.toneMappingExposure = 3
    if (this.scene.fog) {
      this.scene.fog = null
    }
    this.cloudObj = createFogClouds1(0.6, 0.05)
    this.group.add(this.cloudObj.mesh)
    this.scene.add(this.cloudObj.mesh) //云实例化添加方式
    this.scene.add(this.group)
    // console.log(this.cloudObj)
    // console.log(this.scene.children)
    this.scene.fog = new THREE.FogExp2(0xf0f8ff, 0.000088) //d6e1e9//远天蓝    f0f8ff//爱丽丝兰
    if (weather && weather.type === 'weatherChange') {
      setTimeout(() => {
        eventHub.emit('animationLoaded')
      }, 500)
    }
  }
  //阴天
  setCloudy() {
    // eventHub.emit('animationLoading')
    this.clearWeather()
    this.clearCloud1()
    this.clearComposer()
    this.group.name = 'cloudy'

    if (this.scene.fog) {
      this.scene.fog = null
    }
    this.cloudObj = createCloudLayer()
    this.scene.add(this.cloudObj) //云实例化添加方式
    setTimeout(() => {
      eventHub.emit('animationLoaded')
    }, 500)
    // this.cloudObj = createFogClouds2(1, 30, 1000)
    // if (this.cloudObj.meshes && this.cloudObj.meshes.length) {
    //   this.cloudObj.meshes.forEach((mesh) => {
    //     this.scene.add(mesh) //云朵非实例化添加方式
    //   })
    // }
    // // this.scene.add(this.group) //云实例化添加方式

    // this.cloudyAnimationId = new Cloudy()
  }

  setRainy() {
    // eventHub.emit('animationLoading')
    this.clearWeather()
    this.clearCloud1()
    //清除滤镜
    this.clearComposer()
    // 场景雾效配置
    this.scene.fog = new THREE.FogExp2(0x445566, 0.001)
    //云
    // if (!this.threeManager.isNight) {
    //   this.cloudObj = createCloudLayer()
    //   this.scene.add(this.cloudObj) //云实例化添加方式
    // }
    //雨
    this.group.name = 'rainy'
    this.group.add(createRain())
    this.scene.add(this.group)
    setTimeout(() => {
      eventHub.emit('animationLoaded')
    }, 500)
    // this.initRainGui()
  }
  updateWeather(camera) {
    if (!this.animationEnabled || !this.group) return
    if (this.group.name === 'rainy') {
      this.rainAnimationId = updaterainDrops(this.group)
      if (this.cloudObj) {
        // console.log('22')
        // this.cloudAnimationId1 = animateClouds1(this.cloudObj)
      }
    } else if (this.group.name === 'sunny') {
      if (this.cloudObj) {
        this.cloudAnimationId2 = animateClouds1(this.cloudObj)
      }
    } else if (this.group.name === 'cloudy') {
      if (this.cloudObj) {
        this.cloudAnimationId = cloudAnimation(this.cloudObj)
      }
    }

    this.group.position.copy(camera.position) // 保持天气效果跟随相机
  }
  initRainGui() {
    if (this.gui) {
      this.gui.destroy()
    }

    this.gui = new GUI({
      container: this.container,
      autoPlace: true,
      closed: true,
    })
    let gui = this.gui

    gui.domElement.style.position = 'absolute'
    gui.domElement.style.top = '240px'
    gui.domElement.style.right = '26%'
    // 添加雨天控制文件夹
    const rainFolder = gui.addFolder('雨天效果')

    rainFolder
      .add(rainConfig, 'drops', 1000, 20000, 1000)
      .name('雨滴数量')
      .onChange((value) => {
        if (this.group && this.group.name === '下雨') {
          this.scene.remove(this.group)
          const newRain = rainConfig.updateDrops(value)
          this.group = newRain
          this.group.name = '下雨'
          this.scene.add(this.group) // 添加这行，确保新的雨滴被添加到场景中
          this.group.position.copy(this.camera.position)
        }
      })

    rainFolder
      .add(rainConfig, 'speed', 1, 10, 0.5)
      .name('下落速度')
      .onChange((value) => {
        if (this.group && this.group.name === '下雨') {
          this.scene.remove(this.group)
          const newRain = rainConfig.updateSpeed(value)
          this.group = newRain
          this.group.name = '下雨'
          this.scene.add(this.group) // 添加这行，确保新的雨滴被添加到场景中
          this.group.position.copy(this.camera.position)
        }
      })

    rainFolder.open()
  }
  initSnowGui() {
    if (this.gui) {
      this.gui.destroy()
    }

    this.gui = new GUI({
      container: this.container,
      autoPlace: true,
      closed: true,
    })
    let gui = this.gui
    gui.domElement.style.position = 'absolute'
    gui.domElement.style.top = '240px'
    gui.domElement.style.right = '26%'
    // 添加雨天控制文件夹
    const rainFolder = gui.addFolder('下雪效果')

    rainFolder
      .add(snowConfig, 'drops', 1000, 20000, 1000)
      .name('雪花数量')
      .onChange((value) => {
        if (this.group && this.group.name === '下雪') {
          this.scene.remove(this.group)
          const newRain = snowConfig.updateDrops(value)
          this.group = newRain
          this.group.name = '下雪'
          this.scene.add(this.group) // 添加这行，确保新的雨滴被添加到场景中
          this.group.position.copy(this.camera.position)
        }
      })

    rainFolder
      .add(snowConfig, 'speed', 1, 10, 0.5)
      .name('下落速度')
      .onChange((value) => {
        if (this.group && this.group.name === '下雪') {
          this.scene.remove(this.group)
          const newRain = snowConfig.updateSpeed(value)
          this.group = newRain
          this.group.name = '下雪'
          this.scene.add(this.group) // 添加这行，确保新的雨滴被添加到场景中
          this.group.position.copy(this.camera.position)
        }
      })

    rainFolder.open()
  }
}

export default WeatherManager
