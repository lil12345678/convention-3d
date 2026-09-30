import * as THREE from 'three'
import snowTexture from '@/assets/icon/snow.png'
let geom = new THREE.BufferGeometry()
let drops = 10000 //数量
let dropSpeed = 5 //下落速度
export const snowConfig = {
  drops: 10000,
  speed: 5,
  updateDrops: function (newDrops) {
    drops = newDrops
    return createSnow()
  },
  updateSpeed: function (newSpeed) {
    dropSpeed = newSpeed
    return createSnow()
  },
}
export function createSnow() {
  //加载雪图片
  let snow = snowTexture
  const texture = new THREE.TextureLoader().load(snow)
  // 定义顶点数据
  const positions = new Float32Array(drops * 3)
  const velocities = new Float32Array(drops * 3)
  const snowflakeRotations = new Float32Array(drops * 3)
  for (let i = 0; i < drops; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 16000 // x
    positions[i * 3 + 1] = Math.random() * 5000 // y
    positions[i * 3 + 2] = (Math.random() - 0.5) * 16000 // z

    // 修改雪花坠落位置数据，使其x、z方向上可以晃动飘落；修改dropSpeed坠落速度，雪花的速度会慢一些
    velocities[i * 3] = ((Math.random() - 0.5) / 2) * dropSpeed // x
    velocities[i * 3 + 1] = -dropSpeed + (Math.random() / 5) * dropSpeed // y
    velocities[i * 3 + 5] = ((Math.random() - 0.5) / 3) * dropSpeed // z

    // 雪花的随机旋转角度
    snowflakeRotations[i * 3] = (Math.random() / 2) * Math.PI
    snowflakeRotations[i * 3 + 1] = Math.random() * Math.PI
    snowflakeRotations[i * 3 + 2] = (Math.random() / 2) * Math.PI
  }
  geom.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geom.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3))
  geom.setAttribute('rotation', new THREE.BufferAttribute(snowflakeRotations, 1))

  // 创建雨滴材质
  const rainMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 24,
    map: texture,
    transparent: true,
    blending: THREE.AdditiveBlending, // 融合模式
    depthTest: false, // 可以去掉texture的黑色背景
  })
  let Points = new THREE.Points(geom, rainMaterial)
  return Points
}
export function updateDrops() {
  const positions = geom.attributes.position.array
  const velocities = geom.attributes.velocity.array
  for (let i = 0; i < drops; i++) {
    //change Y
    // 更新雨滴位置
    positions[i * 3] += velocities[i * 3]
    positions[i * 3 + 1] += velocities[i * 3 + 1]
    positions[i * 3 + 2] += velocities[i * 3 + 2]

    // 如果雨滴落到了地面，重新回到顶部
    if (positions[i * 3 + 1] < -500) {
      positions[i * 3] = (Math.random() - 0.5) * 16000 // x
      positions[i * 3 + 1] = Math.random() * 5000 // y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 16000 // z
    }
  }
  geom.attributes.position.needsUpdate = true
}
