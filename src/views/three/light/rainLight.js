import * as THREE from 'three'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'

export function rainLightFn() {
  // 创建雨天光照效果
  const rainambientLight = new THREE.AmbientLight(0x222233, 0.6) // 灰暗的环境光

  const rainmainLight = new THREE.DirectionalLight(0x556677, 0.5)
  rainmainLight.position.set(-600, 600, 150)

  const rainfillLight = new THREE.HemisphereLight(0x666666, 0x444444, 0.4) // 半球光
  const rainpointLight = new THREE.PointLight(
    0xffffff, // 初始颜色（白色）
    0, // 初始强度（非闪电时不发光）
    3000, // 有效距离（3000单位内可见）
    0.1 // 衰减速率（平方衰减）
  )
  rainpointLight.position.set(-200, 1000, 300)
  return {
    rainambientLight,
    rainmainLight,
    rainfillLight,
    rainpointLight,
  }
}

export function rainhdrFn(renderer) {
  const rgbeLoader = new RGBELoader()
  return rgbeLoader.loadAsync('textures/cloudy.hdr').then((envMap) => {
    // 设置球形贴图
    envMap.mapping = THREE.EquirectangularReflectionMapping
    // 设置环境贴图
    envMap.colorSpace = THREE.SRGBColorSpace
    return envMap
  })
}
