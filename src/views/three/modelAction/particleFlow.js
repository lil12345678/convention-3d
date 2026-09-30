//粒子动画
import * as THREE from 'three'
import ThreeManager from '../index.js'
export default class ParticleFlow {
  static instance = null
  constructor() {
    if (ParticleFlow.instance) {
      return ParticleFlow.instance
    }
    ParticleFlow.instance = this
    const threeManager = ThreeManager.getInstance()
    this.threeManager = threeManager
    this.scene = threeManager.getScene()
    this.position = null
    this.width = null
    this.clock = new THREE.Clock()
  }
  setProps(position, width) {
    position.y += 10
    this.position = position
    this.width = width
  }
  // 获取实例的静态方法
  static getInstance() {
    if (!ParticleFlow.instance) {
      ParticleFlow.instance = new ParticleFlow()
    }
    return ParticleFlow.instance
  }
  addParticles() {
    const sharedMaterial = new THREE.ShaderMaterial({
      fragmentShader: `
    varying vec3 vColor;
    varying float vSize;
    
    void main() {
      float distanceToCenter = length(gl_PointCoord - vec2(0.5));
      float strength = 1.0 - smoothstep(0.0, 0.5, distanceToCenter);
      vec3 finalColor = vColor * pow(strength, 1.5) * 1.5;
      gl_FragColor = vec4(finalColor, strength * 0.8);
    }
  `,
      vertexShader: `
            uniform float uTime;
            attribute float size;
            attribute vec3 color;
            attribute float speed;
            
            varying vec3 vColor;
            varying float vSize;
            
            void main() {
                vec3 pos = position;
                
                // 保持原有的波浪动画
                pos.z += sin(uTime + pos.x * 0.009) * 28.5;
                
                float flicker = 0.8 + 0.5 * sin(uTime * speed + position.x * 100.0);
                
                // 添加从左到右的移动动画
                float moveProgress = mod(uTime * 0.2 + pos.x * 0.001, 1.0);
                float fadeOut = smoothstep(0.7, 1.0, moveProgress);
                
                // 计算x轴移动
                pos.x += moveProgress * ${this.width / 8}; // 使用实际宽度
                
                // 应用淡出效果
                float opacity = (1.0 - fadeOut) * flicker;
                
                pos.x += sin(uTime * 0.1 * speed + position.y) * 0.15;
                pos.y += cos(uTime * 0.1 * speed + position.x) * 0.15;
                
                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                gl_Position = projectionMatrix * mvPosition;
                
                gl_PointSize = size * opacity * (300.0 / length(mvPosition.xyz));
                
                vColor = color;
                vSize = opacity;
            }
        `,
      uniforms: {
        uTime: { value: 0 },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: true,
      uniforms: {
        uTime: { value: 0 },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    //彩色系
    // const starColors1 = [
    //   new THREE.Color(0xffffff),
    //   new THREE.Color(0xaaccff),
    //   new THREE.Color(0xffccee),
    //   new THREE.Color(0xddddff),
    // ]
    // // 明亮蓝紫色系[0x99eeff, 0x66aaff, 0x4466ff, 0x9944ff, 0xeeddff]
    // //金橙黄色系0xffdd22, 0xff9911, 0xff6633, 0xffdd99, 0xffbb55
    const starColors1 = [
      new THREE.Color(0xff3333),
      new THREE.Color(0xff3333),
      new THREE.Color(0xff3366),
      new THREE.Color(0xff3366),
      new THREE.Color(0xff6666),
    ]

    this.particlePlane1 = this.createParticlePlane(
      this.position,
      starColors1,
      0,
      this.width,
      sharedMaterial
    )
    this.scene.add(this.particlePlane1)
    const starColors2 = [
      //鲜艳粉红色系[0xffffff, 0xff1177, 0xff66bb, 0xff44aa, 0xffddee]
      new THREE.Color(0xff6666),
      new THREE.Color(0x3300ff),
      new THREE.Color(0x3300ff),
      new THREE.Color(0x6600ff),
      new THREE.Color(0x6600ff),
    ]
    this.particlePlane2 = this.createParticlePlane(
      this.position,
      starColors2,
      0,
      this.width,
      sharedMaterial
    )
    this.scene.add(this.particlePlane2)
    const starColors3 = [
      new THREE.Color(0x3300ff),
      new THREE.Color(0x3300ff),
      new THREE.Color(0x3333ff),
      new THREE.Color(0x3333ff),
      new THREE.Color(0x3366ff),
    ]
    this.particlePlane3 = this.createParticlePlane(
      this.position,
      starColors3,
      0.1,
      this.width,
      sharedMaterial
    )
    this.scene.add(this.particlePlane3)
    const starColors4 = [
      //蓝色0x4499ff, 0x66ccff, 0x99eeff, 0x77ddff, 0x55aaff
      new THREE.Color(0x4499ff),
      new THREE.Color(0x33ffff),
      new THREE.Color(0x6600ff),
      new THREE.Color(0x6600ff),
      new THREE.Color(0x6633ff),
    ]
    this.particlePlane4 = this.createParticlePlane(
      this.position,
      starColors4,
      0.1,
      this.width,
      sharedMaterial
    )
    this.scene.add(this.particlePlane4)
  }
  // 初始化粒子系统
  createParticlePlane(position, starColors, yOffset = 0, width, material) {
    const particleCount = 2000
    const planeWidth = 760 // x轴范围：-75到+75
    const planeDepth = 20 // 最大z轴范围
    const zScaleMultiplier = 10.8

    // 定义粒子属性
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    const sizes = new Float32Array(particleCount)
    const speeds = new Float32Array(particleCount)

    for (let i = 0; i < particleCount; i++) {
      // --- x轴分布保持原逻辑（右侧稀疏→左侧密集） ---
      const progress = i / (particleCount - 1)
      // 线性过渡：x从-125（planeWidth/2的负值）均匀递增到+125
      const x = -planeWidth / 2 + progress * planeWidth

      // --- 保持z轴宽度逻辑不变（x越小→z轴越宽） ---
      // 归一化x值（0→1对应x从+125到-125）
      const normalizedX = (planeWidth / 2 - x) / planeWidth
      const zScale = normalizedX * zScaleMultiplier

      // z坐标范围：随x值减小（向左）逐渐扩大
      const z = (Math.random() - 0.5) * planeDepth * zScale

      // y坐标保持-1不变
      const y = position.y

      positions[i * 3] = x
      positions[i * 3 + 1] = y
      positions[i * 3 + 2] = z

      // 颜色、大小、速度保持原逻辑
      const color = starColors[Math.floor(Math.random() * starColors.length)]
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b

      sizes[i] = 20 + Math.random() * 5 //粒子大小调整
      speeds[i] = 0.5 + Math.random() * 2.0
    }

    // ... 几何体、材质、添加到场景
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
    geometry.setAttribute('speed', new THREE.BufferAttribute(speeds, 1))

    this.particlePlane = new THREE.Points(geometry, material)
    this.particlePlane.position.set(position.x, position.y - 16, position.z)
    this.particlePlane.rotation.y = Math.PI / (2.8 + yOffset)
    return this.particlePlane
  }
  // 更新粒子动画
  particleAnimation() {
    const elapsedTime = this.clock.getElapsedTime()
    // 批量更新uniform以提高性能
    const timeValue = { value: elapsedTime }
    const timeValueFast = { value: elapsedTime * 1.1 }

    if (this.particlePlane1) this.particlePlane1.material.uniforms.uTime = timeValue
    if (this.particlePlane2) this.particlePlane2.material.uniforms.uTime = timeValue
    if (this.particlePlane3) this.particlePlane3.material.uniforms.uTime = timeValueFast
    if (this.particlePlane4) this.particlePlane4.material.uniforms.uTime = timeValueFast
  }

  // 清除所有粒子
  dispose() {
    // 清除所有粒子平面
    const particlePlanes = [
      this.particlePlane1,
      this.particlePlane2,
      this.particlePlane3,
      this.particlePlane4,
    ]

    particlePlanes.forEach((plane) => {
      if (plane) {
        // 从场景中移除
        this.scene.remove(plane)

        // 释放几何体资源
        if (plane.geometry) {
          plane.geometry.dispose()
        }

        // 释放材质资源
        if (plane.material) {
          plane.material.dispose()
        }
      }
    })

    // 清空引用
    this.particlePlane1 = null
    this.particlePlane2 = null
    this.particlePlane3 = null
    this.particlePlane4 = null
    this.particlePlane = null
  }
}
