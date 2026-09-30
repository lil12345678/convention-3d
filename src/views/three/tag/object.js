import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer'
import { CSS3DSprite } from 'three/examples/jsm/renderers/CSS3DRenderer.js'
import eventHub from '@/utils/eventHub'
import { debounce } from '@/utils/commonFunc.js'

export function createLabel(text, position, className = 'three-label-icon', icon = '', type) {
  const div = document.createElement('div')
  div.className = 'three-label'

  // 创建图标容器
  const iconContainer = document.createElement('span')
  iconContainer.className = className
  if (icon) {
    iconContainer.innerHTML = `<img src="${icon}" alt="icon"/>`
  }

  // 创建文本容器
  if (text) {
    const textContainer = document.createElement('span')
    textContainer.className = 'three-label-text'
    textContainer.textContent = text
    div.appendChild(textContainer)
  }

  // 组合图标和文本

  div.appendChild(iconContainer)

  div.addEventListener(
    'click',
    debounce(
      (event) => {
        // console.log('测试防抖2')
        event.stopPropagation()
        event.preventDefault()
        if (!type) return
        eventHub.emit('showDeviceInfo', { name: type, position })
      },
      300,
      true
    )
  )

  // const label = new CSS3DObject(div)
  const label = new CSS3DSprite(div)
  label.position.set(position.x, position.y + 35, position.z)
  return label
}
