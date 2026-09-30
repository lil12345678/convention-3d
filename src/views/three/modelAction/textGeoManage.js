import * as THREE from 'three'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js'
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js'
import ThreeManager from '../index.js'
let chineseLetters = []
let englishLetters = []

const displayRange = { left: -10, right: 10 } // 定义显示范围
const loader = new FontLoader()
export class TextAnimationManager {
  static instance = null
  constructor() {
    if (TextAnimationManager.instance) {
      return TextAnimationManager.instance
    }
    TextAnimationManager.instance = this
    this.chineseMeshGroup = null
    this.chineseLetters = []
    this.englishMeshGroup = null
    this.englishLetters = []
    this.offset = {
      y: 0,
      z: 0,
    }
    const threeManager = ThreeManager.getInstance()
    this.threeManager = threeManager
    this.scene = threeManager.getScene()
    this.conventionsMesh = null
    this.vetroPosition = null
    // 添加GUI控制参数
    // this.params = {
    //   chineseX: position.x,
    //   chineseZ: position.z,
    //   englishX: position.x,
    //   englishZ: position.z,
    // }
    // this.initGUI()
  }

  initGUI() {
    const gui = new GUI()
    const position = this.vetroPosition.clone()
    const chineseFolder = gui.addFolder('中文文字位置')
    chineseFolder
      .add(this.params, 'chineseX', -1200, 1200)
      .name('X轴')
      .onChange(() => {
        if (this.chineseMeshGroup) {
          this.chineseMeshGroup.position.x = this.params.chineseX
        }
      })
    chineseFolder
      .add(this.params, 'chineseZ', -1200, 1200)
      .name('Z轴')
      .onChange(() => {
        if (this.chineseMeshGroup) {
          this.chineseMeshGroup.position.z = this.params.chineseZ
        }
      })

    const englishFolder = gui.addFolder('英文文字位置')
    englishFolder
      .add(this.params, 'englishX', -1200, 1200)
      .name('X轴')
      .onChange(() => {
        if (this.englishMeshGroup) {
          this.englishMeshGroup.position.x = this.params.englishX
        }
      })
    englishFolder
      .add(this.params, 'englishZ', -1200, 1200)
      .name('Z轴')
      .onChange(() => {
        if (this.englishMeshGroup) {
          this.englishMeshGroup.position.z = this.params.englishZ
        }
      })

    // 设置GUI面板的位置
    gui.domElement.style.position = 'absolute'
    gui.domElement.style.top = '100px'
    gui.domElement.style.right = '300px'
  }
  setMeshes(conventionsMesh) {
    this.conventionsMesh = conventionsMesh
  }
  static getInstance() {
    if (!TextAnimationManager.instance) {
      TextAnimationManager.instance = new TextAnimationManager()
    }
    return TextAnimationManager.instance
  }
  getvetroPosition() {
    this.conventionsMesh.traverse((child) => {
      if (child.name === '1号馆') {
        // const worldPosition = new THREE.Vector3()
        // // 计算包围盒
        // const boundingBox = new THREE.Box3().setFromObject(child)
        // // 获取包围盒的中心点
        // boundingBox.getCenter(worldPosition)
        // 保存正确的位置
        this.vetroPosition = child.position.clone()
      }
    })
  }
  initializeText() {
    this.addtext1()
    this.addtext2()
  }

  addtext1() {
    this.getvetroPosition()
    const { chineseMeshGroup, chineseLetters } = this.initChineseText()
    this.chineseMeshGroup = chineseMeshGroup
    this.chineseLetters = chineseLetters

    const position = this.vetroPosition.clone()
    // const cube = new THREE.Mesh(
    //   new THREE.BoxGeometry(10, 10, 10),
    //   new THREE.MeshBasicMaterial({ color: 0x00ff00 })
    // )

    // cube.position.copy(position)
    // cube.position.y += 10
    // this.scene.add(cube)

    this.chineseMeshGroup.position.copy(position)
    this.chineseMeshGroup.rotation.x = -Math.PI / 2
    this.chineseMeshGroup.rotation.z = -Math.PI / 3.5
    this.chineseMeshGroup.position.y += 15

    // // 应用GUI中设置的位置
    this.chineseMeshGroup.position.x = position.x - 55 //this.params.chineseX
    this.chineseMeshGroup.position.z = position.z - 52 //this.params.chineseZ
    this.scene.add(this.chineseMeshGroup)
  }

  addtext2() {
    let position = new THREE.Vector3()
    this.conventionsMesh.traverse((child) => {
      if (child.name === '1号馆') {
        position = child.position.clone()
      }
    })
    const { englishMeshGroup, englishLetters } = this.initEnglishText()
    this.englishMeshGroup = englishMeshGroup
    this.englishLetters = englishLetters
    // const position = this.vetroPosition.clone()
    // position.y += this.offset.y
    // position.z += this.offset.z
    this.englishMeshGroup.position.copy(position)
    this.englishMeshGroup.rotation.x = -Math.PI / 2
    this.englishMeshGroup.rotation.z = -Math.PI / 3.5
    this.englishMeshGroup.position.y += 15

    // 应用GUI中设置的位置
    this.englishMeshGroup.position.x = position.x - 80 //this.params.englishX
    this.englishMeshGroup.position.z = position.z - 25 //this.params.englishZ
    this.scene.add(this.englishMeshGroup)
  }

  initChineseText() {
    let chineseMeshGroup = new THREE.Group()
    chineseMeshGroup.name = 'textGeo1'
    loader.load('HuXiaoBo-NanShen_Regular.json', (font) => {
      const text = `国际会展中心`
      for (let i = 0; i < text.length; i++) {
        const letterGeometry = new TextGeometry(text[i], {
          font,
          size: 18,
          depth: 0.5,
          height: 0.2,
          curveSegments: 10,
          bevelEnabled: false,
          bevelThickness: 0.1,
          bevelSize: 0.1,
          bevelSegments: 5,
        }).center()

        const vertexShader = `
          varying vec3 vPosition;
          void main() {
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `

        const fragmentShader = `
          varying vec3 vPosition;
          void main() {
            vec3 color1 = vec3(1.0, 0.5, 0.0); 
            vec3 color2 = vec3(1.0, 0.8, 0.4); 
            float mixValue = (vPosition.z + 2.0) / 4.0; 
            vec3 finalColor = mix(color1, color2, mixValue);
            gl_FragColor = vec4(finalColor, 1.0);
          }
        `
        const material = new THREE.ShaderMaterial({
          vertexShader: vertexShader,
          fragmentShader: fragmentShader,
        })
        const letterMesh = new THREE.Mesh(letterGeometry, material)
        letterMesh.position.x = i * 28.0 // 调整间距
        chineseMeshGroup.add(letterMesh)
        chineseLetters.push(letterMesh)
        // chineseMeshGroup.position.x = -90
      }
    })
    // chineseMeshGroup.position.y = 10
    return { chineseMeshGroup, chineseLetters }
  }
  initEnglishText() {
    let englishMeshGroup = new THREE.Group()
    englishMeshGroup.name = 'textGeo2'
    loader.load('HuXiaoBo-NanShen_Regular.json', (font) => {
      const text = `WELCOME TO YOU `
      for (let i = 0; i < text.length; i++) {
        const letterGeometry = new TextGeometry(text[i], {
          font,
          size: 12,
          depth: 0.5,
          height: 0.2,
          curveSegments: 10,
          bevelEnabled: false,
          bevelThickness: 0.1,
          bevelSize: 0.1,
          bevelSegments: 5,
        }).center()

        const mesh = new THREE.Mesh(
          letterGeometry,
          new THREE.MeshBasicMaterial({ color: 0xffffff })
        )
        const sampler = new MeshSurfaceSampler(mesh).build()
        const positions = new Float32Array(3000)
        const colors = new Float32Array(3000)
        const samplePoint = new THREE.Vector3()
        const color = new THREE.Color()

        for (let j = 0; j < 1000; j++) {
          sampler.sample(samplePoint)
          if (isNaN(samplePoint.x) || isNaN(samplePoint.y) || isNaN(samplePoint.z)) {
            positions.set([0, 0, 0], j * 3)
          } else {
            positions.set([samplePoint.x, samplePoint.y, samplePoint.z], j * 3)
          }
          // color.setHSL(Math.random(), 1.0, 0.5)
          const hue = 0.75 + Math.random() * 0.1
          const saturation = 0.8 // 固定饱和度
          const lightness = 0.4 + Math.random() * 0.3 // 随机亮度，产生渐变效果
          color.setHSL(hue, saturation, lightness)
          colors.set([color.r, color.g, color.b], j * 3)
        }

        const pointsGeometry = new THREE.BufferGeometry()
        pointsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
        pointsGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

        const pointsMaterial = new THREE.PointsMaterial({ size: 0.04, vertexColors: true })
        const letterPoints = new THREE.Points(pointsGeometry, pointsMaterial)
        letterPoints.position.x = i * 8 // 调整字母间距
        englishMeshGroup.add(letterPoints)
        englishLetters.push(letterPoints)
        // englishMeshGroup.position.x = this.vetroPosition.x - 50
      }
    })
    // englishMeshGroup.position.y = 10
    return { englishMeshGroup, englishLetters }
  }
  animate() {
    const displayRange = { left: -1500, right: -1400 }

    // 处理中文文字动画
    if (this.chineseLetters.length > 0) {
      this.chineseMeshGroup.position.x += 0.2
      this.chineseLetters.forEach((letter, index) => {
        const worldPosition = new THREE.Vector3()
        letter.getWorldPosition(worldPosition)
        if (worldPosition.x > displayRange.right) {
          this.chineseMeshGroup.remove(letter)
          this.chineseLetters.splice(index, 1)
        }
      })
      if (this.chineseLetters.length === 0) {
        this.chineseMeshGroup.position.x = displayRange.left
        this.addtext1()
      }
    }

    // 处理英文文字动画
    if (this.englishLetters.length > 0) {
      this.englishMeshGroup.position.z += 0.2
      this.englishLetters.forEach((letter, index) => {
        const worldPosition = new THREE.Vector3()
        letter.getWorldPosition(worldPosition)
        if (worldPosition.z > displayRange.right) {
          this.englishMeshGroup.remove(letter)
          this.englishLetters.splice(index, 1)
        }
      })
      if (this.englishLetters.length === 0) {
        this.englishMeshGroup.position.z = 0
        this.addtext2()
      }
    }
  }

  dispose() {
    if (this.chineseMeshGroup) {
      this.scene.remove(this.chineseMeshGroup)
    }
    if (this.englishMeshGroup) {
      this.scene.remove(this.englishMeshGroup)
    }
    // 移除GUI
    if (this.gui) {
      this.gui.destroy()
    }
  }
}
