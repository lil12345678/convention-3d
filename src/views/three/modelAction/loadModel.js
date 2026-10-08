import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
const gltfLoader = new GLTFLoader()
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('./draco/')
dracoLoader.setDecoderConfig({ type: 'js' })
dracoLoader.preload()
gltfLoader.setDRACOLoader(dracoLoader)
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
