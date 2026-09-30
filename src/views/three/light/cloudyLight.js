import * as THREE from 'three'
export function cloudyLightFn() {
  //  多云光照系统
  // 环境光（主导冷色调）
  const cloudambientLight = new THREE.AmbientLight(0x88a4c1, 0.5)

  // 主方向光（模拟被云层过滤的阳光）
  const cloudmainLight = new THREE.DirectionalLight(0xfff5e6, 0.7)
  cloudmainLight.position.set(-600, 600, 150)
  // 补充顶光（模拟云层反射）
  const topLight = new THREE.DirectionalLight(0xffffff, 0.3)
  topLight.position.set(0, 600, 0)

  return { cloudambientLight, cloudmainLight, topLight }
}

//光线动态变化系统
function LightVariationSystem(mainLight) {
  let lightBaseIntensity = mainLight.intensity
  const variationParams = {
    speed: 0.002,
    intensityRange: [0.6, 0.8],
    colorVariation: 0.05,
  }

  function update() {
    const time = Date.now() * variationParams.speed
    // 强度波动
    mainLight.intensity =
      lightBaseIntensity *
      (variationParams.intensityRange[0] +
        Math.sin(time) * (variationParams.intensityRange[1] - variationParams.intensityRange[0]))

    // 色温波动
    const colorOffset = Math.sin(time * 0.7) * variationParams.colorVariation
    mainLight.color.setHSL(0.1 + colorOffset, 0.3 + Math.cos(time) * 0.1, 0.9)
  }

  return { update }
}
