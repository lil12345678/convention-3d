控制台测试脚本。先登录，再在浏览器控制台执行。run 会先请求 POST /api/scene/command。

// 1. 查看前端本地白名单
aiCommandBus.actions

// 2. 切页。顶部「设备运行」应高亮
await aiCommandBus.run({ action: 'navigate', params: { page: '设备运行' } })

// 3. 回到总览，再定位到 5 号馆
await aiCommandBus.run({ action: 'overview' })
await aiCommandBus.run({ action: 'selectBuilding', params: { building: '5' } })

// 4. 展开 1F。必须先选中场馆
await aiCommandBus.run({ action: 'selectFloor', params: { floor: '1F' } })

// 5. 显示场馆标签，再打开热力图
await aiCommandBus.run({ action: 'showVenueLabels' })
await aiCommandBus.run({ action: 'toggleHeatmap', params: { visible: true } })

// 6. 打开安防设备，再选中门禁。点 3D 标签应弹出该点位的设备
await aiCommandBus.run({ action: 'openDeviceCategory', params: { category: '安防设备' } })
await aiCommandBus.run({ action: 'showDevice', params: { device: '门禁' } })

// 7. 查询。画面不动，结果在返回值的 data 里
await aiCommandBus.run({ action: 'queryHall', params: { name: '1号馆' } })
await aiCommandBus.run({ action: 'queryDevices', params: { leaf_type: '门禁' } })

// 8. 多步连续执行。后端先整批校验，通过后前端按顺序做画面操作
await aiCommandBus.run([
  { action: 'navigate', params: { page: '会展信息' } },
  { action: 'overview' },
  { action: 'selectBuilding', params: { building: '5号馆' } },
  { action: 'showDevice', params: { device: '空调用电' } },
  { action: 'queryHall', params: { name: '5号馆' } },
])

// 9. 白名单拒绝。日夜、改天气都不应执行
await aiCommandBus.run({ action: 'showDevice', params: { device: '洗衣机' } })
await aiCommandBus.run({ action: 'setWeather', params: { weather: 'rain' } })

// 10. 未登录。先点右上角「退出」，再执行，应返回「请先登录」
await aiCommandBus.run({ action: 'navigate', params: { page: '安防态势' } })
