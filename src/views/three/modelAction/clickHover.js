import * as THREE from 'three'
import { changeCameraPosition } from '../function.js'
import ThreeManager from '../index.js'
let lastSelectedObject = null
export function modelClick(event) {
  const threeManager = ThreeManager.getInstance()
  const scene = threeManager.getScene()
  const camera = threeManager.getCamera()
  const raycaster = new THREE.Raycaster()
  const mouse = new THREE.Vector2()

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

  raycaster.setFromCamera(mouse, camera)
  const intersects = raycaster.intersectObjects(scene.children, true)
  if (intersects.length > 0) {
    if (lastSelectedObject) {
      // 恢复上一个选中物体的材质
      if (lastSelectedObject.originalMaterial) {
        lastSelectedObject.material = lastSelectedObject.originalMaterial
      }
    }
    const selectedObject = intersects[0].object
    if (
      selectedObject &&
      (selectedObject.name.includes('号馆') || selectedObject.name.includes('登录厅'))
    ) {
      // 保存原始材质
      selectedObject.originalMaterial = selectedObject.material.clone()
      // 创建新的材质
      const newMaterial = selectedObject.material.clone()
      newMaterial.emissive.set(0xff62e258)
      newMaterial.emissiveIntensity = 1
      selectedObject.material = newMaterial

      lastSelectedObject = selectedObject
      console.log('selectedObject', selectedObject)
      changeCameraPosition({
        position: selectedObject.position,
        target: selectedObject.position,
        type: 'modelType',
      })
      // selectedObject.material.color.set(0xff62e258)
      // outlineObjFn([selectedObject], this.outlinePass, this.outlineComposer)
    }
  } else {
    if (lastSelectedObject) {
      // 恢复上一个选中物体的材质
      if (lastSelectedObject.originalMaterial) {
        lastSelectedObject.material = lastSelectedObject.originalMaterial
        lastSelectedObject.originalMaterial = null // 清除保存的原始材质
      }
    }
    // if (this.outlinePass) {
    //   this.outlineComposer.removePass(this.outlinePass)
    //   this.outlinePass = null
    // }
  }
}
