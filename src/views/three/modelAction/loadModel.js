import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import ThreeManager from '../index.js'
import eventHub from '@/utils/eventHub'
let gltfLoader = new GLTFLoader()
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('./draco/')
dracoLoader.setDecoderConfig({ type: 'js' })
dracoLoader.preload()
gltfLoader.setDRACOLoader(dracoLoader)
//加载多个模型
export function loadallModel(url) {
  const textureLoader = new THREE.TextureLoader()

  // 创建加载管理器
  const manager = new THREE.LoadingManager()

  // 设置加载管理器的回调函数
  manager.onProgress = (url, itemsLoaded, itemsTotal) => {
    const progress = ((itemsLoaded / itemsTotal) * 100).toFixed(2)
    console.log(`总进度: ${progress}%`)
  }

  manager.onLoad = () => {
    console.log('所有资源加载完成')
    eventHub.emit('modelLoaded')
  }

  manager.onError = (url) => {
    console.error('加载出错:', url)
    eventHub.emit('modelLoaded')
  }
  // 使用加载管理器创建加载器
  gltfLoader = new GLTFLoader(manager)
  textureLoader = new THREE.TextureLoader(manager)
  // 加载第一个模型
  model1(gltfLoader)
  // model2(gltfLoader)

  // 加载贴图等其他资源...
  textureLoader.load('textures/Logo_1.png')
}
//
export function model1(gltfLoader) {
  // 加载第一个模型
  gltfLoader.load(
    // 'model/d.glb',
    (gltf) => {
      // ... 现有的模型处理代码 ...
    },
    // 单个模型的进度回调
    (xhr) => {
      const progress = ((xhr.loaded / xhr.total) * 100).toFixed(2)
      // console.log('模型1加载进度:', progress + '%')
    },
    null // 错误处理统一由 manager 处理
  )
}
//单独加载一个模型
export function loadOneModel(modelPath) {
  if (!modelPath) {
    console.error('模型路径未提供')
    return
  }
  return new Promise((resolve, reject) => {
    gltfLoader.load(
      modelPath,
      (gltf) => {
        resolve(gltf)
      },
      (xhr) => {
        const progress = ((xhr.loaded / xhr.total) * 100).toFixed(2)
        // console.log('模型加载进度:', progress + '%')
      },
      reject
    )
  })
}
