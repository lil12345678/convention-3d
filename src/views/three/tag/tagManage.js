import * as THREE from 'three'
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js'
import ThreeManager from '../index.js'
import eventHub from '@/utils/eventHub'
import ModelManager from '../modelAction/modelManage.js'
// import { createLabel } from './sprite.js' //标注
import { createLabel } from './object.js' //标注
class TagManager {
  static instance = null

  constructor() {
    if (TagManager.instance) {
      return TagManager.instance
    }
    TagManager.instance = this

    const threeManager = ThreeManager.getInstance()
    this.scene = threeManager.getScene()
    this.initEventListeners()
  }

  static getInstance() {
    if (!TagManager.instance) {
      TagManager.instance = new TagManager()
    }
    return TagManager.instance
  }

  initEventListeners() {
    eventHub.on('stadiumLabelCallback', () => this.showStadiumLabels())
    eventHub.on('hideStadiumLabelCallback', () => this.hideStadiumLabels())
    eventHub.on('securityLabelCallback', () => this.showsecurityLabel())
    eventHub.on('hidesecurityLabelCallback', () => this.hidesecurityLabel())
    eventHub.on('parkingLabelCallback', () => this.showparkingLabel())
    eventHub.on('hideparkingLabelCallback', () => this.hideparkingLabel())
    eventHub.on('doorLabelCallback', () => this.showdoorLabel())
    eventHub.on('hidedoorLabelCallback', () => this.hidedoorLabel())
    eventHub.on('ac1LabelCallback', () => this.showAC1Label())
    eventHub.on('hideac1LabelCallback', () => this.hideAC1Label())
    eventHub.on('ac2LabelCallback', () => this.showAC2Label())
    eventHub.on('hideac2LabelCallback', () => this.hideAC2Label())
    eventHub.on('ac3LabelCallback', () => this.showAC3Label())
    eventHub.on('hideac3LabelCallback', () => this.hideAC3Label())
    eventHub.on('ac4LabelCallback', () => this.showAC4Label())
    eventHub.on('hideac4LabelCallback', () => this.hideAC4Label())
    eventHub.on('ac5LabelCallback', () => this.showAC5Label())
    eventHub.on('hideac5LabelCallback', () => this.hideAC5Label())
    eventHub.on('ac6LabelCallback', () => this.showAC6Label())
    eventHub.on('hideac6LabelCallback', () => this.hideAC6Label())
    eventHub.on('elevatorLabelCallback', () => this.showelevatorLabel())
    eventHub.on('hideelevatorLabelCallback', () => this.hideelevatorLabel())
    eventHub.on('energyLabelCallback', () => this.showenergyLabel())
    eventHub.on('hideenergyLabelCallback', () => this.hideenergyLabel())
    eventHub.on('showDeviceInfo', (data) => this.showDeviceInfo(data))
  }
  //场馆tag
  showStadiumLabels() {
    if (this.labelSprites) {
      this.labelSprites.visible = true
      return
    }

    const modelManager = ModelManager.getInstance()
    const modelMesh = modelManager.getModelMesh()

    if (!modelMesh) {
      console.warn('模型未加载，无法创建标签')
      return
    }

    this.labelSprites = new THREE.Group()
    let type = 'stadium'
    modelMesh.traverse((child) => {
      if (
        (child.name.includes('号馆') || child.name.includes('登录厅')) &&
        child.name.indexOf('_Wall') === -1
      ) {
        const label = createLabel(
          child.name,
          child.position,
          'three-label-icon',
          `textures/labels/${type}.png`
        )
        // const label = createLabel(child.position, 'stadium', child.name)
        label.rotateY(Math.PI / 5)
        this.labelSprites.add(label)
      }
    })

    this.scene.add(this.labelSprites)
  }
  hideStadiumLabels() {
    if (this.labelSprites) {
      this.scene.remove(this.labelSprites) // 从场景中移除标签组
      this.labelSprites.traverse((child) => {
        if (child instanceof CSS3DObject) {
          child.element.remove() // 移除 DOM 元素
        }
      })
      this.labelSprites = null // 清空引用
    }
  }
  //入侵探测器
  async showsecurityLabel() {
    if (this.securitySprites) {
      this.securitySprites.visible = true
      return
    }

    const modelManager = ModelManager.getInstance()
    const modelMesh = await modelManager.loadtagpoint().catch(() => null)

    if (!modelMesh) {
      console.warn('模型未加载，无法创建标签')
      return
    }
    this.securitySprites = new THREE.Group()
    let type = 'security'
    modelMesh.traverse((child) => {
      if (child.name.includes('入侵探测器')) {
        const label = createLabel(
          null,
          child.position,
          'three-label-icon2',
          `textures/labels/${type}.png`,
          '入侵探测器'
        )
        // const label = createLabel(child.position, 'stadium', child.name)
        label.rotateY(Math.PI / 5)
        label.position.y -= 30
        this.securitySprites.add(label)
      }
    })

    this.scene.add(this.securitySprites)
  }
  hidesecurityLabel() {
    if (this.securitySprites) {
      this.scene.remove(this.securitySprites) // 从场景中移除标签组
      this.securitySprites.traverse((child) => {
        if (child instanceof CSS3DObject) {
          child.element.remove() // 移除 DOM 元素
        }
      })
      this.securitySprites = null // 清空引用
    }
  }
  //停车场
  async showparkingLabel() {
    if (this.parkSprites) {
      this.parkSprites.visible = true
      return
    }

    const modelManager = ModelManager.getInstance()
    const modelMesh = await modelManager.loadtagpoint().catch(() => null)

    if (!modelMesh) {
      console.warn('模型未加载，无法创建标签')
      return
    }

    this.parkSprites = new THREE.Group()
    let type = 'park'

    modelMesh.traverse((child) => {
      if (child.name.includes('停车场')) {
        // //console.log(child.name)
        const label = createLabel(
          null,
          child.position,
          'three-label-icon2',
          `textures/labels/${type}.png`,
          '停车场匝道'
        )
        // const label = createLabel(child.position, 'stadium', child.name)
        label.rotateY(Math.PI / 5)
        label.position.y -= 30
        this.parkSprites.add(label)
      }
    })

    this.scene.add(this.parkSprites)
  }
  hideparkingLabel() {
    if (this.parkSprites) {
      this.scene.remove(this.parkSprites) // 从场景中移除标签组
      this.parkSprites.traverse((child) => {
        if (child instanceof CSS3DObject) {
          child.element.remove() // 移除 DOM 元素
        }
      })
      this.parkSprites = null // 清空引用
    }
  }
  //门禁
  async showdoorLabel() {
    if (this.doorSprites) {
      this.doorSprites.visible = true
      return
    }

    const modelManager = ModelManager.getInstance()
    const modelMesh = await modelManager.loadtagpoint().catch(() => null)

    if (!modelMesh) {
      console.warn('模型未加载，无法创建标签')
      return
    }

    this.doorSprites = new THREE.Group()
    let type = 'door'

    modelMesh.traverse((child) => {
      if (child.name.includes('入侵探测器')) {
        const label = createLabel(
          null,
          child.position,
          'three-label-icon2',
          `textures/labels/${type}.png`,
          '门禁'
        )
        // const label = createLabel(child.position, 'stadium', child.name)
        label.rotateY(Math.PI / 5)
        label.position.y -= 30
        this.doorSprites.add(label)
      }
    })

    this.scene.add(this.doorSprites)
  }
  hidedoorLabel() {
    if (this.doorSprites) {
      this.scene.remove(this.doorSprites) // 从场景中移除标签组
      this.doorSprites.traverse((child) => {
        if (child instanceof CSS3DObject) {
          child.element.remove() // 移除 DOM 元素
        }
      })
      this.doorSprites = null // 清空引用
    }
  }
  async showAC1Label() {
    if (this.ac1Sprites) {
      this.ac1Sprites.visible = true
      return
    }

    const modelManager = ModelManager.getInstance()
    const modelMesh = await modelManager.loadtagpoint().catch(() => null)

    if (!modelMesh) {
      console.warn('模型未加载，无法创建标签')
      return
    }

    this.ac1Sprites = new THREE.Group()
    let type = 'AC1'

    modelMesh.traverse((child) => {
      //console.log(child.name)
      if (child.name.includes('空调用电')) {
        const label = createLabel(
          null,
          child.position,
          'three-label-icon2',
          `textures/labels/${type}.png`,
          '空调用电'
        )
        // const label = createLabel(child.position, 'stadium', child.name)
        label.rotateY(Math.PI / 5)
        label.position.y -= 30
        this.ac1Sprites.add(label)
      }
    })

    this.scene.add(this.ac1Sprites)
  }
  hideAC1Label() {
    if (this.ac1Sprites) {
      this.scene.remove(this.ac1Sprites) // 从场景中移除标签组
      this.ac1Sprites.traverse((child) => {
        if (child instanceof CSS3DObject) {
          child.element.remove() // 移除 DOM 元素
        }
      })
      this.ac1Sprites = null // 清空引用
    }
  }
  async showAC2Label() {
    if (this.ac2Sprites) {
      this.ac2Sprites.visible = true
      return
    }

    const modelManager = ModelManager.getInstance()
    const modelMesh = await modelManager.loadtagpoint().catch(() => null)

    if (!modelMesh) {
      console.warn('模型未加载，无法创建标签')
      return
    }

    this.ac2Sprites = new THREE.Group()
    let type = 'AC1'

    modelMesh.traverse((child) => {
      //console.log(child.name)
      if (child.name.includes('集中空调')) {
        const label = createLabel(
          null,
          child.position,
          'three-label-icon2',
          `textures/labels/${type}.png`,
          '集中空调'
        )
        // const label = createLabel(child.position, 'stadium', child.name)
        label.rotateY(Math.PI / 5)
        label.position.y -= 30
        this.ac2Sprites.add(label)
      }
    })

    this.scene.add(this.ac2Sprites)
  }
  hideAC2Label() {
    if (this.ac2Sprites) {
      this.scene.remove(this.ac2Sprites) // 从场景中移除标签组
      this.ac2Sprites.traverse((child) => {
        if (child instanceof CSS3DObject) {
          child.element.remove() // 移除 DOM 元素
        }
      })
      this.ac2Sprites = null // 清空引用
    }
  }
  async showAC3Label() {
    if (this.ac3Sprites) {
      this.ac3Sprites.visible = true
      return
    }

    const modelManager = ModelManager.getInstance()
    const modelMesh = await modelManager.loadtagpoint().catch(() => null)

    if (!modelMesh) {
      console.warn('模型未加载，无法创建标签')
      return
    }

    this.ac3Sprites = new THREE.Group()
    let type = 'AC1'

    modelMesh.traverse((child) => {
      //console.log(child.name)
      if (child.name.includes('辐射空调')) {
        const label = createLabel(
          null,
          child.position,
          'three-label-icon2',
          `textures/labels/${type}.png`,
          '辐射空调'
        )
        // const label = createLabel(child.position, 'stadium', child.name)
        label.rotateY(Math.PI / 5)
        label.position.y -= 30
        this.ac3Sprites.add(label)
      }
    })

    this.scene.add(this.ac3Sprites)
  }
  hideAC3Label() {
    if (this.ac3Sprites) {
      this.scene.remove(this.ac3Sprites) // 从场景中移除标签组
      this.ac3Sprites.traverse((child) => {
        if (child instanceof CSS3DObject) {
          child.element.remove() // 移除 DOM 元素
        }
      })
      this.ac3Sprites = null // 清空引用
    }
  }
  async showAC4Label() {
    if (this.ac4Sprites) {
      this.ac4Sprites.visible = true
      return
    }

    const modelManager = ModelManager.getInstance()
    const modelMesh = await modelManager.loadtagpoint().catch(() => null)

    if (!modelMesh) {
      console.warn('模型未加载，无法创建标签')
      return
    }

    this.ac4Sprites = new THREE.Group()
    let type = 'AC1'

    modelMesh.traverse((child) => {
      //console.log(child.name)
      if (child.name.includes('应急照明')) {
        const label = createLabel(
          null,
          child.position,
          'three-label-icon2',
          `textures/labels/${type}.png`,
          '应急照明'
        )
        // const label = createLabel(child.position, 'stadium', child.name)
        label.rotateY(Math.PI / 5)
        label.position.y -= 30
        this.ac4Sprites.add(label)
      }
    })

    this.scene.add(this.ac4Sprites)
  }
  hideAC4Label() {
    if (this.ac4Sprites) {
      this.scene.remove(this.ac4Sprites) // 从场景中移除标签组
      this.ac4Sprites.traverse((child) => {
        if (child instanceof CSS3DObject) {
          child.element.remove() // 移除 DOM 元素
        }
      })
      this.ac4Sprites = null // 清空引用
    }
  }
  async showAC5Label() {
    if (this.ac5Sprites) {
      this.ac5Sprites.visible = true
      return
    }

    const modelManager = ModelManager.getInstance()
    const modelMesh = await modelManager.loadtagpoint().catch(() => null)

    if (!modelMesh) {
      console.warn('模型未加载，无法创建标签')
      return
    }

    this.ac5Sprites = new THREE.Group()
    let type = 'AC1'

    modelMesh.traverse((child) => {
      //console.log(child.name)
      if (child.name.includes('照明插座')) {
        const label = createLabel(
          null,
          child.position,
          'three-label-icon2',
          `textures/labels/${type}.png`,
          '照明插座'
        )
        // const label = createLabel(child.position, 'stadium', child.name)
        label.rotateY(Math.PI / 5)
        label.position.y -= 30
        this.ac5Sprites.add(label)
      }
    })

    this.scene.add(this.ac5Sprites)
  }
  hideAC5Label() {
    if (this.ac5Sprites) {
      this.scene.remove(this.ac5Sprites) // 从场景中移除标签组
      this.ac5Sprites.traverse((child) => {
        if (child instanceof CSS3DObject) {
          child.element.remove() // 移除 DOM 元素
        }
      })
      this.ac5Sprites = null // 清空引用
    }
  }
  async showAC6Label() {
    if (this.ac6Sprites) {
      this.ac6Sprites.visible = true
      return
    }

    const modelManager = ModelManager.getInstance()
    const modelMesh = await modelManager.loadtagpoint().catch(() => null)

    if (!modelMesh) {
      console.warn('模型未加载，无法创建标签')
      return
    }

    this.ac6Sprites = new THREE.Group()
    let type = 'AC1'

    modelMesh.traverse((child) => {
      //console.log(child.name)
      if (child.name.includes('景观照明')) {
        const label = createLabel(
          null,
          child.position,
          'three-label-icon2',
          `textures/labels/${type}.png`,
          '景观照明'
        )
        // const label = createLabel(child.position, 'stadium', child.name)
        label.rotateY(Math.PI / 5)
        label.position.y -= 30
        this.ac6Sprites.add(label)
      }
    })

    this.scene.add(this.ac6Sprites)
  }
  hideAC6Label() {
    if (this.ac6Sprites) {
      this.scene.remove(this.ac6Sprites) // 从场景中移除标签组
      this.ac6Sprites.traverse((child) => {
        if (child instanceof CSS3DObject) {
          child.element.remove() // 移除 DOM 元素
        }
      })
      this.ac6Sprites = null // 清空引用
    }
  }
  showelevatorLabel() {}
  hideelevatorLabel() {}
  showenergyLabel() {}
  hideenergyLabel() {}
  showDeviceInfo() {}
}

export default TagManager
