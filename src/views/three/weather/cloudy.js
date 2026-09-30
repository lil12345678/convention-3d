import * as THREE from 'three'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import cloudTexture1 from '@/assets/cloud1.png'

export function createCloudLayer() {
  const cloudGeo = new THREE.PlaneGeometry(1000, 1000)
  const cloudTexture = new THREE.TextureLoader().load(cloudTexture1)
  const cloudMat = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.7,
    depthWrite: false,
    // blending: THREE.AdditiveBlending,
    map: cloudTexture,
  })

  const clouds = new THREE.Group()
  clouds.name = 'cloudy'
  const cloudCount = 15

  for (let i = 0; i < cloudCount; i++) {
    const cloud = new THREE.Mesh(cloudGeo, cloudMat)
    cloud.rotation.x = -Math.PI / 2
    cloud.position.set(Math.random() * 1000, 380 + Math.random() * 50, Math.random() * 400)
    cloud.scale.set(1 + Math.random(), 1, 1)
    clouds.add(cloud)
  }

  return clouds
}
export function cloudAnimation(clouds) {
  console.log('阴天动画')
  // 云层移动
  clouds.children.forEach((cloud, i) => {
    cloud.position.x += Math.sin(i * 0.2 + Date.now() * 0.0005) * 2.1 //0.1移动速度
    cloud.position.z += Math.cos(i * 0.3 + Date.now() * 0.0006) * 0.1
    cloud.material.opacity = 0.6 + Math.sin(Date.now() * 0.001 + i) * 0.2
  })
}
