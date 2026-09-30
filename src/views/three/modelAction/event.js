import * as THREE from 'three'
import ThreeManager from '../index.js'
import ModelManager from '../modelAction/modelManage.js'
import { changeCameraPosition } from '../function.js'
import { ScreenMaskPass } from './mask.js'
import eventHub from '@/utils/eventHub'
import PostProcessManager from '../postProcess/postProcessManage.js'
class EventManager {
  static instance = null

  constructor() {
    if (EventManager.instance) {
      return EventManager.instance
    }
    EventManager.instance = this

    const threeManager = ThreeManager.getInstance()
    this.threeManager = threeManager
    this.scene = threeManager.getScene()
    this.camera = threeManager.getCamera()
    this.controls = threeManager.getControls()
    this.composer = threeManager.getComposer()
    this.renderer = threeManager.getRenderer()

    this.initEvents()
    this.postProcessManager = PostProcessManager.getInstance()
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
    this.screenMaskPass = null
    window.addEventListener('click', (event) => this.handleModelClick(event))
    eventHub.on('hideComposerCallback', () => this.disableMask())
  }

  handleModelClick(event) {
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
        //  模型的屋顶没有合并成一个整体，选中的时候只能选中中间的某个网格，网格的位置也是世界原点无法做处理
        console.log(selectedObject)
        // if (selectedObject.name) {
        //   if (
        //     selectedObject.name.includes('Main_Building_ZhanTing') ||
        //     selectedObject.name.includes('ZhuDengLuTing_Roof')
        //   ) {
        //     this.lastSelectedObject = selectedObject
        //     changeCameraPosition(this.camera, this.controls, {
        //       position: selectedObject.parent.position,
        //       target: selectedObject.parent.position,
        //       type: 'modelView',
        //     })
        //   }
        //   if (!this.screenMaskPass) {
        //     this.threeManager.isModelClicked = true
        //     this.screenMaskPass = new ScreenMaskPass()
        //     this.composer.addPass(this.screenMaskPass)
        //     // if (this.screenMaskPass) {
        //     //   this.screenMaskPass.enabled = true
        //     // }
        //     this.postProcessManager.disableEffect('springBloom')
        //     this.postProcessManager.disableEffect('nightBloom')
        //     this.postProcessManager.enableEffect('mask')
        //   } else {
        //     this.enableMask()
        //   }
        //   // if (
        //   //   selectedObject &&
        //   //   (selectedObject.name.includes('号馆') || selectedObject.name.includes('登录厅'))
        //   // ) {
        //   // // 保存原始材质
        //   // selectedObject.originalMaterial = selectedObject.material.clone()
        //   // // 创建新的材质
        //   // const newMaterial = selectedObject.material.clone()
        //   // newMaterial.emissive.set(0xff62e258)
        //   // newMaterial.emissiveIntensity = 1
        //   // selectedObject.material = newMaterial
        //   // this.lastSelectedObject = selectedObject
        //   // changeCameraPosition(this.camera, this.controls, {
        //   //   position: selectedObject.position,
        //   //   target: selectedObject.position,
        //   //   type: 'modelView',
        //   // })
        //   // if (!this.screenMaskPass) {
        //   //   this.threeManager.isModelClicked = true
        //   //   this.screenMaskPass = new ScreenMaskPass()
        //   //   this.composer.addPass(this.screenMaskPass)
        //   //   this.threeManager.getBloomPass().enabled = false
        //   //   this.postProcessManager.enableEffect('mask')
        //   // } else {
        //   //   this.enableMask()
        //   // }
        // }
      } else {
        if (this.lastSelectedObject) {
          // 恢复上一个选中物体的材质
          if (this.lastSelectedObject.originalMaterial) {
            this.lastSelectedObject.material = this.lastSelectedObject.originalMaterial
            this.lastSelectedObject.originalMaterial = null // 清除保存的原始材质
          }
        }
        this.threeManager.isModelClicked = false
        this.disableMask()
      }
    }
  }
  enableMask() {
    if (!this.screenMaskPass) return
    this.threeManager.disableEffect('springBloom')
    this.postProcessManager.disableEffect('nightBloom')
    this.screenMaskPass.enabled = true
    this.threeManager.isModelClicked = true
    this.threeManager.getBloomPass().enabled = false
    // if (this.screenMaskPass) {
    //   this.screenMaskPass.enabled = true
    // }
    this.postProcessManager.enableEffect('mask')
  }
  disableMask() {
    if (!this.screenMaskPass) return
    this.screenMaskPass.enabled = false
    this.threeManager.isModelClicked = false
    if (this.screenMaskPass) {
      this.screenMaskPass.enabled = false
    }
    this.postProcessManager.disableEffect('mask')
  }
}

export default EventManager
