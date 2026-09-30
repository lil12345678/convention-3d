// 获取定位和天气
import request from './request'

export function getLocation(params) {
  return request({
    url: 'https://restapi.amap.com/v3/ip',
    method: 'get',
    headers: {
      isToken: true,
    },
    params,
  })
}
