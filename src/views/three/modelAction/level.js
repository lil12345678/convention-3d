import * as THREE from 'three'
import ThreeManager from '../index.js'
import ModelManager from '../modelAction/modelManage.js'
import { changeCameraPosition } from '../function.js'
import { ScreenMaskPass } from './mask.js'
import eventHub from '@/utils/eventHub'
import PostProcessManager from '../postProcess/postProcessManage.js'
import gsap from 'gsap'
class ModelLevelManager {
  static instance = null

  constructor() {
    if (ModelLevelManager.instance) {
      return ModelLevelManager.instance
    }
    ModelLevelManager.instance = this

    const threeManager = ThreeManager.getInstance()
    this.threeManager = threeManager
    this.scene = threeManager.getScene()
    this.camera = threeManager.getCamera()
    this.controls = threeManager.getControls()
    this.composer = threeManager.getComposer()
    this.renderer = threeManager.getRenderer()
    this.postProcessManager = PostProcessManager.getInstance()
    this.roofGroup
    this.wallGroup
    this.initEvents()
  }

  static getInstance() {
    if (!ModelLevelManager.instance) {
      ModelLevelManager.instance = new ModelLevelManager()
    }
    return ModelLevelManager.instance
  }

  initEvents() {
    eventHub.on('buildSelectCallback', (build) => this.buildSelect(build))
    eventHub.on('levelSelectCallback', (level) => this.levelSelect(level))

    this.lastSelectedObject = null // 记录上一个被点击的对象
  }
  buildSelect(build) {
    if (this.lastSelectedObject) {
      this.collapseAll() // 恢复上一个建筑的楼层状态
    }
    const modelManager = ModelManager.getInstance()
    const modelMesh = modelManager.getModelMesh()

    if (build) {
      modelMesh.traverse((child) => {
        if (child.name === build) {
          // console.log(child.position) // {x: -698.958251953125, y: 13.180912971496582, z: 386.75506591796875}
          const position = child.position.clone()
          changeCameraPosition(this.camera, this.controls, {
            position: {
              x: position.x - 150,
              y: position.y + 55,
              z: position.z + 30,
            },
            // position: {
            //   x: -83,
            //   y: 69,
            //   z: -87,
            // },
            target: position, // { x: 0, y: 0, z: 0 },
            type: 'modelView',
          })
          this.roofGroup = child
          this.lastSelectedObject = child //更新当前选中建筑为上一个选中对象
        }

        if (child.name === `${build}_Wall`) {
          this.wallGroup = child
        }
      })
      // if (!this.screenMaskPass) {
      //   this.threeManager.isModelClicked = true
      //   this.screenMaskPass = new ScreenMaskPass()
      //   this.composer.addPass(this.screenMaskPass)
      //   // if (this.screenMaskPass) {
      //   //   this.screenMaskPass.enabled = true
      //   // }
      //   this.postProcessManager.disableEffect('springBloom')
      //   this.postProcessManager.disableEffect('nightBloom')
      //   this.postProcessManager.enableEffect('mask')
      // }
      // this.controls.enabled = false
      //默认展开楼层
      this.expandAll()
    }
  }
  levelSelect(level) {
    this.postProcessManager.disableEffect('springBloom')
    this.postProcessManager.disableEffect('nightBloom')

    if (level == 1) {
      this.roofGroup.visible = false
    } else if (level == 2) {
      this.roofGroup.visible = true
      this.collapseAll()
    } else {
      this.roofGroup.visible = true
      this.expandAll()
    }
  }
  //展开全部
  expandAll() {
    this.originPos = this.roofGroup.position.clone()
    gsap.to(this.roofGroup.position, {
      y: 50,
      duration: 2,
    })
    gsap.to(this.wallGroup.position, {
      y: 20,
      duration: 2,
      delay: 2,
    })
    this.isexpend = true
  }
  //恢复全部
  collapseAll() {
    gsap.to(this.wallGroup.position, {
      y: 0,
      duration: 1,
    })
    gsap.to(this.roofGroup.position, {
      y: this.isexpend ? this.originPos.y : this.roofGroup.position.y,
      duration: 1,
      delay: 1,
    })
    this.isexpend = false
  }
}

export default ModelLevelManager
