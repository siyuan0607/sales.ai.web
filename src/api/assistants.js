import request from '@/utils/request'

export function getConfig() {
  return request({
    url: '/assistants',
    method: 'get'
  })
}

export function updateConfig(data) {
  return request({
    url: '/assistants',
    method: 'put',
    data
  })
}