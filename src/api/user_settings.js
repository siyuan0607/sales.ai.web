import request from '@/utils/request'

export function getConfig() {
  return request({
    url: '/user_settings',
    method: 'get'
  })
}

export function updateConfig(data) {
  return request({
    url: '/user_settings',
    method: 'post',
    data
  })
}