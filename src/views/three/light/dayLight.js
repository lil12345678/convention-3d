import * as THREE from 'three'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { Lensflare, LensflareElement } from 'three/addons/objects/Lensflare.js'
export function daylightFn() {
  // 环境光
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.0) //fff0e0

  // 主平行光
  const mainLight = new THREE.DirectionalLight(0xffffcc, 1.0) //ffd700ffec8b
  mainLight.position.set(-600, 600, 150)
  // mainLight.target.updateMatrixWorld()

  const sunLight = new THREE.DirectionalLight(0xffffff, 0.3) //颜色，光照强度，照射范围，衰减度
  sunLight.position.set(-740, 410, 550)
  sunLight.target.updateMatrixWorld()
  const getlensflare = async () => {
    // 光晕效果
    const textureLoader = new THREE.TextureLoader()
    const [textureFlare0, textureFlare3] = await Promise.all([
      textureLoader.loadAsync('textures/lensflare0.png'),
      textureLoader.loadAsync('textures/lensflare3.png'),
    ]) //
    let arr = [textureFlare0, textureFlare3]
    arr.forEach((texture) => {
      if (!texture.image) {
        throw new Error('纹理加载失败，请检查文件路径')
      }
      texture.format = THREE.RGBAFormat // 显式设置像素格式
      texture.needsUpdate = true
      texture.premultiplyAlpha = true
    })
    const lensflare = new Lensflare()
    try {
      textureFlare0.generateMipmaps = false
      textureFlare3.generateMipmaps = false
      lensflare.addElement(new LensflareElement(textureFlare0, 200, 0))
      lensflare.addElement(new LensflareElement(textureFlare0, 75, 0.1)) // 原300→150
      lensflare.addElement(new LensflareElement(textureFlare3, 100, 0.1)) // 原150→75
      lensflare.addElement(new LensflareElement(textureFlare3, 100, 0.11)) // 原150→75
      lensflare.addElement(new LensflareElement(textureFlare3, 100, 0.17)) // 原150→75
      lensflare.addElement(new LensflareElement(textureFlare0, 75, 0.2)) // 原200→100
      lensflare.addElement(new LensflareElement(textureFlare3, 100, 0.21)) // 原150→75
      lensflare.addElement(new LensflareElement(textureFlare0, 50, 0.25)) // 原200→100
      lensflare.addElement(new LensflareElement(textureFlare3, 75, 0.255))
      lensflare.addElement(new LensflareElement(textureFlare3, 75, 0.28))
      lensflare.addElement(new LensflareElement(textureFlare3, 50, 0.3))
    } catch (e) {
      console.error('Lensflare元素创建失败:', e)
      throw e
    }
    lensflare.depthWrite = false
    lensflare.depthTest = false
    lensflare.antialias = false
    lensflare.renderOrder = 9999
    return lensflare
  }
  getlensflare().then((lensflare) => {
    sunLight.add(lensflare)
  })
  // sunLight.add(lensflare)
  // mainLight.castShadow = true
  // mainLight.shadow.mapSize.width = 2048
  // mainLight.shadow.mapSize.height = 2048
  // mainLight.shadow.camera.near = 0
  // mainLight.shadow.camera.far = 1300
  // mainLight.shadow.camera.left = -1300
  // mainLight.shadow.camera.right = 1300
  // mainLight.shadow.camera.top = 800
  // mainLight.shadow.camera.bottom = -1200
  // mainLight.shadow.bias = -0.0005
  // mainLight.shadow.normalBias = 0.02 // 添加法线偏差以减少阴影伪影
  // mainLight.shadow.radius = 4 // PCF softness
  // mainLight.shadow.darkness = 1.8 // 增加阴影深度
  // mainLight.shadow.intensity = 0.8

  // mainLight.shadow.intensity =0.8
  mainLight.shadow.camera.updateProjectionMatrix()
  // 辅助光源也调整为更自然的强度
  const fillLight1 = new THREE.DirectionalLight(0xfff0e0, 0.1)
  fillLight1.position.set(-500, 400, -180)

  const fillLight2 = new THREE.DirectionalLight(0xfff0e0, 0.1)
  fillLight2.position.set(-600, 600, 150)

  return {
    ambientLight,
    mainLight,
    sunLight,
    fillLight1,
    fillLight2,
  }
}
export function dayhdrFn(renderer) {
  const rgbeLoader = new RGBELoader()
  return rgbeLoader.loadAsync('textures/sky.hdr').then((envMap) => {
    // 设置球形贴图
    envMap.mapping = THREE.EquirectangularReflectionMapping
    // 设置环境贴图
    // envMap.colorSpace = THREE.SRGBColorSpace
    return envMap
  })
}
