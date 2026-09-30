import * as THREE from 'three'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js'
export function nightLightFn() {
  const ambientLight = new THREE.AmbientLight(0xfff0e0, 1.0)
  // 添加月光 - 使用蓝白色调
  const moonLight = new THREE.DirectionalLight(0xc9e2ff, 1.2)
  moonLight.position.set(-600, 600, 150)

  // 增加路灯光源强度和范围
  const streetLight1 = new THREE.PointLight(
    0xffe5b4, //
    20, // 强度
    100, // 有效距离
    0.3 //越小衰减越慢，亮度范围越大
  )
  streetLight1.position.set(-776, 30, 285)

  const streetLight2 = new THREE.PointLight(0xffe5b4, 20, 100, 0.3)
  streetLight2.position.set(-467, 30, 686)
  const streetLight3 = new THREE.PointLight(0xffe5b4, 20, 60, 0.3)
  streetLight3.position.set(-387, 30, 614)
  const streetLight4 = new THREE.PointLight(0xffe5b4, 20, 60, 0.3)
  streetLight4.position.set(-259, 30, 523)
  const streetLight5 = new THREE.PointLight(0xffe5b4, 20, 60, 0.3)
  streetLight5.position.set(-172, 30, 456)
  const streetLight6 = new THREE.PointLight(0xffe5b4, 20, 60, 0.3)
  streetLight6.position.set(-51, 30, 362)
  const streetLight7 = new THREE.PointLight(0xffe5b4, 20, 60, 0.3)
  streetLight7.position.set(33, 30, 295)
  const streetLight8 = new THREE.PointLight(0xffe5b4, 20, 60, 0.3)
  streetLight8.position.set(-275, 30, -99)
  const streetLight9 = new THREE.PointLight(0xffe5b4, 20, 60, 0.3)
  streetLight9.position.set(-364, 30, -20)
  const streetLight10 = new THREE.PointLight(0xffe5b4, 20, 60, 0.3)
  streetLight10.position.set(-488, 30, 50)
  const streetLight11 = new THREE.PointLight(0xffe5b4, 20, 60, 0.3)
  streetLight11.position.set(-575, 30, 118)
  const streetLight12 = new THREE.PointLight(0xffe5b4, 20, 60, 0.3)
  streetLight12.position.set(-685, 30, 214)
  // // 增加补光强度
  // const nightFill = new THREE.DirectionalLight(0x4b6ea3, 0.5)
  // nightFill.position.set(-150, 300, -250)
  // // 添加额外的环境补光
  // const additionalFill = new THREE.HemisphereLight(0xffffbb, 0x080820, 0.5)
  return {
    ambientLight,
    moonLight,
    streetLight1,
    streetLight2,
    streetLight3,
    streetLight4,
    streetLight5,
    streetLight6,
    streetLight7,
    streetLight8,
    streetLight9,
    streetLight10,
    streetLight11,
    streetLight12,
    // nightFill,
    // additionalFill,
  }
}
export function nighthdrFn(renderer) {
  // const rgbeLoader = new RGBELoader()
  // return rgbeLoader.loadAsync('textures/night.hdr').then((envMap) => {
  //   // 设置球形贴图
  //   envMap.mapping = THREE.EquirectangularReflectionMapping
  //   envMap.intensity = 0.5
  //   return envMap
  // })
  let kTX2Loader = new KTX2Loader()
    .setTranscoderPath('basis/') // Basis解码路径
    .detectSupport(renderer)

  return kTX2Loader.loadAsync('textures/night.ktx2').then((envMap) => {
    // 设置球形贴图
    envMap.mapping = THREE.EquirectangularReflectionMapping
    // 设置环境贴图
    envMap.colorSpace = THREE.SRGBColorSpace
    return envMap
  })
}
