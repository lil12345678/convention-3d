import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js'
import Stats from 'three/examples/jsm/libs/stats.module'
import { CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer.js'

import ModelManager from './modelAction/modelManage.js'
import LightManager from './light/ligthManage.js'
import EventManager from './modelAction/event.js'
import ModelLevelManager from './modelAction/level.js'
import TagManager from './tag/tagManage.js'
import WeatherManager from './weather/weatherManage.js'
import TreeManager from './LOD/treeManage.js'
import AutoWalk from './walk/autoWalk.js'

import { changeCameraPosition } from './function.js'
import eventHub from '@/utils/eventHub.js'
import PostProcessManager from './postProcess/postProcessManage.js'

class ThreeManager {
  static instance = null
  constructor(containerId, isNight) {
    if (ThreeManager.instance) {
      return ThreeManager.instance
    }
    ThreeManager.instance = this

    this.container = document.getElementById(containerId)
    this.isNight = isNight
    this.isModelClicked = false
    this.isNight = false
    this.stats = new Stats()
    this.treeLOD = new THREE.LOD()
    this.treeLOD2 = new THREE.LOD()

    this.postProcessManager = PostProcessManager.getInstance()
    this.colorCorrectionPass = null
    this.springBloom = null
    this.initCore()
    this.initEventHub()
  }

  initCore() {
    // console.log('ThreeManager初始化')
    // Three.js实例初始化
    this.initScene()
    this.initCamera()
    this.initRenderer()
    this.initControls()
    new ModelManager()
    this.initComposer()

    new LightManager()
    // // new EventManager() // 事件管理
    new ModelLevelManager() //分层
    new TagManager() // 标签管理
    new WeatherManager() // 天气管理

    new TreeManager()

    new AutoWalk()

    // 基础事件监听
    this.initResizeListener()
    this.initAnimationLoop()
  }

  // 获取实例的静态方法
  static getInstance() {
    return ThreeManager.instance
  }
  initScene() {
    this.scene = new THREE.Scene()
    // const axesHelper = new THREE.AxesHelper(15)
    // this.scene.add(axesHelper)
  }

  // 创建柔和的粒子纹理

  initCamera() {
    this.camera = new THREE.PerspectiveCamera(
      45,
      this.container.offsetWidth / this.container.offsetHeight,
      1,
      100000
    )
    this.camera.position.set(421, 516, 816) //484, 459, 989
    // this.camera.lookAt(0, 0, 0)
    // 新增：设置相机能渲染层1的物体（激光所在层）
    this.camera.layers.enable(2)
  }

  initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      logarithmicDepthBuffer: true,
      antialias: true,
      premultipliedAlpha: true,
    })
    this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight)
    // this.renderer.shadowMap.enabled = true
    // this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    // this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    // this.renderer.toneMappingExposure = 2.5
    this.container.appendChild(this.renderer.domElement)

    // CSS3D渲染器
    this.css3dRenderer = new CSS3DRenderer()
    this.css3dRenderer.setSize(this.container.offsetWidth, this.container.offsetHeight)
    this.css3dRenderer.domElement.style.position = 'absolute'
    this.css3dRenderer.domElement.style.top = '0'
    this.css3dRenderer.domElement.style.pointerEvents = 'none'
    this.container.appendChild(this.css3dRenderer.domElement)
    //，添加性能监视器
    this.stats.domElement.style.position = 'absolute'
    this.stats.domElement.style.top = '0px'
    this.container.appendChild(this.stats.domElement)
  }
  initControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.dampingFactor = 0.05 // 阻尼系数
    this.controls.enableDamping = true
    this.controls.enableZoom = true
    //总览会展控制缩放最大最小距离
    this.controls.minDistance = 50
    this.controls.maxDistance = 1300
    // 旋转速度
    this.controls.rotateSpeed = 0.2
    // 平移速度
    this.controls.translateSpeed = 0.2
    //视角控制 限制相机的俯仰角度
    // this.controls.minPolarAngle = Math.PI / 5 //
    this.controls.maxPolarAngle = Math.PI / 2 //
    //控制旋转角度
    // this.controls.minAzimuthAngle = -Math.PI / 2 //小角度
    // this.controls.maxAzimuthAngle = Math.PI / 2 //最大角度
    this.controls.addEventListener('change', () => {
      // 打印相机位置
      // console.log('相机位置:', {
      //   x: this.camera.position.x.toFixed(2),
      //   y: this.camera.position.y.toFixed(2),
      //   z: this.camera.position.z.toFixed(2),
      // })

      // // 打印控制器目标点
      // console.log('控制器目标点:', {
      //   x: this.controls.target.x.toFixed(2),
      //   y: this.controls.target.y.toFixed(2),
      //   z: this.controls.target.z.toFixed(2),
      // })
      const treeManager = TreeManager.getInstance()
      treeManager.updateTreeLOD(this.camera)
      // 更新会展中心模型的LOD
      // const modelManager = ModelManager.getInstance()
      // if(modelManager.conventionsMesh && modelManager.conventionsMesh.isLOD) {
      //   modelManager.conventionsMesh.update(this.camera)
      // }
      this.renderer.render(this.scene, this.camera)
    })
  }
  initComposer() {
    this.effectComposer = new EffectComposer(this.renderer)

    let renderPass = new RenderPass(this.scene, this.camera)
    this.renderPass = renderPass
    this.effectComposer.addPass(renderPass)
    this.addMaskFilter() //添加滤镜
    // 添加辉光通道
    // this.bloomPass = new UnrealBloomPass(
    //   new THREE.Vector2(window.innerWidth, window.innerHeight),
    //   1.5, // 强度
    //   0.4, // 半径
    //   0.85 // 阈值
    // )
    // this.effectComposer.addPass(this.bloomPass)
    // this.bloomPass.enabled = false
    // this.outlinePass = new OutlinePass(
    //   new THREE.Vector2(window.innerWidth, window.innerHeight),
    //   this.scene,
    //   this.camera
    // )
    // 抗锯齿
    // const smaaPass = new SMAAPass(
    //   window.innerWidth * this.renderer.getPixelRatio(),
    //   window.innerHeight * this.renderer.getPixelRatio()
    // );
    // this.effectComposer.addPass(smaaPass);
  }

  initResizeListener() {
    window.addEventListener('resize', () => {
      this.camera.aspect = this.container.offsetWidth / this.container.offsetHeight
      this.camera.updateProjectionMatrix()
      this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight)
    })
  }
  //场景滤镜
  addMaskFilter() {
    // 4. 春日色彩校正滤镜
    this.colorCorrectionPass = new ShaderPass({
      uniforms: {
        tDiffuse: { value: null },
        saturation: { value: 1.3 }, // 增加饱和度
        contrast: { value: 1.1 }, // 提高对比度
        brightness: { value: 0.05 }, // 轻微提亮
        warmFactor: { value: 1.15 }, // 暖色滤镜
        // yellowTint: { value: new THREE.Color(0xffec8b).multiplyScalar(0.15) } // 添加黄色调
      },
      vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
      fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float saturation;
    uniform float contrast;
    uniform float brightness;
    uniform float warmFactor;
    varying vec2 vUv;

    vec3 applyWarmFilter(vec3 color) {
      vec3 warm = vec3(1.0, 0.9, 0.8); // 暖黄色调
      return mix(color, color * warm, warmFactor);
    }

    void main() {
      vec4 color = texture2D(tDiffuse, vUv);
      
      // 亮度调整
      color.rgb += brightness;
      
      // 对比度调整
      color.rgb = (color.rgb - 0.5) * contrast + 0.5;
      
      // 饱和度调整
      float luminance = dot(color.rgb, vec3(0.2125, 0.7154, 0.0721));
      color.rgb = mix(vec3(luminance), color.rgb, saturation);
      
      // 暖色滤镜
      color.rgb = applyWarmFilter(color.rgb);
 
      
      gl_FragColor = color;
    }
  `,
    })
    this.effectComposer.addPass(this.colorCorrectionPass)

    // 5. 添加泛光效果（模拟阳光普照）
    this.springBloom = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth * 0.5, window.innerHeight * 0.5),
      0.5, // 强度
      0.1, // 半径
      0.9 // 阈值
      // 256     // 分辨率（降低可优化性能）
    )
    this.effectComposer.addPass(this.springBloom)
    this.postProcessManager.enableEffect('springBloom')
  }
  initAnimationLoop() {
    const animate = () => {
      this.renderer.clear()
      this.stats.begin()
      requestAnimationFrame(animate)
      this.css3dRenderer.render(this.scene, this.camera)

      this.renderer.clearDepth()
      this.controls.update()
      if (this.colorCorrectionPass && this.springBloom && !this.isNight) {
        // console.log('springBloom')
        this.effectComposer.render()
      } else {
        this.renderer.render(this.scene, this.camera)
      }
      // 获取天气管理器实例来更新天气效果
      const weatherManager = WeatherManager.getInstance()
      weatherManager.updateWeather(this.camera)

      // //文字动画
      // // if (this.isNight) {
      // //   const modelManager = ModelManager.getInstance()
      // //   // modelManager.textAnimation()
      // // }

      // //后期通道

      // const activeEffects = this.postProcessManager.getActiveEffects()
      // if (activeEffects.length > 0) {
      //   activeEffects.forEach((effect) => {
      //     switch (effect.type) {
      //       case 'outline':
      //         // this.effectComposer.render()
      //         break
      //       case 'bloom':
      //         if (this.isNight) {
      //           // console.log('后期通道' + effect.type)
      //           // this.effectComposer.render()
      //         }
      //         break
      //       case 'mask':
      //         if (this.isModelClicked) {
      //           // console.log('后期通道' + effect.type)
      //           // this.effectComposer.render()
      //         }
      //         break
      //       case 'springBloom':
      //         if (this.colorCorrectionPass && this.springBloom && !this.isNight) {
      //           console.log('后期通道' + effect.type)
      //           this.effectComposer.render()
      //         }
      //         break
      //       // case 'nightBloom':
      //       //   if (this.nightBloom && this.isNight) {
      //       //     this.effectComposer.render()
      //       //   }
      //       //   break
      //     }
      //   })
      // } else {
      //   this.renderer.render(this.scene, this.camera)
      // }

      this.stats.end()
    }
    animate()
  }
  // 核心实例的getter方法
  getScene() {
    return this.scene
  }
  getCamera() {
    return this.camera
  }
  getRenderer() {
    return this.renderer
  }
  getControls() {
    return this.controls
  }
  getContainer() {
    return this.container
  }
  getComposer() {
    return this.effectComposer
  }
  getRenderPass() {
    return this.renderPass
  }
  getBloomPass() {
    return this.bloomPass
  }
  getspringBloom() {
    return this.springBloom
  }
  getColorCorrectionPass() {
    return this.colorCorrectionPass
  }
  dispose() {
    // 停止动画循环
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
    }

    // 清理渲染器
    if (this.renderer) {
      this.renderer.dispose()
      this.renderer.forceContextLoss()
      this.renderer.domElement.remove()
    }

    // 清理CSS3D渲染器
    if (this.css3dRenderer) {
      this.css3dRenderer.domElement.remove()
    }

    // 清理性能监视器
    if (this.stats) {
      this.stats.dom.remove()
    }

    // 清理后期处理
    if (this.effectComposer) {
      this.effectComposer.dispose()
    }

    // 清理控制器
    if (this.controls) {
      this.controls.dispose()
    }

    // 清理场景中的所有内容
    if (this.scene) {
      // 递归遍历场景中的所有对象
      this.scene.traverse((object) => {
        // 清理几何体
        if (object.geometry) {
          object.geometry.dispose()
        }

        // 清理材质
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((material) => {
              // 清理材质中的纹理
              Object.keys(material).forEach((prop) => {
                if (material[prop] && material[prop].isTexture) {
                  material[prop].dispose()
                }
              })
              material.dispose()
            })
          } else {
            // 清理材质中的纹理
            Object.keys(object.material).forEach((prop) => {
              if (object.material[prop] && object.material[prop].isTexture) {
                object.material[prop].dispose()
              }
            })
            object.material.dispose()
          }
        }

        // 移除事件监听器
        if (object.removeEventListener) {
          object.removeEventListener()
        }
      })

      // 清空场景
      while (this.scene.children.length > 0) {
        this.scene.remove(this.scene.children[0])
      }
    }

    // 清理天气效果和动画
    const weatherManager = WeatherManager.getInstance()
    weatherManager.clearWeather()
    weatherManager.clearAnimation()

    // 清理模型管理器
    const modelManager = ModelManager.getInstance()
    if (modelManager.dispose) {
      modelManager.dispose()
    }

    // 清理事件管理器
    // const eventManager = EventManager.getInstance()
    // if (eventManager.dispose) {
    //   eventManager.dispose()
    // }

    // 清理标签管理器
    const tagManager = TagManager.getInstance()
    if (tagManager.dispose) {
      tagManager.dispose()
    }

    // 清理后期处理管理器
    const postProcessManager = PostProcessManager.getInstance()
    if (postProcessManager.dispose) {
      postProcessManager.dispose()
    }

    // 移除窗口事件监听
    window.removeEventListener('resize', this.resizeHandler)

    // 清理事件总线
    eventHub.off('changeCameraPosition')
    eventHub.off('disposeCallback')

    // 清理实例
    ThreeManager.instance = null
  }

  initEventHub() {
    eventHub.on('changeCameraPosition', (data) => {
      changeCameraPosition(this.camera, this.controls, data)
    })
    eventHub.on('disposeCallback', () => {
      this.dispose()
    })
    // eventHub.on('walkCallback', () => {
    //   new AutoWalk()
    // })
  }
}

export default ThreeManager
