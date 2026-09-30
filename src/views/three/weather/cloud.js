import * as THREE from 'three'
import { Clouds, Cloud, SpriteAnimator } from '@pmndrs/vanilla'
import cloudTexture1 from '@/assets/cloud.png'
import cloudTexture3 from '@/assets/cloud3.png'
import cloudTexture4 from '@/assets/cloud1.png'

//CloudJs创建的云
export function CloudAnimation() {
  const loader = new THREE.TextureLoader()
  const texture = loader.load(CloudTexture)
  texture.format = THREE.RGBAFormat // 指定格式为RGBA
  texture.needsUpdate = true // 更新纹理

  const clouds = new Clouds({
    texture: texture,
  })

  const cloud0 = new Cloud({
    color: new THREE.Color(1.0, 1.0, 1.0),
    speed: 0.8,
    seed: 50,
  })
  clouds.add(cloud0)
  clouds.scale.set(100, 100, 100)
  return clouds
}
//动态云雾效果（实例化，但是每次只能用一个材质）
export function createFogClouds1(opacity = 1, cloudSpeed = 0.2) {
  // 创建多个云朵变体
  const textures = [
    new THREE.TextureLoader().load(cloudTexture1),
    // new THREE.TextureLoader().load(cloudTexture2),
    new THREE.TextureLoader().load(cloudTexture3),
    new THREE.TextureLoader().load(cloudTexture4),
  ]

  // 在创建云朵时随机选择纹理
  const cloudMaterial = new THREE.MeshPhongMaterial({
    map: textures[Math.floor(Math.random() * textures.length)],
    transparent: true,
    opacity: opacity,
    depthWrite: false,
  })
  // 创建实例化网格
  const cloudGeometry = new THREE.PlaneGeometry(20, 8)
  const instanceCount = 20 // 云朵数量
  const cloudInstances = new THREE.InstancedMesh(cloudGeometry, cloudMaterial, instanceCount)

  // 初始化每个实例的位置和属性
  const matrix = new THREE.Matrix4()
  const dummy = new THREE.Object3D()
  const instanceData = []

  for (let i = 0; i < instanceCount; i++) {
    // const startSide = Math.random() > 0.5 ? -1000 : 1000
    // const y = 160 + Math.random() * 20
    // const z = -40 + Math.random() * 80
    // const speed = (2 + Math.random() * 2) * (startSide > 0 ? -1 : 1)
    // 随机选择起始位置：x轴两侧或z轴两侧
    const startPosition =
      Math.random() > 0.5
        ? {
            // x轴起始
            x: Math.random() > 0.5 ? -1000 : 1000,
            z: 800 * Math.random(), //-140 + Math.random() * 500,
          }
        : {
            // z轴起始
            x: -1000 + Math.random() * 2000,
            z: 750, //Math.random() > 0.5 ? -140 : 280,
          }

    const y = 180 + Math.random() * 20

    // 根据起始位置决定移动方向
    const isXAxis = Math.abs(startPosition.x) === 1000
    const speed =
      (cloudSpeed + Math.random() * cloudSpeed) *
      (isXAxis
        ? startPosition.x > 0
          ? -1
          : 1 // x轴移动
        : startPosition.z > 0
        ? -1
        : 1) // z轴移动
    const baseScale = 5 + Math.random() * 15 // 调整缩放范围

    // 先重置dummy的变换
    dummy.position.set(0, 0, 0)
    dummy.rotation.set(0, 0, 0) //旋转40度
    dummy.scale.set(1, 1, 1)

    // 按照顺序应用变换
    // dummy.position.set(startSide, y, z)
    dummy.position.set(startPosition.x, y, startPosition.z)
    dummy.rotation.x = Math.PI / 2
    dummy.scale.set(baseScale, baseScale, baseScale)

    // 更新矩阵
    dummy.updateMatrix()
    cloudInstances.setMatrixAt(i, dummy.matrix)

    instanceData.push({
      speed: speed,
      baseY: y,
      phase: Math.random() * Math.PI * 2,
      scale: baseScale, // 保存缩放值
    })
  }

  cloudInstances.instanceMatrix.needsUpdate = true
  // scene.add(cloudInstances)

  // 返回云朵实例和数据，供动画使用
  return {
    mesh: cloudInstances,
    data: instanceData,
  }
}
//非实例化，每次能运用多个材质
export function createFogClouds2(opacity = 1, count = 20, startDistance = 1000, cloudSpeed = 0.2) {
  // 创建多个云朵变体
  const textures = [
    new THREE.TextureLoader().load(cloudTexture1),
    new THREE.TextureLoader().load(cloudTexture3),
    new THREE.TextureLoader().load(cloudTexture4),
  ]

  const cloudGeometry = new THREE.PlaneGeometry(20, 8)
  const instanceCount = count

  // 为每个实例创建独立的材质
  const cloudMaterials = []
  for (let i = 0; i < instanceCount; i++) {
    const material = new THREE.MeshPhongMaterial({
      map: textures[Math.floor(Math.random() * textures.length)],
      transparent: true,
      opacity: opacity, //根据天气调整不透明度
      depthWrite: false,
    })
    cloudMaterials.push(material)
  }

  // 创建多个网格而不是使用InstancedMesh
  const clouds = []
  const instanceData = []

  for (let i = 0; i < instanceCount; i++) {
    const cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterials[i])
    const startSide = Math.random() > 0.5 ? -startDistance : startDistance
    const y = 160 + Math.random() * 20
    const z = -140 + Math.random() * 100
    const speed = (cloudSpeed + Math.random() * cloudSpeed) * (startSide > 0 ? -1 : 1) //同时修改0.01，值越小减缓速度；分别修改不同的值，减少随机性；

    cloudMesh.position.set(startSide, y, z)
    cloudMesh.rotation.x = -Math.PI / 2
    const baseScale = 1.5 + Math.random() * 20.5 // 基础缩放值在0.5到3之间
    cloudMesh.scale.set(baseScale, baseScale, baseScale) // 随机缩放值
    // scene.add(cloudMesh)
    clouds.push(cloudMesh)
    instanceData.push({
      speed: speed,
      baseY: y,
      phase: Math.random() * Math.PI * 2,
    })
  }

  return {
    meshes: clouds,
    data: instanceData,
  }
}
// 云实例动画部分
export function animateClouds1(clouds) {
  const matrix = new THREE.Matrix4()
  const dummy = new THREE.Object3D()
  for (let i = 0; i < clouds.data.length; i++) {
    clouds.mesh.getMatrixAt(i, matrix)
    dummy.matrix.copy(matrix)
    dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale)

    // 水平移动
    dummy.position.x += clouds.data[i].speed

    // 循环逻辑
    if (clouds.data[i].speed > 0 && dummy.position.x > 1000) {
      dummy.position.x = -1000
      dummy.position.z = -140 + Math.random() * 100
    } else if (clouds.data[i].speed < 0 && dummy.position.x < -1000) {
      dummy.position.x = 1000
      dummy.position.z = 140 + Math.random() * 100
    }

    // 添加上下浮动
    dummy.position.y =
      clouds.data[i].baseY + Math.sin(Date.now() * 0.001 + clouds.data[i].phase) * 2

    // 保持原有的旋转和缩放
    dummy.rotation.x = -Math.PI / 2
    dummy.scale.setScalar(clouds.data[i].scale)

    // 更新矩阵
    dummy.updateMatrix()
    clouds.mesh.setMatrixAt(i, dummy.matrix)
  }

  clouds.mesh.instanceMatrix.needsUpdate = true
}
// 非实例化云朵动画
export function animateClouds2(clouds, startDistance = 1000) {
  for (let i = 0; i < clouds.data.length; i++) {
    const cloud = clouds.meshes[i]

    // 水平移动
    cloud.position.x += clouds.data[i].speed

    // 循环逻辑
    if (clouds.data[i].speed > 0 && cloud.position.x > startDistance) {
      cloud.position.x = -startDistance
      cloud.position.z = -140 + Math.random() * 100
    } else if (clouds.data[i].speed < 0 && cloud.position.x < -startDistance) {
      cloud.position.x = startDistance
      cloud.position.z = 140 + Math.random() * 100
    }

    // 添加较小的上下浮动
    cloud.position.y =
      clouds.data[i].baseY + Math.sin(Date.now() * 0.001 + clouds.data[i].phase) * 2
  }
}
