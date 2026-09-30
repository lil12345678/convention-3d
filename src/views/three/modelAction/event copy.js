import * as THREE from 'three'
import ThreeManager from '../index.js'
import ModelManager from '../modelAction/modelManage.js'
import { changeCameraPosition } from '../function.js'
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import * as dat from 'dat.gui'
// import { BokehPass } from '../bokeh/BokehPass.js'
const ColorOverlayShader = {
  uniforms: {
    tDiffuse: { value: null }, // 输入纹理
    overlayColor: { value: new THREE.Color(0x0000ff) }, // 深蓝色
    blendIntensity: { value: 0.5 }, // 混合强度
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
    uniform vec3 overlayColor;
    uniform float blendIntensity;
    varying vec2 vUv;
    
    void main() {
      vec4 originalColor = texture2D(tDiffuse, vUv);
      // 混合原色与深蓝色（根据模糊程度动态调整）
      vec3 blendedColor = mix(originalColor.rgb, overlayColor, blendIntensity * (1.0 - originalColor.a));
      gl_FragColor = vec4(blendedColor, originalColor.a);
    }
  `,
}
class EventManager {
  static instance = null

  constructor() {
    if (EventManager.instance) {
      return EventManager.instance
    }
    EventManager.instance = this

    const threeManager = ThreeManager.getInstance()
    this.scene = threeManager.getScene()
    this.camera = threeManager.getCamera()
    this.controls = threeManager.getControls()
    this.composer = threeManager.getComposer()
    this.renderer = threeManager.getRenderer()
    this.bokehPass = null
    this.animationFrameId = null
    this.gui = null
    this.initEvents()
  }

  static getInstance() {
    if (!EventManager.instance) {
      EventManager.instance = new EventManager()
    }
    return EventManager.instance
  }

  initEvents() {
    // 记录上一个被点击的对象
    this.lastSelectedObject = null
    window.addEventListener('click', (event) => this.handleModelClick(event))
  }

  handleModelClick(event) {
    // if (this.composer && !this.bokehPass) {
    //   // 创建景深效果
    //   this.bokehPass = new BokehPass(this.scene, this.camera, {
    //     focus: 1.0, // 初始焦点距离（后续动态更新）
    //     aperture: 0.02, // 光圈值（值越大模糊越强）
    //     maxblur: 0.02, // 最大模糊强度
    //   })
    //   // 创建GUI控制器
    //   if (!this.gui) {
    //     this.gui = new dat.GUI()
    //     let gui = this.gui

    //     gui.domElement.style.position = 'absolute'
    //     gui.domElement.style.top = '240px'
    //     gui.domElement.style.right = '26%'
    //     const bokehFolder = this.gui.addFolder('景深效果')

    //     // 添加控制参数
    //     bokehFolder.add(this.bokehPass.uniforms.focus, 'value', 10.0, 3000.0, 10).name('焦点距离')
    //     bokehFolder.add(this.bokehPass.uniforms.aperture, 'value', 0, 10, 0.1).name('光圈大小')
    //     bokehFolder.add(this.bokehPass.uniforms.maxblur, 'value', 0.0, 0.01, 0.001).name('最大模糊')

    //     bokehFolder.open()
    //   }
    //   // 创建深度纹理
    //   const depthTexture = new THREE.DepthTexture()
    //   const renderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
    //     depthTexture: depthTexture,
    //     depthBuffer: true,
    //   })
    //   this.renderer.setRenderTarget(renderTarget)
    //   this.renderer.setRenderTarget(null) // 重置渲染目标

    //   this.composer.addPass(this.bokehPass)
    //   this.colorOverlayPass = new ShaderPass(ColorOverlayShader)
    //   this.colorOverlayPass.uniforms.blendIntensity.value = 1 // 调整混合强度
    //   this.composer.addPass(this.colorOverlayPass)
    // }

    const mouse = new THREE.Vector2()
    const raycaster = new THREE.Raycaster()

    // 将鼠标位置归一化为设备坐标
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

    raycaster.setFromCamera(mouse, this.camera)

    const modelManager = ModelManager.getInstance()
    const modelMesh = modelManager.getModelMesh()

    if (modelMesh) {
      const intersects = raycaster.intersectObject(modelMesh, true)
      if (intersects.length > 0) {
        if (this.lastSelectedObject) {
          // 恢复上一个选中物体的材质
          if (this.lastSelectedObject.originalMaterial) {
            this.lastSelectedObject.material = this.lastSelectedObject.originalMaterial
          }
        }
        const selectedObject = intersects[0].object
        if (
          selectedObject &&
          (selectedObject.name.includes('号馆') || selectedObject.name.includes('登录厅'))
        ) {
          // 保存原始材质
          selectedObject.originalMaterial = selectedObject.material.clone()
          // 创建新的材质
          const newMaterial = selectedObject.material.clone()
          newMaterial.emissive.set(0xff62e258)
          newMaterial.emissiveIntensity = 1
          selectedObject.material = newMaterial

          this.lastSelectedObject = selectedObject
          console.log('selectedObject', selectedObject)

          // selectedObject.material.color.set(0xff62e258)
          // outlineObjFn([selectedObject], this.outlinePass, this.outlineComposer)
          // if (this.bokehPass) {
          //   this.bokehPass.enabled = true
          //   this.colorOverlayPass.enabled = true
          //   // 计算到选中物体的距离
          //   const distance = this.camera.position.distanceTo(selectedObject.position)

          //   // 设置焦点距离为选中物体的距离
          //   this.bokehPass.uniforms.focus.value = distance
          //   console.log('distance', distance)

          //   // 增加光圈和模糊值使非焦点区域更模糊
          //   this.bokehPass.uniforms.aperture.value = 5 //
          //   this.bokehPass.uniforms.maxblur.value = 0.1 //

          //   // 将选中物体移到一个稍微不同的深度，以确保它保持清晰
          //   selectedObject.position.z += 200
          //   selectedObject.position.y += 200
          //   // 取消之前的动画循环
          //   if (this.animationFrameId !== null) {
          //     cancelAnimationFrame(this.animationFrameId)
          //   }

          //   // 更新渲染器的动画循环
          //   const animate = () => {
          //     this.animationFrameId = requestAnimationFrame(animate)
          //     if (this.composer && (this.bokehPass.enabled || this.colorOverlayPass.enabled)) {
          //       this.composer.render(0.1)
          //     } else {
          //       // 正常渲染场景
          //       this.renderer.render(this.scene, this.camera)
          //     }
          //   }
          //   animate()
          // }
          changeCameraPosition(this.camera, this.controls, {
            position: selectedObject.position,
            target: selectedObject.position,
            type: 'modelView',
          })
        }
      } else {
        if (this.lastSelectedObject) {
          // 恢复上一个选中物体的材质
          if (this.lastSelectedObject.originalMaterial) {
            this.lastSelectedObject.material = this.lastSelectedObject.originalMaterial
            this.lastSelectedObject.originalMaterial = null // 清除保存的原始材质
          }
        }
        // if (this.outlinePass) {
        //   this.outlineComposer.removePass(this.outlinePass)
        //   this.outlinePass = null
        // }
        // 恢复选中物体的原始位置
        // if (this.lastSelectedObject) {
        //   this.lastSelectedObject.position.z -= 0.001
        // }
        // 取消动画循环
        // if (this.animationFrameId !== null) {
        //   cancelAnimationFrame(this.animationFrameId)
        //   this.animationFrameId = null
        // }
        // if (this.gui) {
        //   // 当取消选中时，不要销毁GUI，保持参数可调
        //   this.bokehPass.enabled = false
        //   this.colorOverlayPass.enabled = false
        // }
      }
    }
  }
}

export default EventManager
