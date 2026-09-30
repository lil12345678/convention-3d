import * as THREE from 'three'

export function snowLightFn() {
  // 环境光 - 使用冷色调
  const ambientLight = new THREE.AmbientLight(0xc8d8ff, 0.6)

  // 主平行光 - 模拟散射的天光
  const snowLight = new THREE.DirectionalLight(0xd8e8ff, 0.8)
  snowLight.position.set(50, 100, 50)
  snowLight.castShadow = true
  snowLight.shadow.mapSize.width = 2048
  snowLight.shadow.mapSize.height = 2048
  snowLight.shadow.camera.near = 1
  snowLight.shadow.camera.far = 300
  snowLight.shadow.camera.left = -100
  snowLight.shadow.camera.right = 100
  snowLight.shadow.camera.top = 100
  snowLight.shadow.camera.bottom = -100
  snowLight.shadow.bias = -0.001

  // 补光1 - 模拟雪地反射光
  const snowfillLight1 = new THREE.DirectionalLight(0xe8f0ff, 0.4)
  snowfillLight1.position.set(-50, -10, -50)

  // 补光2 - 增加整体亮度
  const snowfillLight2 = new THREE.HemisphereLight(0xffffff, 0xc8d8ff, 0.1)

  return {
    ambientLight,
    snowLight,
    snowfillLight1,
    snowfillLight2,
  }
}
//雪景环境图
