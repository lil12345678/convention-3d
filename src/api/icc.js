import request from './iccRequest'

export function getPublicKey() {
  return request({
    url: '/evo-oauth/1.0.0/oauth/public-key',
    method: 'get',
    headers: {
      isToken: false,
    },
  })
}

export function getICCToken(data) {
  return request({
    url: '/evo-oauth/1.0.0/oauth/extend/token',
    method: 'post',
    headers: {
      isToken: false,
    },
    data,
  })
}
