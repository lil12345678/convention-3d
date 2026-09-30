import * as THREE from 'three' // composer绘制轮廓线
export function outlineObjFn(selectedObjects, outlinePass, outlineComposer) {
  // 物体边缘发光通道

  outlinePass.edgeStrength = 2 // 边框的亮度
  outlinePass.edgeGlow = 1 // 光晕[0,1]
  outlinePass.edgeThickness = 1 // 边框宽度
  outlinePass.pulsePeriod = 3 // 呼吸闪烁的速度
  outlinePass.visibleEdgeColor.set(0xff4ecfff)
  outlinePass.hiddenEdgeColor.set(0x00ffff)
  outlinePass.selectedObjects = selectedObjects
  outlineComposer.addPass(outlinePass)
}
// 改变相机位置
let changeCameraAnimationId = null
export function changeCameraPosition(camera, controls, { position, target, type }) {
  // console.log(changeCameraAnimationId)
  if (changeCameraAnimationId) {
    cancelAnimationFrame(changeCameraAnimationId)
  }

  if (type != 'modelType') {
    const duration = 2500
    const startPosition = camera.position.clone()
    const startTarget = controls.target.clone()
    const startRotation = camera.rotation.clone() // 保存初始旋转状态
    camera.updateMatrixWorld()
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easeProgress = easeInOutQuad(progress)

      // 更新相机位置
      camera.position.lerpVectors(
        startPosition,
        new THREE.Vector3(position.x, position.y, position.z),
        easeProgress
      )

      // 保持相机的原始旋转
      camera.rotation.copy(startRotation)

      // 更新控制器目标点
      controls.target.lerpVectors(
        startTarget,
        new THREE.Vector3(target.x, target.y, target.z),
        easeProgress
      )

      controls.update()

      if (progress < 1) {
        changeCameraAnimationId = requestAnimationFrame(animate)
      }
    }

    animate()
  } else {
    camera.position.set(position.x, position.y, position.z)
    controls.target.set(target.x, target.y, target.z)
    controls.update()
  }
}
// 添加更平缓的缓动函数
function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
}
