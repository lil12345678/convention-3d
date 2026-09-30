import * as THREE from 'three'
import eventHub from '@/utils/eventHub'
// canvas标注
export function creatSpriteTag(child, name) {
  // console.log(child.position)
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  // 设置画布大小
  canvas.width = 256
  canvas.height = 128

  // 绘制背景
  context.fillStyle = 'rgba(0, 14, 17, 0.5)'
  context.fillRect(0, 0, canvas.width, canvas.height)

  // 设置文字样式
  context.fillStyle = '#ffffff'
  context.font = 'bold 48px Arial'
  context.textAlign = 'center'
  context.textBaseline = 'middle'

  // 绘制文字
  context.fillText(name, canvas.width / 2, canvas.height / 2)

  // 创建纹理
  const texture = new THREE.CanvasTexture(canvas)
  // 创建精灵标签
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: texture,
      sizeAttenuation: false,
      depthTest: false,
    })
  )

  // 设置精灵位置和大小
  sprite.position.copy(child.position)
  sprite.position.y += 10 // 在物体上方显示
  sprite.scale.set(0.05, 0.05, 0.05) // 设置标签大小
  return sprite
}
//图片sprite标注
export function createLabel(position, type, name) {
  // 创建图片精灵
  const spriteMap = new THREE.TextureLoader().load(`textures/labels/${type}.png`)
  const spriteMaterial = new THREE.SpriteMaterial({
    map: spriteMap,
    transparent: true,
    depthTest: false,
  })
  const sprite = new THREE.Sprite(spriteMaterial)

  // 创建文字标签
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  canvas.width = 256
  canvas.height = 64
  // 设置白色背景
  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, canvas.width, canvas.height)
  // 设置黑色文字
  context.fillStyle = '#000000'
  context.font = 'bold 48px Arial'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillText(name, canvas.width / 2, canvas.height / 2)

  const textTexture = new THREE.CanvasTexture(canvas)
  const textSprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: textTexture,
      transparent: true,
      depthTest: false,
    })
  )

  // 创建组合对象
  const group = new THREE.Group()

  // 设置图片标签大小和位置
  sprite.scale.set(15, 15, 1)
  sprite.position.y = 20
  sprite.userData.type = type
  // 设置文字标签大小和位置
  textSprite.scale.set(15, 8, 1)
  textSprite.position.y = 35

  // 将两个精灵添加到组中
  group.add(sprite)
  group.add(textSprite)

  // 设置组的位置
  group.position.copy(position)

  // 添加类型属性
  // group.userData.type = type

  return group
}
