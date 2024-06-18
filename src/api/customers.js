import request from '@/utils/request'

export function getList(params) {
  return request({
    url: '/customers',
    method: 'get',
    params
  })
}