import * as THREE from 'three'
import gsap from 'gsap'
import walkPositions from './walk.json'
import walkPositions2 from './walk2.json'
import ThreeManager from '../index.js'
import eventHub from '@/utils/eventHub.js'

export default class AutoWalk {
  constructor() {
    const threeManager = ThreeManager.getInstance()
    this.camera = threeManager.getCamera()
    this.controls = threeManager.getControls()
    this.renderer = threeManager.getRenderer()
    this.scene = threeManager.getScene()
    this.isPaused = false
    this.animationFrameId = null
    this.currentAnimation = null
    this.lookAtTween = null
    this.initEventHub()
  }

  startCameraTour(walkPositions) {
    if (this.currentAnimation) {
      gsap.killTweensOf(this.camera.position)
      gsap.killTweensOf(this.camera.quaternion)
      this.currentAnimation = null
    }
    // 禁用控制器，防止其干扰摄像机朝向
    if (this.controls) {
      this.controls.enabled = false
    }
    const pathData = walkPositions
    let currentPointIndex = 0
    const points = pathData.points
    let camera = this.camera
    let controls = this.controls
    // 禁用控制器，防止其干扰摄像机朝向
    const moveToNextPoint = () => {
      if (this.isPaused) {
        // 如果处于暂停状态，暂停当前动画
        if (this.currentAnimation) {
          this.currentAnimation.pause()
        }
        return
      }
      if (currentPointIndex >= points.length - 1) {
        if (pathData.loop) currentPointIndex = 0
        else return
      }
      // 如果存在暂停的动画，恢复它
      if (this.currentAnimation && this.currentAnimation.paused()) {
        this.currentAnimation.resume()
        return
      }
      const startPoint = points[currentPointIndex]
      const endPoint = points[currentPointIndex + 1]

      // 计算两点间距离和移动时间
      const distance = new THREE.Vector3()
        .subVectors(
          new THREE.Vector3(...endPoint.position),
          new THREE.Vector3(...startPoint.position)
        )
        .length()

      const duration = distance / endPoint.speed
      this.lookAtTween = gsap.to(
        {},
        {
          duration: duration,
          ease: 'linear',
          onUpdate: () => {
            const lookAtPos = new THREE.Vector3(
              endPoint.lookAt[0],
              endPoint.lookAt[1],
              endPoint.lookAt[2]
            )
            camera.lookAt(lookAtPos)
            controls.target.copy(lookAtPos)
          },
        }
      )
      // 使用 GSAP 实现缓动动画
      this.currentAnimation = gsap.to(camera.position, {
        duration: duration,
        ease: 'none',
        x: endPoint.position[0],
        y: endPoint.position[1],
        z: endPoint.position[2],
        onComplete: () => {
          setTimeout(() => {
            currentPointIndex++
            moveToNextPoint()
          }, endPoint.pause * 1000)
        },
      })

      // 动态更新lookAt点
      gsap.to(
        {},
        {
          duration: duration,
          ease: 'linear',
          onUpdate: () => {
            const lookAtPos = new THREE.Vector3(
              endPoint.lookAt[0],
              endPoint.lookAt[1],
              endPoint.lookAt[2]
            )
            // console.log(lookAtPos)
            // 确保相机始终朝向前进方向
            camera.lookAt(lookAtPos)
            controls.target.copy(lookAtPos) // 确保控制器的目标点也朝向前进方向
          },
        }
      )
    }
    moveToNextPoint()
  }
  // 添加清除动画方法
  clearAnimation() {
    // if (this.isPaused) {
    //   this.currentAnimation.pause()
    // }
    if (this.currentAnimation) {
      this.currentAnimation.pause()
      gsap.killTweensOf(this.camera.position)
      gsap.killTweensOf(this.camera.quaternion)
      this.currentAnimation.kill()
      this.currentAnimation = null
    }
    if (this.lookAtTween) {
      this.lookAtTween.kill()
      this.lookAtTween = null
    }

    // // 重置暂停状态
    // this.isPaused = false
    // 重新启用控制器
    if (this.controls) {
      this.controls.enabled = true
    }
    this.controls.target.set(0, 0, 0)
    eventHub.emit('changeCameraPosition', {
      position: { x: 421, y: 516, z: 816 },
      target: { x: 0, y: 0, z: 0 },
      type: 'view',
    })
  }
  initEventHub() {
    // window.addEventListener('keydown', this.handleKeyDown.bind(this))
    eventHub.on('walkCallback', (route) => {
      this.clearAnimation()
      if (!route) return
      if (route === 'route1') {
        this.startCameraTour(walkPositions)
      } else if (route === 'route2') {
        this.startCameraTour(walkPositions2)
      }
    })
    eventHub.on('walkStartPause', (isStart) => {
      if (this.currentAnimation) {
        if (isStart) {
          this.currentAnimation.pause()
        } else {
          this.currentAnimation.resume()
        }
      }
    })
  }
  // togglePause() {
  //   this.isPaused = !this.isPaused
  //   if (this.currentAnimation) {
  //     if (this.isPaused) {
  //       this.currentAnimation.pause()
  //     } else {
  //       this.currentAnimation.resume()
  //     }
  //   }
  // }

  // handleKeyDown(event) {
  //   if (event.code === 'Space') {
  //     this.togglePause()
  //   }
  // }
}
