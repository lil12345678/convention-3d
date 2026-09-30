//激光动画
import * as THREE from 'three'
import ThreeManager from '../index.js'

export default class LaserBeam {
  static instance = null
  constructor() {
    if (LaserBeam.instance) {
      return LaserBeam.instance
    }
    LaserBeam.instance = this
    const threeManager = ThreeManager.getInstance()
    this.threeManager = threeManager
    this.scene = threeManager.getScene()
    this.lasers = []
    this.radius = 50
    this.clock = new THREE.Clock()
  }
  // 获取实例的静态方法
  static getInstance() {
    if (!LaserBeam.instance) {
      LaserBeam.instance = new LaserBeam()
    }
    return LaserBeam.instance
  }
  addLaser() {
    const color = [0xffeedd, 0xdddfff, 0xffffff, 0xf2d3ff, 0xffeedd, 0xdddfff, 0xffffff, 0xf2d3ff]
    for (let i = 0; i < 8; i++) {
      const laser = this.createLaserBeam(
        new THREE.Color(color[i]),
        (i * Math.PI * 2) / 8,
        i // 传入索引
      )
      this.lasers.push(laser)
    }
    // this.laserAnimation()
  }

  createLaserBeam(color, initialAngle, index) {
    const geometry = new THREE.CylinderGeometry(40, 0.5, 640, 32)
    // 将几何体的原点移到底部
    geometry.translate(0, 250, 0)
    // 创建渐变材质
    const material = new THREE.ShaderMaterial({
      transparent: true,
      uniforms: {
        color: { value: color },
        time: { value: 0 },
      },
      vertexShader: `
          varying float vY;
          void main() {
              vY = position.y; // vY范围：-70（底部）~570（顶部）
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
      `,
      fragmentShader: `
          uniform vec3 color;
          uniform float time;
          varying float vY;
          void main() {
              // 归一化范围：底部vY=-70 → 0，顶部vY=570 → 1
              float normalizedY = (vY + 70.0) / 640.0;
              
              // 过渡区间：从底部（normalizedY=0）开始，到80%高度（normalizedY=0.8）完成过渡
              float smoothAlpha = smoothstep(0.0, 0.8, normalizedY);
              
              // 不透明度随高度递减：底部（normalizedY=0）→ 0.8（最不透明），顶部（normalizedY=1）→ 0（最透明）
              float opacity = (1.0 - smoothAlpha) * 0.8;
              
              // 保持颜色亮度增强（确保辉光可见）
              vec3 brightColor = color * 1.5;
              
              gl_FragColor = vec4(brightColor, opacity);
          }
      `,
    })

    const laser = new THREE.Mesh(geometry, material)

    // 设置初始位置和角度
    const radius = this.radius // 增大圆圈半径
    laser.position.x = Math.cos(initialAngle) * radius
    laser.position.z = Math.sin(initialAngle) * radius
    laser.position.y = 140

    // 倾斜角度，使光束向外倾斜
    laser.rotation.x = Math.PI * 0.15
    laser.rotation.y = initialAngle

    // 添加动画参数
    // 修改动画参数，根据索引设置不同的初始方向
    laser.userData = {
      initialAngle: initialAngle,
      rotationSpeed: 0.002,
      swayAngle: index % 2 === 0 ? 0 : Math.PI, // 相邻光束初始角度相差π
      swaySpeed: 0.015,
      swayAmount: 0.3,
      // 添加整体旋转参数
      groupRotation: 0,
      groupRotationSpeed: 0.001, // 整体旋转速度
    }
    laser.layers.set(2)
    this.scene.add(laser)
    laser.position.set(0, 20, 0)
    return laser
  }
  laserAnimation() {
    // 更新激光动画
    const time = Date.now() * 0.001
    // 更新整体旋转角度
    const groupRotation = time * 0.2 // 控制整体旋转速度

    this.lasers.forEach((laser, index) => {
      const userData = laser.userData

      // 更新摇摆角度
      userData.swayAngle += userData.swaySpeed
      const direction = index % 2 === 0 ? 1 : -1
      const swayOffset = Math.sin(userData.swayAngle) * userData.swayAmount * direction

      // 计算新位置（应用整体旋转）
      const angle = userData.initialAngle + groupRotation
      laser.position.x = Math.cos(angle) * this.radius
      laser.position.z = Math.sin(angle) * this.radius

      // 重置旋转
      laser.rotation.set(0, 0, 0)
      // 应用朝向中心的旋转
      laser.rotateY(angle + Math.PI / 2)
      // 应用摇摆
      laser.rotateZ(swayOffset)
    })
  }
  // 清除激光
  dispose() {
    if (this.lasers && this.lasers.length > 0) {
      this.lasers.forEach((laser) => {
        if (laser.geometry) {
          laser.geometry.dispose()
        }
        if (laser.material) {
          laser.material.dispose()
        }
        this.scene.remove(laser)
      })
      this.lasers = []
    }
  }
}
