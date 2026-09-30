import * as THREE from 'three'
import { ElMessage } from 'element-plus'
import { heatmapdata1, heatmapdata2 } from './heatmapData'
//div热力图测试用  3d和2d热力图修改着色器和PlaneGeometry的参数即可
export function TDHeatMap() {
  // 热力图
  var heatmap = h337.create({
    container: document.getElementById('heatmap'),
  })
  var len = 100
  var width = 300
  var height = 300
  var points = []
  var max = 0
  while (len--) {
    var val = Math.floor(Math.random() * 100)
    max = Math.max(max, val)
    var point = {
      x: Math.floor(Math.random() * width),
      y: Math.floor(Math.random() * height),
      value: val,
    }
    points.push(point)
  }
  // console.log(points)
  heatmap.setData({
    max: max,
    data: points,
  })
  // 灰度图
  var greymap = h337.create({
    container: document.getElementById('greymap'),
    gradient: {
      0: 'black',
      '1.0': 'white',
    },
  })

  greymap.setData({
    max: max,
    data: points,
  })
  let heatMapMaterial = new THREE.ShaderMaterial({
    transparent: true,
    vertexShader: `varying vec2 vUv;
        uniform float Zscale;
        uniform sampler2D greyMap;
        void main() {
         vUv = uv;
        vec4 frgColor = texture2D(greyMap, uv);//获取灰度图点位信息
        float height = Zscale * frgColor.a;//通过灰度图的rgb*需要设置的高度计算出热力图每个点位最终在z轴高度
        vec3 transformed = vec3( position.x, position.y, height);//重新组装点坐标
        gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);//渲染点位

        }
      `,
    fragmentShader: `varying vec2 vUv;
        uniform sampler2D heatMap;//热力图
        uniform vec3 u_color;//基础颜色
        uniform float u_opacity; // 透明度
        void main() {
          //vec4 alphaColor = texture2D(heatMap, vUv);
          // gl_FragColor = alphaColor;
           gl_FragColor = vec4(u_color, u_opacity) * texture2D(heatMap, vUv);//把热力图颜色和透明度进行渲染
        }`,
    uniforms: {
      heatMap: {
        value: { value: undefined },
      },
      greyMap: {
        value: { value: undefined },
      },
      Zscale: { value: 100.0 }, // 高度参数
      u_color: {
        value: new THREE.Color('rgb(255, 255, 255)'),
      },
      u_opacity: {
        value: 1.0,
      },
    },
  })
  let texture = new THREE.Texture(heatmap._config.container.children[0])
  texture.needsUpdate = true
  let texture2 = new THREE.Texture(greymap._config.container.children[0])
  texture2.needsUpdate = true
  heatMapMaterial.uniforms.heatMap.value = texture
  heatMapMaterial.side = THREE.DoubleSide // 双面渲染
  heatMapMaterial.uniforms.greyMap.value = texture2
  const heatMapModel = new THREE.BufferGeometry(800, 800, 300, 300) // 3d热力图大小，及分块数量
  let heatMapPlane = new THREE.Mesh(heatMapModel, heatMapMaterial)
  heatMapPlane.rotation.set(-Math.PI / 2, 0, 0)
  heatMapPlane.position.set(200, 0, 0) //  3d热力图中心点位置
  return heatMapPlane
}
//单个建筑物canvas热力图
export function TDHeatMap1(buildingMesh, scene) {
  console.log(buildingMesh)
  // 获取建筑物的包围盒
  const bbox = new THREE.Box3().setFromObject(buildingMesh)
  // bbox.expandByScalar(10) // 扩大包围盒以适应热力图
  const size = new THREE.Vector3()
  bbox.getSize(size)
  // 创建 Canvas 并附加到 DOM（即使隐藏）
  var width = 300
  var height = 300
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  document.body.appendChild(canvas) // 临时附加

  // 初始化热力图
  const heatmap = h337.create({
    container: canvas,
    radius: 30,
    maxOpacity: 0.6,
    minOpacity: 0.1,
    blur: 0.75,
  })
  // 生成随机数据（示例）
  const points = []
  let max = 0
  for (let i = 0; i < 100; i++) {
    const val = Math.floor(Math.random() * 100)
    max = Math.max(max, val)
    points.push({
      x: Math.floor(Math.random() * width),
      y: Math.floor(Math.random() * height),
      value: val,
    })
  }
  // console.log('热力图数据' + JSON.stringify(points))
  let arr = []
  if (buildingMesh.name == '1号馆') {
    arr = heatmapdata1
  } else if (buildingMesh.name == '2号馆') {
    arr = heatmapdata2
  } else {
    arr = points
  }
  // 设置热力图数据
  heatmap.setData({ max: max, data: arr })

  // 创建 Three.js 材质
  const heatMapMaterial = new THREE.ShaderMaterial({
    transparent: true,
    vertexShader: `
      varying vec2 vUv;
      uniform float Zscale;
      void main() {
        vUv = uv;
        vec3 transformed = vec3(position.x, position.y, position.z);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform sampler2D heatMap;
      uniform vec3 u_color;
      uniform float u_opacity;
      void main() {
        gl_FragColor = vec4(u_color, u_opacity) * texture2D(heatMap, vUv);
      }
    `,
    uniforms: {
      heatMap: { value: null },
      Zscale: { value: 100.0 },
      u_color: { value: new THREE.Color('rgb(255, 255, 255)') },
      u_opacity: { value: 1.0 },
    },
  })

  // 延迟加载纹理，确保热力图渲染完成
  setTimeout(() => {
    // 正确获取热力图的内部 Canvas（根据库实现调整）
    const heatmapCanvas = heatmap._renderer.canvas

    // 创建 Three.js 纹理
    const texture = new THREE.Texture(heatmapCanvas)
    texture.needsUpdate = true
    heatMapMaterial.uniforms.heatMap.value = texture

    // 移除临时附加的 Canvas（可选）
    document.body.removeChild(canvas)
  }, 0)
  // console.log(size)
  // 创建几何体和网格
  const heatMapModel = new THREE.PlaneGeometry(size.x, size.z, 2, 2) //按照模型大小显示热力图的范围
  const heatMapPlane = new THREE.Mesh(heatMapModel, heatMapMaterial)
  const center = new THREE.Vector3()
  bbox.getCenter(center)
  heatMapPlane.position.set(center.x, bbox.max.y + 1, center.z)
  if (
    buildingMesh.name.indexOf('7号馆') === -1 &&
    buildingMesh.name.indexOf('8号馆') === -1 &&
    buildingMesh.name.indexOf('9号馆') === -1 &&
    buildingMesh.name.indexOf('10号馆') === -1 &&
    buildingMesh.name.indexOf('登录厅') === -1
  ) {
    heatMapPlane.rotation.set(-Math.PI / 2, 0, Math.PI / 4.5)
    heatMapPlane.scale.set(0.5, 1, 1)
  } else {
    heatMapPlane.rotation.set(-Math.PI / 2, 0, 0)
  }

  heatMapPlane.name = 'heatmap'
  scene.add(heatMapPlane)
}
//多个建筑物canvas热力图
export function TDHeatMap2(modelMesh) {
  if (modelMesh == undefined || modelMesh.length === 0)
    return ElMessage({
      message: '未找到建筑物',
      type: 'warning',
      duration: 2000,
      showClose: false,
    })
  // 获取所有建筑物的边界盒，计算总体范围
  let overallBbox = new THREE.Box3()
  let buildingMeshes = []

  modelMesh.traverse((child) => {
    if (child.name.includes('号馆') || child.name.includes('登录厅')) {
      buildingMeshes.push(child)
      const bbox = new THREE.Box3().setFromObject(child)
      overallBbox.union(bbox)
    }
  })

  const size = new THREE.Vector3()
  overallBbox.getSize(size)
  // 创建 Canvas 并附加到 DOM（即使隐藏）
  const canvas = document.createElement('canvas')
  canvas.width = 300
  canvas.height = 300
  document.body.appendChild(canvas) // 临时附加

  // 初始化热力图
  const heatmap = h337.create({
    container: canvas,
    radius: 30,
    maxOpacity: 0.6,
    minOpacity: 0.1,
    blur: 0.75,
  })

  // 生成随机数据（示例）
  const points = []
  let max = 0
  for (let i = 0; i < 100; i++) {
    const val = Math.floor(Math.random() * 100)
    max = Math.max(max, val)
    points.push({
      x: Math.floor(Math.random() * 300),
      y: Math.floor(Math.random() * 300),
      value: val,
    })
  }

  // 设置热力图数据
  heatmap.setData({ max: max, data: points })

  // 创建 Three.js 材质
  const heatMapMaterial = new THREE.ShaderMaterial({
    transparent: true,
    vertexShader: `
      varying vec2 vUv;
      uniform float Zscale;
      void main() {
        vUv = uv;
        vec3 transformed = vec3(position.x, position.y, position.z);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform sampler2D heatMap;
      uniform vec3 u_color;
      uniform float u_opacity;
      void main() {
        gl_FragColor = vec4(u_color, u_opacity) * texture2D(heatMap, vUv);
      }
    `,
    uniforms: {
      heatMap: { value: null },
      Zscale: { value: 100.0 },
      u_color: { value: new THREE.Color('rgb(255, 255, 255)') },
      u_opacity: { value: 1.0 },
    },
  })

  // 延迟加载纹理，确保热力图渲染完成
  setTimeout(() => {
    // 正确获取热力图的内部 Canvas（根据库实现调整）
    const heatmapCanvas = heatmap._renderer.canvas

    // 创建 Three.js 纹理
    const texture = new THREE.Texture(heatmapCanvas)
    texture.needsUpdate = true
    heatMapMaterial.uniforms.heatMap.value = texture

    // 移除临时附加的 Canvas（可选）
    document.body.removeChild(canvas)
  }, 0)

  // 创建几何体和网格
  // const heatMapModel = new THREE.PlaneGeometry(size.x, size.z,10,10)//10可以添加热力图的高度
  const heatMapModel = new THREE.PlaneGeometry(size.x, size.z)
  const heatMapPlane = new THREE.Mesh(heatMapModel, heatMapMaterial)
  heatMapPlane.rotation.set(-Math.PI / 2, 0, 0)
  heatMapPlane.position.set(130, 35, -90)
  heatMapPlane.name = 'heatmap'
  return heatMapPlane
}
//以下为手动创建的热力图，效果不如插件
function createHeatmap(buildingMesh) {
  // 获取建筑物的包围盒
  const bbox = new THREE.Box3().setFromObject(buildingMesh)
  const size = new THREE.Vector3()
  bbox.getSize(size)

  // 创建热力图平面
  const heatmapGeometry = new THREE.PlaneGeometry(size.x, size.z)

  // 创建渐变材质
  const heatmapMaterial = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 0.6,
    side: THREE.DoubleSide,
  })

  // 创建画布
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')

  // 清除画布
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = 'rgba(0, 0, 0, 0)'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // 生成随机热点数据（0-100范围内）
  const numHotspots = 100 // 固定热点数量
  const hotspots = []

  for (let i = 0; i < numHotspots; i++) {
    hotspots.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      value: Math.floor(Math.random() * 101), // 0-100的随机值
    })
  }
  // console.log(hotspots)
  hotspots.forEach((spot) => {
    const radius = 50 // 固定热点半径
    const gradient = ctx.createRadialGradient(spot.x, spot.y, 0, spot.x, spot.y, radius)

    // 根据数值计算颜色强度
    const intensity = spot.value / 100
    // console.log(intensity)
    // 使用图片中的颜色方案：从红色到黄色到蓝色
    if (intensity > 0.7) {
      // 红色区域
      gradient.addColorStop(0, `rgba(255, 0, 0,1)`)
      gradient.addColorStop(0.6, `rgba(255, 0, 0, 0.6)`)
      gradient.addColorStop(1, 'rgba(255, 0, 0, 0)')
    } else if (intensity > 0.5) {
      // 黄绿色区域
      gradient.addColorStop(0, `rgba(255, 255, 0,1)`)
      gradient.addColorStop(0.6, `rgba(255, 255, 0, 0.6)`)
      gradient.addColorStop(1, 'rgba(255, 255, 0, 0.4)')
    } else if (intensity > 0.2) {
      // 黄绿色区域
      gradient.addColorStop(0, `rgba(47, 255, 0,1)`)
      gradient.addColorStop(0.6, `rgba(115, 255, 0, 0.6)`)
      gradient.addColorStop(1, 'rgba(255, 255, 0, 0.4)')
    } else {
      // 蓝色区域
      gradient.addColorStop(0, `rgba(0, 255, 255,1)`)
      gradient.addColorStop(0.6, `rgba(0, 255, 255, 0.3)`)
      gradient.addColorStop(1, 'rgba(0, 255, 255, 0.4)')
    }

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  })

  // 将画布转换为纹理
  const texture = new THREE.CanvasTexture(canvas)
  heatmapMaterial.map = texture

  // 创建热力图网格
  const heatmap = new THREE.Mesh(heatmapGeometry, heatmapMaterial)

  // 将热力图定位在建筑物上方
  const center = new THREE.Vector3()
  bbox.getCenter(center)
  heatmap.position.set(center.x, bbox.max.y + 1, center.z)
  heatmap.rotation.x = -Math.PI / 2

  this.scene.add(heatmap)
}
function createOverallHeatmap() {
  // 获取所有建筑物的边界盒，计算总体范围
  let overallBbox = new THREE.Box3()
  let buildingMeshes = []

  this.modelMesh.traverse((child) => {
    if (child.name.includes('号馆') || child.name.includes('登录厅')) {
      buildingMeshes.push(child)
      const bbox = new THREE.Box3().setFromObject(child)
      overallBbox.union(bbox)
    }
  })

  const size = new THREE.Vector3()
  overallBbox.getSize(size)

  // 创建热力图平面
  const heatmapGeometry = new THREE.PlaneGeometry(size.x, size.z)

  // 创建渐变材质
  const heatmapMaterial = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 0.6,
    side: THREE.DoubleSide,
  })

  // 创建画布
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')

  // 清除画布
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = 'rgba(0, 0, 0, 0)'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // 生成随机热点数据（0-100范围内）
  const numHotspots = 20 // 固定热点数量
  const hotspots = []

  for (let i = 0; i < numHotspots; i++) {
    hotspots.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      value: Math.floor(Math.random() * 101), // 0-100的随机值
    })
  }

  // 为每个热点创建渐变
  // 为每个热点创建渐变
  hotspots.forEach((spot) => {
    const radius = 30 // 减小热点半径

    // 创建圆形路径
    ctx.beginPath()
    ctx.arc(spot.x, spot.y, radius, 0, Math.PI * 2)

    // 创建渐变
    const gradient = ctx.createRadialGradient(spot.x, spot.y, 0, spot.x, spot.y, radius)

    // 根据数值计算颜色
    const value = spot.value / 100

    if (value > 0.7) {
      // 红色区域
      gradient.addColorStop(0, `rgba(255, 0, 0,1)`)
      gradient.addColorStop(0.6, `rgba(255, 0, 0, 0.6)`)
      gradient.addColorStop(1, 'rgba(255, 0, 0, 0)')
    } else if (value > 0.5) {
      // 黄绿色区域
      gradient.addColorStop(0, `rgba(255, 255, 0,1)`)
      gradient.addColorStop(0.6, `rgba(255, 255, 0, 0.6)`)
      gradient.addColorStop(1, 'rgba(255, 255, 0, 0.4)')
    } else if (value > 0.2) {
      // 黄绿色区域
      gradient.addColorStop(0, `rgba(47, 255, 0,1)`)
      gradient.addColorStop(0.6, `rgba(115, 255, 0, 0.6)`)
      gradient.addColorStop(1, 'rgba(255, 255, 0, 0.4)')
    } else {
      // 蓝色区域
      gradient.addColorStop(0, `rgba(0, 255, 255,1)`)
      gradient.addColorStop(0.6, `rgba(0, 255, 255, 0.3)`)
      gradient.addColorStop(1, 'rgba(0, 255, 255, 0.4)')
    }

    // 设置渐变填充样式
    ctx.fillStyle = gradient

    // 只填充圆形区域
    ctx.fill()
  })

  // 将画布转换为纹理
  const texture = new THREE.CanvasTexture(canvas)
  heatmapMaterial.map = texture

  // 创建热力图网格
  const heatmap = new THREE.Mesh(heatmapGeometry, heatmapMaterial)

  // 将热力图定位在所有建筑物的上方
  const center = new THREE.Vector3()
  overallBbox.getCenter(center)
  heatmap.position.set(center.x, overallBbox.max.y + 1, center.z)
  heatmap.rotation.x = -Math.PI / 2

  this.scene.add(heatmap)
}
