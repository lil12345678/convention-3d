控制台测试ai指令脚本
// 1. 查看所有可用指令
aiCommandBus.actions

// 2. 切换页面，顶部 tab 应该同步高亮
await aiCommandBus.execute({ action: 'navigate', params: { page: '设备运行' } })

// 3. 打开设备分类，再选中设备（3D 标签出现，点标签会弹出后端数据）
await aiCommandBus.execute({ action: 'openDeviceCategory', params: { category: '安防设备' } })
await aiCommandBus.execute({ action: 'showDevice', params: { device: '门禁' } })

// 4. 多步连续执行
await aiCommandBus.execute([
  { action: 'navigate', params: { page: '会展信息' } },
  { action: 'overview' },
  { action: 'selectBuilding', params: { building: '5号馆' } },
  { action: 'showDevice', params: { device: '空调用电' } },
])

// 5. 白名单拦截：不存在的设备、不支持的操作
await aiCommandBus.execute({ action: 'showDevice', params: { device: '洗衣机' } })
await aiCommandBus.execute({ action: 'deleteAll' })

// 6. 未登录拦截：先点右上角"退出"，再执行，应返回 "请先登录"
await aiCommandBus.execute({ action: 'navigate', params: { page: '安防态势' } })