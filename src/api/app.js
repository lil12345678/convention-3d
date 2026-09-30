import request from './request'
export function projectList(data) {
  return request({
    url: '/base/auth/projectList',
    method: 'post',
    headers: {
      isToken: true,
    },
    data,
  })
}
